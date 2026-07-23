import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Play, 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Video,
  Type,
  Music,
  ChevronRight,
  Sparkles,
  History,
  Download,
  X,
  Layers,
  Volume2,
  VolumeX,
  Clock,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = 'http://localhost:3001/api';

interface Scene {
  id: string;
  type: string;
  voiceText: string;
  templateData: any;
  sfx?: any;
}

interface Script {
  metadata: {
    title: string;
    theme?: string;
    source: {
      url: string;
      domain: string;
    }
  };
  scenes: Scene[];
}

interface RenderStatus {
  step: number;
  total: number;
  percentage: number;
  message: string;
}

const THEMES = [
  { id: 'tech-blue', name: 'Công nghệ (Xanh)', color: 'bg-blue-500' },
  { id: 'growth-green', name: 'Tăng trưởng (Lục)', color: 'bg-emerald-500' },
  { id: 'finance-gold', name: 'Tài chính (Vàng)', color: 'bg-amber-500' },
  { id: 'warning-red', name: 'Cảnh báo (Đỏ)', color: 'bg-red-500' },
  { id: 'creator-purple', name: 'Sáng tạo (Tím)', color: 'bg-purple-500' },
  { id: 'news-mono', name: 'Tin tức (Đen trắng)', color: 'bg-slate-500' },
];

