import type { Unit } from '../../types';

export const EN_A1: Unit[] = [
  {
    id: 'en-a1-general-1',
    level: 'A1',
    track: 'general',
    title: 'Hello, nice to meet you',
    titleVi: 'Chào hỏi và giới thiệu bản thân',
    lessons: [
      {
        id: 'en-a1-general-1-l1',
        title: 'Introducing yourself',
        titleVi: 'Giới thiệu bản thân',
        objectivesVi: ['Chào hỏi lịch sự', 'Nói tên, quê quán, công việc', 'Hỏi lại thông tin người khác'],
        vocabulary: [
          { term: 'Nice to meet you', meaningVi: 'Rất vui được gặp bạn' },
          { term: 'I work as a/an …', meaningVi: 'Tôi làm nghề …', example: 'I work as an accountant.' },
          { term: 'I am from …', meaningVi: 'Tôi đến từ …', example: 'I am from Thanh Hoa.' },
          { term: 'What do you do?', meaningVi: 'Bạn làm nghề gì?' },
          { term: 'colleague', meaningVi: 'đồng nghiệp' },
        ],
        grammar: {
          titleVi: 'Động từ “to be”: am / is / are',
          pointsVi: ['I → am · he/she/it → is · you/we/they → are', 'Nghề nghiệp số ít cần “a/an”: I am a teacher, she is an engineer.'],
          examples: [
            { text: 'I am Minh. I am a sales assistant.', meaningVi: 'Tôi là Minh. Tôi là nhân viên bán hàng.' },
            { text: 'She is from Hanoi.', meaningVi: 'Cô ấy đến từ Hà Nội.' },
          ],
        },
        activities: [
          {
            id: 'en-a1-g1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe đoạn giới thiệu',
            script: 'Hi, I am Lan. I am from Hanoi. I work as a teacher. I have two children. Nice to meet you!',
            translationVi: 'Chào, tôi là Lan. Tôi đến từ Hà Nội. Tôi là giáo viên. Tôi có hai con. Rất vui được gặp bạn!',
            questions: [
              { id: 'q1', question: 'Where is Lan from?', options: ['Hue', 'Hanoi', 'Da Nang'], answer: 1 },
              { id: 'q2', question: 'What does Lan do?', options: ['Teacher', 'Doctor', 'Driver'], answer: 0 },
            ],
          },
          {
            id: 'en-a1-g1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc hồ sơ nhân viên mới',
            passage: 'New staff: Minh. Age: 25. From: Thanh Hoa. Job: sales assistant. Likes: football and music.',
            questions: [
              { id: 'q1', question: 'How old is Minh?', options: ['52', '25', '15'], answer: 1 },
              { id: 'q2', question: 'Minh likes …', options: ['cooking', 'football', 'shopping'], answer: 1, explanationVi: '“Likes: football and music”.' },
            ],
          },
          {
            id: 'en-a1-g1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: 'Hi, I am Minh.', meaningVi: 'Chào, tôi là Minh.' },
              { text: 'Nice to meet you.', meaningVi: 'Rất vui được gặp bạn.' },
              { text: 'I work as an accountant.', meaningVi: 'Tôi là kế toán.' },
            ],
          },
          {
            id: 'en-a1-g1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: giới thiệu bản thân',
            prompt: 'Introduce yourself: your name, where you are from, and your job.',
            hintVi: 'Nói 3–4 câu. Ví dụ: “Hi, I am … I am from … I work as …”',
            criteria: ['Mentions name, hometown and job', 'Uses “I am” and “I work as” correctly'],
          },
          {
            id: 'en-a1-g1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: tin nhắn chào đồng nghiệp mới',
            prompt: 'Write a short message to a new colleague. Say hello, introduce yourself, and ask one question.',
            hintVi: 'Khoảng 30–50 từ.',
            minLength: 30,
            criteria: ['Greeting and closing', 'At least one question'],
          },
        ],
        roleplay: {
          title: 'Gặp đồng nghiệp mới ở canteen',
          botRole: 'a new colleague from another department, sitting at your table at lunch',
          learnerRole: 'chính bạn',
          goal: 'Chào hỏi, giới thiệu bản thân, hỏi được tên và công việc của đồng nghiệp',
          targetPhrases: ['Nice to meet you', 'What do you do?', 'I work as'],
        },
      },
    ],
  },
  {
    id: 'en-a1-general-2',
    level: 'A1',
    track: 'general',
    title: 'Numbers, time and prices',
    titleVi: 'Số, giờ giấc và giá cả',
    lessons: [
      {
        id: 'en-a1-general-2-l1',
        title: 'What time is it? How much is it?',
        titleVi: 'Hỏi giờ và hỏi giá',
        objectivesVi: ['Nói giờ', 'Hỏi và trả lời giá tiền', 'Hẹn giờ gặp đơn giản'],
        vocabulary: [
          { term: "It's half past seven", meaningVi: '7 giờ 30' },
          { term: "It's a quarter to nine", meaningVi: '9 giờ kém 15' },
          { term: 'How much is it?', meaningVi: 'Cái này bao nhiêu tiền?' },
          { term: "It's 20 dollars", meaningVi: 'Giá 20 đô la' },
          { term: 'See you at …', meaningVi: 'Hẹn gặp lúc …', example: 'See you at 3 o’clock.' },
        ],
        grammar: {
          titleVi: 'Nói giờ: past / to',
          pointsVi: ['Phút 1–30 dùng “past” (qua): ten past six = 6:10.', 'Phút 31–59 dùng “to” (kém): twenty to five = 4:40.', 'Đúng giờ: “o’clock”: It’s eight o’clock.'],
          examples: [
            { text: "It's ten past six.", meaningVi: '6 giờ 10.' },
            { text: "It's twenty to five.", meaningVi: '5 giờ kém 20 (4:40).' },
          ],
        },
        activities: [
          {
            id: 'en-a1-g2-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe hẹn giờ họp',
            script: 'The meeting is at a quarter past ten, in room three. Lunch is at twelve thirty. The bus leaves at five forty-five.',
            translationVi: 'Cuộc họp lúc 10 giờ 15, ở phòng 3. Ăn trưa lúc 12 giờ 30. Xe buýt rời lúc 5 giờ 45.',
            questions: [
              { id: 'q1', question: 'When is the meeting?', options: ['10:15', '10:45', '9:45'], answer: 0 },
              { id: 'q2', question: 'When does the bus leave?', options: ['5:15', '5:45', '6:45'], answer: 1 },
            ],
          },
          {
            id: 'en-a1-g2-l1-read',
            kind: 'reading',
            titleVi: 'Đọc thực đơn quán cà phê',
            passage: 'Coffee 2 dollars · Tea 1.5 dollars · Sandwich 4 dollars · Cake 3 dollars. Open: 7 am – 9 pm, every day.',
            questions: [
              { id: 'q1', question: 'How much is a coffee and a cake?', options: ['5 dollars', '6 dollars', '4.5 dollars'], answer: 0 },
              { id: 'q2', question: 'Is the café open at 10 pm?', options: ['Yes', 'No'], answer: 1 },
            ],
          },
          {
            id: 'en-a1-g2-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: 'How much is it?', meaningVi: 'Bao nhiêu tiền?' },
              { text: 'It is half past seven.', meaningVi: 'Bây giờ là 7 giờ 30.' },
              { text: 'See you at three o’clock.', meaningVi: 'Hẹn gặp lúc 3 giờ.' },
            ],
          },
          {
            id: 'en-a1-g2-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: lịch một ngày của bạn',
            prompt: 'Say what time you get up, start work, have lunch and go home.',
            hintVi: '“I get up at … I start work at …”',
            criteria: ['Says four times correctly', 'Uses “at” before times'],
          },
          {
            id: 'en-a1-g2-l1-write',
            kind: 'writing',
            titleVi: 'Viết: tin nhắn hẹn gặp',
            prompt: 'Write a message to a friend. Invite them for coffee: say the day, time, place and price of the coffee.',
            hintVi: 'Khoảng 30–50 từ.',
            minLength: 30,
            criteria: ['Day, time and place are clear', 'Correct time expressions'],
          },
        ],
        roleplay: {
          title: 'Mua đồ ở cửa hàng tiện lợi',
          botRole: 'a shop assistant at a convenience store',
          learnerRole: 'khách mua ba món đồ',
          goal: 'Hỏi giá ba món, thanh toán và hỏi mấy giờ cửa hàng đóng cửa',
          targetPhrases: ['How much is it?', 'What time do you close?'],
        },
      },
    ],
  },
];
