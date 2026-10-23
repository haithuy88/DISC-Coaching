import type { Unit } from '../../types';

export const EN_B1: Unit[] = [
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
          { term: 'unit price', meaningVi: 'đơn giá' },
        ],
        grammar: {
          titleVi: 'Câu hỏi gián tiếp cho lịch sự',
          pointsVi: ['Thay “What is your price?” bằng “Could you let me know what your price is?”.', 'Sau “let me know / I’d like to know / I wonder” động từ đứng sau chủ ngữ, không đảo.'],
          examples: [
            { text: 'Could you let me know what the lead time is?', meaningVi: 'Anh/chị cho biết thời gian giao hàng là bao lâu được không?' },
            { text: "I'd like to know if you offer a discount for larger orders.", meaningVi: 'Tôi muốn biết bên anh có giảm giá cho đơn lớn không.' },
          ],
        },
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
            id: 'en-b1-p1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: 'We are looking for a supplier of printed cartons.', meaningVi: 'Chúng tôi đang tìm nhà cung cấp thùng carton in.' },
              { text: 'Could you let me know your lead time?', meaningVi: 'Anh/chị cho biết thời gian giao hàng được không?' },
              { text: 'What are your payment terms?', meaningVi: 'Điều khoản thanh toán của bên anh/chị thế nào?' },
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
            minLength: 100,
            criteria: ['Clear subject line', 'All key information requested', 'Professional tone'],
          },
        ],
        roleplay: {
          title: 'Gọi điện xin báo giá thùng carton',
          botRole: 'a sales rep at a packaging supplier who tries to sell a larger quantity',
          learnerRole: 'nhân viên thu mua',
          goal: 'Hỏi được giá, MOQ, thời gian giao và điều khoản thanh toán cho 10.000 thùng carton in',
          targetPhrases: ['request for quotation', 'lead time', 'payment terms', 'MOQ'],
        },
      },
    ],
  },
  {
    id: 'en-b1-business-1',
    level: 'B1',
    track: 'business',
    title: 'Meetings',
    titleVi: 'Họp hành',
    lessons: [
      {
        id: 'en-b1-business-1-l1',
        title: 'Giving a progress update',
        titleVi: 'Báo cáo tiến độ trong cuộc họp',
        objectivesVi: ['Báo việc đã xong / đang làm / bị chậm', 'Nêu nguyên nhân và đề xuất', 'Xin hỗ trợ một cách chuyên nghiệp'],
        vocabulary: [
          { term: 'on track', meaningVi: 'đúng tiến độ' },
          { term: 'behind schedule', meaningVi: 'chậm tiến độ' },
          { term: "We've completed …", meaningVi: 'Chúng tôi đã hoàn thành …' },
          { term: 'The main issue is …', meaningVi: 'Vấn đề chính là …' },
          { term: 'deadline', meaningVi: 'hạn chót' },
          { term: 'Could we get support from …?', meaningVi: 'Chúng ta có thể nhờ … hỗ trợ không?' },
        ],
        grammar: {
          titleVi: 'Hiện tại hoàn thành để báo kết quả',
          pointsVi: ['have/has + V3 cho việc đã xong mà kết quả còn liên quan hiện tại: We have finished the testing.', 'Dùng với already / yet / so far: We haven’t received the parts yet.', 'Nói thời điểm cụ thể trong quá khứ thì dùng quá khứ đơn: We finished it last Friday.'],
          examples: [
            { text: 'So far we have trained 40 staff.', meaningVi: 'Đến nay chúng tôi đã đào tạo 40 nhân viên.' },
            { text: "We haven't received the parts yet.", meaningVi: 'Chúng tôi chưa nhận được linh kiện.' },
          ],
        },
        activities: [
          {
            id: 'en-b1-b1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe báo cáo tuần',
            script:
              "Quick update on the new warehouse system. We've finished the installation and trained twenty people so far. We're about one week behind schedule because the barcode scanners arrived late. To catch up, I'd like two more people from IT next week.",
            questions: [
              { id: 'q1', question: 'Why is the project late?', options: ['Staff were sick', 'The scanners arrived late', 'The budget was cut'], answer: 1 },
              { id: 'q2', question: 'What does the speaker ask for?', options: ['More money', 'More time', 'Two people from IT'], answer: 2 },
            ],
          },
          {
            id: 'en-b1-b1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc biên bản họp',
            passage:
              'Minutes – Sales meeting, 3 June. 1) Q2 sales: 92% of target. 2) New price list: approved, starts 1 July. 3) Action: Linh to send the price list to all distributors by 20 June. Next meeting: 1 July.',
            questions: [
              { id: 'q1', question: 'When does the new price list start?', options: ['3 June', '20 June', '1 July'], answer: 2 },
              { id: 'q2', question: 'Who must send the price list?', options: ['Linh', 'The distributors', 'Everyone'], answer: 0 },
            ],
          },
          {
            id: 'en-b1-b1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: "We're on track to finish by Friday.", meaningVi: 'Chúng tôi đúng tiến độ để xong trước thứ Sáu.' },
              { text: "We're about one week behind schedule.", meaningVi: 'Chúng tôi chậm khoảng một tuần.' },
              { text: 'The main issue is the late delivery.', meaningVi: 'Vấn đề chính là giao hàng trễ.' },
            ],
          },
          {
            id: 'en-b1-b1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: báo cáo tiến độ công việc của bạn',
            prompt: 'Give a one-minute update on a real task at your work: what is done, what is in progress, one problem, and what help you need.',
            hintVi: 'Theo khung: Done → In progress → Issue → Request.',
            criteria: ['Clear structure', 'Uses present perfect for results', 'Makes a specific request'],
          },
          {
            id: 'en-b1-b1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: email tóm tắt sau họp',
            prompt: 'Write a short follow-up email after a meeting: summarise two decisions and list action items with owners and deadlines.',
            hintVi: 'Khoảng 100–130 từ, có gạch đầu dòng.',
            minLength: 100,
            criteria: ['Decisions are clear', 'Every action has an owner and a deadline'],
          },
        ],
        roleplay: {
          title: 'Họp giao ban với sếp',
          botRole: 'your manager running a weekly meeting, who asks follow-up questions about delays',
          learnerRole: 'thành viên trong nhóm',
          goal: 'Báo cáo tiến độ, giải thích một việc bị chậm và chốt hỗ trợ bạn cần',
          targetPhrases: ['on track', 'behind schedule', 'The main issue is'],
        },
      },
    ],
  },
  {
    id: 'en-b1-accounting-1',
    level: 'B1',
    track: 'accounting',
    title: 'Invoices and payments',
    titleVi: 'Hoá đơn và thanh toán',
    lessons: [
      {
        id: 'en-b1-accounting-1-l1',
        title: 'Chasing an overdue payment',
        titleVi: 'Nhắc khách thanh toán quá hạn',
        objectivesVi: ['Nhắc nợ lịch sự nhưng rõ ràng', 'Đối chiếu số hoá đơn, số tiền', 'Đề xuất bước tiếp theo'],
        vocabulary: [
          { term: 'invoice', meaningVi: 'hoá đơn' },
          { term: 'overdue', meaningVi: 'quá hạn' },
          { term: 'outstanding balance', meaningVi: 'số dư còn nợ' },
          { term: 'remittance', meaningVi: 'chứng từ chuyển tiền' },
          { term: 'reconcile', meaningVi: 'đối chiếu (số liệu)' },
          { term: 'due date', meaningVi: 'ngày đến hạn' },
        ],
        grammar: {
          titleVi: 'Viết lịch sự với câu bị động',
          pointsVi: ['Bị động giúp tránh “đổ lỗi” trực tiếp: “The invoice has not been paid” nhẹ hơn “You have not paid”.', 'Cấu trúc: be + V3 (is attached, has been sent, was issued).'],
          examples: [
            { text: 'Invoice INV-208 was issued on 5 May.', meaningVi: 'Hoá đơn INV-208 được xuất ngày 5/5.' },
            { text: 'According to our records, it has not been paid yet.', meaningVi: 'Theo sổ sách của chúng tôi, hoá đơn này chưa được thanh toán.' },
          ],
        },
        activities: [
          {
            id: 'en-b1-a1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe cuộc gọi nhắc nợ',
            script:
              "Hello, this is Mai from Lam Son accounts. I'm calling about invoice two-oh-eight for twelve thousand dollars. It was due on the fifth of June, so it's now two weeks overdue. Could you check if the payment has been processed?",
            questions: [
              { id: 'q1', question: 'How much is the invoice?', options: ['$2,080', '$12,000', '$20,000'], answer: 1 },
              { id: 'q2', question: 'How late is the payment?', options: ['Two days', 'Five days', 'Two weeks'], answer: 2 },
            ],
          },
          {
            id: 'en-b1-a1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc bảng sao kê công nợ',
            passage: 'Statement – ABC Trading. INV-201: 5,000 USD, paid. INV-205: 7,500 USD, paid 2,500. INV-208: 12,000 USD, unpaid. Total outstanding: 17,000 USD.',
            questions: [
              { id: 'q1', question: 'How much is still owed on INV-205?', options: ['2,500', '5,000', '7,500'], answer: 1 },
              { id: 'q2', question: 'Is the total outstanding correct?', options: ['Yes', 'No'], answer: 0, explanationVi: '5.000 (INV-205 còn lại) + 12.000 (INV-208) = 17.000.' },
            ],
          },
          {
            id: 'en-b1-a1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: "I'm calling about an overdue invoice.", meaningVi: 'Tôi gọi về một hoá đơn quá hạn.' },
              { text: 'Could you send us the remittance advice?', meaningVi: 'Anh/chị gửi giúp chứng từ chuyển tiền được không?' },
              { text: 'Our records show an outstanding balance of seventeen thousand dollars.', meaningVi: 'Sổ sách của chúng tôi cho thấy còn nợ 17.000 đô.' },
            ],
          },
          {
            id: 'en-b1-a1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: gọi điện nhắc thanh toán',
            prompt: 'Call ABC Trading about INV-208 (12,000 USD, two weeks overdue). Be polite, confirm the details and ask for a payment date.',
            hintVi: 'Mở đầu → nêu hoá đơn → hỏi tình trạng → chốt ngày thanh toán.',
            criteria: ['States invoice number, amount and due date', 'Polite but clear request for a payment date'],
          },
          {
            id: 'en-b1-a1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: email nhắc thanh toán lần 1',
            prompt: 'Write a first payment reminder email to ABC Trading for INV-208. Attach a statement and ask them to confirm the payment date.',
            hintVi: 'Khoảng 90–120 từ, dùng câu bị động cho lịch sự.',
            minLength: 90,
            criteria: ['Invoice details correct', 'Polite tone with a clear request', 'Mentions the attachment'],
          },
        ],
        roleplay: {
          title: 'Đối chiếu công nợ với khách',
          botRole: 'an accountant at ABC Trading who says they already paid INV-205 in full',
          learnerRole: 'kế toán công nợ phải thu của Lam Son',
          goal: 'Tìm ra vì sao số liệu lệch nhau và thống nhất bước tiếp theo cho INV-205 và INV-208',
          targetPhrases: ['outstanding balance', 'reconcile', 'remittance'],
        },
      },
    ],
  },
  {
    id: 'en-b1-hr-1',
    level: 'B1',
    track: 'hr',
    title: 'Recruitment',
    titleVi: 'Tuyển dụng',
    lessons: [
      {
        id: 'en-b1-hr-1-l1',
        title: 'Interviewing a candidate',
        titleVi: 'Phỏng vấn ứng viên',
        objectivesVi: ['Đặt câu hỏi phỏng vấn theo năng lực', 'Hỏi đào sâu (follow-up)', 'Giới thiệu bước tiếp theo'],
        vocabulary: [
          { term: 'Tell me about a time when …', meaningVi: 'Hãy kể về một lần mà …' },
          { term: 'strength / weakness', meaningVi: 'điểm mạnh / điểm yếu' },
          { term: 'salary expectation', meaningVi: 'mức lương mong muốn' },
          { term: 'notice period', meaningVi: 'thời gian báo trước khi nghỉ việc cũ' },
          { term: "We'll get back to you by …", meaningVi: 'Chúng tôi sẽ phản hồi trước ngày …' },
        ],
        grammar: {
          titleVi: 'Câu hỏi mở với Wh- và How',
          pointsVi: ['Tránh câu hỏi Yes/No khi phỏng vấn; dùng What / Why / How / Tell me.', 'Câu hỏi đào sâu: What did you do exactly? What was the result?'],
          examples: [
            { text: 'How did you handle a difficult customer?', meaningVi: 'Anh/chị đã xử lý một khách khó tính thế nào?' },
            { text: 'What was the result?', meaningVi: 'Kết quả ra sao?' },
          ],
        },
        activities: [
          {
            id: 'en-b1-h1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe ứng viên trả lời',
            script:
              'In my last job, a big customer was angry because his order was late. First I listened and apologised. Then I called the warehouse and found the order. We delivered it the next morning, and he placed another order the same month.',
            questions: [
              { id: 'q1', question: 'Why was the customer angry?', options: ['Wrong price', 'Late order', 'Rude staff'], answer: 1 },
              { id: 'q2', question: 'What was the result?', options: ['The customer left', 'The customer ordered again', 'The candidate was promoted'], answer: 1 },
            ],
          },
          {
            id: 'en-b1-h1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc mô tả công việc',
            passage:
              'Sales Executive. Requirements: 2+ years in B2B sales, good English, driving licence. Benefits: base salary + commission, 13th-month bonus, health insurance. Apply by 30 September.',
            questions: [
              { id: 'q1', question: 'How much experience is required?', options: ['At least 1 year', 'At least 2 years', 'No experience'], answer: 1 },
              { id: 'q2', question: 'Which is NOT a benefit?', options: ['Commission', 'Company car', 'Health insurance'], answer: 1 },
            ],
          },
          {
            id: 'en-b1-h1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: 'Could you tell me a little about yourself?', meaningVi: 'Anh/chị giới thiệu đôi chút về bản thân được không?' },
              { text: 'Tell me about a time when you solved a problem.', meaningVi: 'Hãy kể về một lần anh/chị giải quyết một vấn đề.' },
              { text: "We'll get back to you by Friday.", meaningVi: 'Chúng tôi sẽ phản hồi trước thứ Sáu.' },
            ],
          },
          {
            id: 'en-b1-h1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: mở đầu buổi phỏng vấn',
            prompt: 'Welcome a candidate, introduce yourself and the interview structure, then ask your first two questions.',
            hintVi: 'Chào → giới thiệu → cấu trúc buổi phỏng vấn → 2 câu hỏi mở.',
            criteria: ['Warm and professional opening', 'Two open questions'],
          },
          {
            id: 'en-b1-h1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: email mời phỏng vấn vòng 2',
            prompt: 'Write an email inviting a candidate to a second interview: date, time, place, who they will meet, and what to bring.',
            hintVi: 'Khoảng 90–120 từ.',
            minLength: 90,
            criteria: ['All logistics included', 'Friendly professional tone'],
          },
        ],
        roleplay: {
          title: 'Phỏng vấn ứng viên Sales',
          botRole: 'a candidate for a sales executive job who gives short answers unless asked follow-up questions',
          learnerRole: 'người phỏng vấn của phòng Nhân sự',
          goal: 'Tìm hiểu kinh nghiệm, một thành tích, mức lương mong muốn và thời gian báo nghỉ việc cũ',
          targetPhrases: ['Tell me about a time when', 'salary expectation', 'notice period'],
        },
      },
    ],
  },
];
