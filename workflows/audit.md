# /audit - Visual Architecture Audit

$ARGUMENTS

---

## Purpose
Kích hoạt quy trình kiểm toán mã nguồn và tự động vẽ sơ đồ cấu trúc kiến trúc (Before/After) lên trình duyệt dưới dạng file HTML, giúp phân tích các module cồng kềnh và đưa ra phương án tái cấu trúc trực quan.

---

## Behavior
Khi `/audit` được kích hoạt:

1. **Khảo sát:** Đọc và phân tích cấu trúc thư mục hoặc file được chỉ định.
2. **Vẽ biểu đồ:** Áp dụng bộ quy tắc `@[.agent/skills/visual-architecture-audit/SKILL.md]` để sinh ra mã HTML & Mermaid biểu diễn sơ đồ kiến trúc.
3. **Trình diễn:** Mở trực tiếp file HTML trên trình duyệt của máy tính (`xdg-open` trên Ubuntu).
4. **Tham vấn:** Đợi người dùng xem xong báo cáo và quyết định phương án tái cấu trúc.

---

## Examples

```
/audit @[frontend/src/components]
/audit @[backend/src/main/java/com/techhub/order]
```
