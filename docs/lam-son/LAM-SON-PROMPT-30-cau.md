# Prompt Claude Code — Lam Son / 30 câu trắc nghiệm

Prompt này **thay thế hoàn toàn các prompt trước**. Đặt LAM-SON-30-cau-hoi.vi.json và LAM-SON-30-google-sheets-schema.json vào dự án, rồi dán phần dưới vào Claude Code.

---

Hãy xây hoặc sửa app khảo sát Lam Son theo phạm vi gọn dưới đây. Đọc hai JSON đính kèm. Nếu đang có app/platform cũ, giữ UI, framework, cách chọn đáp án và luồng hiện có, chỉ thay dữ liệu và tính năng cần thiết. Không khởi tạo lại app khi có thể sửa app cũ. Nếu repository chưa có app thì dùng React+TypeScript+Vite frontend và Node+TypeScript API. Không mặc định “platform cũ” là một website bên ngoài chưa được cung cấp; mặc định đây là giao diện trắc nghiệm trong dự án.

## Phạm vi bắt buộc
Đối tượng: trưởng phòng ban Lam Son. **Đúng 30 câu**, gồm 24 câuDISC hướng ban đầu (6/nhóm) và 6 câu bổ sung (3 leadership,3 làm việc nhóm). Tất cả trắc nghiệm một lựa chọn, thang 1–5 như JSON bản mới và N/A riêng khi chưa có trải nghiệm. Không có câu mở, textarea trả lời coaching, case study, hành động 7 ngày, gợi ý coach, dashboard đánh giá nguồn lực hoặc bảng xếp hạng. Không xây các tab COACH_CA_NHAN/PHOI_HOP/TONG_QUAN_PHONG. Chị coach tự phân tích dữ liệu sau.
App: nhận diện→đồng ý gửi cho coach→30 câu→rà soát→gửi→kết quả sơ bộ. Có thể 4 câu/trang, trang cuối 2 câu. Đọc text/scale từ JSON, không hardcode nội dungv 2. Ẩn scored/dimension khi làm bài. Không preselect đáp án. Quay lại giữ lựa chọn. Cần chọn 1–5 hoặcN/A cho đủ 30 mục; chưa chọn khácN/A. Không gửi trước consent.

## Chấm điểm
Version lamson-disc-30-vi-3.0.0. Chỉ 24 câu scored=true códimensionD/I/S/C được tính.6 câu scored=false giữ đáp án riêng; không cộng vàoDISC, không tạo điểm năng lực, không tự suy giỏi/yếu.
Mỗi nhóm 6 câu: n là số điểm nguyên 1–5, mean=total/n, score=25*(mean−1); n 0=>null. N/A không thành 3. Kết luận khi mỗi nhómn>=5 vàn_DISC>=20. complete khi 24 câuDISC có điểm; partial khi 20–23 và đủ từng nhóm; insufficient còn lại. Tổng 30 câu có lựa chọn không đồng nghĩa đủ dữ liệuDISC. Đáp án 6 câu phụ không thay đổi trạng thái đủ dữ liệuDISC.
So score chưa làm tròn. Range<=10=>flat, không nhóm chính/phụ. Không flat=>candidates mọi nhóm max−score<=10; mộtclearer, haiclose_pair, bamultiple; ties giữ đồng hạng. Epsilon 1 e-9 hoặc so phân số cho biên. Hiển thị 1 chữ số thập phân; bốn điểm không cộng thành 100. Không percentile, độ chính xác hoặc certainty. Tất cả 24 đáp án có điểm giống nhau=>mời rà soát bằng ví dụ, không cáo buộc.
Validate payload: đúngversion, đúng 30 ID, không trùng/ID lạ, rejectstring, số ngoài 1–5,NaN,infinity; null làN/A. Server tính lại, không tin điểmclient. Không nhận đáp án 32 câu/version cũ để chấm với bộmới.

## Kết quả trên app
Bốn điểm/n từng nhóm, nhận xét xu hướng ngắn hoặc chưa đủ dữ liệu, bảng 6 câu phụ gồm phát biểu và lựa chọn nguyên bản. Tối đa 2 minh chứngDISC từ câu 4–5 nếu có, không bịa. Chỉ nói “Trong các câu trả lời này…” và nêu chưa chuẩn hóa. Không coach sâu, gợi ý cải thiện, nghề nghiệp hoặc đánh giá leadership. Học viên chỉ thấy kết quả của mình.

