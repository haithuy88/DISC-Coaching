"""Workbook bài tập Phần VI (B27-B32) – case Nafoods. Số liệu public ghi nguồn; số giả định tô vàng."""
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import LineChart, BarChart, Reference
from openpyxl.utils import get_column_letter

out = sys.argv[1]
wb = Workbook()

H = Font(name="Calibri", bold=True, size=14, color="0F172A")
B = Font(name="Calibri", bold=True, color="FFFFFF")
INP = Font(name="Calibri", color="1D4ED8")
BOLD = Font(name="Calibri", bold=True)
HEAD = PatternFill("solid", fgColor="4F46E5")
ASSUME = PatternFill("solid", fgColor="FEF9C3")
PUBLIC = PatternFill("solid", fgColor="DCFCE7")
OUTF = PatternFill("solid", fgColor="E0E7FF")
thin = Side(style="thin", color="CBD5E1")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")


def title(ws, text, sub):
    ws["A1"] = text
    ws["A1"].font = H
    ws["A2"] = sub
    ws["A2"].font = Font(italic=True, color="475569")


def header(ws, row, labels, col=1):
    for i, lab in enumerate(labels):
        c = ws.cell(row=row, column=col + i, value=lab)
        c.font, c.fill, c.border = B, HEAD, BOX
        c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")


def cell(ws, ref, val, kind=None, fmt=None):
    c = ws[ref]
    c.value = val
    c.border = BOX
    if kind == "a":
        c.fill, c.font = ASSUME, INP
    elif kind == "p":
        c.fill, c.font = PUBLIC, INP
    elif kind == "o":
        c.fill, c.font = OUTF, BOLD
    if fmt:
        c.number_format = fmt
    return c


def widths(ws, w):
    for i, x in enumerate(w, 1):
        ws.column_dimensions[get_column_letter(i)].width = x


# ---------------- 0. README ----------------
ws = wb.active
ws.title = "0_README"
title(ws, "Nafoods – Bộ bài tập thực chiến Phần VI (B27–B32)",
      "Costing, Demand Planning & Warehouse | Dùng kèm giáo án mentoring")
rows = [
    ("Quy ước màu", ""),
    ("Ô xanh lá", "Số liệu PUBLIC (BCTC, báo chí, báo cáo CTCK) – xem sheet 1_Public_Data"),
    ("Ô vàng", "GIẢ ĐỊNH để luyện tập – mentee thay bằng số nội bộ Nafoods"),
    ("Ô tím", "Kết quả tính bằng công thức – không gõ đè"),
    ("", ""),
    ("Sheet", "Buổi / mục tiêu"),
    ("2_B27_Demand", "B27 Demand Planning: seasonal index, dự báo 2026, MAPE/Bias, nhu cầu quả tươi"),
    ("3_B28_COGS", "B28 Bóc tách giá vốn/kg: puree chanh leo, mít sấy tự SX vs gia công"),
    ("4_B29_Overhead", "B29 Phân bổ SXC cố định theo công suất bình thường (VAS 02) & chi phí nhàn rỗi"),
    ("5_B30_Variance", "B30 Phân tích chênh lệch: giá bán, lượng, mix, giá vốn, giá NVL, hiệu suất (yield)"),
    ("6_B31_I2C", "B31 Inventory-to-Cash, DIO/CCC, chi phí lưu kho lạnh, tiền giải phóng"),
    ("7_B32_KPI", "B32 Từ điển KPI cho Dashboard Costing & Inventory"),
    ("", ""),
    ("Lưu ý", "Số liệu giả định KHÔNG phải số thật của Nafoods. Không dùng cho mục đích đầu tư."),
]
for i, (a, b) in enumerate(rows, 4):
    ws.cell(row=i, column=1, value=a).font = BOLD
    ws.cell(row=i, column=2, value=b)
ws["A5"].fill, ws["A6"].fill, ws["A7"].fill = PUBLIC, ASSUME, OUTF
widths(ws, [18, 100])

