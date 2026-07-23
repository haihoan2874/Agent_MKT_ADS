# Workflow: Quy Trình Tự Động Tạo Video Ads Marketing (MKT Ads Video Pipeline)

Quy trình chuẩn từng bước giúp AI Agent tự động hóa hoàn toàn từ bước nghiên cứu Trend, viết Kịch bản, lập Storyboard hình ảnh/âm thanh đến gọi Engine Render Video hoàn chỉnh.

---

## 📋 Các Bước Thực Hiện (Execution Flow)

### 1. Nghiên cứu Xu hướng & Insight (Trend & Research)
- **Kích hoạt Skill:** `last30days`, `customer-research`, `competitors`
- **Tác vụ:**
  - Cào & phân tích nội dung, ý tưởng hot trong 30 ngày gần nhất trên Reddit, YouTube, X/Twitter theo từ khóa ngành.
  - Phân tích insight đối tượng khách hàng mục tiêu (Nỗi đau, mong muốn, từ ngữ hay dùng).

### 2. Xây dựng Kịch bản Ads (Scriptwriting & Copywriting)
- **Kích hoạt Skill:** `copywriting`, `ad-creative`, `marketing-psychology`, `ainovel`
- **Tác vụ:**
  - Tạo 3 biến thể kịch bản (Hook 3 giây đầu ➔ Problem ➔ Solution ➔ CTA).
  - Viết Lời thoại (Voiceover script) và Chú thích trên màn hình (On-screen text).
  - Áp dụng các nguyên lý tâm lý học tiếp thị để tối ưu tỷ lệ giữ chân (Retention rate).

### 3. Thiết kế Kịch bản Hình ảnh & Âm thanh (Storyboard & Asset Planning)
- **Kích hoạt Skill:** `video`, `image`
- **Tác vụ:**
  - Xuất bảng phân cảnh (Storyboard) chi tiết cho từng giây.
  - Tạo prompt cho AI sinh ảnh/video illustration (Midjourney / Flux / Runway).
  - Tạo kịch bản Voiceover TTS (ElevenLabs / Edge-TTS) và nhạc nền (BGM).

### 4. Gọi Engine Render Video (Video Engine Rendering)
- **Engine kết nối:** `html-video` (HTML/CSS canvas animation) & `auto-create-video` (Python/FFmpeg pipeline).
- **Tác vụ:**
  - Tự động sinh file HTML template hoặc JSON config cho video engine.
  - Render và tổng hợp thành file video cuối cùng `.mp4`.
