// Bài test xếp lớp tiếng Hoa: 3 câu mỗi level (CEFR ≈ HSK), có câu nghe.
// Bộ câu hỏi tự soạn, chưa chuẩn hoá; dùng để gợi ý điểm bắt đầu, không thay chứng chỉ HSK.
import type { PlacementTest } from '../types';

export const ZH_PLACEMENT: PlacementTest = {
  language: 'zh',
  writingTask: '用中文写4–6句话介绍你的工作：你做什么，喜欢什么，有什么困难。(Nếu chưa viết được chữ Hán, hãy viết pinyin.)',
  questions: [
    { id: 'a1-1', level: 'A1', question: '你___什么名字？', options: ['叫', '是', '有'], answer: 0 },
    { id: 'a1-2', level: 'A1', question: 'Nghe. Bây giờ là mấy giờ?', audio: '现在八点半。', options: ['8:00', '8:30', '9:30'], answer: 1 },
    { id: 'a1-3', level: 'A1', question: '我___越南人。', options: ['是', '在', '有'], answer: 0 },

    { id: 'a2-1', level: 'A2', question: '我昨天去___超市。', options: ['了', '着', '的'], answer: 0 },
    { id: 'a2-2', level: 'A2', question: '他比我___。', options: ['很高', '高', '非常高'], answer: 1, explanationVi: 'Sau 比 không dùng 很/非常.' },
    {
      id: 'a2-3',
      level: 'A2',
      question: 'Nghe. Người nói gọi điện để làm gì?',
      audio: '对不起，我明天有事，不能来开会了。',
      options: ['约见面时间', '说明天不能来开会', '请假去医院'],
      answer: 1,
    },

    { id: 'b1-1', level: 'B1', question: '我已经___这本书看完了。', options: ['把', '被', '给'], answer: 0 },
    { id: 'b1-2', level: 'B1', question: '虽然很累，___他还是去上班了。', options: ['所以', '但是', '因为'], answer: 1 },
    {
      id: 'b1-3',
      level: 'B1',
      question: '听录音。经理要什么？',
      audio: '你能不能在星期五以前把销售数据发给我？下星期一开会要用。',
      options: ['星期五开会', '星期五以前的销售数据', '一个新的销售经理'],
      answer: 1,
    },

    { id: 'b2-1', level: 'B2', question: '他___没来，___连电话也没打。', options: ['不但……而且', '因为……所以', '虽然……但是'], answer: 0 },
    { id: 'b2-2', level: 'B2', question: '经过三个月的努力，项目终于___了。', options: ['完成', '完全', '完美'], answer: 0 },
    { id: 'b2-3', level: 'B2', question: '“这件事你看着办吧” nghĩa là:', options: ['Bạn tự quyết định đi', 'Bạn hãy nhìn cho kỹ', 'Bạn đừng làm việc này'], answer: 0 },

    { id: 'c1-1', level: 'C1', question: '这个方案成本太高，___不可行。', options: ['显然', '居然', '竟然'], answer: 0 },
    { id: 'c1-2', level: 'C1', question: '“半途而废” nghĩa là:', options: ['Bỏ dở giữa chừng', 'Đi được nửa đường', 'Lãng phí một nửa'], answer: 0 },
    {
      id: 'c1-3',
      level: 'C1',
      question: '听录音。说话人的态度是什么？',
      audio: '这个计划确实很有想法，这一点我承认。可是预算只有一半，我实在看不出来怎么能做成。',
      options: ['非常支持', '怀疑', '无所谓'],
      answer: 1,
    },

    { id: 'c2-1', level: 'C2', question: '“画蛇添足” dùng để chỉ:', options: ['Làm thừa khiến hỏng việc', 'Vẽ rất giỏi', 'Làm việc cẩn thận'], answer: 0 },
    { id: 'c2-2', level: 'C2', question: '他说话总是___，让人摸不着头脑。', options: ['拐弯抹角', '直截了当', '一针见血'], answer: 0 },
    { id: 'c2-3', level: 'C2', question: '这次失败___是坏事，可以让我们吸取教训。', options: ['未必', '必定', '务必'], answer: 0 },
  ],
};
