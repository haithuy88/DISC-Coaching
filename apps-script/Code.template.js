/**
 * Lam Son — DISC 30 câu: nhận bài nộp và ghi vào Google Sheets.
 * File Code.gs được sinh từ apps-script/Code.template.js bằng `npm run build:gas`.
 * Đừng sửa Code.gs bằng tay; sửa template rồi sinh lại.
 *
 * Cách dùng (chi tiết trong README):
 *   1. Mở Google Sheet trong thư mục COACHING/DISC → Tiện ích mở rộng → Apps Script.
 *   2. Dán toàn bộ Code.gs, lưu, chạy hàm setup() một lần (cấp quyền cho chính tài khoản của bạn).
 *   3. Triển khai → Ứng dụng web: Thực thi với tư cách "Tôi", Ai có quyền truy cập "Bất kỳ ai".
 *   4. Dán URL /exec vào biến VITE_SUBMIT_URL khi build app.
 * Người làm khảo sát chỉ gửi được dữ liệu, không đọc được Sheet.
 */

var QUESTIONNAIRE = /*__QUESTIONNAIRE__*/ null;
var SHEETS_SCHEMA = /*__SHEETS_SCHEMA__*/ null;
var CONSENT_VERSION = '/*__CONSENT_VERSION__*/';

var DIMENSIONS = ['D', 'I', 'S', 'C'];
var EPSILON = 1e-9;
var MAX_BODY = 20000;
var MAX_TEXT = 80;
var DIM_NAME = {
  D: 'chủ động và hướng kết quả',
  I: 'kết nối và tạo ảnh hưởng',
  S: 'hợp tác và duy trì ổn định',
  C: 'phân tích và chú trọng chất lượng',
};

// ---------- Kiểm tra dữ liệu ----------

function isPlainObject_(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function hasDangerousKeys_(v, depth) {
  depth = depth || 0;
  if (depth > 10) return true;
  if (Array.isArray(v)) {
    for (var i = 0; i < v.length; i++) if (hasDangerousKeys_(v[i], depth + 1)) return true;
    return false;
  }
  if (isPlainObject_(v)) {
    var keys = Object.keys(v);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') return true;
      if (hasDangerousKeys_(v[key], depth + 1)) return true;
    }
  }
  return false;
}

