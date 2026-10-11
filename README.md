# DISC Coaching Lab

Ứng dụng web tiếng Việt, ưu tiên điện thoại, giúp học viên **tự phản tư** về xu hướng hành vi, xem **gợi ý có bằng chứng từ chính câu trả lời** và **lập kế hoạch thử nghiệm 7 ngày**.

> Bộ câu hỏi tự biên soạn (`disc-reflection-vi-1.0.0`), **chưa chuẩn hóa hoặc kiểm định tâm trắc**. Kết quả dùng cho tự phản tư và trao đổi coaching; không dùng để chẩn đoán, tuyển dụng hoặc xếp hạng năng lực. Đây **không phải** Everything DiSC hay sản phẩm của bất kỳ nhà cung cấp thương mại nào, không dùng logo thương mại và không có chứng nhận.

## Chạy ứng dụng

Yêu cầu Node.js ≥ 22.12 (đã thử với Node 22.22, npm 10.9).

```bash
npm install          # cài đúng phiên bản trong package-lock.json
npm run dev          # http://127.0.0.1:5173
npm run build        # kiểm tra kiểu (tsc -b) + build vào dist/
npm run preview      # chạy bản build tại http://127.0.0.1:4173
npm test             # unit test (Vitest)
npm run test:e2e     # E2E (Playwright, tự build + preview)
npm run screenshots  # chụp lại docs/screenshots bằng fixture tổng hợp
```

Lần đầu chạy E2E trên máy khác: `npx playwright install chromium`.

### Phiên bản đã khóa

Mọi dependency được ghi phiên bản chính xác (`.npmrc` có `save-exact=true`) và khóa bằng `package-lock.json`.

| Gói | Phiên bản | Ghi chú |
|---|---|---|
| react / react-dom | 19.3.0 | |
| zod | 4.6.5 | kiểm tra JSON câu hỏi, localStorage, file nhập |
| vite | 8.3.4 | |
| @vitejs/plugin-react | 6.1.2 | |
| typescript | 5.9.3 | chọn nhánh 5.x ổn định thay vì 7.x để tương thích công cụ |
| vitest | 5.0.3 | |
| @playwright/test | 1.56.1 | khớp bản Chromium 1194 có sẵn trong môi trường kiểm thử |
| @fontsource/inter, @fontsource/plus-jakarta-sans | 5.3.0 | font tự host, có bộ ký tự tiếng Việt, không gọi Google Fonts |
| @types/node, @types/react, @types/react-dom | 22.20.5, 19.3.0, 19.3.0 | |

## Kiến trúc

```
src/
  data/disc-questionnaire.vi.json   # nguồn duy nhất: câu hỏi, thang, profiles, rules
  domain/                           # logic thuần, không phụ thuộc React
    questionnaire.ts                # tải + kiểm tra JSON bằng zod khi khởi động
    answers.ts                      # whitelist ID, kiểm tra giá trị, chặn khóa nguy hiểm
    scoring.ts                      # n, tổng, mean, score từng nhóm
    interpretation.ts               # insufficient / flat / clearer / close_pair / multiple
    recommendations.ts              # bằng chứng, giả thuyết, bài tập cặp, lựa chọn mục tiêu
    narrative.ts                    # câu diễn giải tiếng Việt theo mẫu
    session.ts                      # kiểu dữ liệu phiên, kế hoạch, ngày
    report.ts                       # export JSON, schema, import + tính lại
  storage/persistence.ts            # localStorage chỉ khi học viên bật
  ui/                               # React: App, useAppState, screens/, components/
  styles/                           # tokens.css, base.css, components.css, print.css
tests/unit/                         # Vitest
tests/e2e/                          # Playwright
tests/screenshots/                  # chụp màn hình tài liệu
docs/                               # tài liệu coaching gốc, screenshots, PDF mẫu
```

Luồng: Mở đầu (xác nhận đã hiểu) → Bối cảnh → Khảo sát 8 trang × 4 câu → Rà soát → Kết quả → Coaching → Kế hoạch 7 ngày → Lưu & chia sẻ (in/PDF, export/import, xóa dữ liệu). Khảo sát và báo cáo không gọi AI, không cần API key, không có backend.

## Công thức chấm điểm

Áp dụng cho từng nhóm D, I, S, C (8 câu mỗi nhóm, không có câu đảo điểm):

- `n` = số câu đã chấm 1–5 (N/A = `null` không được tính và **không** bị thay bằng 3; câu chưa trả lời cũng không được tự điền).
- `mean = total / n`, `score = 25 × (mean − 1)` → dải 0–100. Với `n = 0`: `mean = score = null`, không chia cho 0.
- Bốn điểm độc lập, **không cộng thành 100**; không phải percentile, phần trăm tính cách hay xác suất.

