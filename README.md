# Lam Son — Khảo sát DISC 30 câu

Ứng dụng web tiếng Việt, ưu tiên điện thoại, cho **trưởng phòng ban Lam Son** làm khảo sát 30 câu trắc nghiệm, xem **kết quả sơ bộ của chính mình**. Toàn bộ câu trả lời và kết quả được **ghi vào một Google Sheets** do coach sở hữu. Coach tự phân tích dữ liệu sau.

> Bộ câu hỏi tự biên soạn (`lamson-disc-30-vi-3.0.0`), **chưa chuẩn hóa hoặc kiểm định tâm trắc**. Không dùng để chẩn đoán, tuyển dụng, thưởng/phạt hay xếp hạng năng lực. Không phải Everything DiSC hay sản phẩm của nhà cung cấp thương mại nào.

## Phạm vi

- Luồng: **Mở đầu → Thông tin (họ tên, phòng ban bắt buộc; chức danh tùy chọn) + đồng ý gửi cho coach → 30 câu (4 câu/trang, trang cuối 2 câu) → Rà soát → Gửi → Kết quả sơ bộ.**
- 30 câu = 24 câu DISC (6 câu mỗi nhóm D/I/S/C) + 3 câu leadership + 3 câu làm việc nhóm. Thang 1–5 và N/A riêng. Không chọn sẵn đáp án. Phải chọn đủ 30 câu mới gửi được.
- Kết quả sơ bộ: bốn điểm, số câu có điểm từng nhóm, một nhận xét ngắn, tối đa 2 phát biểu được chấm 4–5, bảng lựa chọn của 6 câu bổ sung, trạng thái ghi Sheets.
- **Không có** coaching, câu hỏi mở, kế hoạch hành động, gợi ý coach, đánh giá nguồn lực hay xếp hạng trong app/Sheets. Phần đánh giá nguồn lực công ty và đề xuất phương án coach được làm riêng **sau khi đã có dữ liệu thật**.

## Kiến trúc

```
Trình duyệt (React + TypeScript + Vite)          Google (tài khoản của coach)
  ├─ src/data/lamson-30.vi.json   ──┐              ┌─ Google Sheets "LAM SON - DISC 30 cau - Ket qua"
  ├─ src/domain/ (chấm điểm, nhận xét)            │    KET_QUA · TRA_LOI · DANH_SACH · CAU_HOI · HUONG_DAN
  └─ POST text/plain ──────────────────────────────►  Apps Script web app (apps-script/Code.gs)
                                                       kiểm tra → chấm lại → khóa → ghi 2 tab → biên nhận
```

- **Máy chủ = Google Apps Script** gắn vào chính Sheet. Không cần thuê server, không có secret trong code. Apps Script chạy bằng quyền của coach, nên chỉ coach đọc được Sheet; người làm khảo sát chỉ **gửi** được dữ liệu.
- `apps-script/Code.gs` được **sinh tự động** từ `apps-script/Code.template.js` + JSON câu hỏi + schema Sheets (`npm run build:gas`). `npm run build` báo lỗi nếu Code.gs cũ.
- Máy chủ **không tin điểm do trình duyệt gửi**: payload không có điểm (trường thừa bị từ chối) và Apps Script tự tính lại. Một test so sánh chấm điểm của app và Apps Script trên 300 bộ đáp án ngẫu nhiên.

| Thư mục | Nội dung |
|---|---|
| `src/data/` | `lamson-30.vi.json` (30 câu, thang, quy tắc), `lamson-30.sheets-schema.json` (tab, tiêu đề cột) |
| `src/domain/` | `questionnaire` (kiểm tra JSON), `answers` (whitelist ID, giá trị), `scoring`, `interpretation`, `narrative`, `session`, `submission` (payload, gửi, biên nhận) |
| `src/ui/` | `useAppState`, 5 màn hình, biểu đồ |
| `apps-script/` | Template và Code.gs để dán vào Apps Script |
| `tests/unit/` | Vitest: chấm điểm, ranh giới, payload, Apps Script trên bảng tính giả |
| `tests/e2e/` | Playwright: luồng chính với Code.gs thật chạy trên bảng tính giả |
| `docs/lam-son/` | Tài liệu gốc (prompt, 30 câu, schema) · `docs/screenshots/` ảnh màn hình |

## Chạy và kiểm thử

Yêu cầu Node.js ≥ 22.12.

```bash
npm install
npm run dev            # http://127.0.0.1:5173 – chế độ chạy thử nếu chưa có VITE_SUBMIT_URL
npm run build          # kiểm tra Code.gs + kiểu + build dist/
npm test               # Vitest
npm run test:e2e       # Playwright (tự build với URL Apps Script giả)
npm run build:gas      # sinh lại apps-script/Code.gs sau khi sửa câu hỏi/schema
npm run screenshots
```

