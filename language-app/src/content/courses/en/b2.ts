import type { Unit } from '../../types';

export const EN_B2: Unit[] = [
  {
    id: 'en-b2-business-1',
    level: 'B2',
    track: 'business',
    title: 'Negotiation',
    titleVi: 'Đàm phán',
    lessons: [
      {
        id: 'en-b2-business-1-l1',
        title: 'Negotiating a price increase',
        titleVi: 'Đàm phán khi đối tác tăng giá',
        objectivesVi: ['Phản hồi đề nghị mà không mất thiện chí', 'Đưa điều kiện đổi lấy nhượng bộ', 'Chốt và xác nhận thoả thuận'],
        vocabulary: [
          { term: 'I see where you are coming from, but …', meaningVi: 'Tôi hiểu quan điểm của anh, nhưng …' },
          { term: 'If you could …, we would be willing to …', meaningVi: 'Nếu bên anh có thể …, chúng tôi sẵn sàng …' },
          { term: 'meet halfway', meaningVi: 'mỗi bên nhượng một nửa' },
          { term: 'a deal-breaker', meaningVi: 'điều kiện không thể chấp nhận' },
          { term: 'to put it in writing', meaningVi: 'ghi thành văn bản' },
        ],
        grammar: {
          titleVi: 'Câu điều kiện loại 2 để đưa đề nghị mềm',
          pointsVi: ['If + quá khứ đơn, would + động từ: nghe như giả định, ít áp lực hơn loại 1.', '“If you could …, we would …” là khuôn chuẩn để đổi điều kiện lấy nhượng bộ.'],
          examples: [
            { text: 'If you kept the old price until March, we would sign a one-year contract.', meaningVi: 'Nếu bên anh giữ giá cũ đến tháng 3, chúng tôi sẽ ký hợp đồng một năm.' },
            { text: 'Would you consider a 3% increase instead?', meaningVi: 'Bên anh có cân nhắc tăng 3% thay vì vậy không?' },
          ],
        },
        activities: [
          {
            id: 'en-b2-b1-l1-listen',
            kind: 'listening',
            titleVi: 'Nghe nhà cung cấp thông báo tăng giá',
            script:
              "As you know, raw material costs have gone up by almost twelve percent this year. We've absorbed most of that, but from next quarter we'll need to raise our prices by eight percent. We're open to discussing how to phase it in, particularly for long-term partners like you.",
            questions: [
              { id: 'q1', question: 'How much do they want to raise prices?', options: ['3%', '8%', '12%'], answer: 1 },
              { id: 'q2', question: 'What hint does the supplier give?', options: ['The price is final', 'They could phase it in for long-term partners', 'They will lower quality'], answer: 1 },
            ],
          },
          {
            id: 'en-b2-b1-l1-read',
            kind: 'reading',
            titleVi: 'Đọc email phản hồi của đối tác',
            passage:
              'Thank you for your proposal. We can accept a 5% increase from April instead of 8% from January, provided that you commit to a minimum of 200,000 units over the next twelve months and pay within 30 days.',
            questions: [
              { id: 'q1', question: 'What does the supplier want in return?', options: ['A longer payment term', 'A volume commitment and 30-day payment', 'A new product order'], answer: 1 },
              { id: 'q2', question: '“Provided that” means …', options: ['only if', 'even though', 'because'], answer: 0 },
            ],
          },
          {
            id: 'en-b2-b1-l1-shadow',
            kind: 'shadowing',
            titleVi: 'Nói theo câu mẫu',
            sentences: [
              { text: "I see where you're coming from, but eight percent is too high for us.", meaningVi: 'Tôi hiểu quan điểm của anh, nhưng 8% là quá cao với chúng tôi.' },
              { text: 'If you could phase it in, we would be willing to extend the contract.', meaningVi: 'Nếu bên anh tăng dần, chúng tôi sẵn sàng gia hạn hợp đồng.' },
              { text: "Let's put that in writing.", meaningVi: 'Hãy ghi điều đó thành văn bản.' },
            ],
          },
          {
            id: 'en-b2-b1-l1-speak',
            kind: 'speaking',
            titleVi: 'Nói: phản hồi đề nghị tăng giá 8%',
            prompt: 'Respond to the 8% price increase. Acknowledge their position, explain your constraints, and make a conditional counter-offer.',
            hintVi: 'Ghi nhận → ràng buộc của bạn → đề nghị có điều kiện.',
            criteria: ['Acknowledges the other side', 'Uses at least one conditional offer', 'Keeps a cooperative tone'],
          },
          {
            id: 'en-b2-b1-l1-write',
            kind: 'writing',
            titleVi: 'Viết: email xác nhận thoả thuận',
            prompt: 'Write an email confirming the agreement: 5% increase from April, 200,000 units over 12 months, payment within 30 days. Ask them to confirm in writing.',
            hintVi: 'Khoảng 120–160 từ.',
            minLength: 120,
            criteria: ['All three terms stated accurately', 'Asks for written confirmation', 'Professional and positive tone'],
          },
        ],
        roleplay: {
          title: 'Đàm phán giảm mức tăng giá',
          botRole: 'a supplier account manager who wants an 8% increase but can accept less in exchange for volume or faster payment',
          learnerRole: 'trưởng phòng thu mua',
          goal: 'Đàm phán mức tăng giá xuống 5% hoặc thấp hơn với điều kiện chấp nhận được',
          targetPhrases: ['If you could', 'meet halfway', 'put it in writing'],
        },
      },
    ],
  },
];
