# Polyglot Practice — app học ngoại ngữ thực chiến

App web tiếng Việt, ưu tiên điện thoại, cho **nhân viên công ty và người thân** học **nhiều ngoại ngữ** theo **level (CEFR A1→C2)** và **chuyên ngành**, luyện đủ **Nghe – Nói – Đọc – Viết**, rồi **hội thoại với AI** trong tình huống thật. AI (Claude) chấm Nói/Viết và nhận xét bằng tiếng Việt. Quản trị viên cấp **mã truy cập** và xem **báo cáo tiến độ** ngay trên Google Sheets.

> Thư mục này độc lập với app khảo sát DISC ở thư mục gốc (package, build và test riêng).

## Có gì trong app

| | |
|---|---|
| **Ngôn ngữ** | Tiếng Anh và **Tiếng Hoa** có giáo trình + test xếp lớp. Nhật, Hàn, Pháp, Đức: luyện hội thoại với AI. |
| **Test xếp lớp** | 18 câu trắc nghiệm (có câu nghe), từ dễ đến khó, + một đoạn viết do AI chấm. Hoặc tự chọn level. |
| **Level** | CEFR A1→C2, kèm quy đổi gần đúng IELTS / HSK / JLPT / TOPIK. Làm hết bài của level với kết quả tốt thì app gợi ý lên level. |
| **Chuyên ngành** | Giao tiếp chung (từ A1) · Du lịch, Bán hàng & CSKH, Nhà hàng – Khách sạn (từ A2) · Văn phòng, Thu mua, Kế toán, Nhân sự, IT (từ B1). |
| **Bài học** | Từ vựng + mẹo ngữ pháp → Nghe → Đọc → Nói theo câu mẫu → Nói → Viết → Thực chiến với AI. |
| **Tiếng Hoa** | Chữ giản thể, **pinyin có dấu thanh** (bật/tắt được), đếm độ dài bài viết theo chữ Hán, bot thêm pinyin cho người mới (A1–A2). |
| **Giữ thói quen** | Mục tiêu XP mỗi ngày, chuỗi ngày học liên tiếp, **ôn từ vựng ngắt quãng** (thẻ ghi nhớ, giãn lịch 1-3-7-14-30 ngày). |
| **Báo cáo** | Tab `TIEN_DO` trên Sheets: mỗi người × ngôn ngữ một dòng (level, XP, chuỗi ngày, điểm 4 kỹ năng, số hội thoại, lần học gần nhất). Tab `NHAT_KY_AI`: mỗi lần dùng AI, kèm token để tính chi phí. |

**Nội dung hiện có:**
- **Tiếng Anh (9 unit):**
  - A1: Chào hỏi; Số – giờ – giá.
  - A2: Chuyện phiếm công sở; Khách sạn; Tư vấn khách hàng.
  - B1: Xin báo giá (Thu mua); Báo cáo tiến độ (Văn phòng); Nhắc nợ quá hạn (Kế toán); Phỏng vấn (Nhân sự).
  - B2: Đàm phán tăng giá.
- **Tiếng Hoa (6 unit):**
  - A1: 你好 – giới thiệu; 多少钱 – mua sắm.
  - A2: Một ngày của tôi; Gọi món ở nhà hàng.
  - B1: Họp – báo cáo tiến độ; 询价 – hỏi giá nhà cung cấp.

### Thiết kế nội dung tham khảo các app phổ biến

Không sao chép nội dung của app nào; chỉ áp dụng cách làm đã được chứng minh hiệu quả:

| Cách làm | Học từ | Áp dụng trong app |
|---|---|---|
| Bài ngắn 5–10 phút, XP, chuỗi ngày, mục tiêu ngày | Duolingo | XP mỗi hoạt động, vòng mục tiêu ngày, 🔥 chuỗi ngày |
| Bài học xoay quanh hội thoại đời thực, ngữ pháp gọn trong ngữ cảnh | Babbel | Mỗi bài một tình huống công việc/đời sống, mẹo ngữ pháp 2–3 ý kèm ví dụ |
| Bám khung CEFR, bài Nói/Viết được chấm và sửa | Busuu | Level CEFR, AI chấm theo level, chỉ ra lỗi + bản viết tốt hơn |
| Nói là chính, đóng vai với AI | Speak, Praktika | Bước “Thực chiến” cuối mỗi bài + thư viện tình huống theo chuyên ngành |
| Nghe rồi nói lại câu mẫu | ELSA, HelloChinese | Bước “Nói theo”: app tự chấm độ khớp, không tốn lượt AI |
| Pinyin, thanh điệu, câu hỏi tiếng mẹ đẻ cho người mới | HelloChinese, SuperChinese | Pinyin bật/tắt; câu hỏi A1–A2 bằng tiếng Việt, từ B1 bằng tiếng Hoa |
| Ôn tập ngắt quãng | Anki, Babbel Review | Hộp Leitner cho từ vựng của các bài đã học |