# ---------------- 1. Public data ----------------
ws = wb.create_sheet("1_Public_Data")
title(ws, "Dữ liệu public về Nafoods (NAF – HOSE)", "Đơn vị: tỷ VND trừ khi ghi khác. Đối chiếu BCTC kiểm toán trước khi trình bày ra ngoài.")
header(ws, 4, ["Chỉ tiêu", "2024", "2025", "6T/2026", "Nguồn"])
pub = [
    ("Doanh thu thuần", 1437.7, 2063.7, 1167.46, "Báo Pháp luật (2024); Báo Nghệ An (2025); Báo Đầu tư (6T/2026)"),
    ("Lợi nhuận gộp", None, 469.0, None, "ABS Research note 06/2026"),
    ("Biên LN gộp", 0.282, 0.227, None, "ABS Research note 06/2026"),
    ("LNST", 118.1, 145.8, 140.6, "Báo Pháp luật; Simply Wall St; Báo Đầu tư"),
    ("Tổng tài sản (cuối kỳ)", 2042, 2313, None, "Báo Pháp luật; VietnamFinance 03/2026"),
    ("Nợ phải trả", None, 1529, None, "VietnamFinance 03/2026"),
    ("Nợ ngắn hạn", None, 993, None, "VietnamFinance 03/2026"),
    ("Hàng tồn kho (cuối Q1/2026)", None, None, 249.2, "ABS: tồn kho Q1/2026; thành phẩm 195 tỷ"),
    ("Thành phẩm (cuối Q1/2026)", None, None, 195.0, "ABS: +52,7% so với cuối 2025"),
    ("XDCB dở dang 30/6/2026", None, None, 177.7, "Báo Đầu tư: Long An GĐ2 100,3; Gia Lai GĐ4 39,6"),
    ("Kế hoạch DT 2026", None, None, 3000, "ĐHĐCĐ 7/5/2026"),
    ("Kế hoạch LNST 2026", None, None, 200, "ĐHĐCĐ 7/5/2026"),
]
for i, (a, b, c, d, e) in enumerate(pub, 5):
    ws.cell(row=i, column=1, value=a).border = BOX
    for j, v in enumerate([b, c, d], 2):
        x = ws.cell(row=i, column=j, value=v)
        x.border = BOX
        if v is not None:
            x.fill, x.font = PUBLIC, INP
            x.number_format = "0.0%" if isinstance(v, float) and v < 1 else "#,##0.0"
    ws.cell(row=i, column=5, value=e).alignment = WRAP
r = 5 + len(pub) + 1
ws.cell(row=r, column=1, value="Chỉ số suy ra").font = BOLD
cell(ws, f"A{r+1}", "Giá vốn 2025 = DT − LN gộp")
cell(ws, f"C{r+1}", "=C5-C6", "o", "#,##0.0")
cell(ws, f"A{r+2}", "Thành phẩm cuối 2025 ≈ 195 / 1,527")
cell(ws, f"C{r+2}", "=D13/1.527", "o", "#,##0.0")
cell(ws, f"A{r+3}", "DIO ước tính (tồn kho Q1/26 ÷ giá vốn 2025 × 365)")
cell(ws, f"C{r+3}", f"=D12/C{r+1}*365", "o", "0.0")
cell(ws, f"A{r+4}", "Hệ số nợ/tài sản 2025")
cell(ws, f"C{r+4}", "=C10/C9", "o", "0.0%")
r += 6
ws.cell(row=r, column=1, value="Dữ kiện vận hành (để đặt bối cảnh)").font = BOLD
facts = [
    "9T/2025: DT 1.694 tỷ (+53%); chanh leo +47%, dứa +731%, mít sấy >300 tỷ; châu Âu ~50% DT; biên gộp ~23% do giá NVL cao & tỷ trọng gia công lớn (BSC).",
    "6T/2025: giá vốn 800,1 tỷ (+52,9%); biên gộp 22,3% so với 30,4% cùng kỳ.",
    "2024: DT giảm 17% do mất mùa vải & cạnh tranh chanh leo; xoài, chuối tăng >60%.",
    "Nafoods Tây Nguyên (Gia Lai): GĐ1 vận hành 8/2022 (104 tỷ); mở rộng lên 100.000 tấn nguyên liệu/năm, tổng vốn 744 tỷ.",
    "Công suất công bố trên hồ sơ doanh nghiệp: IQF 12.500 t; cô đặc 17.000 t; puree/NFC 10.000 t; sấy 700 t/năm (số cũ, cần cập nhật).",
    "Xuất khẩu ~78% DT (2019–2022, Vietcap); có mặt >70 quốc gia; ~10% sản lượng xuất khẩu chanh leo toàn cầu.",
    "Vụ chanh leo: đợt thu hoạch đầu thường ~40% sản lượng năm; 2025 chỉ ~25% → giá quả tươi tăng.",
    "Nguồn vốn: FMO >520 tỷ; responsAbility 160 tỷ vốn xanh. Mục tiêu 2030: 200 triệu USD doanh thu.",
]
for i, f in enumerate(facts, r + 1):
    ws.cell(row=i, column=1, value="•")
    c = ws.cell(row=i, column=2, value=f)
    ws.merge_cells(start_row=i, start_column=2, end_row=i, end_column=5)
    c.alignment = WRAP
    ws.row_dimensions[i].height = 32