const VOICES = [
  { 
    id: '7Tb4dvGZyJMPjnnfxVBgik', 
    name: 'Đức Trung', 
    desc: 'Giọng nam quyền lực, trầm, quảng cáo', 
    sample: '' 
  },
  { 
    id: '24oEtXGic7NhDjXzmDbDvt', 
    name: 'Quang Anh', 
    desc: 'Giọng nam VTV, đọc báo', 
    sample: '' 
  },
  { 
    id: 'cLZiqtzLcKYqwYrWJemAJH', 
    name: 'Chi Mai', 
    desc: 'Giọng nữ nhẹ nhàng, kể chuyện', 
    sample: '' 
  },
  { 
    id: 'vpx8W1mXrSR62VsbdMCpbu', 
    name: 'Phương Thảo', 
    desc: 'Giọng nữ truyền cảm, thuyết minh', 
    sample: '' 
  },
];

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderStatus, setRenderStatus] = useState<RenderStatus | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [slug, setSlug] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTheme, setActiveTheme] = useState('tech-blue');
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (rendering && slug) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/render-status/${slug}`);
          setRenderStatus(res.data);
          if (res.data.percentage === 100) {
            setRendering(false);
            setRenderStatus(null);
            fetchVideos();
            clearInterval(interval);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [rendering, slug]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_URL}/videos`);
      setVideos(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleParse = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/parse-url`, { url });
      setScript(res.data.script);
      setSlug(res.data.slug);
      setActiveTheme(res.data.script.metadata.theme || 'tech-blue');
    } catch (e) {
      alert('Failed to parse URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!script || !slug) return;
    try {
      const finalScript = { 
        ...script, 
        metadata: { ...script.metadata, theme: activeTheme },
        voice: { provider: 'lucylab', voiceId: voiceId, speed: 1.0 }
      };
      await axios.post(`${API_URL}/save-script`, { slug, script: finalScript });
      alert('Saved successfully!');
    } catch (e) {
      alert('Failed to save');
    }
  };

  const handleRender = async () => {
    if (!slug) return;
    setRendering(true);
    setRenderStatus({ step: 0, total: 8, percentage: 0, message: 'Initializing pipeline...' });
    try {
      await axios.post(`${API_URL}/render`, { slug });
    } catch (e) {
      alert('Failed to start render');
      setRendering(false);
    }
  };

  const updateScene = (index: number, data: Partial<Scene>) => {
    if (!script) return;
    const newScenes = [...script.scenes];
    newScenes[index] = { ...newScenes[index], ...data };
    setScript({ ...script, scenes: newScenes });
  };

  const deleteScene = (index: number) => {
    if (!script) return;
    const newScenes = script.scenes.filter((_, i) => i !== index);
    setScript({ ...script, scenes: newScenes });
  };

  const addScene = () => {
    if (!script) return;
    const newScene: Scene = {
      id: `body-${Date.now()}`,
      type: 'body',
      voiceText: 'Nội dung cảnh mới...',
      templateData: {
        template: 'callout',
        statement: 'Nội dung hiển thị trên màn hình'
      }
    };
    const newScenes = [...script.scenes];
    newScenes.splice(newScenes.length - 1, 0, newScene);
    setScript({ ...script, scenes: newScenes });
  };

  const playSample = async (id: string) => {
    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setPlayingId(id);
    
    try {
      const response = await axios.get(`${API_URL}/tts-preview?voiceId=${id}`, {
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.play().catch((e) => {
        console.error(e);
        setPlayingId(null);
      });

      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(url);
      };
    } catch (e: any) {
      console.error(e);
      let errorMsg = 'Lỗi khi tạo bản nghe thử.';
      
      if (e.response?.data instanceof Blob) {
        // Axios returns blob for errors too if responseType is blob
        const text = await e.response.data.text();
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || errorMsg;
        } catch (err) {
          errorMsg = text || errorMsg;
        }
      } else {
        errorMsg = e.response?.data?.error || e.message || errorMsg;
      }
      
      alert(errorMsg);
      setPlayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-sky-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 py-8 md:px-12 md:py-12 flex flex-col gap-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                  <Video className="w-7 h-7 text-white" />
               </div>
               <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                  Auto News <span className="text-sky-500">Video</span>
               </h1>
            </div>
            <p className="text-slate-500 font-medium max-w-md">The ultimate studio-grade automated video generator for modern creators.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
             <button className="px-5 py-2.5 bg-white/10 rounded-xl text-sm font-bold text-white shadow-sm border border-white/10">Dashboard</button>
             <button className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">History</button>
             <div className="w-px h-6 bg-white/10 mx-2" />
             <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn("p-2.5 rounded-xl transition-colors", showSettings ? "bg-sky-500 text-white" : "hover:bg-white/10 text-slate-400")}
             >
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl animate-in fade-in slide-in-from-top-4 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[80px] pointer-events-none" />
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-bold text-white">Global Configuration</h3>
                   <p className="text-xs text-slate-500">Customize your video production engine settings.</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="space-y-4">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Video Theme</label>
                   <div className="grid grid-cols-2 gap-2">
                      {THEMES.map(t => (
                        <button 
                          key={t.id}
                          onClick={() => setActiveTheme(t.id)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border text-[10px] font-bold transition-all",
                            activeTheme === t.id ? "border-sky-500 bg-sky-500/10 text-white" : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                          )}
                        >
                          <div className={cn("w-2 h-2 rounded-full", t.color)} />
                          {t.name}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="space-y-4">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Select AI Voice</label>
                   <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {VOICES.map(v => (
                        <div 
                          key={v.id}
                          className={cn(
                            "group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                            voiceId === v.id ? "border-sky-500 bg-sky-500/10" : "border-white/5 bg-white/5 hover:border-white/10"
                          )}
                          onClick={() => setVoiceId(v.id)}
                        >
                           <div className="flex flex-col">
                              <span className={cn("text-xs font-bold", voiceId === v.id ? "text-white" : "text-slate-400")}>{v.name}</span>
                              <span className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">{v.desc}</span>
                           </div>
                           <button 
                            onClick={(e) => { e.stopPropagation(); playSample(v.id); }}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              playingId === v.id ? "bg-sky-500 text-white animate-pulse" : "bg-white/5 text-slate-500 group-hover:text-sky-400 group-hover:bg-sky-500/20"
                            )}
                           >
                              {playingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                           </button>
                        </div>
                      ))}

                      {/* Custom Voice Input */}
                      <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 space-y-3">
                         <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Dùng Voice ID riêng của bạn</label>
                         <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Dán ID từ lucylab.io vào đây..."
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500"
                              onChange={(e) => setVoiceId(e.target.value)}
                            />
                            <button 
                              onClick={() => playSample(voiceId)}
                              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                            >
                               <Volume2 className="w-4 h-4 text-slate-400" />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">TikTok Brand</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-sky-500 outline-none" defaultValue="@haihoan" />
                   </div>
                   <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center gap-4">
                      <div className="p-2 bg-sky-500/20 rounded-lg"><CheckCircle2 className="w-5 h-5 text-sky-500" /></div>
                      <p className="text-[10px] font-medium text-slate-400">Your API keys are securely loaded from .env.local</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Progress Bar Section */}
        {rendering && renderStatus && (
          <section className="animate-in fade-in zoom-in duration-500">
             <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[80px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-sky-500/20 rounded-lg animate-bounce">
                            <Zap className="w-5 h-5 text-sky-500" />
                         </div>
                         <h3 className="text-xl font-bold text-white uppercase italic">Production in Progress</h3>
                      </div>
                      <p className="text-sm text-slate-400 flex items-center gap-2">
                         <Loader2 className="w-3 h-3 animate-spin text-sky-500" />
                         {renderStatus.message}
                      </p>
                   </div>
                   <div className="flex-1 max-w-xl w-full space-y-3">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                         <span className="text-sky-500">Step {renderStatus.step} of {renderStatus.total}</span>
                         <span className="text-white">{renderStatus.percentage}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                         <div 
                          className="h-full bg-gradient-to-r from-sky-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(56,189,248,0.5)]" 
                          style={{ width: `${renderStatus.percentage}%` }}
                         />
                      </div>
                      <div className="flex items-center justify-between opacity-50">
                         <span className="text-[10px] font-bold text-slate-500">HyperFrames Engine</span>
                         <span className="text-[10px] font-bold text-slate-500">Est: ~2 mins</span>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        )}

        {/* Input Section */}
        <section className="relative group max-w-4xl mx-auto w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-[#0a0a0a] border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 flex items-center pl-4">
              <Sparkles className="w-5 h-5 text-sky-500 mr-3" />
              <input 
                type="text" 
                placeholder="Paste an article URL (VnExpress, TechCrunch, ...) "
                className="w-full bg-transparent border-none focus:ring-0 py-4 text-lg text-white placeholder:text-slate-600 font-medium"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button 
              onClick={handleParse}
              disabled={loading || !url}
              className={cn(
                "px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed",
                loading && "animate-pulse"
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              {loading ? 'Analyzing...' : 'Generate Script'}
            </button>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Editor Area */}
          <div className="xl:col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Type className="w-5 h-5 text-sky-400" />
                Script & Composition
              </h2>
              {script && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button 
                    onClick={handleRender}
                    disabled={rendering}
                    className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 rounded-xl text-sm font-black text-white shadow-lg shadow-sky-500/20 transition-all uppercase tracking-tighter"
                  >
                    {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                    Produce MP4
                  </button>
                </div>
              )}
            </div>

            {!script ? (
              <div className="h-[500px] bg-white/[0.02] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 space-y-6">
                <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/5">
                   <AlertCircle className="w-10 h-10 opacity-20" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-bold text-slate-400">No Script Loaded</p>
                  <p className="text-sm">Paste a URL above to start the AI orchestration engine.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {script.scenes.map((scene, idx) => (
                  <div key={idx} className="group bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-5 hover:border-sky-500/30 transition-all shadow-xl hover:shadow-sky-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-sky-400">
                          {idx + 1}
                        </div>
                        <div className="space-y-0.5">
                           <div className="flex items-center gap-2">
                              <span className="uppercase text-[10px] font-black tracking-widest text-slate-500">{scene.type}</span>
                              <div className="w-1 h-1 rounded-full bg-slate-800" />
                              <span className="text-xs font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full">{scene.templateData.template}</span>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all" onClick={() => deleteScene(idx)}>
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">Voiceover Script</label>
                       <textarea 
                          className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-slate-300 focus:ring-1 focus:ring-sky-500/50 transition-all outline-none text-base leading-relaxed placeholder:text-slate-700"
                          rows={3}
                          value={scene.voiceText}
                          onChange={(e) => updateScene(idx, { voiceText: e.target.value })}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-sky-400 transition-colors">
                          <Music className="w-3.5 h-3.5" /> SFX: {scene.sfx?.name || 'Auto-Optimized'}
                       </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addScene}
                  className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-slate-600 hover:text-sky-500 hover:border-sky-500/20 hover:bg-sky-500/5 transition-all flex items-center justify-center gap-3 font-bold uppercase text-xs tracking-widest"
                >
                  <Plus className="w-4 h-4" /> Add Scene
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-4 space-y-10">
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <History className="w-5 h-5 text-emerald-400" />
                Production History
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                {videos.length === 0 ? (
                  <div className="p-8 border border-white/5 bg-white/[0.01] rounded-2xl text-center">
                    <p className="text-slate-600 text-sm font-medium">No videos found in output/</p>
                  </div>
                ) : (
                  videos.map((vid, idx) => (
                    <div key={idx} className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/50 transition-all shadow-2xl">
                      <div className="aspect-[9/16] bg-slate-900 relative">
                         {vid.thumbnail ? (
                           <img src={`http://localhost:3001${vid.thumbnail}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                              <Video className="w-12 h-12 text-white/10" />
                           </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                         
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                            <a 
                              href={`http://localhost:3001${vid.url}`} 
                              target="_blank" 
                              className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center shadow-2xl shadow-sky-500/50 hover:bg-sky-400 transition-colors"
                            >
                               <Play className="w-7 h-7 text-white fill-white ml-1" />
                            </a>
                         </div>

                         <div className="absolute bottom-4 left-4 right-4 space-y-1">
                            <p className="text-sm font-bold text-white truncate drop-shadow-lg">{vid.slug}</p>
                            <div className="flex items-center justify-between">
                               <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest bg-sky-500/20 px-2 py-0.5 rounded-md backdrop-blur-md">TikTok Ready</span>
                               <span className="text-[10px] text-slate-400 font-medium">1080x1920</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="p-3 bg-white/5 flex items-center justify-between gap-2 border-t border-white/10">
                         <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-400 transition-all flex items-center justify-center gap-2">
                            <History className="w-3.5 h-3.5" /> Re-Render
                         </button>
                         <a href={`http://localhost:3001${vid.url}`} download className="p-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-lg transition-all">
                            <Download className="w-4 h-4" />
                         </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 border-t border-white/5 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 hover:opacity-100 transition-opacity">
         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">© 2026 Auto-Create-Video Pipeline</p>
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Engine: HyperFrames 0.4</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">UI: React 19 + Tailwind 4</span>
         </div>
      </footer>
    </div>
  );
}
