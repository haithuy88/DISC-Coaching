import type { Unit } from '../../types';

// Từ B1 câu hỏi viết bằng tiếng Hoa; pinyin chỉ còn ở từ vựng và câu mẫu.
export const ZH_B1: Unit[] = [
  {
    id: 'zh-b1-business-1',
    level: 'B1',
    track: 'business',
    title: '开会',
    titleVi: 'Họp hành',
    lessons: [
      {
        id: 'zh-b1-business-1-l1',
        title: '汇报工作进度',
        titleVi: 'Báo cáo tiến độ công việc',
        objectivesVi: ['Báo việc đã xong / chưa xong', 'Giải thích nguyên nhân chậm trễ', 'Đề nghị hỗ trợ'],
        vocabulary: [
          { term: '开会', reading: 'kāihuì', meaningVi: 'họp' },
          { term: '进度', reading: 'jìndù', meaningVi: 'tiến độ' },
          { term: '按时完成', reading: 'ànshí wánchéng', meaningVi: 'hoàn thành đúng hạn' },
          { term: '推迟', reading: 'tuīchí', meaningVi: 'lùi lại, hoãn' },
          { term: '负责', reading: 'fùzé', meaningVi: 'phụ trách' },
          { term: '截止日期', reading: 'jiézhǐ rìqī', meaningVi: 'hạn chót' },
        ],
        grammar: {
          titleVi: '已经…了 / 还没…呢 và 因为…所以…',
          pointsVi: [
            '已经 + động từ + 了 = đã … rồi; 还没 + động từ + 呢 = vẫn chưa ….',
            '因为 A，所以 B = vì A nên B. Có thể bỏ một trong hai từ, nhưng giữ cả hai nghe trang trọng hơn khi báo cáo.',
          ],
          examples: [
            { text: '新系统已经安装好了。', reading: 'Xīn xìtǒng yǐjīng ānzhuāng hǎo le.', meaningVi: 'Hệ thống mới đã cài xong.' },
            { text: '我们还没收到零件呢。', reading: 'Wǒmen hái méi shōudào língjiàn ne.', meaningVi: 'Chúng tôi vẫn chưa nhận được linh kiện.' },
            { text: '因为供应商晚交货，所以推迟了一周。', reading: 'Yīnwèi gōngyìngshāng wǎn jiāohuò, suǒyǐ tuīchíle yì zhōu.', meaningVi: 'Vì nhà cung cấp giao muộn nên lùi một tuần.' },
          ],
        },
        activities: [
          {
            id: 'zh-b1-b1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe báo cáo tuần',
            script: '我说一下这个星期的进度。新系统已经安装好了，培训了二十个同事。因为扫描枪到货晚了，所以我们推迟了一个星期。下周我需要IT部门再派两个人帮忙。',
            reading:
              'Wǒ shuō yíxià zhège xīngqī de jìndù. Xīn xìtǒng yǐjīng ānzhuāng hǎo le, péixùnle èrshí gè tóngshì. Yīnwèi sǎomiáoqiāng dàohuò wǎn le, suǒyǐ wǒmen tuīchíle yí gè xīngqī. Xià zhōu wǒ xūyào IT bùmén zài pài liǎng gè rén bāngmáng.',
            translationVi: 'Tôi báo cáo tiến độ tuần này. Hệ thống mới đã cài xong, đã đào tạo 20 đồng nghiệp. Vì súng quét mã về muộn nên chúng tôi lùi một tuần. Tuần sau tôi cần phòng IT cử thêm hai người hỗ trợ.',
            questions: [
              { id: 'q1', question: '为什么推迟了？', options: ['同事生病了', '扫描枪到货晚了', '预算不够'], answer: 1 },
              { id: 'q2', question: '他需要什么？', options: ['更多的钱', 'IT部门的两个人', '更多时间'], answer: 1 },
            ],
          },
          {
            id: 'zh-b1-b1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc biên bản họp',
            passage: '会议纪要：1. 第二季度销售完成目标的92%。2. 新价格表已批准，7月1日开始执行。3. 阿玲负责在6月20日前把价格表发给所有经销商。',
            translationVi: 'Biên bản: 1. Doanh số quý 2 đạt 92% mục tiêu. 2. Bảng giá mới đã duyệt, áp dụng từ 1/7. 3. A Linh phụ trách gửi bảng giá cho mọi đại lý trước 20/6.',
            questions: [
              { id: 'q1', question: '新价格什么时候开始执行？', options: ['6月20日', '7月1日', '马上'], answer: 1 },
              { id: 'q2', question: '谁负责发价格表？', options: ['阿玲', '经销商', '销售经理'], answer: 0 },
            ],
          },
          {
            id: 'zh-b1-b1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: '我们的进度很正常。', reading: 'Wǒmen de jìndù hěn zhèngcháng.', meaningVi: 'Tiến độ của chúng tôi bình thường.' },
              { text: '因为供应商晚交货，所以推迟了一周。', reading: 'Yīnwèi gōngyìngshāng wǎn jiāohuò, suǒyǐ tuīchíle yì zhōu.', meaningVi: 'Vì nhà cung cấp giao muộn nên lùi một tuần.' },
              { text: '这件事由我负责。', reading: 'Zhè jiàn shì yóu wǒ fùzé.', meaningVi: 'Việc này do tôi phụ trách.' },
            ],
          },
          {
            id: 'zh-b1-b1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: báo cáo tiến độ công việc của bạn',
            prompt: '用一分钟汇报你最近的一项工作：已经完成了什么、还没完成什么、有什么问题、需要什么帮助。',
            hintVi: 'Khung: 已经… → 还没… → 因为…所以… → 我需要…',
            criteria: ['Uses 已经…了 and 还没 correctly', 'Explains a cause with 因为…所以', 'Makes a clear request'],
          },
          {
            id: 'zh-b1-b1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: email sau cuộc họp',
            prompt: '写一封会后邮件：总结两个决定，列出谁负责什么、截止日期是什么时候。',
            hintVi: 'Khoảng 100–150 chữ.',
            minLength: 100,
            criteria: ['Two decisions stated clearly', 'Each task has an owner (负责) and a deadline'],
          },
        ],
        roleplay: {
          title: 'Họp giao ban với sếp người Đài Loan',
          botRole: 'your manager running a weekly meeting in Mandarin, asking follow-up questions about delays',
          learnerRole: 'thành viên trong nhóm',
          goal: 'Báo cáo tiến độ, giải thích một việc bị chậm và chốt hỗ trợ bạn cần',
          targetPhrases: ['进度', '推迟', '负责'],
        },
      },
    ],
  },
  {
    id: 'zh-b1-purchasing-1',
    level: 'B1',
    track: 'purchasing',
    title: '采购',
    titleVi: 'Thu mua',
    lessons: [
      {
        id: 'zh-b1-purchasing-1-l1',
        title: '询价',
        titleVi: 'Hỏi giá nhà cung cấp',
        objectivesVi: ['Mô tả nhu cầu mua hàng', 'Hỏi đơn giá, MOQ, thời gian giao, phương thức thanh toán', 'So sánh hai báo giá'],
        vocabulary: [
          { term: '询价 / 报价', reading: 'xúnjià / bàojià', meaningVi: 'hỏi giá / báo giá' },
          { term: '单价', reading: 'dānjià', meaningVi: 'đơn giá' },
          { term: '最小起订量', reading: 'zuìxiǎo qǐdìngliàng', meaningVi: 'số lượng đặt tối thiểu (MOQ)' },
          { term: '交货期', reading: 'jiāohuòqī', meaningVi: 'thời gian giao hàng' },
          { term: '付款方式', reading: 'fùkuǎn fāngshì', meaningVi: 'phương thức thanh toán' },
          { term: '预付', reading: 'yùfù', meaningVi: 'trả trước' },
          { term: '纸箱', reading: 'zhǐxiāng', meaningVi: 'thùng carton' },
        ],
        grammar: {
          titleVi: '如果…的话，就… và câu hỏi lịch sự 请问',
          pointsVi: ['如果 A 的话，(主语) 就 B = nếu A thì B — dùng khi đưa điều kiện.', '请问 + câu hỏi = cho hỏi … (mở đầu lịch sự).'],
          examples: [
            { text: '如果预付百分之五十的话，两周就能交货。', reading: 'Rúguǒ yùfù bǎi fēn zhī wǔshí de huà, liǎng zhōu jiù néng jiāohuò.', meaningVi: 'Nếu trả trước 50% thì hai tuần có thể giao.' },
            { text: '请问交货期是多长时间？', reading: 'Qǐngwèn jiāohuòqī shì duō cháng shíjiān?', meaningVi: 'Cho hỏi thời gian giao hàng là bao lâu?' },
          ],
        },
        activities: [
          {
            id: 'zh-b1-p1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe nhà cung cấp báo giá',
            script: '谢谢您的询价。一万个纸箱，单价是三块二人民币。最小起订量是五千个，交货期三周。如果预付百分之五十的话，两周就能交货。',
            reading:
              'Xièxie nín de xúnjià. Yíwàn gè zhǐxiāng, dānjià shì sān kuài èr rénmínbì. Zuìxiǎo qǐdìngliàng shì wǔqiān gè, jiāohuòqī sān zhōu. Rúguǒ yùfù bǎi fēn zhī wǔshí de huà, liǎng zhōu jiù néng jiāohuò.',
            translationVi: 'Cảm ơn anh đã hỏi giá. 10.000 thùng carton, đơn giá 3,2 tệ. MOQ 5.000 thùng, giao trong 3 tuần. Nếu trả trước 50% thì 2 tuần là giao được.',
            questions: [
              { id: 'q1', question: '最小起订量是多少？', options: ['五千个', '一万个', '五万个'], answer: 0 },
              { id: 'q2', question: '怎样才能两周交货？', options: ['多订一些', '预付百分之五十', '用现金付款'], answer: 1 },
            ],
          },
          {
            id: 'zh-b1-p1-l1-read',
            kind: 'reading',
            titleVi: 'So sánh hai báo giá',
            passage: '供应商A：单价3.2元，起订量5000个，交货期3周，月结30天。供应商B：单价3.0元，起订量20000个，交货期5周，预付全款。',
            translationVi: 'NCC A: đơn giá 3,2 tệ, MOQ 5.000, giao 3 tuần, thanh toán sau 30 ngày. NCC B: 3,0 tệ, MOQ 20.000, giao 5 tuần, trả trước toàn bộ.',
            questions: [
              { id: 'q1', question: '哪家的单价更低？', options: ['A', 'B'], answer: 1 },
              { id: 'q2', question: '一个月内需要8000个，选哪家？', options: ['A', 'B', '都不行'], answer: 0, explanationVi: 'B có MOQ 20.000 và giao 5 tuần, nên chỉ A đáp ứng.' },
            ],
          },
          {
            id: 'zh-b1-p1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: '我们想采购一万个纸箱。', reading: 'Wǒmen xiǎng cǎigòu yíwàn gè zhǐxiāng.', meaningVi: 'Chúng tôi muốn mua 10.000 thùng carton.' },
              { text: '请问交货期是多长时间？', reading: 'Qǐngwèn jiāohuòqī shì duō cháng shíjiān?', meaningVi: 'Cho hỏi thời gian giao hàng là bao lâu?' },
              { text: '付款方式是什么？', reading: 'Fùkuǎn fāngshì shì shénme?', meaningVi: 'Phương thức thanh toán thế nào?' },
            ],
          },
          {
            id: 'zh-b1-p1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: gọi điện hỏi giá',
            prompt: '给供应商打电话：说明你要买什么、要多少、什么时候要，然后问单价、起订量和付款方式。',
            hintVi: 'Mở đầu bằng 您好，我是…公司的…; dùng 请问 khi hỏi.',
            criteria: ['States product, quantity and deadline', 'Asks about price, MOQ and payment terms'],
          },
          {
            id: 'zh-b1-p1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: email hỏi giá',
            prompt: '写一封询价邮件给新供应商：一万个印刷纸箱，下个月底前交货，请对方报单价、起订量、交货期和付款方式。',
            hintVi: 'Khoảng 100–150 chữ, văn phong lịch sự.',
            minLength: 100,
            criteria: ['Clear subject and greeting', 'All key information requested', 'Polite business tone'],
          },
        ],
        roleplay: {
          title: 'Hỏi giá thùng carton với nhà cung cấp Trung Quốc',
          botRole: 'a sales rep at a Chinese packaging factory who pushes a larger order',
          learnerRole: 'nhân viên thu mua của một công ty Việt Nam',
          goal: 'Hỏi được đơn giá, MOQ, thời gian giao và phương thức thanh toán cho 10.000 thùng carton in',
          targetPhrases: ['单价', '最小起订量', '交货期', '付款方式'],
        },
      },
    ],
  },
];