widths(ws, [44, 12, 12, 12, 70])

# ---------------- 2. B27 Demand ----------------
ws = wb.create_sheet("2_B27_Demand")
title(ws, "B27 – Demand Planning: Puree chanh leo (tấn thành phẩm)",
      "Lịch sử bán hàng là GIẢ ĐỊNH mô phỏng tăng trưởng 2025 (+~40%). Cung quả tươi theo mùa vụ Tây Nguyên.")
header(ws, 4, ["Tháng", "Bán 2024", "Bán 2025", "Seasonal index", "Dự báo 2026", "Thực tế 2026",
               "Sai số tuyệt đối", "APE", "% sản lượng quả theo tháng", "Quả tươi cần (t)", "Quả sẵn có (t)", "Thiếu/(thừa) quả", "Cân đối lũy kế (t)"])
s24 = [820, 780, 850, 900, 980, 1050, 1100, 1080, 950, 900, 860, 930]
s25 = [1150, 1100, 1200, 1280, 1400, 1500, 1560, 1530, 1350, 1290, 1220, 1320]
a26 = [1380, 1150, 1290, 1520, 1610, 1820, None, None, None, None, None, None]
sup = [0.04, 0.03, 0.03, 0.04, 0.07, 0.10, 0.12, 0.13, 0.13, 0.12, 0.10, 0.09]
for m in range(12):
    r = 5 + m
    cell(ws, f"A{r}", f"T{m+1}")
    cell(ws, f"B{r}", s24[m], "a", "#,##0")
    cell(ws, f"C{r}", s25[m], "a", "#,##0")
    cell(ws, f"D{r}", f"=((B{r}/AVERAGE($B$5:$B$16))+(C{r}/AVERAGE($C$5:$C$16)))/2", "o", "0.00")
    cell(ws, f"E{r}", f"=$C$21*(1+$C$20)/12*D{r}", "o", "#,##0")
    cell(ws, f"F{r}", a26[m], "a" if a26[m] else None, "#,##0")
    cell(ws, f"G{r}", f'=IF(F{r}="","",ABS(F{r}-E{r}))', "o", "#,##0")
    cell(ws, f"H{r}", f'=IF(F{r}="","",G{r}/F{r})', "o", "0.0%")
    cell(ws, f"I{r}", sup[m], "a", "0%")
    cell(ws, f"J{r}", f"=E{r}*$C$22", "o", "#,##0")
    cell(ws, f"K{r}", f"=$C$23*I{r}", "o", "#,##0")
    cell(ws, f"L{r}", f"=J{r}-K{r}", "o", "#,##0;[Red](#,##0)")
    cell(ws, f"M{r}", f"=SUM($K$5:K{r})-SUM($J$5:J{r})", "o", "#,##0;[Red](#,##0)")
cell(ws, "A17", "Tổng", None)
for col in "BCEJKL":
    cell(ws, f"{col}17", f"=SUM({col}5:{col}16)", "o", "#,##0")
ws["A17"].font = BOLD
inputs = [
    (20, "Tăng trưởng 2026 giả định", 0.12, "0%"),
    (21, "Tổng bán 2025 (t)", "=C17", "#,##0"),
    (22, "Định mức quả tươi / kg puree", 2.8, "0.00"),
    (23, "Quả tươi ký hợp đồng cả năm (t)", 50000, "#,##0"),
]
for r, lab, v, f in inputs:
    cell(ws, f"A{r}", lab)
    cell(ws, f"C{r}", v, "a" if not str(v).startswith("=") else "o", f)
ws.merge_cells("A20:B20"); ws.merge_cells("A21:B21"); ws.merge_cells("A22:B22"); ws.merge_cells("A23:B23")
cell(ws, "A25", "MAPE 6T/2026"); cell(ws, "C25", "=AVERAGE(H5:H16)", "o", "0.0%")
cell(ws, "A26", "Bias (Σ dự báo − Σ thực tế)/Σ thực tế (6T)")
cell(ws, "C26", "=(SUMPRODUCT((F5:F16<>\"\")*E5:E16)-SUM(F5:F16))/SUM(F5:F16)", "o", "0.0%;[Red]-0.0%")
cell(ws, "A27", "Tồn đầu năm cần có (quy đổi t quả) để không đứt hàng")
cell(ws, "C27", "=MAX(0,-MIN(M5:M16))", "o", "#,##0")
for r in (25, 26, 27):
    ws.merge_cells(f"A{r}:B{r}")
