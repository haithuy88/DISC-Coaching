// Bài test xếp lớp tiếng Anh: 3 câu mỗi level, từ dễ đến khó, có câu nghe.
// Bộ câu hỏi tự soạn, chưa chuẩn hoá; dùng để gợi ý điểm bắt đầu, không thay chứng chỉ.
import type { PlacementTest } from '../types';

export const EN_PLACEMENT: PlacementTest = {
  language: 'en',
  writingTask: 'Write 4–6 sentences about your job: what you do, what you like about it, and one challenge you face.',
  questions: [
    { id: 'a1-1', level: 'A1', question: 'She ___ a teacher.', options: ['am', 'is', 'are'], answer: 1 },
    { id: 'a1-2', level: 'A1', question: 'Listen. What time is it?', audio: 'It is half past seven.', options: ['7:00', '7:30', '6:30'], answer: 1 },
    { id: 'a1-3', level: 'A1', question: '___ do you live? — In Hanoi.', options: ['What', 'Where', 'Who'], answer: 1 },

    { id: 'a2-1', level: 'A2', question: 'Yesterday I ___ to the supermarket.', options: ['go', 'went', 'gone'], answer: 1 },
    { id: 'a2-2', level: 'A2', question: 'This hotel is ___ than the other one.', options: ['more cheap', 'cheaper', 'cheapest'], answer: 1 },
    {
      id: 'a2-3',
      level: 'A2',
      question: 'Listen. Why is the speaker calling?',
      audio: 'Hello, this is Mai. I am sorry, but I cannot come to the meeting tomorrow because I am ill.',
      options: ['To book a meeting', 'To cancel attending a meeting', 'To ask for a doctor'],
      answer: 1,
    },

    { id: 'b1-1', level: 'B1', question: 'I have worked here ___ 2019.', options: ['for', 'since', 'from'], answer: 1 },
    { id: 'b1-2', level: 'B1', question: 'If it rains tomorrow, we ___ the trip.', options: ['cancel', 'will cancel', 'would cancel'], answer: 1 },
    {
      id: 'b1-3',
      level: 'B1',
      question: 'Listen. What does the manager want?',
      audio: 'Could you send me the updated sales figures before Friday? I need them for the board meeting on Monday.',
      options: ['A meeting on Friday', 'Sales figures before Friday', 'A new sales manager'],
      answer: 1,
    },

    { id: 'b2-1', level: 'B2', question: 'By the time we arrived, the meeting ___.', options: ['already started', 'had already started', 'has already started'], answer: 1 },
    { id: 'b2-2', level: 'B2', question: 'The supplier agreed to ___ the delivery date by a week.', options: ['bring forward', 'bring up', 'bring about'], answer: 0 },
    { id: 'b2-3', level: 'B2', question: '“The figures don\'t add up.” This means the numbers …', options: ['are too small', 'are not consistent', 'are missing'], answer: 1 },

    { id: 'c1-1', level: 'C1', question: 'Not only ___ late, but he also forgot the documents.', options: ['he arrived', 'did he arrive', 'he did arrive'], answer: 1 },
    { id: 'c1-2', level: 'C1', question: 'The proposal was rejected, ___ came as no surprise.', options: ['that', 'which', 'what'], answer: 1 },
    {
      id: 'c1-3',
      level: 'C1',
      question: 'Listen. What is the speaker\'s attitude?',
      audio: 'Well, the plan is ambitious, I\'ll give them that, but I can\'t see how it\'s going to work with half the budget.',
      options: ['Enthusiastic', 'Sceptical', 'Indifferent'],
      answer: 1,
    },

    { id: 'c2-1', level: 'C2', question: 'Her explanation was so ___ that nobody could follow it.', options: ['convoluted', 'concise', 'candid'], answer: 0 },
    { id: 'c2-2', level: 'C2', question: '“To play devil\'s advocate” means to …', options: ['argue the opposite view for discussion', 'cause trouble on purpose', 'defend a guilty person'], answer: 0 },
    { id: 'c2-3', level: 'C2', question: 'Little ___ that the decision would cost him his job.', options: ['he knew', 'did he know', 'he did know'], answer: 1 },
  ],
};
