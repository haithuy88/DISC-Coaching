# Polyglot Practice — app học ngoại ngữ thực chiến (bộ khung)

App web tiếng Việt, ưu tiên điện thoại, cho người Việt học **nhiều ngoại ngữ** theo **level (CEFR A1→C2)** và **chuyên ngành**, luyện đủ **Nghe – Nói – Đọc – Viết**, rồi **hội thoại với AI** trong tình huống thật. AI (Claude) chấm bài Nói/Viết và nhận xét cuộc hội thoại bằng tiếng Việt.

> Thư mục này độc lập với app khảo sát DISC ở thư mục gốc (package, build và test riêng).

## Luồng người học

```
Chọn ngôn ngữ ──► Test xếp lớp ──────────────► Tổng quan
                  (trắc nghiệm có câu nghe      ├─ Level + quy đổi IELTS/HSK/JLPT/TOPIK
                   + đoạn viết AI chấm)          ├─ 4 thanh kỹ năng Nghe/Nói/Đọc/Viết
                  hoặc tự chọn level             ├─ Chuyên ngành: mở dần theo level
                                                 ├─ Bài học ──► Từ vựng → Nghe → Đọc → Nói → Viết → Thực chiến
                                                 └─ Hội thoại thực chiến (bot đóng vai) ──► AI nhận xét
```

- **Xếp lớp**: level = level cao nhất mà nó và mọi level dưới đều đúng ≥ 60%. Đoạn viết do AI chấm có thể hạ tối đa 1 level (`src/domain/placement.ts`). Ngôn ngữ chưa có bộ trắc nghiệm thì chỉ làm phần viết.
- **Chuyên ngành theo level**: Giao tiếp chung từ A1; Du lịch, Bán hàng & CSKH, Nhà hàng – Khách sạn từ A2; Văn phòng, Thu mua, Kế toán, Nhân sự, IT từ B1 (`src/content/tracks.ts`).
- **Lên level**: làm hết bài của level hiện tại, mỗi kỹ năng trung bình ≥ 70 thì app gợi ý lên level.
- **Bot hội thoại**: đóng vai theo tình huống của bài học hoặc thư viện tình huống theo chuyên ngành, nói theo độ khó của level, mỗi lượt 1–3 câu để người học nói nhiều hơn; người học bí thì gõ tiếng Việt để nhận gợi ý. Bấm “Kết thúc & nhận xét” để AI chấm cả cuộc hội thoại.
- **Nghe / Nói** dùng giọng đọc và nhận giọng nói có sẵn của trình duyệt (miễn phí). Nhận giọng nói chạy trên Chrome/Edge/Safari; người học sửa được bản ghi trước khi nộp.

## Kiến trúc

```
Trình duyệt (React + TS + Vite)                 Máy chủ Node (server/)                 Claude API
 ├─ src/content/   giáo trình, bài test,        ├─ kiểm tra payload bằng zod
 │                 chuyên ngành, tình huống      │   (shared/api.ts, từ chối trường lạ)
 ├─ src/domain/    xếp lớp, mở khoá, tiến độ    ├─ giới hạn số lượt/phút theo IP
 ├─ src/lib/       gọi API, giọng nói            ├─ POST /api/chat   ── stream ────────►  bot đóng vai
 └─ localStorage   tiến độ người học    ──────► └─ POST /api/grade  ── JSON có schema ►  chấm Nói/Viết/hội thoại
```

| Thư mục | Nội dung |
|---|---|
| `shared/` | Hợp đồng API (schema zod) và danh sách ngôn ngữ, dùng chung cho cả hai phía |
| `server/` | `index.ts` (HTTP, giới hạn, phục vụ `dist/`), `claude.ts` (gọi Claude), `prompts.ts` (prompt bot và bộ chấm) |
| `src/content/` | `courses/en.ts` (3 unit mẫu: A1 Giao tiếp, A2 Du lịch, B1 Thu mua), `placement/en.ts` (18 câu), `tracks.ts` |
| `src/domain/` | Logic thuần, có unit test: `placement`, `curriculum`, `progress`, `levels` |
| `src/ui/` | 5 màn hình: chọn ngôn ngữ, xếp lớp, tổng quan, bài học, hội thoại |
| `tests/` | Vitest cho logic lõi |

**AI**: mặc định `claude-opus-5-5`; hội thoại chạy effort `low` (nhanh), chấm bài effort `medium` với output có schema nên luôn trả đúng cấu trúc. Đã bật **fallback phía server** (`fallbacks: "default"`): nếu bộ lọc an toàn từ chối nhầm một yêu cầu, API tự chạy lại trên model dự phòng. Đổi model bằng biến `CLAUDE_MODEL` (vd. `claude-haiku-5-5` rẻ hơn rất nhiều cho hội thoại số lượng lớn).

## Chạy thử

Cần Node ≥ 22.18 (chạy TypeScript trực tiếp, không cần bước biên dịch máy chủ) và một API key Anthropic.

```bash
cd language-app
npm install
cp .env.example .env        # điền ANTHROPIC_API_KEY
npm run dev                 # API ở :8787, giao diện ở http://127.0.0.1:5174
npm test                    # unit test
npm run typecheck
npm run build && npm start  # bản production: một tiến trình phục vụ cả giao diện và API ở :8787
```

Không có key, app vẫn mở được; bài trắc nghiệm Nghe/Đọc và test xếp lớp vẫn chạy, còn chấm Nói/Viết và bot sẽ báo lỗi cấu hình.

## Thêm nội dung

- **Unit mới**: thêm một phần tử vào `units` trong `src/content/courses/<ngôn ngữ>.ts` — chọn `level`, `track`, rồi các `activities` (listening / reading / speaking / writing) và một `roleplay`. `id` hoạt động phải duy nhất (có test kiểm tra).
- **Ngôn ngữ mới có giáo trình**: tạo `courses/<code>.ts` + `placement/<code>.ts`, đăng ký trong `src/content/index.ts`, bật `hasCourse` trong `shared/languages.ts`.
- **Ngôn ngữ chỉ luyện với AI**: chỉ cần một dòng trong `shared/languages.ts` (đã có Trung, Nhật, Hàn, Pháp, Đức).
- **Tình huống hội thoại**: thêm vào `SCENARIO_LIBRARY` trong `src/content/tracks.ts`, dùng được cho mọi ngôn ngữ.

## Giới hạn hiện tại và bước tiếp theo

1. **Tài khoản & lưu trữ**: tiến độ đang nằm trong trình duyệt. Cần đăng nhập + cơ sở dữ liệu để học trên nhiều máy, để giáo viên/quản lý xem báo cáo, và để giới hạn chi phí theo người thay vì theo IP.
2. **Phát âm**: hiện chấm Nói dựa trên bản ghi chữ, nên chỉ phát hiện lỗi phát âm khi từ bị nhận sai thành từ khác. Chấm phát âm chi tiết cần dịch vụ chấm âm thanh riêng.
3. **Nội dung**: mới có 3 unit tiếng Anh mẫu và bộ test 18 câu tự soạn (chưa chuẩn hoá). Có thể dùng AI soạn nháp unit hàng loạt theo khuôn `Unit`, rồi người duyệt.
4. **Ôn tập**: lặp lại ngắt quãng cho từ vựng, nhật ký lỗi hay gặp lấy từ phần “Cần sửa” của AI.
5. **Chi phí**: theo dõi số lượt gọi AI mỗi người, cân nhắc model rẻ hơn cho bot hội thoại.