ws["A29"] = "Câu hỏi thảo luận: (1) Bias dương hay âm? Ai trong S&OP đang 'đẩy' số? (2) Tháng nào phải chạy tồn kho đệm vì quả không đủ? (3) Nếu đợt vụ đầu chỉ đạt 25% thay vì 40% như 2025 thì sao?"
ws["A29"].alignment = WRAP
ws.merge_cells("A29:L30")
ws.row_dimensions[29].height = 30
widths(ws, [12, 10, 10, 11, 11, 11, 11, 9, 13, 13, 13, 13, 13])
ch = LineChart(); ch.title = "Bán hàng vs Dự báo (t)"; ch.height, ch.width = 7, 16
ch.add_data(Reference(ws, min_col=3, min_row=4, max_row=16), titles_from_data=True)
ch.add_data(Reference(ws, min_col=5, min_row=4, max_row=16), titles_from_data=True)
ch.add_data(Reference(ws, min_col=6, min_row=4, max_row=16), titles_from_data=True)
ch.set_categories(Reference(ws, min_col=1, min_row=5, max_row=16))
ws.add_chart(ch, "O4")

# ---------------- 3. B28 COGS ----------------
ws = wb.create_sheet("3_B28_COGS")
title(ws, "B28 – Bóc tách giá vốn / kg thành phẩm", "Toàn bộ đơn giá là GIẢ ĐỊNH huấn luyện. Đơn vị VND/kg thành phẩm.")
header(ws, 4, ["Khoản mục", "Puree chanh leo (aseptic)", "Mít sấy – tự SX", "Mít sấy – gia công", "Ghi chú / cách lấy số"])
cogs = [
    ("Giá quả tươi (VND/kg quả)", 9000, 6000, None, "Giá thu mua bình quân gia quyền theo vụ"),
    ("Định mức quả / kg TP", 2.8, 10, None, "Yield: puree ~36%; mít sấy giòn ~1:10 quả nguyên"),
    ("1. NVL chính", "=B5*B6", "=C5*C6", None, "Giá quả × định mức"),
    ("2. Bao bì", 2500, 9000, 9000, "Túi aseptic + phuy / túi zip + thùng"),
    ("3. Nhân công trực tiếp", 1200, 8000, None, ""),
    ("4. Năng lượng (hơi, điện, dầu chiên, lạnh)", 1800, 12000, None, ""),
    ("5. SXC cố định phân bổ (khấu hao, bảo trì)", 2500, 10000, None, "Theo công suất bình thường – xem B29"),
    ("6. Phí gia công trả đối tác", None, None, 125000, "Bao gồm NVL+NC+SXC của bên gia công"),
    ("7. Hao hụt / QA reject", "=SUM(B7:B10)*0.02", "=SUM(C7:C10)*0.03", "=D11*0.01", "2–3% chi phí"),
]
for i, (lab, b, c, d, note) in enumerate(cogs, 5):
    cell(ws, f"A{i}", lab)
    for col, v in zip("BCD", (b, c, d)):
        k = "o" if isinstance(v, str) else ("a" if v is not None else None)
        cell(ws, f"{col}{i}", v, k, "#,##0.00" if i == 6 else "#,##0")
    ws[f"E{i}"] = note
r = 5 + len(cogs)
cell(ws, f"A{r}", "GIÁ VỐN / kg TP"); ws[f"A{r}"].font = BOLD
for col in "BCD":
    cell(ws, f"{col}{r}", f"=SUM({col}7:{col}{r-1})", "o", "#,##0")
cell(ws, f"A{r+1}", "Giá bán FOB (VND/kg)")
cell(ws, f"B{r+1}", 44000, "a", "#,##0"); cell(ws, f"C{r+1}", 180000, "a", "#,##0"); cell(ws, f"D{r+1}", 180000, "a", "#,##0")
cell(ws, f"A{r+2}", "Biên LN gộp")
for col in "BCD":
    cell(ws, f"{col}{r+2}", f"=1-{col}{r}/{col}{r+1}", "o", "0.0%")
cell(ws, f"A{r+3}", "Tỷ trọng NVL chính trong giá vốn")
for col in "BC":
    cell(ws, f"{col}{r+3}", f"={col}7/{col}{r}", "o", "0.0%")
cell(ws, f"A{r+5}", "Độ nhạy: giá quả chanh leo +1.000 VND/kg → giá vốn puree tăng (VND/kg)")
cell(ws, f"B{r+5}", "=1000*B6", "o", "#,##0")
cell(ws, f"A{r+6}", "Make-vs-Buy mít sấy: chênh lệch giá vốn gia công − tự SX (VND/kg)")
cell(ws, f"B{r+6}", f"=D{r}-C{r}", "o", "#,##0")
cell(ws, f"A{r+7}", "Sản lượng mít sấy chuyển từ gia công về tự SX (tấn)")
cell(ws, f"B{r+7}", 1000, "a", "#,##0")
cell(ws, f"A{r+8}", "→ Lãi gộp tăng thêm (tỷ VND)")
cell(ws, f"B{r+8}", f"=B{r+6}*B{r+7}*1000/1e9", "o", "#,##0.0")
widths(ws, [62, 22, 18, 18, 48])