## Kiến trúc

```
Điện thoại / máy tính                              Google (tài khoản quản trị)
GitHub Pages: giao diện React (tĩnh, miễn phí)     Google Sheets  NGUOI_DUNG · TIEN_DO · NHAT_KY_AI · HUONG_DAN
  ├─ giáo trình, test, chấm trắc nghiệm,               ▲
  │  chấm "nói theo", ôn tập: chạy trên máy             │ đọc/ghi
  └─ POST (mã truy cập + yêu cầu) ───────────────►  Apps Script web app (apps-script/Code.gs)
                                                     ├─ kiểm tra mã, giới hạn lượt AI/ngày
                                                     ├─ gọi Claude API (API key nằm ở Apps Script)
                                                     └─ ghi tiến độ + nhật ký
```

- Giao diện nằm trên **GitHub Pages**, không nằm trong Apps Script, vì trang Apps Script không cho dùng micro (bước Nói sẽ không chạy).
- **API key** chỉ nằm trong Thuộc tính tập lệnh của Apps Script, không có trong code và không lộ ra trình duyệt.
- `apps-script/Code.gs` **được sinh tự động** từ `backend/` + `shared/` (`npm run build:gas`). Test và máy chủ dev chạy chính file Code.gs này trên bảng tính giả lập, nên thứ chạy thật là thứ đã được kiểm thử.
- Apps Script không chạy được SDK npm, nên backend gọi Claude Messages API bằng HTTP trực tiếp (`backend/claude.ts`). Model mặc định là `claude-opus-5-5`, đổi được bằng thuộc tính `CLAUDE_MODEL`. Hội thoại dùng effort `low`, chấm bài dùng `medium` kèm JSON schema. Đã bật fallback phía server: nếu bộ lọc an toàn từ chối nhầm, API tự chạy lại bằng model dự phòng.

| Thư mục | Nội dung |
|---|---|
| `shared/` | Hợp đồng API (schema zod), danh sách ngôn ngữ, prompt cho AI, thống kê |
| `backend/` | Mã Apps Script: `main.ts` (doPost, menu), `sheets.ts` (các tab), `claude.ts` (gọi AI) |
| `apps-script/Code.gs` | **File để dán vào Apps Script** (sinh tự động, đừng sửa tay) |
| `src/content/` | Giáo trình `courses/en/`, `courses/zh/`; test xếp lớp `placement/`; chuyên ngành + thư viện tình huống `tracks.ts` |
| `src/domain/` | Logic thuần có test: xếp lớp, mở khoá chuyên ngành, tiến độ/XP/ôn tập, chấm nói theo |
| `src/ui/` | Các màn hình: đăng nhập, chọn ngôn ngữ, xếp lớp, tổng quan, bài học, ôn tập, hội thoại |
| `tools/` | Bảng tính giả lập + máy chủ dev chạy Code.gs |
| `tests/` | Test logic, nội dung, và backend (chạy Code.gs thật) |

## Triển khai (làm một lần, khoảng 20 phút)

### Bước 1 — Google Sheets + Apps Script (máy chủ)