## Google Sheets
Đích https://drive.google.com/drive/folders/1 iDOyMIg 7 XzcjvJ_3 QQk 8 Nv 9 gFoxSgHOl ; folder ID trong schema. Đường dẫnG:\My Drive\COACHING\DISC là đường dẫn đồng bộ, không ghi trực tiếp từbrowser. Triển khai setupGoogle OAuth owner: nếu chưa cóspreadsheet ID thì tạo một nativeGoogleSheets đúng folder, tên theo schema; lưuID để không tạo trùng. Nếu cóID thì đọc metadata và kiểm tra trước dùng. Nhiều file trùng tên=>owner chọn; không xóa file. Tạo 5 tab/headers từschema; giữ dữ liệu/tab cũ khi migration, không tự xóa coachingtabs từng tồn tại. App mới ngừng tạo/ghi các tab đó; đề nghị owner xử lý lịch sử riêng.
Runtime server dùng service account được owner cấpeditor đúngworkbook hoặc OAuthserver phù hợp; không secretclient, không sharepublic/domain-wide. Không cần kết nốiGoogleDrive củaCodex. Viết đầy đủadapter/setup/readme dù chưa cócredentials; hướng dẫn xác thực thật trongbrowser, không yêu cầu gửi khóa/chat.
KET_QUA một dòng/lầnnộp. TRA_LOI lưu 30 đáp án version+ID;6 phụ giữ raw. DANH_SACH rosterthật coachcấp; CAU_HOI đủ 30 câu với scored vàsection; HUONG_DAN ghi giới hạn và cách dùng. Chưa có dữ liệu=>không tạo dữ liệu người dùng giả. Không tự đánh giá nguồn lực/coaching trongSheets.

## Nhận diện, quyền riêng tư và lưu dữ liệu
Dùng invite/phiên cá nhân theo roster: token entropy cao hash server, expiry, HttpOnlySecurecookie, CSRF/origincheck, rate limit. Participant/campaign gán từsession, không tinclient để mạo danh; kiểm traIDOR. Không endpoint đọc kết quả người khác. GoogleWorkbook chỉ coachđượcchỉđịnh, không học viên; ẩn/protecttab không làaccesscontrol. Không log token/PII/answers; không analyticsmặcđịnh. Retention doowner chọn trướcproduction, quyền sửa/xóa mô tả rõ. Không localStoragelưuPII mặcđịnh.
Lưu DB/outbox bềnvững trước đồng bộSheets. Local mộtserver dùngSQLite với volume bềnvững; nhiều instance/serverless dùngPostgreSQL. Idempotencykey+payloadhash+uniqueconstraint; cùngkey/payload trảcùngreceipt, khácpayload trả 409. Worker ghi từngtab có trạng thái, retry/backoff vàreconcileSubmission_ID khiGoogletimeout khôngrõ đãghi. Hai tabghi khôngatomic, repairpartialwrite; không đánh dấu synced khi thiếu tab. Ghi giá trịRAW tránhformulainjection.
Học viên thấy kếtquả server sauDBcommit nhưng trạngthái pending_sync/synced/sync_error riêng; chỉbáo đãghiGoogleSheet khi xácnhận. Mạnglỗi không mấtanswers trongphiên đangmở, retry không appendtrùng. Secrets.envserver, .env.exampleplaceholder, khôngdeploy hoặc trảphí tựđộng.

## Tests và nghiệmthu
Validate 24 scored cân bằng 4 × 6,6 unscored,30 uniqueID. All 1=>0/all 3=>50/all 5=>100; min 5 mỗinhóm; một nhóm 4=>insufficient dùtổng 20; all 6 phụ thành 5 vẫn không đổiDISC. Boundary 10/ties/rounding/NA/invalid/version tests. Trangcuối 2 câu, progress 30, không còn 32 hoặc 8 câu/nhóm trongscoring/UI.
TestGoogle 403/429/timeout trước/sauwrite/partial 2 tab/worker restart/retrydupe; khôngtạofiletrùng setup; mappingheaders; RAW; expiredinvite/IDOR/consent; mobile 375 px; backgiữ answers; pending không báo synced; không UIcoaching/câu mở/actionplan. Dữliệutest riêng, không ghi vàoSheetproduction.
Bàn giao codechạyđược, build/tests thật, READMEsetupGoogle/roster/invite/worker/backup/xóa dữliệu vàscreenshots. Không có Google credentials=>integrationmocktest hoànchỉnh, báo thậtchưa xácminh. Không dừng ởkếhoạch; tự sửa đến khiapp đúngphạmvi.