# ---------------- 4. B29 Overhead ----------------
ws = wb.create_sheet("4_B29_Overhead")
title(ws, "B29 – Phân bổ SXC cố định & chi phí năng lực nhàn rỗi (nhà máy Gia Lai)",
      "Công suất thiết kế 100.000 t quả/năm là số public; chi phí SXC & sản lượng theo tháng là GIẢ ĐỊNH.")
params = [
    (4, "Công suất thiết kế (t quả/năm)", 100000, "p", "#,##0"),
    (5, "Công suất bình thường (% thiết kế)", 0.75, "a", "0%"),
    (6, "SXC cố định cả năm (tỷ VND)", 72, "a", "#,##0.0"),
    (7, "Đơn giá phân bổ chuẩn (VND/t quả)", "=C6*1e9/(C4*C5)", "o", "#,##0"),
]
for r, lab, v, k, f in params:
    cell(ws, f"A{r}", lab); ws.merge_cells(f"A{r}:B{r}")
    cell(ws, f"C{r}", v, k, f)
header(ws, 9, ["Tháng", "Chanh leo (t)", "Dứa (t)", "Mít (t)", "Xoài/chuối/khác (t)", "Tổng chế biến (t)",
               "Công suất tháng (t)", "Hiệu suất sử dụng", "SXC phân bổ vào SP (tr VND)", "SXC phát sinh (tr VND)", "Chênh lệch (tr VND)"])
cl = [1600, 1200, 1200, 1600, 2800, 4000, 4800, 5200, 5200, 4800, 4000, 3600]
pine = [900, 1100, 1300, 1400, 1200, 900, 700, 600, 600, 700, 800, 900]
jack = [500, 500, 700, 900, 1000, 900, 700, 500, 400, 400, 400, 500]
oth = [300, 300, 400, 600, 900, 800, 500, 300, 200, 200, 200, 300]
for m in range(12):
    r = 10 + m
    cell(ws, f"A{r}", f"T{m+1}")
    for col, arr in zip("BCDE", (cl, pine, jack, oth)):
        cell(ws, f"{col}{r}", arr[m], "a", "#,##0")
    cell(ws, f"F{r}", f"=SUM(B{r}:E{r})", "o", "#,##0")
    cell(ws, f"G{r}", "=$C$4/12", "o", "#,##0")
    cell(ws, f"H{r}", f"=F{r}/G{r}", "o", "0%")
    cell(ws, f"I{r}", f"=F{r}*$C$7/1e6", "o", "#,##0")
    cell(ws, f"J{r}", "=$C$6*1000/12", "o", "#,##0")
    cell(ws, f"K{r}", f"=I{r}-J{r}", "o", "#,##0;[Red](#,##0)")
cell(ws, "A22", "Cả năm"); ws["A22"].font = BOLD
for col in "BCDEFGIJK":
    cell(ws, f"{col}22", f"=SUM({col}10:{col}21)", "o", "#,##0;[Red](#,##0)")
cell(ws, "H22", "=F22/G22", "o", "0%")
cell(ws, "A24", "Theo VAS 02: SXC cố định không phân bổ hết (dưới công suất bình thường) ghi vào giá vốn trong kỳ")
ws.merge_cells("A24:H24")
cell(ws, "A25", "Chi phí nhàn rỗi ghi nhận vào P&L cả năm (tỷ VND)"); ws.merge_cells("A25:H25")
cell(ws, "I25", "=MAX(0,C6-F22*C7/1e9)", "o", "#,##0.0")
cell(ws, "A26", "Kịch bản: chỉ chạy chanh leo (bỏ dứa, mít, khác) → chi phí nhàn rỗi (tỷ VND)"); ws.merge_cells("A26:H26")
cell(ws, "I26", "=MAX(0,C6-B22*C7/1e9)", "o", "#,##0.0")
ws["A28"] = "Thảo luận: Vì sao chiến lược đa trái cây (dứa +731%, mít sấy >300 tỷ năm 2025) là bài toán lấp đầy công suất trái vụ? Tháng nào nên nhận gia công cho bên ngoài?"
ws["A28"].alignment = WRAP; ws.merge_cells("A28:K29"); ws.row_dimensions[28].height = 30
widths(ws, [10, 12, 10, 10, 14, 14, 14, 12, 16, 16, 16])
bc = BarChart(); bc.type = "col"; bc.grouping = "stacked"; bc.overlap = 100
bc.title = "Sản lượng chế biến theo tháng vs công suất"; bc.height, bc.width = 8, 18
bc.add_data(Reference(ws, min_col=2, max_col=5, min_row=9, max_row=21), titles_from_data=True)
bc.set_categories(Reference(ws, min_col=1, min_row=10, max_row=21))
ws.add_chart(bc, "M4")