function cleanText_(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

function exactKeys_(obj, keys) {
  var own = Object.keys(obj).sort();
  var want = keys.slice().sort();
  return own.length === want.length && own.every(function (k, i) { return k === want[i]; });
}

/** Trả {ok:true, value} hoặc {ok:false, error}. Không tự ép kiểu. */
function validatePayload_(p) {
  if (!isPlainObject_(p)) return { ok: false, error: 'Dữ liệu gửi lên không đúng định dạng.' };
  if (hasDangerousKeys_(p)) return { ok: false, error: 'Dữ liệu chứa trường không được phép.' };
  if (!exactKeys_(p, ['submissionId', 'questionnaireVersion', 'consentVersion', 'consentAt', 'participant', 'answers'])) {
    return { ok: false, error: 'Dữ liệu có trường thiếu hoặc thừa.' };
  }
  if (p.questionnaireVersion !== QUESTIONNAIRE.version) {
    return { ok: false, error: 'Phiên bản bộ câu hỏi không được hỗ trợ.' };
  }
  if (p.consentVersion !== CONSENT_VERSION) return { ok: false, error: 'Phiên bản đồng ý không được hỗ trợ.' };
  if (typeof p.submissionId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(p.submissionId)) {
    return { ok: false, error: 'Mã lần nộp không hợp lệ.' };
  }
  if (typeof p.consentAt !== 'string' || isNaN(Date.parse(p.consentAt))) {
    return { ok: false, error: 'Thiếu thời điểm đồng ý gửi dữ liệu.' };
  }
  var part = p.participant;
  if (!isPlainObject_(part) || !exactKeys_(part, ['fullName', 'department', 'title'])) {
    return { ok: false, error: 'Thông tin người làm không đúng định dạng.' };
  }
  if (typeof part.fullName !== 'string' || typeof part.department !== 'string' || typeof part.title !== 'string') {
    return { ok: false, error: 'Thông tin người làm không đúng định dạng.' };
  }
  var fullName = cleanText_(part.fullName);
  var department = cleanText_(part.department);
  var title = cleanText_(part.title);
  if (fullName.length < 2 || fullName.length > MAX_TEXT) return { ok: false, error: 'Họ tên là bắt buộc (2–80 ký tự).' };
  if (department.length < 2 || department.length > MAX_TEXT) return { ok: false, error: 'Phòng ban là bắt buộc (2–80 ký tự).' };
  if (title.length > MAX_TEXT) return { ok: false, error: 'Chức danh tối đa 80 ký tự.' };

  if (!Array.isArray(p.answers) || p.answers.length !== QUESTIONNAIRE.questions.length) {
    return { ok: false, error: 'Cần đủ ' + QUESTIONNAIRE.questions.length + ' câu trả lời.' };
  }
  var known = {};
  QUESTIONNAIRE.questions.forEach(function (q) { known[q.id] = true; });
  var answers = {};
  for (var i = 0; i < p.answers.length; i++) {
    var a = p.answers[i];
    if (!isPlainObject_(a) || !exactKeys_(a, ['id', 'value'])) return { ok: false, error: 'Câu trả lời không đúng định dạng.' };
    if (typeof a.id !== 'string' || !known[a.id]) return { ok: false, error: 'Có ID câu hỏi không hợp lệ.' };
    if (Object.prototype.hasOwnProperty.call(answers, a.id)) return { ok: false, error: 'ID ' + a.id + ' bị trùng.' };
    var v = a.value;
    var valid = v === null || (typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= 1 && v <= 5);
    if (!valid) return { ok: false, error: 'Giá trị của ' + a.id + ' phải là 1–5 hoặc N/A.' };
    answers[a.id] = v;
  }
  return {
    ok: true,
    value: {
      submissionId: p.submissionId,
      consentAt: new Date(p.consentAt).toISOString(),
      participant: { fullName: fullName, department: department, title: title },
      answers: answers,
    },
  };
}

// ---------- Chấm điểm (phải khớp src/domain; có test so sánh) ----------

function scoreAnswers_(answers) {
  var dims = {};
  DIMENSIONS.forEach(function (d) { dims[d] = { n: 0, total: 0 }; });
  var nDisc = 0;
  QUESTIONNAIRE.questions.forEach(function (q) {
    if (!q.scored) return;
    var v = answers[q.id];
    if (typeof v !== 'number') return; // N/A hoặc thiếu: không tính, không thay bằng 3
    dims[q.dimension].n += 1;
    dims[q.dimension].total += v;
    nDisc += 1;
  });
  var scores = {};
  DIMENSIONS.forEach(function (d) {
    var b = dims[d];
    scores[d] = { n: b.n, score: b.n === 0 ? null : (25 * (b.total - b.n)) / b.n };
  });
  return { scores: scores, nDisc: nDisc };
}

function interpret_(scored, answers) {
  var r = QUESTIONNAIRE.rules;
  var missing = DIMENSIONS.filter(function (d) { return scored.scores[d].n < r.minAnsweredPerDimension; });
  var discValues = QUESTIONNAIRE.questions
    .filter(function (q) { return q.scored && typeof answers[q.id] === 'number'; })
    .map(function (q) { return answers[q.id]; });
  var allSame = discValues.length >= 2 && discValues.every(function (v) { return v === discValues[0]; });
  var reviewSuggested = allSame && scored.nDisc >= r.minAnsweredDiscTotal;
  if (missing.length > 0 || scored.nDisc < r.minAnsweredDiscTotal) {
    return { dataStatus: 'insufficient', pattern: 'insufficient', candidates: [], topTied: [], reviewSuggested: reviewSuggested };
  }
  var dataStatus = scored.nDisc >= r.discQuestions ? 'complete' : 'partial';
  var vals = DIMENSIONS.map(function (d) { return scored.scores[d].score; });
  var max = Math.max.apply(null, vals);
  var min = Math.min.apply(null, vals);
  if (max - min <= r.flatRange + EPSILON) {
    return { dataStatus: dataStatus, pattern: 'flat', candidates: [], topTied: [], reviewSuggested: reviewSuggested };
  }
  var candidates = DIMENSIONS.filter(function (d) { return max - scored.scores[d].score <= r.closeDelta + EPSILON; });
  var topTied = DIMENSIONS.filter(function (d) { return max - scored.scores[d].score <= EPSILON; });
  var pattern = candidates.length === 1 ? 'clearer' : candidates.length === 2 ? 'close_pair' : 'multiple';
  return { dataStatus: dataStatus, pattern: pattern, candidates: candidates, topTied: topTied, reviewSuggested: reviewSuggested };
}

function fmt_(x) {
  if (x === null) return '—';
  return String(Math.round(x * 10) / 10).replace('.', ',');
}

function summaryText_(scored, interp) {
  var named = function (d) { return d + ' (' + DIM_NAME[d] + ')'; };
  var join = function (arr) {
    return arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' và ' + arr[arr.length - 1];
  };
  if (interp.pattern === 'insufficient') {
    return 'Trong các câu trả lời này, chưa đủ câu có điểm để nhận xét xu hướng (cần ít nhất 5/6 câu mỗi nhóm và 20/24 câu DISC có điểm).';
  }
  var desc;
  if (interp.pattern === 'flat') desc = 'các xu hướng tương đối gần nhau, nên không có nhóm chính hay nhóm phụ';
  else if (interp.pattern === 'clearer') desc = 'xu hướng được thể hiện rõ hơn là ' + named(interp.candidates[0]);
  else if (interp.pattern === 'close_pair') {
    desc = 'có hai xu hướng gần nhau: ' + join(interp.candidates.map(named)) + (interp.topTied.length === 2 ? ', với điểm bằng nhau' : '');
  } else desc = 'có nhiều xu hướng gần nhau: ' + join(interp.candidates.map(named));
  var scores = DIMENSIONS.map(function (d) { return d + ' ' + fmt_(scored.scores[d].score); }).join(', ');
  var partial = interp.dataStatus === 'partial' ? ' Đây là kết quả tạm thời từ các câu đã có điểm.' : '';
  return 'Trong các câu trả lời này, ' + desc + '. Điểm ' + scores +
    ' thể hiện mức đồng tình với các phát biểu của bộ khảo sát, chưa phải đánh giá đã chuẩn hóa.' + partial;
}

// ---------- Google Sheets ----------

/** Chặn công thức: chuỗi bắt đầu bằng = + - @ được ghi như văn bản thuần. */
function rawCell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  var s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function sheet_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Thiếu tab ' + name + '. Hãy chạy setup().');
  return sh;
}

