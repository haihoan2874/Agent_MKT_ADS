# 🧠 Agent_Core - Hệ Sinh Thái AI Cá Nhân

> **Vũ khí bí mật** giúp tích hợp hệ thống Agentic AI (Antigravity/Gemini) vào mọi dự án lập trình với cấu hình tối ưu sẵn có.

## 🚀 Tính năng nổi bật
- **20 Chuyên gia AI** (Backend, Frontend, Security, DevOps,...)
- **61 Kỹ năng chuyên sâu** (S-Life UI Kit, Systematic Debugging, Architecture Design,...)
- **11 Workflows** điều khiển bằng Slash Commands (`/debug`, `/enhance`, `/orchestrate`).
- **Tích hợp MCP RAG Server** giúp AI đọc hiểu toàn bộ codebase và có bộ nhớ vĩnh cửu.
- Chế độ **Socratic Gate** ép AI phải tư duy, phân tích trước khi code.

---

## 💻 Hướng Dẫn Sử Dụng (Cho dự án MỚI)

Khi anh bắt đầu làm một dự án hoàn toàn mới, anh không cần phải cấu hình AI từ số 0. Hãy làm theo 2 bước sau:

**Bước 1:** Bật Terminal tại thư mục gốc của dự án mới và chạy lệnh clone Bộ não này về (Lưu ý dấu chấm phía sau để báo nó clone vào folder `.agent`):
```bash
git clone https://github.com/haihoan2874/Agent_Core.git .agent
```

**Bước 2:** Cập nhật Memory cho dự án mới
Tạo một file có tên là `PROJECT_MEMORY.md` bên trong thư mục `.agent/rules/` và ghi các quy tắc nghiệp vụ/database của dự án mới vào đó. (File này đã được `.gitignore` che đi, nên nó sẽ chỉ tồn tại ở máy local của dự án đó).

---

## 🔄 Hướng Dẫn Cập Nhật (Đồng Bộ)

Nếu anh đang code và **dạy cho AI thêm 1 kỹ năng mới** (hoặc tạo 1 script mới trong thư mục `.agent`), anh muốn các dự án khác cũng được thừa hưởng độ khôn này? Rất đơn giản:

**Tại dự án vừa update (Đẩy lên não trung tâm):**
```bash
cd .agent
git add .
git commit -m "Nâng cấp kĩ năng AI"
git push
```

**Tại các dự án khác (Tải não mới về):**
```bash
cd .agent
git pull
```

---
*Developed & Optimized for Tech Lead Workflow.*