# ---------------- 5. B30 Variance ----------------
ws = wb.create_sheet("5_B30_Variance")
title(ws, "B30 – Variance Analysis: Kế hoạch vs Thực tế (1 kỳ, giả định)",
      "Đơn vị: tấn; triệu VND/tấn; triệu VND. Mô phỏng hiện tượng biên gộp giảm 28,2% → 22,7% (2024→2025).")
header(ws, 4, ["Sản phẩm", "SL KH", "Giá KH", "GV KH", "SL TT", "Giá TT", "GV TT",
               "LN gộp/đv KH", "Mix KH", "Mix TT",
               "CL giá bán", "CL giá vốn", "CL mix", "CL lượng"])
prods = [("Puree chanh leo", 6000, 44, 33, 6600, 45, 36.5),
         ("IQF trái cây", 3000, 52, 40, 2700, 51, 41),
         ("Mít sấy – tự SX", 1200, 180, 105, 900, 175, 110),
         ("Mít sấy – gia công", 300, 180, 135, 1100, 175, 138)]
for i, p in enumerate(prods, 5):
    cell(ws, f"A{i}", p[0])
    for col, v in zip("BCDEFG", p[1:]):
        cell(ws, f"{col}{i}", v, "a", "#,##0.0")
    cell(ws, f"H{i}", f"=C{i}-D{i}", "o", "#,##0.0")
    cell(ws, f"I{i}", f"=B{i}/$B$9", "o", "0.0%")
    cell(ws, f"J{i}", f"=E{i}/$E$9", "o", "0.0%")
    cell(ws, f"K{i}", f"=(F{i}-C{i})*E{i}", "o", "#,##0;[Red](#,##0)")
    cell(ws, f"L{i}", f"=(D{i}-G{i})*E{i}", "o", "#,##0;[Red](#,##0)")
    cell(ws, f"M{i}", f"=(E{i}-$E$9*I{i})*H{i}", "o", "#,##0;[Red](#,##0)")
    cell(ws, f"N{i}", f"=($E$9*I{i}-B{i})*H{i}", "o", "#,##0;[Red](#,##0)")
cell(ws, "A9", "Tổng"); ws["A9"].font = BOLD
for col in "BEKLMN":
    cell(ws, f"{col}9", f"=SUM({col}5:{col}8)", "o", "#,##0;[Red](#,##0)")
cell(ws, "A11", "Doanh thu KH"); cell(ws, "C11", "=SUMPRODUCT(B5:B8,C5:C8)", "o", "#,##0")
cell(ws, "A12", "LN gộp KH"); cell(ws, "C12", "=SUMPRODUCT(B5:B8,H5:H8)", "o", "#,##0")
cell(ws, "A13", "Biên gộp KH"); cell(ws, "C13", "=C12/C11", "o", "0.0%")
cell(ws, "A14", "Doanh thu TT"); cell(ws, "C14", "=SUMPRODUCT(E5:E8,F5:F8)", "o", "#,##0")
cell(ws, "A15", "LN gộp TT"); cell(ws, "C15", "=SUMPRODUCT(E5:E8,F5:F8)-SUMPRODUCT(E5:E8,G5:G8)", "o", "#,##0")
cell(ws, "A16", "Biên gộp TT"); cell(ws, "C16", "=C15/C14", "o", "0.0%")
cell(ws, "A17", "Kiểm tra: LN KH + ΣCL = LN TT"); cell(ws, "C17", "=C12+K9+L9+M9+N9-C15", "o", "#,##0")
for r in range(11, 18):
    ws.merge_cells(f"A{r}:B{r}")
