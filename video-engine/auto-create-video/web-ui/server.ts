import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { runPipeline } from '../src/pipeline.js';
import axios from 'axios';
import * as dotenv from 'dotenv';
import os from 'os';
import { LucylabClient } from '../src/tts/lucylab-client.js';
import { loadConfig } from '../src/config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '../.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const OUTPUT_BASE_DIR = join(ROOT_DIR, 'output');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/output', express.static(OUTPUT_BASE_DIR));

// Endpoint to parse URL and generate a script (Mock/AI Placeholder)
app.post('/api/parse-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const slug = new URL(url).pathname.split('/').filter(Boolean).pop() || 'video-' + Date.now();
    const timestamp = Date.now();
    const outputDir = join(OUTPUT_BASE_DIR, `${slug}-${timestamp}`);
    await mkdir(outputDir, { recursive: true });

    let pageContent = "";
    try {
      const pageResp = await axios.get(url, { timeout: 10000 });
      pageContent = pageResp.data.replace(/<script[^>]*>([\s\S]*?)<\/script>/gmi, '')
                                .replace(/<style[^>]*>([\s\S]*?)<\/style>/gmi, '')
                                .replace(/<[^>]*>?/gm, ' ')
                                .substring(0, 10000);
      console.log(`Fetched content from ${url}, length: ${pageContent.length}`);
    } catch (e) { console.warn("Fetch failed", e); }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY in .env.local");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    const prompt = `
Bạn là chuyên gia biên tập video TikTok/Shorts. Viết kịch bản JSON từ nội dung:
TITLE: ${slug}
URL: ${url}
TEXT: ${pageContent}

YÊU CẦU:
1. scenes: Tạo từ 10 đến 18 cảnh để video chi tiết và dài hơn (hook, nhiều body scenes, outro).
2. voiceText: PHẢI viết số thành chữ (10% -> mười phần trăm, iPhone 16 -> iPhone mười sáu).
3. template: hook, comparison, stat-hero, feature-list, callout, outro, quote-card, icon-grid, timeline, big-text, chart-bars, kinetic-quote.
4. metadata: theme (tech-blue, growth-green, finance-gold, warning-red, creator-purple, news-mono).

TRẢ VỀ DUY NHẤT JSON KHÔNG MARKDOWN:
{
  "version": "1.0",
  "metadata": { "title": "...", "theme": "...", "source": { "url": "${url}", "domain": "${new URL(url).hostname}", "image": null }, "channel": "..." },
  "voice": { "provider": "lucylab", "voiceId": "${process.env.VIETNAMESE_VOICEID}", "speed": 1.0 },
  "scenes": [ { "id": "...", "type": "...", "voiceText": "...", "templateData": { "template": "...", ... } } ]
}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const script = JSON.parse(text);
    if (!script.voice.voiceId) script.voice.voiceId = process.env.VIETNAMESE_VOICEID;

    const scriptPath = join(outputDir, 'script.json');
    await writeFile(scriptPath, JSON.stringify(script, null, 2));

    res.json({ slug: `${slug}-${timestamp}`, script, path: scriptPath });
  } catch (error: any) {
    console.error('AI Parse failed:', error);
    res.status(500).json({ error: error.message || 'AI generation failed' });
  }
});

// Endpoint to save script
app.post('/api/save-script', async (req, res) => {
  const { slug, script } = req.body;
  if (!slug || !script) return res.status(400).json({ error: 'Slug and script are required' });

  try {
    const outputDir = join(OUTPUT_BASE_DIR, slug);
    const scriptPath = join(outputDir, 'script.json');
    await writeFile(scriptPath, JSON.stringify(script, null, 2));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to trigger render
app.post('/api/render', async (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'Slug is required' });

  const outputDir = join(OUTPUT_BASE_DIR, slug);
  const scriptPath = join(outputDir, 'script.json');

  if (!existsSync(scriptPath)) {
    return res.status(404).json({ error: 'Script not found' });
  }

  // Run pipeline in background
  res.json({ message: 'Render started' });

  try {
    await runPipeline(scriptPath);
    console.log(`Render complete for ${slug}`);
  } catch (error) {
    console.error(`Render failed for ${slug}:`, error);
  }
});

// List generated videos
app.get('/api/videos', async (req, res) => {
  try {
    if (!existsSync(OUTPUT_BASE_DIR)) {
      return res.json([]);
    }
    const dirs = await (await import('node:fs/promises')).readdir(OUTPUT_BASE_DIR);
    const videos = [];
    for (const dir of dirs) {
      const videoPath = join(OUTPUT_BASE_DIR, dir, 'video.mp4');
      if (existsSync(videoPath)) {
        videos.push({
          slug: dir,
          url: `/output/${dir}/video.mp4`,
          thumbnail: existsSync(join(OUTPUT_BASE_DIR, dir, 'thumbnail.png')) ? `/output/${dir}/thumbnail.png` : null
        });
      }
    }
    res.json(videos.reverse());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get render status
app.get('/api/render-status/:slug', async (req, res) => {
  const { slug } = req.params;
  const statusPath = join(OUTPUT_BASE_DIR, slug, 'status.json');
  
  if (!existsSync(statusPath)) {
    return res.json({ step: 0, total: 8, percentage: 0, message: 'Starting...' });
  }

  try {
    const statusData = await readFile(statusPath, 'utf8');
    res.json(JSON.parse(statusData));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read status' });
  }
});

// TTS Preview endpoint
app.get('/api/tts-preview', async (req, res) => {
  const { voiceId } = req.query;
  if (!voiceId) return res.status(400).send('voiceId is required');

  try {
    const config = loadConfig();
    const client = new LucylabClient({
      apiKey: config.lucylabApiKey!,
      voiceId: voiceId as string,
      endpoint: config.lucylabEndpoint,
      pollIntervalMs: config.lucylabPollIntervalMs,
      pollTimeoutMs: config.lucylabPollTimeoutMs,
    });

    const tempPath = join(os.tmpdir(), `preview-${voiceId}.mp3`);
    await client.generate("Chào bạn, tôi là giọng nói bạn đang chọn cho video của mình.", tempPath);
    
    res.sendFile(tempPath);
  } catch (e: any) {
    console.error('Preview failed:', e);
    res.status(500).json({ error: e.message || 'Failed to generate preview' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