Lần đầu chạy E2E trên máy khác: `npx playwright install chromium`. Phiên bản thư viện được khóa chính xác trong `package.json` + `package-lock.json` (React 19.3.0, Vite 8.3.4, TypeScript 5.9.3, Zod 4.6.5, Vitest 5.0.3, Playwright 1.56.1).

Khi **chưa cấu hình** `VITE_SUBMIT_URL`, app hiện rõ “Bản chạy thử: chưa gửi cho coach” và không gửi gì ra ngoài.

## Thiết lập Google Sheets (làm một lần, khoảng 10 phút)

Thư mục đích: `G:\My Drive\COACHING\DISC` = Drive folder `1iDOyMIg7XzcjvJ_3QQk8Nv9gFoxSgHOl`. Đường dẫn G: chỉ là nơi Drive đồng bộ trên máy tính; trình duyệt không ghi trực tiếp vào đó.

1. Trang tính đã được tạo ngày 13/10/2026 trong thư mục DISC: [LAM SON - DISC 30 cau - Ket qua](https://docs.google.com/spreadsheets/d/1wrbWlPCAWJpkuqOOU4tjToTqwfhK_WdzEmVd6enju7k/edit) (ID lưu ở `spreadsheetId` trong schema), đã có sẵn 5 tab, tiêu đề cột, CAU_HOI và HUONG_DAN. Nếu cần tạo lại: trong thư mục → **Mới → Google Trang tính** với đúng tên trên; script không xóa file nào.
2. Trong Sheet: **Tiện ích mở rộng → Apps Script**. Xóa nội dung mẫu, dán toàn bộ `apps-script/Code.gs`, bấm Lưu.
3. Chọn hàm `setup` → **Chạy** → cấp quyền cho chính tài khoản của bạn. Script tạo 5 tab và tiêu đề cột, điền CAU_HOI và HUONG_DAN. Chạy lại không tạo trùng; tab cũ (ví dụ COACH_CA_NHAN) được giữ nguyên, script chỉ không ghi vào đó nữa.
4. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**: *Thực thi với tư cách*: **Tôi**; *Người có quyền truy cập*: **Bất kỳ ai**. Sao chép URL kết thúc bằng `/exec`.
   - “Bất kỳ ai” chỉ cho phép **gửi** bài; không ai đọc được Sheet qua URL này (hàm `doGet` chỉ trả trạng thái dịch vụ).
5. Tạo file `.env` (xem `.env.example`) với `VITE_SUBMIT_URL=<URL /exec>`, rồi `npm run build`. Thư mục `dist/` là website tĩnh để đặt lên hosting tĩnh bất kỳ (việc chọn và đưa lên hosting do chủ dự án quyết định).
6. Không chia sẻ Sheet công khai. Chỉ thêm quyền cho coach được chỉ định. Ẩn hoặc khóa tab **không** phải là kiểm soát truy cập.
7. (Tùy chọn) Apps Script → Cài đặt dự án → Thuộc tính tập lệnh: `CAMPAIGN_ID` (mặc định `LAMSON-2026`).

Khi sửa Code.gs: dán bản mới rồi **Triển khai → Quản lý triển khai → Chỉnh sửa → Phiên bản mới**; URL `/exec` giữ nguyên.

**DANH_SACH**: coach tự nhập danh sách trưởng phòng dự kiến (`Participant_ID, Ho_ten, Phong_ban, Chuc_danh, Campaign_ID`) để biết ai chưa làm. `Participant_ID` trong KET_QUA = `P-` + 12 ký tự SHA-256 của “họ tên|phòng ban” (chữ thường), dùng để đối chiếu, không phải mã bí mật.

## Ghi dữ liệu an toàn

- Mỗi lần nộp có `Submission_ID` (UUID) tạo trên máy. **Gửi lại cùng mã không tạo dòng trùng**; cùng mã nhưng khác đáp án bị từ chối.
- Apps Script dùng `LockService` và kiểm tra **từng tab riêng**: nếu lần trước chỉ ghi được TRA_LOI (Google lỗi 403/429/timeout), lần gửi lại sẽ bổ sung KET_QUA.
- Lỗi tạm thời → app hiện “Chưa gửi được” và nút **Gửi lại**; câu trả lời vẫn còn trên trang. App **chỉ** báo “Đã ghi nhận vào Google Sheets” khi nhận được biên nhận hợp lệ, đúng mã.
- Chuỗi bắt đầu bằng `= + - @` được ghi như văn bản (thêm `'`) để chặn chèn công thức.
- Không ghi log đáp án hay thông tin cá nhân. Không localStorage, không analytics. Bản build có Content-Security-Policy chỉ cho phép kết nối tới `script.google.com`.

### Giới hạn so với prompt gốc

Prompt gốc mô tả máy chủ Node + SQLite/PostgreSQL, outbox, worker đồng bộ và link mời cá nhân. Theo lựa chọn của chủ dự án, bản này dùng Apps Script và người làm tự nhập họ tên + phòng ban. Hệ quả:

- Không có link mời/cookie phiên, nên **không chống mạo danh**: ai có link app đều gửi được bài dưới tên bất kỳ. Coach đối chiếu với DANH_SACH. Nếu cần chống mạo danh, phải bổ sung link mời có mã riêng.
- Sheets là nơi lưu chính (không có database riêng). Không có hàng đợi bền vững phía máy chủ; nếu Google lỗi, dữ liệu nằm trên trang của người làm cho tới khi gửi lại thành công.
- Apps Script giới hạn khoảng 30 lượt thực thi đồng thời và có hạn mức ngày; đủ cho quy mô vài trăm trưởng phòng.
- Chưa kiểm chứng với Google thật trong môi trường này (không có quyền vào Drive của coach). Toàn bộ logic Code.gs đã chạy trong test trên bảng tính giả, gồm cả lỗi 403/429/timeout và ghi một phần.

## Công thức chấm điểm

- Chỉ 24 câu `scored: true`. Mỗi nhóm: `n` = số câu 1–5 (N/A và câu thiếu không tính, **không** thay bằng 3); `mean = total / n`; `score = 25 × (mean − 1)`, 0–100; `n = 0` → không có điểm.
- 6 câu L1–L3, T1–T3: chỉ lưu đáp án gốc, không cộng điểm, không tạo điểm năng lực.
- **complete**: 24/24 câu DISC có điểm; **partial**: 20–23 và mỗi nhóm ≥ 5; **insufficient**: còn lại (không nhận xét xu hướng).
- **flat** nếu cao nhất − thấp nhất ≤ 10. Ngược lại, ứng viên = mọi nhóm cách điểm cao nhất ≤ 10, giữ đồng hạng: 1 → clearer, 2 → close_pair, 3 → multiple. So sánh trên điểm chưa làm tròn, sai số 1e-9; chỉ làm tròn 1 chữ số khi hiển thị.
- Mọi câu DISC có điểm cùng một mức → lời mời rà soát thân thiện, không cáo buộc.
- Không percentile, không độ tin cậy; bốn điểm không cộng thành 100. Các ngưỡng là quy ước MVP, chưa kiểm định.

## Sửa câu hỏi

1. Sửa `src/data/lamson-30.vi.json` và **đổi `version`**. Nếu đổi ID câu, sửa tiêu đề TRA_LOI trong `src/data/lamson-30.sheets-schema.json`.
2. `npm run build:gas`, chạy test, dán Code.gs mới vào Apps Script, chạy `setup()` (thêm câu hỏi phiên bản mới vào CAU_HOI), triển khai phiên bản mới.
3. Máy chủ từ chối bài nộp mang phiên bản khác (ví dụ bộ 32 câu cũ), nên dữ liệu hai phiên bản không bị trộn.

## Xóa dữ liệu và lưu trữ

- Người làm yêu cầu xóa: coach xóa dòng có cùng `Submission_ID` ở KET_QUA và TRA_LOI.
- Thời hạn lưu trữ do chủ dự án quyết định trước khi dùng thật, và nên ghi vào tab HUONG_DAN.
- Sao lưu: Google Sheets có lịch sử phiên bản; có thể định kỳ **Tệp → Tải xuống → .xlsx** vào thư mục DISC.

## Kiểm thử hiện có

- **Unit (57)**: 30 ID / 24 câu DISC cân bằng 4 × 6 / 6 câu không chấm; tất cả 1/3/5 → 0/50/100; 6 câu phụ đổi giá trị không đổi điểm DISC; 5/6 mỗi nhóm → partial, một nhóm 4 → insufficient; biên 10, đồng hạng, làm tròn, N/A, giá trị xấu; payload, gửi lại, lỗi mạng; Apps Script: setup 5 tab không trùng, giữ tab cũ, tiêu đề lệch, ghi đúng cột, trùng mã, xung đột, 403/429, ghi một phần, timeout sau khi ghi, chặn công thức, payload xấu (bản 32 câu, 29 câu, ID trùng/lạ, chuỗi, 3.5, 6, NaN/Infinity, `__proto__`, quá lớn), so khớp chấm điểm app và máy chủ.
- **E2E (9, màn hình 375 px và 320 px)**: luồng đầy đủ tới Sheet, thông tin bắt buộc, không gửi trước khi bấm Gửi, quay lại giữ đáp án, trang cuối 2 câu, rà soát chặn gửi khi thiếu, lỗi mạng rồi gửi lại không trùng, Google lỗi một tab rồi gửi lại, máy chủ từ chối, bàn phím, không tràn ngang, không có giao diện coaching/câu mở.