ws["A19"] = "Tách CL giá vốn Puree thành CL giá NVL & CL hiệu suất (yield)"; ws["A19"].font = BOLD
mat = [(20, "Định mức quả chuẩn (kg/kg)", 2.8, "a", "0.00"),
       (21, "Giá quả chuẩn (VND/kg)", 9000, "a", "#,##0"),
       (22, "Quả thực dùng (tấn)", 19800, "a", "#,##0"),
       (23, "Giá quả thực tế (VND/kg)", 10200, "a", "#,##0"),
       (24, "Quả chuẩn cho SL thực tế (tấn)", "=E5*C20", "o", "#,##0"),
       (25, "CL giá NVL (tr VND) = (Giá chuẩn − Giá TT) × Lượng TT", "=(C21-C23)*C22/1000", "o", "#,##0;[Red](#,##0)"),
       (26, "CL hiệu suất (tr VND) = (Lượng chuẩn − Lượng TT) × Giá chuẩn", "=(C24-C22)*C21/1000", "o", "#,##0;[Red](#,##0)"),
       (27, "Yield thực tế (kg quả/kg puree)", "=C22/E5", "o", "0.00")]
for r, lab, v, k, f in mat:
    cell(ws, f"A{r}", lab); ws.merge_cells(f"A{r}:B{r}")
    cell(ws, f"C{r}", v, k, f)
ws["E20"] = "Chạy: số âm (đỏ) = bất lợi. Hỏi: CL nào do Thu mua, CL nào do Sản xuất, CL nào do Sales/Kế hoạch?"
widths(ws, [24, 9, 9, 9, 9, 9, 9, 11, 9, 9, 12, 12, 12, 12])

# ---------------- 6. B31 I2C ----------------
ws = wb.create_sheet("6_B31_I2C")
title(ws, "B31 – Warehouse Opex & Inventory-to-Cash", "Xanh lá = public; vàng = giả định.")
i2c = [
    (4, "Giá vốn 2025 (tỷ VND)", "='1_Public_Data'!C19", "o", "#,##0.0"),
    (5, "Doanh thu 2025 (tỷ VND)", "='1_Public_Data'!C5", "o", "#,##0.0"),
    (6, "Tồn kho cuối Q1/2026 (tỷ VND)", 249.2, "p", "#,##0.0"),
    (7, "Trong đó thành phẩm (tỷ VND)", 195.0, "p", "#,##0.0"),
    (8, "DSO giả định (ngày)", 60, "a", "0"),
    (9, "DPO giả định (ngày)", 45, "a", "0"),
    (10, "DIO (ngày)", "=C6/C4*365", "o", "0.0"),
    (11, "CCC = DIO + DSO − DPO (ngày)", "=C10+C8-C9", "o", "0.0"),
    (13, "Chi phí vốn (%/năm)", 0.08, "a", "0.0%"),
    (14, "Chi phí kho lạnh & vận hành kho (%/năm giá trị)", 0.04, "a", "0.0%"),
    (15, "Hao hụt, hết hạn, giảm giá (%/năm)", 0.02, "a", "0.0%"),
    (16, "Bảo hiểm (%/năm)", 0.005, "a", "0.0%"),
    (17, "Tổng chi phí nắm giữ (%/năm)", "=SUM(C13:C16)", "o", "0.0%"),
    (18, "Chi phí nắm giữ thành phẩm/năm (tỷ VND)", "=C7*C17", "o", "#,##0.0"),
    (20, "Mục tiêu giảm DIO (ngày)", 10, "a", "0"),
    (21, "Tiền mặt giải phóng (tỷ VND)", "=C4/365*C20", "o", "#,##0.0"),
    (22, "Tiết kiệm chi phí nắm giữ/năm (tỷ VND)", "=C21*C17", "o", "#,##0.0"),
    (24, "Kho lạnh −18°C: đơn giá thuê (VND/pallet/ngày)", 25000, "a", "#,##0"),
    (25, "Tấn / pallet", 0.9, "a", "0.0"),
    (26, "Tồn kho đông lạnh bình quân (tấn)", 4000, "a", "#,##0"),
    (27, "Chi phí thuê kho lạnh/năm (tỷ VND)", "=C26/C25*C24*365/1e9", "o", "#,##0.0"),
    (28, "Chi phí kho / kg hàng xuất (VND/kg) – nếu xuất 20.000 t/năm", "=C27*1e9/(20000*1000)", "o", "#,##0"),
]
for r, lab, v, k, f in i2c:
    cell(ws, f"A{r}", lab); ws.merge_cells(f"A{r}:B{r}")
    cell(ws, f"C{r}", v, k, f)
ws["E4"] = "Chuỗi I2C của Nafoods (điền số ngày thực tế):"
ws["E4"].font = BOLD
steps = ["Thu mua quả → nhập NVL (giờ)", "Chế biến → nhập kho TP", "QA release / chờ kết quả kiểm nghiệm",
         "Tồn kho TP chờ booking", "Đóng container lạnh → xuất cảng", "Vận chuyển biển (EU ~30–40 ngày)",
         "Trình bộ chứng từ / L/C / D/P", "Khách thanh toán → tiền về"]