1. Tạo một Google Sheet mới, đặt tên ví dụ **“Polyglot – Học ngoại ngữ”**.
2. Menu **Tiện ích mở rộng → Apps Script**. Xoá hết code mẫu trong `Code.gs`.
3. Mở file [`language-app/apps-script/Code.gs`](apps-script/Code.gs) trên GitHub → nút **Copy raw file** → dán vào Apps Script → **Lưu** (Ctrl+S).
4. Ở thanh trên, chọn hàm **`setup`** → **Chạy** → cho phép các quyền Google hỏi. Sheet sẽ có 4 tab và một người dùng thử (có mã sẵn).
5. **Cài đặt dự án** (biểu tượng bánh răng bên trái) → **Thuộc tính tập lệnh** → **Thêm thuộc tính**:
   - `ANTHROPIC_API_KEY` = API key lấy ở [console.anthropic.com](https://console.anthropic.com) → API Keys (cần nạp credit vào tài khoản).
   - Tuỳ chọn: `CLAUDE_MODEL` = `claude-haiku-5-5` nếu muốn tiết kiệm (xem phần Chi phí).
6. **Triển khai → Tác vụ triển khai mới** → biểu tượng bánh răng → **Ứng dụng web**:
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   
   → **Triển khai** → sao chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`).
7. Tải lại trang Sheet: sẽ có menu **Polyglot** (Tạo mã truy cập, Cài đặt các tab).

> Khi em cập nhật `Code.gs`: dán bản mới → **Triển khai → Quản lý các bản triển khai** → ✏️ → Phiên bản: **Phiên bản mới** → Triển khai. URL giữ nguyên.

### Bước 2 — GitHub Pages (giao diện)

1. Trên GitHub repo: **Settings → Pages** → Source: **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → tab Variables → New repository variable**:
   - Tên: `LANG_APP_API_URL`
   - Giá trị: URL `/exec` ở bước 1.6
3. Merge nhánh này vào `main`. GitHub tự build và đăng app (xem tiến trình ở tab **Actions**).
4. App chạy tại **https://haithuy88.github.io/DISC-Coaching/** — gửi link này cho người học.

### Bước 3 — Cấp mã cho người học

1. Tab `NGUOI_DUNG`: điền **Họ tên** và **Nhóm** (Nhân viên / Người thân), để trống cột Mã.
2. Menu **Polyglot → Tạo mã truy cập**. Mỗi người nhận một mã dạng `LS-7KQ2MX` (đã bỏ các ký tự dễ nhầm như 0/O, 1/I).
3. Gửi link app + mã cho từng người. Họ nhập mã một lần trên mỗi máy.
4. Khoá ai đó: đổi **Trạng thái** thành `Khoá`. Giới hạn lượt AI/ngày: cột **Giới hạn AI/ngày** (để trống = 60).

## Chi phí AI (ước tính)

Chỉ phần **chấm Nói/Viết** và **hội thoại** tốn tiền. Trắc nghiệm, nói theo câu mẫu và ôn tập chạy trên máy, miễn phí. Số liệu dưới đây là ước tính thô; chi phí thật tính được từ cột token trong `NHAT_KY_AI`.

| Model | Giá / 1 triệu token (vào / ra) | Một lượt hội thoại | Một lần chấm bài | Một bài học trọn vẹn* |
|---|---|---|---|---|
| `claude-opus-5-5` (mặc định, chấm kỹ nhất) | 4 / 20 USD | ~0,01 USD | ~0,04 USD | ~0,2 USD (≈ 5.000đ) |
| `claude-haiku-5-5` (tiết kiệm) | 0,10 / 0,50 USD | dưới 0,001 USD | ~0,001 USD | ~0,005 USD (≈ 130đ) |

\* Nói + Viết + 10 lượt hội thoại + nhận xét cuối. Mức giới hạn 60 lượt/ngày/người giúp không ai vượt quá vài USD mỗi ngày.

## Dành cho người phát triển

Cần Node ≥ 22.18.

```bash
cd language-app
npm install
cp .env.example .env     # điền ANTHROPIC_API_KEY nếu muốn gọi AI thật khi dev
npm run dev              # giao diện http://127.0.0.1:5174 + Apps Script giả lập (mã thử in ra terminal)
npm test                 # test logic, nội dung và Code.gs
npm run typecheck
npm run build:gas        # sinh lại apps-script/Code.gs sau khi sửa backend/ hoặc shared/
npm run build            # báo lỗi nếu Code.gs cũ; build giao diện vào dist/
```

Dữ liệu bảng tính giả khi dev nằm ở `.dev-data/sheets.json` (không commit).

### Thêm nội dung

- **Unit mới**: thêm vào file level tương ứng trong `src/content/courses/<ngôn ngữ>/`. Mỗi bài có từ vựng, mẹo ngữ pháp, các hoạt động `listening` / `reading` / `shadowing` / `speaking` / `writing`, và một `roleplay`. Tiếng Hoa: điền `reading` (pinyin) cho từ vựng và câu mẫu. Test sẽ báo lỗi nếu trùng id, sai chỉ số đáp án, thiếu kỹ năng, hoặc thiếu pinyin ở A1–A2.
- **Ngôn ngữ mới có giáo trình**: tạo `courses/<code>/` + `placement/<code>.ts`, đăng ký trong `src/content/index.ts`, bật `hasCourse` trong `shared/languages.ts`.
- **Tình huống hội thoại**: thêm vào `SCENARIO_LIBRARY` trong `src/content/tracks.ts`. Dùng được cho mọi ngôn ngữ.

## Giới hạn hiện tại

- **Phát âm**: phần Nói được chấm qua bản ghi chữ, phần Nói theo chấm bằng độ khớp chữ. Chưa chấm được thanh điệu và âm chi tiết; việc đó cần dịch vụ chấm âm thanh riêng.
- **Bot trả lời cả câu một lần** (chờ 2–5 giây) vì Apps Script không hỗ trợ trả dữ liệu dần. Chấm bài mất khoảng 10–30 giây.
- **Test xếp lớp** do em tự soạn, chưa chuẩn hoá; chỉ dùng để gợi ý điểm bắt đầu.
- **Đồng bộ nhiều máy**: khi một người học trên hai máy, app giữ bản có nhiều XP hơn.