/** Tìm dòng có Submission_ID ở cột A; trả về số dòng (1-based) hoặc 0. */
function findRow_(sh, submissionId) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === submissionId) return i + 2;
  return 0;
}

function appendRow_(sh, values) {
  var row = sh.getLastRow() + 1;
  sh.getRange(row, 1, 1, values.length).setValues([values.map(rawCell_)]);
}

function answerCell_(v) {
  return v === null ? 'N/A' : v;
}

function participantId_(p) {
  // Mã ổn định theo họ tên + phòng ban để coach đối chiếu với DANH_SACH; không phải mã bí mật.
  var raw = (p.fullName + '|' + p.department).toLowerCase();
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  var hex = bytes.slice(0, 6).map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
  return 'P-' + hex;
}

function campaignId_() {
  return PropertiesService.getScriptProperties().getProperty('CAMPAIGN_ID') || 'LAMSON-2026';
}

function recordSubmission_(v) {
  var answers = v.answers;
  var scored = scoreAnswers_(answers);
  var interp = interpret_(scored, answers);
  var now = new Date();
  var receivedUtc = now.toISOString();
  var receivedVn = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
  var pid = participantId_(v.participant);
  var campaign = campaignId_();
  var round = function (x) { return x === null ? '' : Math.round(x * 10) / 10; };

  var answerRow = [v.submissionId, pid, campaign, QUESTIONNAIRE.version].concat(
    SHEETS_SCHEMA.tabs.TRA_LOI.slice(4).map(function (id) { return answerCell_(answers[id]); }),
  );
  var resultByHeader = {
    Submission_ID: v.submissionId,
    Participant_ID: pid,
    Campaign_ID: campaign,
    Ho_ten: v.participant.fullName,
    Phong_ban: v.participant.department,
    Chuc_danh: v.participant.title,
    Received_UTC: receivedUtc,
    Received_VN: receivedVn,
    Questionnaire_version: QUESTIONNAIRE.version,
    Consent_version: CONSENT_VERSION,
    Consent_at_UTC: v.consentAt,
    N_DISC: scored.nDisc,
    N_D: scored.scores.D.n,
    N_I: scored.scores.I.n,
    N_S: scored.scores.S.n,
    N_C: scored.scores.C.n,
    Score_D: round(scored.scores.D.score),
    Score_I: round(scored.scores.I.score),
    Score_S: round(scored.scores.S.score),
    Score_C: round(scored.scores.C.score),
    Data_status: interp.dataStatus,
    Pattern_status: interp.pattern,
    Candidate_groups: interp.candidates.join(','),
    Preliminary_summary: summaryText_(scored, interp),
  };
  var resultRow = SHEETS_SCHEMA.tabs.KET_QUA.map(function (h) { return resultByHeader[h]; });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var duplicate = false;
  try {
    var answersSheet = sheet_('TRA_LOI');
    var resultSheet = sheet_('KET_QUA');
    var existingAnswers = findRow_(answersSheet, v.submissionId);
    if (existingAnswers) {
      // Cùng mã, khác nội dung: từ chối thay vì ghi đè.
      var stored = answersSheet.getRange(existingAnswers, 1, 1, answerRow.length).getValues()[0];
      for (var i = 4; i < answerRow.length; i++) {
        if (String(stored[i]) !== String(answerRow[i])) {
          return { ok: false, error: 'Mã lần nộp đã được dùng cho câu trả lời khác.', conflict: true };
        }
      }
      duplicate = true;
    } else {
      appendRow_(answersSheet, answerRow);
    }
    // Ghi KET_QUA nếu chưa có (cũng là bước sửa khi lần trước chỉ ghi được TRA_LOI).
    if (!findRow_(resultSheet, v.submissionId)) appendRow_(resultSheet, resultRow);
    else duplicate = true;
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return {
    ok: true,
    submissionId: v.submissionId,
    duplicate: duplicate,
    receivedAt: receivedUtc,
    nDisc: scored.nDisc,
    scores: scored.scores,
    dataStatus: interp.dataStatus,
    pattern: interp.pattern,
    candidates: interp.candidates,
  };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handlePost_(e) {
  var body = e && e.postData && typeof e.postData.contents === 'string' ? e.postData.contents : '';
  if (!body || body.length > MAX_BODY) return { ok: false, error: 'Dữ liệu gửi lên rỗng hoặc quá lớn.' };
  var payload;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    return { ok: false, error: 'Dữ liệu gửi lên không phải JSON hợp lệ.' };
  }
  var checked = validatePayload_(payload);
  if (!checked.ok) return checked;
  try {
    return recordSubmission_(checked.value);
  } catch (err) {
    // Không ghi log đáp án hay thông tin cá nhân.
    console.error('record_failed: ' + (err && err.message ? err.message : 'unknown'));
    return { ok: false, retryable: true, error: 'Chưa ghi được vào Google Sheets. Vui lòng thử lại sau ít phút.' };
  }
}

function doPost(e) {
  return json_(handlePost_(e));
}

function doGet() {
  return json_({ ok: true, service: 'lamson-disc-30', questionnaireVersion: QUESTIONNAIRE.version });
}

// ---------- Thiết lập workbook ----------

var GUIDE_ROWS = [
  ['Mục đích', 'Lưu bài khảo sát DISC 30 câu của trưởng phòng ban Lam Son để coach phân tích. Mỗi lần nộp là một dòng KET_QUA và một dòng TRA_LOI.'],
  ['Phiên bản', 'Bộ câu hỏi ' + (QUESTIONNAIRE ? QUESTIONNAIRE.version : '') + '; đồng ý ' + CONSENT_VERSION + '.'],
  ['Cách chấm', 'Chỉ 24 câu DISC được chấm: điểm nhóm = 25 × (trung bình − 1), thang 0–100. N/A không tính thành 3. 6 câu L/T chỉ lưu đáp án, không cộng điểm.'],
  ['Đủ dữ liệu', 'complete: 24/24 câu DISC có điểm; partial: 20–23 và mỗi nhóm ≥ 5; insufficient: còn lại.'],
  ['Xu hướng', 'flat: chênh lệch cao nhất − thấp nhất ≤ 10; clearer/close_pair/multiple: các nhóm cách điểm cao nhất ≤ 10. Ngưỡng là quy ước, chưa kiểm định.'],
  ['Giới hạn', 'Bộ câu hỏi tự biên soạn, chưa chuẩn hóa tâm trắc. Không dùng để chẩn đoán, tuyển dụng, thưởng/phạt hay xếp hạng năng lực.'],
  ['Quyền truy cập', 'Chỉ coach được chỉ định mở workbook. Không chia sẻ công khai. Ẩn hoặc khóa tab không phải là kiểm soát truy cập.'],
  ['DANH_SACH', 'Coach tự nhập danh sách trưởng phòng dự kiến để biết ai chưa làm. Participant_ID trong KET_QUA được tính từ họ tên + phòng ban.'],
  ['Xóa dữ liệu', 'Khi người làm yêu cầu xóa, xóa dòng có Submission_ID tương ứng ở cả KET_QUA và TRA_LOI.'],
];

function ensureTab_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  var lastCol = sh.getLastColumn();
  if (sh.getLastRow() === 0 || lastCol === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    return sh;
  }
  var current = sh.getRange(1, 1, 1, Math.max(lastCol, headers.length)).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(current[i]) !== headers[i]) {
      throw new Error('Tab ' + name + ' có tiêu đề cột khác schema (cột ' + (i + 1) + '). Không tự sửa để tránh mất dữ liệu.');
    }
  }
  return sh;
}

/** Chạy một lần sau khi dán script. Tạo 5 tab và tiêu đề; không xóa tab hay dữ liệu cũ. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = SHEETS_SCHEMA.tabs;
  ['KET_QUA', 'TRA_LOI', 'DANH_SACH', 'CAU_HOI', 'HUONG_DAN'].forEach(function (name) {
    ensureTab_(ss, name, tabs[name]);
  });
  var q = ss.getSheetByName('CAU_HOI');
  var existing = q.getLastRow() > 1 ? q.getRange(2, 1, q.getLastRow() - 1, 2).getValues() : [];
  var have = {};
  existing.forEach(function (r) { have[r[0] + '|' + r[1]] = true; });
  QUESTIONNAIRE.questions.forEach(function (item) {
    if (have[QUESTIONNAIRE.version + '|' + item.id]) return;
    appendRow_(q, [QUESTIONNAIRE.version, item.id, item.section, item.dimension || '', item.scored ? 'TRUE' : 'FALSE', item.text]);
  });
  var g = ss.getSheetByName('HUONG_DAN');
  if (g.getLastRow() <= 1) GUIDE_ROWS.forEach(function (r) { appendRow_(g, r); });
  return 'Đã thiết lập ' + Object.keys(tabs).length + ' tab.';
}