Diễn giải (quy ước thiết kế MVP, không phải ngưỡng tâm trắc; lưu trong `rules` của JSON và `SCORING_CONFIG_VERSION = disc-lab-scoring-mvp-1`):

1. **insufficient** nếu có nhóm `n < 6` hoặc tổng `< 24`: chỉ hiển thị số câu từng nhóm; không nhóm chính, không strengths, không gợi ý.
2. Đủ dữ liệu nhưng `< 32` câu có điểm → `partial`, ghi rõ “kết quả tạm thời”.
3. **flat** nếu `max − min ≤ 10`: không nhóm chính/phụ.
4. Ngược lại, `candidates` = mọi nhóm có `max − score ≤ 10` (giữ mọi đồng hạng): 1 → **clearer**, 2 → **close_pair**, 3 → **multiple**.
5. So sánh trên điểm chưa làm tròn, sai số `1e-9` ở ranh giới; chỉ làm tròn 1 chữ số khi hiển thị. Thứ tự D/I/S/C chỉ dùng để hiển thị, không tạo ưu thế khi bằng điểm.
6. Mọi câu có điểm cùng một giá trị → `reviewSuggested`: lời mời rà soát thân thiện, không cáo buộc, không vô hiệu hóa kết quả.

Gợi ý: tối đa 3 câu đã chấm 4–5, sắp điểm giảm dần rồi ID theo bảng chữ cái; mỗi gợi ý có `evidenceIds`, giá trị, phát biểu và `action` lấy từ JSON. Không có câu 4–5 → nói rõ, không bịa. Giả thuyết theo nhóm (profiles) chỉ đưa cho clearer/close_pair, luôn dùng “có thể”, “nếu”; close_pair có thêm bài tập cặp tự biên soạn (DI, DS, DC, IS, IC, SC). multiple/flat ưu tiên từng câu trả lời và mục tiêu học viên tự chọn. Câu 1–2 chỉ xuất hiện như lựa chọn thử nghiệm tùy ý, không phải khuyết điểm.

## Giới hạn

- Chưa có nghiên cứu độ tin cậy, cấu trúc, giá trị đo hay công bằng giữa nhóm; thời lượng 8–10 phút là ước lượng cần thử nghiệm.
- Không suy ra natural/adapted, stress, nghề nghiệp, IQ, bệnh, mức lãnh đạo hay độ tương hợp.
- Điểm thấp hơn chỉ là ít đồng tình hơn với các phát biểu trong bối cảnh đã chọn, không chứng minh thiếu năng lực.
- App không gửi nhắc nhở; ngày xem lại là để học viên tự ghi lịch.

## Quyền riêng tư

- Mặc định dữ liệu chỉ nằm trong bộ nhớ của tab, mất khi tải lại/đóng trang.
- “Lưu trên thiết bị này” (nút **Quyền riêng tư**) mới ghi `localStorage` (khóa `disc-coaching-lab:v1`), kèm cảnh báo thiết bị dùng chung. Tắt tùy chọn sẽ xóa bản lưu. Dữ liệu khôi phục được kiểm tra lại bằng zod; hỏng thì bị xóa.
- **Xóa toàn bộ dữ liệu** (có bước xác nhận) xóa bộ nhớ tab và localStorage.
- Không analytics, không gửi mạng. Bản build có Content-Security-Policy `connect-src 'none'`, font được tự host.
- Chia sẻ với coach chỉ bằng cách học viên tự xuất file. Câu trả lời từng câu chỉ có trong file khi bật ô “Kèm câu trả lời từng câu” (mặc định tắt).

## Schema export (`schemaVersion: 1`)

```jsonc
{
  "schema": "disc-coaching-lab/report",
  "schemaVersion": 1,
  "createdAt": "2026-10-11T08:00:00.000Z",
  "questionnaireVersion": "disc-reflection-vi-1.0.0",
  "scoringConfig": { "version": "disc-lab-scoring-mvp-1",
    "rules": { "minAnsweredPerDimension": 6, "minAnsweredTotal": 24, "closeDelta": 10, "flatRange": 10, "tieDelta": 0 } },
  "context": { "setting": "team", "settingLabel": "Làm việc nhóm", "period": "last-3-months",
               "periodLabel": "3 tháng gần đây", "displayName": "" },
  "startedAt": "2026-10-11", "completedAt": "2026-10-11",
  "counts": { "answered": 32, "na": 0, "unanswered": 0, "total": 32 },
  "scores": { "D": { "n": 8, "itemCount": 8, "score": 100 }, "I": { ... }, "S": { ... }, "C": { ... } },
  "interpretation": { "status": "clearer", "partial": false, "candidates": ["D"], "reviewSuggested": false },
  "evidence": [{ "id": "D1", "value": 5, "text": "…", "action": "…" }],
  "reflections": { "D1": "fit" }, "fitNote": "", "notFitNote": "",
  "goal": { "optionId": "evidence:D2", "text": "…" },
  "plan": { "situation": "", "behavior": "", "count": 3, "usefulSignal": "", "feedbackPerson": "",
            "reviewDate": "2026-10-18", "notes": "" },
  "answersIncluded": false
  // "answers": [{ "id": "D1", "value": 5 }, { "id": "I1", "value": null }, ...]  chỉ khi answersIncluded = true
}
```

