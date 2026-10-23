import type { Unit } from '../../types';

export const EN_A2: Unit[] = [
  {
    id: 'en-a2-general-1',
    level: 'A2',
    track: 'general',
    title: 'Small talk at work',
    titleVi: 'Chuyện phiếm nơi công sở',
    lessons: [
      {
        id: 'en-a2-general-1-l1',
        title: 'How was your weekend?',
        titleVi: 'Cuối tuần của bạn thế nào?',
        objectivesVi: ['Kể việc đã làm cuối tuần', 'Hỏi lại và phản hồi tự nhiên', 'Dùng thì quá khứ đơn'],
        vocabulary: [
          { term: 'How was your weekend?', meaningVi: 'Cuối tuần của bạn thế nào?' },
          { term: 'It was relaxing', meaningVi: 'Rất thư giãn' },
          { term: 'visit my parents', meaningVi: 'về thăm bố mẹ' },
          { term: 'Sounds fun!', meaningVi: 'Nghe vui đấy!' },
          { term: 'What about you?', meaningVi: 'Còn bạn thì sao?' },
        ],
        grammar: {
          titleVi: 'Quá khứ đơn: động từ có quy tắc và bất quy tắc',
          pointsVi: ['Có quy tắc: thêm -ed (visit → visited, watch → watched).', 'Bất quy tắc phải nhớ: go → went, have → had, see → saw, eat → ate.', 'Câu hỏi: Did you + động từ nguyên mẫu? (Did you go out?)'],
          examples: [
            { text: 'I visited my parents in Nam Dinh.', meaningVi: 'Tôi về thăm bố mẹ ở Nam Định.' },
            { text: 'Did you watch the match?', meaningVi: 'Bạn có xem trận đấu không?' },
          ],
        },
        activities: [
          {
            id: 'en-a2-g1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe hai đồng nghiệp nói chuyện',
            script:
              'A: Hi Hoa, how was your weekend? B: Great, thanks! I went to Ha Long Bay with my family. We stayed on a boat for one night. What about you? A: Oh, nothing special. I stayed at home and watched films.',
            translationVi:
              'A: Chào Hoa, cuối tuần thế nào? B: Tuyệt lắm! Mình đi Hạ Long với gia đình, ngủ trên tàu một đêm. Còn bạn? A: Không có gì đặc biệt. Mình ở nhà xem phim.',
            questions: [
              { id: 'q1', question: 'Where did Hoa go?', options: ['Sa Pa', 'Ha Long Bay', 'Da Lat'], answer: 1 },
              { id: 'q2', question: 'What did the other person do?', options: ['Went shopping', 'Stayed at home', 'Visited parents'], answer: 1 },
            ],
          },
          {
            id: 'en-a2-g1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc tin nhắn nhóm',
            passage:
              'Tuan: Thanks for the team dinner on Friday, everyone! The food was delicious. Sorry I left early – my son was sick. He is better now. See you all on Monday!',
            questions: [
              { id: 'q1', question: 'Why did Tuan leave early?', options: ['He was tired', 'His son was sick', 'He had a meeting'], answer: 1 },
              { id: 'q2', question: 'When was the dinner?', options: ['Friday', 'Saturday', 'Monday'], answer: 0 },
            ],
          },
          {
            id: 'en-a2-g1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: 'How was your weekend?', meaningVi: 'Cuối tuần của bạn thế nào?' },
              { text: 'I visited my parents.', meaningVi: 'Tôi về thăm bố mẹ.' },
              { text: 'That sounds fun! What about you?', meaningVi: 'Nghe vui đấy! Còn bạn?' },
            ],
          },
          {
            id: 'en-a2-g1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: kể về cuối tuần vừa rồi',
            prompt: 'Tell a colleague about your last weekend: where you went, who with, and what you did.',
            hintVi: 'Nói 4–6 câu ở thì quá khứ.',
            criteria: ['Uses past simple correctly', 'Gives at least three details'],
          },
          {
            id: 'en-a2-g1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: tin nhắn kể chuyện',
            prompt: 'Write a message to a friend about a nice day you had recently.',
            hintVi: 'Khoảng 50–70 từ.',
            minLength: 50,
            criteria: ['Past tense used correctly', 'Clear sequence: first, then, after that'],
          },
        ],
        roleplay: {
          title: 'Thứ Hai đầu tuần ở pantry',
          botRole: 'a friendly colleague making coffee on Monday morning',
          learnerRole: 'chính bạn',
          goal: 'Trò chuyện vài lượt về cuối tuần rồi kết thúc lịch sự',
          targetPhrases: ['How was your weekend?', 'What about you?', 'Sounds fun'],
        },
      },
    ],
  },
  {
    id: 'en-a2-travel-1',
    level: 'A2',
    track: 'travel',
    title: 'At the hotel',
    titleVi: 'Ở khách sạn',
    lessons: [
      {
        id: 'en-a2-travel-1-l1',
        title: 'Checking in',
        titleVi: 'Làm thủ tục nhận phòng',
        objectivesVi: ['Báo tên đặt phòng', 'Hỏi giờ ăn sáng, wifi', 'Xử lý khi phòng không đúng yêu cầu'],
        vocabulary: [
          { term: 'reservation', meaningVi: 'đặt phòng', example: 'I have a reservation under the name Nguyen.' },
          { term: 'check in / check out', meaningVi: 'nhận phòng / trả phòng' },
          { term: 'twin room / double room', meaningVi: 'phòng 2 giường / phòng 1 giường đôi' },
          { term: 'Is breakfast included?', meaningVi: 'Có bao gồm bữa sáng không?' },
          { term: "I'm afraid …", meaningVi: 'Tôi e là … (mở đầu lời phàn nàn lịch sự)' },
        ],
        grammar: {
          titleVi: 'Yêu cầu lịch sự: Could I / Could you',
          pointsVi: ['Could I + động từ? = xin phép làm gì (Could I have a late check-out?).', 'Could you + động từ? = nhờ người khác (Could you change my room?).', 'Thêm “please” cuối câu cho mềm hơn.'],
          examples: [
            { text: 'Could I have a non-smoking room, please?', meaningVi: 'Cho tôi phòng không hút thuốc được không?' },
            { text: 'Could you call a taxi for me?', meaningVi: 'Anh/chị gọi giúp tôi một chiếc taxi được không?' },
          ],
        },
        activities: [
          {
            id: 'en-a2-t1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe lễ tân hướng dẫn',
            script:
              'Welcome to the Riverside Hotel. Your room is 405, on the fourth floor. Breakfast is from six thirty to ten in the restaurant. The wifi password is on your key card. Check-out is at twelve.',
            questions: [
              { id: 'q1', question: 'What is the room number?', options: ['504', '405', '45'], answer: 1 },
              { id: 'q2', question: 'When does breakfast finish?', options: ['10:00', '10:30', '12:00'], answer: 0 },
              { id: 'q3', question: 'Where is the wifi password?', options: ['On the door', 'On the key card', 'At reception'], answer: 1 },
            ],
          },
          {
            id: 'en-a2-t1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc email xác nhận đặt phòng',
            passage:
              'Dear Mr Tran, thank you for your booking. Room: double room, non-smoking. Dates: 12–14 May (2 nights). Price: 90 USD per night, breakfast included. Free cancellation until 10 May.',
            questions: [
              { id: 'q1', question: 'How many nights is the booking?', options: ['1', '2', '3'], answer: 1 },
              { id: 'q2', question: 'Can Mr Tran cancel for free on 11 May?', options: ['Yes', 'No'], answer: 1, explanationVi: 'Chỉ huỷ miễn phí đến 10/5.' },
            ],
          },
          {
            id: 'en-a2-t1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: 'I have a reservation under the name Nguyen.', meaningVi: 'Tôi có đặt phòng tên Nguyễn.' },
              { text: 'Is breakfast included?', meaningVi: 'Có gồm bữa sáng không?' },
              { text: "I'm afraid there is a problem with my room.", meaningVi: 'Tôi e là phòng của tôi có vấn đề.' },
            ],
          },
          {
            id: 'en-a2-t1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: phòng không đúng yêu cầu',
            prompt: 'You booked a non-smoking double room, but you got a smoking twin room. Tell the receptionist politely and ask for a change.',
            hintVi: "Dùng “I'm afraid …”, “Could I …?”",
            criteria: ['Explains the problem clearly', 'Makes a polite request'],
          },
          {
            id: 'en-a2-t1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: email hỏi thông tin khách sạn',
            prompt: 'Write an email to a hotel. Ask about airport transfer, breakfast time and late check-out.',
            hintVi: 'Khoảng 60–80 từ, có lời chào và kết thư.',
            minLength: 60,
            criteria: ['Asks all three questions', 'Polite email format'],
          },
        ],
        roleplay: {
          title: 'Nhận phòng: phòng không đúng',
          botRole: 'a hotel receptionist; the hotel is almost full',
          learnerRole: 'khách đã đặt phòng đôi không hút thuốc',
          goal: 'Nhận phòng và có được đúng loại phòng hoặc phương án thay thế hợp lý',
          targetPhrases: ['I have a reservation', "I'm afraid", 'Could I'],
        },
      },
    ],
  },
  {
    id: 'en-a2-sales-1',
    level: 'A2',
    track: 'sales',
    title: 'Helping customers',
    titleVi: 'Tư vấn khách hàng',
    lessons: [
      {
        id: 'en-a2-sales-1-l1',
        title: 'Can I help you?',
        titleVi: 'Tôi có thể giúp gì cho anh/chị?',
        objectivesVi: ['Chào và hỏi nhu cầu khách', 'So sánh hai sản phẩm', 'Gợi ý và chốt lựa chọn'],
        vocabulary: [
          { term: 'Can I help you?', meaningVi: 'Tôi giúp gì được cho anh/chị?' },
          { term: "I'm looking for …", meaningVi: 'Tôi đang tìm …' },
          { term: 'cheaper / lighter / bigger', meaningVi: 'rẻ hơn / nhẹ hơn / to hơn' },
          { term: 'in stock', meaningVi: 'còn hàng' },
          { term: 'I recommend …', meaningVi: 'Tôi gợi ý …' },
        ],
        grammar: {
          titleVi: 'So sánh hơn',
          pointsVi: ['Tính từ ngắn: thêm -er + than (cheap → cheaper than).', 'Tính từ dài: more + tính từ + than (more expensive than).', 'Bất quy tắc: good → better, bad → worse.'],
          examples: [
            { text: 'This model is lighter than that one.', meaningVi: 'Mẫu này nhẹ hơn mẫu kia.' },
            { text: 'The blue one is more expensive, but it is better.', meaningVi: 'Cái màu xanh đắt hơn nhưng tốt hơn.' },
          ],
        },
        activities: [
          {
            id: 'en-a2-s1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe tư vấn nồi cơm điện',
            script:
              'Customer: I am looking for a rice cooker for four people. Assistant: This one is one point eight litres and costs sixty dollars. That one is smaller and cheaper, forty dollars, but it is only for two people. Customer: OK, I will take the bigger one.',
            questions: [
              { id: 'q1', question: 'How many people is the customer cooking for?', options: ['Two', 'Four', 'Six'], answer: 1 },
              { id: 'q2', question: 'Which one does the customer buy?', options: ['The 40-dollar one', 'The 60-dollar one'], answer: 1 },
            ],
          },
          {
            id: 'en-a2-s1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc bảng so sánh sản phẩm',
            passage: 'Fan A: 3 speeds, 45 USD, 2-year warranty. Fan B: 5 speeds, remote control, 70 USD, 1-year warranty.',
            questions: [
              { id: 'q1', question: 'Which fan has a longer warranty?', options: ['Fan A', 'Fan B'], answer: 0 },
              { id: 'q2', question: 'A customer wants a remote control. Recommend:', options: ['Fan A', 'Fan B'], answer: 1 },
            ],
          },
          {
            id: 'en-a2-s1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: 'Good morning. Can I help you?', meaningVi: 'Chào buổi sáng. Tôi giúp gì được cho anh/chị?' },
              { text: 'This one is cheaper than that one.', meaningVi: 'Cái này rẻ hơn cái kia.' },
              { text: 'I recommend the blue one.', meaningVi: 'Tôi gợi ý cái màu xanh.' },
            ],
          },
          {
            id: 'en-a2-s1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: so sánh hai sản phẩm',
            prompt: 'A customer cannot choose between Fan A and Fan B (see the reading). Compare them and recommend one.',
            hintVi: 'Dùng ít nhất hai câu so sánh hơn.',
            criteria: ['Uses comparatives correctly', 'Gives a clear recommendation with a reason'],
          },
          {
            id: 'en-a2-s1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: trả lời tin nhắn khách hỏi hàng',
            prompt: 'A customer messages: “Do you have the blue backpack in stock? How much is it?” Reply: it is out of stock until Friday; offer a similar black one.',
            hintVi: 'Khoảng 50–70 từ, giọng thân thiện.',
            minLength: 50,
            criteria: ['Answers both questions', 'Offers an alternative politely'],
          },
        ],
        roleplay: {
          title: 'Khách phân vân giữa hai sản phẩm',
          botRole: 'a customer in an electronics shop who cannot decide between two phones and worries about the price',
          learnerRole: 'nhân viên bán hàng',
          goal: 'Hỏi nhu cầu của khách và giúp khách chọn được một chiếc điện thoại',
          targetPhrases: ['Can I help you?', 'cheaper than', 'I recommend'],
        },
      },
    ],
  },
];
