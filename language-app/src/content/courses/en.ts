// Giáo trình mẫu tiếng Anh: mỗi unit là một cặp (level, chuyên ngành). Thêm unit mới theo đúng khuôn này.
import type { Course } from '../types';

export const EN_COURSE: Course = {
  language: 'en',
  units: [
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
          ],
          activities: [
            {
              id: 'en-a1-g1-l1-listen',
              kind: 'listening',
              titleVi: 'Nghe đoạn giới thiệu',
              script: 'Hi, I am Lan. I am from Hanoi. I work as a teacher. I have two children. Nice to meet you!',
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
              minWords: 30,
              criteria: ['Greeting and closing', 'At least one question'],
            },
          ],
          roleplay: {
            title: 'Gặp đồng nghiệp mới ở canteen',
            botRole: 'a new colleague from another department, sitting at your table at lunch',
            learnerRole: 'yourself',
            goal: 'Say hello, introduce yourself and find out the colleague\'s name and job',
            targetPhrases: ['Nice to meet you', 'What do you do?', 'I work as'],
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
          ],
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
              id: 'en-a2-t1-l1-speak',
              kind: 'speaking',
              titleVi: 'Nói: phòng không đúng yêu cầu',
              prompt: 'You booked a non-smoking double room, but you got a smoking twin room. Tell the receptionist politely and ask for a change.',
              hintVi: 'Dùng “I\'m afraid …”, “Could I …?”',
              criteria: ['Explains the problem clearly', 'Makes a polite request'],
            },
            {
              id: 'en-a2-t1-l1-write',
              kind: 'writing',
              titleVi: 'Viết: email hỏi thông tin khách sạn',
              prompt: 'Write an email to a hotel. Ask about airport transfer, breakfast time and late check-out.',
              hintVi: 'Khoảng 60–80 từ, có lời chào và kết thư.',
              minWords: 60,
              criteria: ['Asks all three questions', 'Polite email format'],
            },
          ],
          roleplay: {
            title: 'Nhận phòng: phòng không đúng',
            botRole: 'a hotel receptionist; the hotel is almost full',
            learnerRole: 'a guest who booked a non-smoking double room',
            goal: 'Check in and get the right room or a fair alternative',
            targetPhrases: ['I have a reservation', "I'm afraid", 'Could I'],
          },
        },
      ],
    },
    {
      id: 'en-b1-purchasing-1',
      level: 'B1',
      track: 'purchasing',
      title: 'Working with suppliers',
      titleVi: 'Làm việc với nhà cung cấp',
      lessons: [
        {
          id: 'en-b1-purchasing-1-l1',
          title: 'Requesting a quotation',
          titleVi: 'Yêu cầu báo giá',
          objectivesVi: ['Mô tả nhu cầu mua hàng', 'Hỏi giá, MOQ, thời gian giao', 'So sánh hai báo giá'],
          vocabulary: [
            { term: 'request for quotation (RFQ)', meaningVi: 'yêu cầu báo giá' },
            { term: 'minimum order quantity (MOQ)', meaningVi: 'số lượng đặt tối thiểu' },
            { term: 'lead time', meaningVi: 'thời gian từ lúc đặt đến lúc giao' },
            { term: 'payment terms', meaningVi: 'điều khoản thanh toán', example: 'Our payment terms are 30 days after delivery.' },
          ],
          activities: [
            {
              id: 'en-b1-p1-l1-listen',
              kind: 'listening',
              titleVi: 'Nghe cuộc gọi của nhà cung cấp',
              script:
                'Thanks for your enquiry. For ten thousand cartons, our price is zero point four five dollars each. The minimum order is five thousand. Lead time is three weeks, or two weeks if you pay fifty percent in advance.',
              questions: [
                { id: 'q1', question: 'What is the MOQ?', options: ['5,000', '10,000', '50,000'], answer: 0 },
                { id: 'q2', question: 'How can the buyer get delivery in two weeks?', options: ['Order more', 'Pay 50% in advance', 'Pay in cash'], answer: 1 },
              ],
            },
            {
              id: 'en-b1-p1-l1-read',
              kind: 'reading',
              titleVi: 'So sánh hai báo giá',
              passage:
                'Supplier A: 0.45 USD/unit, MOQ 5,000, lead time 3 weeks, payment 30 days. Supplier B: 0.42 USD/unit, MOQ 20,000, lead time 5 weeks, payment in advance.',
              questions: [
                { id: 'q1', question: 'Which supplier is cheaper per unit?', options: ['A', 'B'], answer: 1 },
                {
                  id: 'q2',
                  question: 'You need 8,000 units within a month. Which supplier fits?',
                  options: ['A', 'B', 'Neither'],
                  answer: 0,
                  explanationVi: 'B có MOQ 20.000 và giao 5 tuần, nên chỉ A đáp ứng.',
                },
              ],
            },
            {
              id: 'en-b1-p1-l1-speak',
              kind: 'speaking',
              titleVi: 'Nói: gọi điện xin báo giá',
              prompt: 'Call a supplier. Describe what you need (product, quantity, delivery date) and ask for price, MOQ and payment terms.',
              hintVi: 'Nói khoảng 1 phút. Dùng “We are looking for …”, “Could you let me know …?”',
              criteria: ['Describes product, quantity and deadline', 'Asks about price, MOQ and payment terms'],
            },
            {
              id: 'en-b1-p1-l1-write',
              kind: 'writing',
              titleVi: 'Viết: email RFQ',
              prompt:
                'Write a request-for-quotation email to a new supplier for 10,000 printed cartons, delivery by the end of next month. Ask for price, MOQ, lead time and payment terms.',
              hintVi: 'Khoảng 100–150 từ, giọng văn chuyên nghiệp.',
              minWords: 100,
              criteria: ['Clear subject line', 'All key information requested', 'Professional tone'],
            },
          ],
          roleplay: {
            title: 'Gọi điện xin báo giá thùng carton',
            botRole: 'a sales rep at a packaging supplier who tries to sell a larger quantity',
            learnerRole: 'a purchasing officer',
            goal: 'Get price, MOQ, lead time and payment terms for 10,000 printed cartons',
            targetPhrases: ['request for quotation', 'lead time', 'payment terms', 'MOQ'],
          },
        },
      ],
    },
  ],
};
