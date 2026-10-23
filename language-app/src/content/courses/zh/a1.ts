import type { Unit } from '../../types';

// Ở A1–A2 câu hỏi viết bằng tiếng Việt, đáp án bằng chữ Hán (cách các app học tiếng Hoa phổ biến làm cho người mới).
export const ZH_A1: Unit[] = [
  {
    id: 'zh-a1-general-1',
    level: 'A1',
    track: 'general',
    title: '你好！',
    titleVi: 'Chào hỏi và giới thiệu bản thân',
    lessons: [
      {
        id: 'zh-a1-general-1-l1',
        title: '我叫阮明',
        titleVi: 'Tôi tên là Nguyễn Minh',
        objectivesVi: ['Chào hỏi', 'Nói tên, quốc tịch, nghề nghiệp', 'Đặt câu hỏi với 吗'],
        vocabulary: [
          { term: '你好', reading: 'nǐ hǎo', meaningVi: 'xin chào' },
          { term: '我叫…', reading: 'wǒ jiào…', meaningVi: 'tôi tên là…', example: '我叫阮明。' },
          { term: '越南人', reading: 'Yuènán rén', meaningVi: 'người Việt Nam' },
          { term: '中国人', reading: 'Zhōngguó rén', meaningVi: 'người Trung Quốc' },
          { term: '老师', reading: 'lǎoshī', meaningVi: 'giáo viên' },
          { term: '认识你很高兴', reading: 'rènshi nǐ hěn gāoxìng', meaningVi: 'rất vui được biết bạn' },
        ],
        grammar: {
          titleVi: 'Câu với 是 và câu hỏi với 吗',
          pointsVi: [
            'A 是 B = A là B: 我是越南人 (Tôi là người Việt Nam).',
            'Thêm 吗 cuối câu để thành câu hỏi có/không: 你是老师吗？',
            'Phủ định: 不是 (bú shì) — 不 đổi sang thanh 2 khi đứng trước thanh 4.',
          ],
          examples: [
            { text: '我是越南人。', reading: 'Wǒ shì Yuènán rén.', meaningVi: 'Tôi là người Việt Nam.' },
            { text: '你是老师吗？', reading: 'Nǐ shì lǎoshī ma?', meaningVi: 'Bạn là giáo viên à?' },
            { text: '我不是老师。', reading: 'Wǒ bú shì lǎoshī.', meaningVi: 'Tôi không phải giáo viên.' },
          ],
        },
        activities: [
          {
            id: 'zh-a1-g1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe Vương Lệ giới thiệu',
            script: '你好！我叫王丽，我是中国人。我是老师。认识你很高兴！',
            reading: 'Nǐ hǎo! Wǒ jiào Wáng Lì, wǒ shì Zhōngguó rén. Wǒ shì lǎoshī. Rènshi nǐ hěn gāoxìng!',
            translationVi: 'Xin chào! Tôi tên Vương Lệ, tôi là người Trung Quốc. Tôi là giáo viên. Rất vui được biết bạn!',
            questions: [
              { id: 'q1', question: 'Vương Lệ là người nước nào?', options: ['中国人', '越南人', '日本人'], answer: 0 },
              { id: 'q2', question: 'Vương Lệ làm nghề gì?', options: ['老师', '医生', '学生'], answer: 0 },
            ],
          },
          {
            id: 'zh-a1-g1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc thẻ nhân viên',
            passage: '我叫阮明，我是越南人。我二十五岁。我是公司职员。',
            reading: 'Wǒ jiào Ruǎn Míng, wǒ shì Yuènán rén. Wǒ èrshíwǔ suì. Wǒ shì gōngsī zhíyuán.',
            translationVi: 'Tôi tên Nguyễn Minh, tôi là người Việt Nam. Tôi 25 tuổi. Tôi là nhân viên công ty.',
            questions: [
              { id: 'q1', question: 'Minh bao nhiêu tuổi?', options: ['十五', '二十五', '五十二'], answer: 1 },
              { id: 'q2', question: 'Minh làm gì?', options: ['老师', '公司职员', '医生'], answer: 1, explanationVi: '公司职员 (gōngsī zhíyuán) = nhân viên công ty.' },
            ],
          },
          {
            id: 'zh-a1-g1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu (chú ý thanh điệu)',
            sentences: [
              { text: '你好！', reading: 'Nǐ hǎo!', meaningVi: 'Xin chào! (nǐ đọc thành thanh 2 vì hai thanh 3 đi liền)' },
              { text: '我叫阮明。', reading: 'Wǒ jiào Ruǎn Míng.', meaningVi: 'Tôi tên là Nguyễn Minh.' },
              { text: '认识你很高兴。', reading: 'Rènshi nǐ hěn gāoxìng.', meaningVi: 'Rất vui được biết bạn.' },
            ],
          },
          {
            id: 'zh-a1-g1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: giới thiệu bản thân',
            prompt: '用中文介绍自己：名字、哪国人、工作。',
            hintVi: 'Nói 3 câu: 我叫… · 我是越南人 · 我是… (nghề nghiệp).',
            criteria: ['Says name, nationality and job', 'Correct use of 是 and 叫'],
          },
          {
            id: 'zh-a1-g1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: tin nhắn chào đồng nghiệp mới',
            prompt: '写一条消息给新同事：问好，介绍自己，问一个问题。',
            hintVi: 'Khoảng 20–40 chữ Hán. Gõ bằng bộ gõ pinyin trên điện thoại.',
            minLength: 20,
            criteria: ['Greeting', 'Self-introduction', 'One question with 吗 or a question word'],
          },
        ],
        roleplay: {
          title: 'Làm quen đồng nghiệp người Trung Quốc',
          botRole: 'a new Chinese colleague, sitting next to you at lunch',
          learnerRole: 'chính bạn',
          goal: 'Chào hỏi, giới thiệu bản thân, hỏi được tên và công việc của đồng nghiệp',
          targetPhrases: ['你好', '我叫', '认识你很高兴'],
        },
      },
    ],
  },
  {
    id: 'zh-a1-general-2',
    level: 'A1',
    track: 'general',
    title: '多少钱？',
    titleVi: 'Số đếm, mua sắm và mặc cả',
    lessons: [
      {
        id: 'zh-a1-general-2-l1',
        title: '这个多少钱？',
        titleVi: 'Cái này bao nhiêu tiền?',
        objectivesVi: ['Đếm 1–100', 'Hỏi giá và trả giá', 'Dùng lượng từ 个、杯、斤'],
        vocabulary: [
          { term: '多少钱', reading: 'duōshao qián', meaningVi: 'bao nhiêu tiền' },
          { term: '块', reading: 'kuài', meaningVi: 'đồng (tệ, cách nói khẩu ngữ)' },
          { term: '太贵了', reading: 'tài guì le', meaningVi: 'đắt quá' },
          { term: '便宜一点儿', reading: 'piányi yìdiǎnr', meaningVi: 'rẻ hơn một chút' },
          { term: '我要这个', reading: 'wǒ yào zhège', meaningVi: 'tôi lấy cái này' },
          { term: '一杯咖啡', reading: 'yì bēi kāfēi', meaningVi: 'một cốc cà phê' },
        ],
        grammar: {
          titleVi: 'Số + lượng từ + danh từ',
          pointsVi: [
            'Tiếng Hoa luôn cần lượng từ: 一个苹果 (một quả táo), 一杯茶 (một cốc trà), 一斤苹果 (nửa cân táo).',
            'Trước lượng từ, số 2 nói là 两 (liǎng) chứ không phải 二: 两杯咖啡.',
            'Hỏi giá: … 多少钱？ / … 多少钱一斤？',
          ],
          examples: [
            { text: '我要两杯咖啡。', reading: 'Wǒ yào liǎng bēi kāfēi.', meaningVi: 'Tôi lấy hai cốc cà phê.' },
            { text: '苹果多少钱一斤？', reading: 'Píngguǒ duōshao qián yì jīn?', meaningVi: 'Táo bao nhiêu tiền nửa cân?' },
          ],
        },
        activities: [
          {
            id: 'zh-a1-g2-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe mặc cả ở chợ',
            script: '这个苹果多少钱一斤？八块钱一斤。太贵了，便宜一点儿吧。好，七块。',
            reading: 'Zhège píngguǒ duōshao qián yì jīn? Bā kuài qián yì jīn. Tài guì le, piányi yìdiǎnr ba. Hǎo, qī kuài.',
            translationVi: 'Táo này bao nhiêu nửa cân? 8 tệ nửa cân. Đắt quá, rẻ chút đi. Được, 7 tệ.',
            questions: [
              { id: 'q1', question: 'Giá ban đầu là bao nhiêu?', options: ['七块', '八块', '十块'], answer: 1 },
              { id: 'q2', question: 'Giá cuối cùng là bao nhiêu?', options: ['七块', '八块', '六块'], answer: 0 },
            ],
          },
          {
            id: 'zh-a1-g2-l1-read',
            kind: 'reading',
            titleVi: 'Đọc bảng giá quán cà phê',
            passage: '咖啡 十五块 · 茶 十块 · 面包 八块',
            reading: 'kāfēi shíwǔ kuài · chá shí kuài · miànbāo bā kuài',
            translationVi: 'Cà phê 15 tệ · Trà 10 tệ · Bánh mì 8 tệ',
            questions: [
              { id: 'q1', question: 'Một cà phê và một bánh mì hết bao nhiêu?', options: ['二十三块', '二十五块', '十八块'], answer: 0 },
              { id: 'q2', question: 'Món nào rẻ nhất?', options: ['咖啡', '茶', '面包'], answer: 2 },
            ],
          },
          {
            id: 'zh-a1-g2-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: '这个多少钱？', reading: 'Zhège duōshao qián?', meaningVi: 'Cái này bao nhiêu tiền?' },
              { text: '太贵了，便宜一点儿吧。', reading: 'Tài guì le, piányi yìdiǎnr ba.', meaningVi: 'Đắt quá, rẻ chút đi.' },
              { text: '我要两杯咖啡。', reading: 'Wǒ yào liǎng bēi kāfēi.', meaningVi: 'Tôi lấy hai cốc cà phê.' },
            ],
          },
          {
            id: 'zh-a1-g2-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: hỏi giá và trả giá',
            prompt: '你在市场买水果。问两种水果的价格，然后讲价。',
            hintVi: 'Hỏi giá 2 loại quả, chê đắt và xin bớt.',
            criteria: ['Asks prices with 多少钱', 'Bargains with 太贵了 / 便宜一点儿', 'Uses measure words'],
          },
          {
            id: 'zh-a1-g2-l1-write',
            kind: 'writing',
            titleVi: 'Viết: nhờ bạn mua đồ',
            prompt: '写一条消息给朋友，请他帮你买东西：买什么、买多少。',
            hintVi: 'Khoảng 20–40 chữ, nhớ dùng lượng từ.',
            minLength: 20,
            criteria: ['Lists at least two items with quantities', 'Correct measure words'],
          },
        ],
        roleplay: {
          title: 'Mua hoa quả ở chợ',
          botRole: 'a friendly fruit seller at a Chinese market who starts with high prices',
          learnerRole: 'khách hàng',
          goal: 'Mua hai loại quả và mặc cả được giá thấp hơn',
          targetPhrases: ['多少钱', '太贵了', '便宜一点儿'],
        },
      },
    ],
  },
];