header(ws, 5, ["Bước", "Ngày (điền)"], col=5)
for i, s in enumerate(steps, 6):
    cell(ws, f"E{i}", s)
    cell(ws, f"F{i}", None, "a")
cell(ws, f"E{6+len(steps)}", "Tổng ngày Inventory-to-Cash"); cell(ws, f"F{6+len(steps)}", f"=SUM(F6:F{5+len(steps)})", "o", "0")
widths(ws, [40, 22, 12, 4, 44, 12])

# ---------------- 7. B32 KPI ----------------
ws = wb.create_sheet("7_B32_KPI")
title(ws, "B32 – Từ điển KPI cho Dashboard Costing & Inventory", "Mỗi KPI: định nghĩa – công thức – nguồn dữ liệu – chủ sở hữu – tần suất – ngưỡng gợi ý")
header(ws, 4, ["Nhóm", "KPI", "Công thức", "Nguồn dữ liệu", "Chủ sở hữu", "Tần suất", "Ngưỡng gợi ý"])
kpis = [
    ("Demand", "Forecast Accuracy (1−MAPE)", "1 − Σ|F−A|/ΣA theo SKU-tháng", "ERP sales, file S&OP", "Demand Planner", "Tháng", "≥ 75% (SKU), ≥ 85% (nhóm)"),
    ("Demand", "Forecast Bias", "(ΣF − ΣA)/ΣA", "ERP, S&OP", "Demand Planner", "Tháng", "±5%"),
    ("Demand", "Raw-material coverage", "Quả ký HĐ / quả cần theo dự báo", "Thu mua, vùng trồng", "Thu mua", "Tuần (mùa vụ)", "≥ 95%"),
    ("Costing", "Giá vốn / kg TP theo SKU", "(NVL + NC + SXC)/kg", "ERP costing", "Kế toán giá thành", "Tháng", "So chuẩn ±3%"),
    ("Costing", "Yield (kg quả/kg TP)", "Quả đưa vào / TP nhập kho", "MES/biên bản SX", "Quản đốc", "Ca/ngày", "Chanh leo puree ≤ 2,9"),
    ("Costing", "Giá quả bình quân", "Σ tiền thu mua / Σ kg", "Thu mua", "Thu mua", "Ngày", "Theo dải giá S&OP"),
    ("Capacity", "Hiệu suất sử dụng công suất", "Sản lượng / công suất", "MES", "GĐ nhà máy", "Tuần", "≥ 75% bình quân năm"),
    ("Capacity", "Chi phí năng lực nhàn rỗi", "SXC cố định − SXC phân bổ", "ERP", "Kế toán giá thành", "Tháng", "→ 0"),
    ("Variance", "CL giá NVL / CL yield / CL mix", "Xem sheet B30", "ERP + S&OP", "FP&A", "Tháng", "Giải trình nếu > 2% LN gộp"),
    ("Inventory", "DIO theo nhóm (NVL, BTP, TP)", "Tồn kho / giá vốn × 365", "ERP/WMS", "Supply Chain", "Tháng", "TP ≤ 45 ngày (ngoài mùa đệm)"),
    ("Inventory", "Tuổi tồn kho TP (aging)", "% giá trị TP > 180 ngày", "WMS", "Kho", "Tuần", "≤ 5%"),
    ("Inventory", "Độ chính xác tồn kho", "Số đếm = hệ thống", "Kiểm kê chu kỳ", "Kho", "Tháng", "≥ 98%"),
    ("Warehouse", "Chi phí kho / kg xuất", "Opex kho / kg xuất", "Kế toán, WMS", "Logistics", "Tháng", "Giảm 5%/năm"),
    ("Warehouse", "Lấp đầy kho lạnh", "Pallet dùng / pallet sức chứa", "WMS", "Kho", "Tuần", "70–90%"),
    ("Cash", "Inventory-to-Cash (ngày)", "Nhập NVL → tiền về", "ERP", "CFO", "Tháng", "Giảm 10 ngày/năm"),
    ("Service", "OTIF xuất khẩu", "Đơn đúng hạn & đủ / tổng đơn", "ERP, booking", "Logistics", "Tháng", "≥ 95%"),
]
for i, k in enumerate(kpis, 5):
    for j, v in enumerate(k, 1):
        c = ws.cell(row=i, column=j, value=v)
        c.border, c.alignment = BOX, WRAP
widths(ws, [12, 30, 34, 22, 18, 12, 26])

for s in wb.worksheets:
    s.sheet_view.showGridLines = False
    s.freeze_panes = None
wb.save(out)
print("saved", out)