Import (chỉ khi người dùng chọn file): giới hạn 1 MB; JSON hợp lệ; chặn `__proto__`/`constructor`/`prototype` ở mọi độ sâu; `schema`, `schemaVersion`, `questionnaireVersion` phải được hỗ trợ; schema zod strict (không trường lạ, giới hạn độ dài text). Đáp án: whitelist 32 ID, không trùng, chỉ số nguyên 1–5 hoặc `null`.

- Có `answers` hợp lệ → **tính lại toàn bộ** điểm, diễn giải và gợi ý; điểm trong file bị bỏ qua (báo nếu không khớp).
- Không có `answers` → nhãn “Báo cáo được nhập, chưa đối chiếu đáp án”; điểm được kiểm tra tính khả thi (`25·(k−n)/n`, số câu khớp tổng), diễn giải được tính lại từ điểm, phát biểu/action lấy từ bộ câu hỏi chứ không lấy từ file.
- Mọi text hiển thị dạng thuần qua React; không dùng `dangerouslySetInnerHTML`.

## Sửa câu hỏi có version

1. Sửa `src/data/disc-questionnaire.vi.json` và **tăng `version`** (ví dụ `disc-reflection-vi-1.1.0`). App kiểm tra JSON khi khởi động (ID dạng `D1`, khớp nhóm, không trùng, `reverse: false`, đủ bốn nhóm).
2. Nếu đổi ngưỡng/logic chấm, sửa `rules` và tăng `SCORING_CONFIG_VERSION` trong `src/domain/questionnaire.ts`.
3. Báo cáo và bản lưu cũ có `questionnaireVersion` khác sẽ bị từ chối với thông báo rõ (không trộn hai bộ câu hỏi). Nếu cần nhận bản cũ, thêm chuyển đổi tường minh trong `report.ts`.
4. Thứ tự hiển thị là thứ tự trong JSON (nên giữ xen kẽ D/I/S/C). Cập nhật test nếu số câu thay đổi; chạy `npm test && npm run test:e2e`.

## Kiểm thử

- **Unit (Vitest, 69 test)**: `tests/unit/` – tất cả 1/3/5, clearer, close_pair đồng hạng, multiple, n=6 vs n=5, 0 câu không NaN, N/A ≠ 3, biên 10 (D75/I65/S50/C25 giữ I; 64,99 loại), range=10 flat, làm tròn không tạo/loại đồng hạng, input xấu (string, số thực, NaN, Infinity, ID lạ/trùng, `__proto__`), XSS text, version lạ, > 1 MB, bằng chứng 0/ít hơn 3/đủ 3 và sourceIds.
- **E2E (Playwright, 18 test, viewport 375px + 320px)**: `tests/e2e/` – luồng đầy đủ tới in/PDF (nút bị ẩn khi in), quay lại giữ đáp án, lỗi trang thiếu câu, rà soát và sửa câu, insufficient, partial, reviewSuggested, refresh khi có/không opt-in, xóa localStorage, export mặc định không có answers / có khi opt-in, import bị sửa điểm được tính lại, import không answers, XSS, version lạ, file hỏng, > 1 MB, bàn phím, không tràn ngang 320/375px.
- Fixture trong test là dữ liệu tổng hợp, không hiển thị như dữ liệu người dùng.

## Screenshots

`docs/screenshots/` (375px): `01-mo-dau`, `02-boi-canh`, `03-khao-sat`, `04-ra-soat`, `05-ket-qua`, `06-coaching`, `07-ke-hoach`, `08-bao-cao-export`, `09-ban-in`, cùng `bao-cao-mau.pdf` (PDF tạo bằng Chromium).

## Giai đoạn sau MVP (chỉ mô tả, chưa xây)

**Coach quản lý lớp** cần: backend thật; authentication; phân quyền owner/coach/student; consent chia sẻ riêng cho từng báo cáo; thời hạn lưu trữ do chủ dự án chọn; xóa dữ liệu theo yêu cầu; audit log; kiểm thử truy cập trái phép. Không đặt secret trong client và không làm dashboard chỉ bằng localStorage.

**Nếu thêm AI**: chỉ để diễn đạt lại dữ liệu đã chấm; bắt buộc `evidenceIds` và validation output; consent riêng trước khi truyền dữ liệu; mặc định không gửi thông tin định danh; luôn có fallback rule-based như hiện tại.
