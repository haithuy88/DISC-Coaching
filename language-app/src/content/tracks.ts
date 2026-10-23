import type { Level, Scenario } from '../../shared/api';
import type { Track, TrackId } from './types';

export const TRACKS: Track[] = [
  { id: 'general', nameVi: 'Giao tiếp chung', icon: '💬', minLevel: 'A1', descriptionVi: 'Chào hỏi, giới thiệu, mua sắm, đời sống hằng ngày.' },
  { id: 'travel', nameVi: 'Du lịch', icon: '✈️', minLevel: 'A2', descriptionVi: 'Sân bay, khách sạn, hỏi đường, nhà hàng.' },
  { id: 'sales', nameVi: 'Bán hàng & CSKH', icon: '🤝', minLevel: 'A2', descriptionVi: 'Tư vấn, xử lý phàn nàn, chốt đơn.' },
  { id: 'hospitality', nameVi: 'Nhà hàng – Khách sạn', icon: '🏨', minLevel: 'A2', descriptionVi: 'Đón khách, đặt phòng, phục vụ.' },
  { id: 'business', nameVi: 'Văn phòng & Business', icon: '💼', minLevel: 'B1', descriptionVi: 'Email, họp, thuyết trình, đàm phán.' },
  { id: 'purchasing', nameVi: 'Thu mua', icon: '📦', minLevel: 'B1', descriptionVi: 'Báo giá, đàm phán giá, theo dõi giao hàng.' },
  { id: 'accounting', nameVi: 'Kế toán – Tài chính', icon: '📊', minLevel: 'B1', descriptionVi: 'Hoá đơn, đối chiếu công nợ, báo cáo.' },
  { id: 'hr', nameVi: 'Nhân sự', icon: '🧑‍💼', minLevel: 'B1', descriptionVi: 'Phỏng vấn, onboarding, chính sách.' },
  { id: 'tech', nameVi: 'Công nghệ – IT', icon: '💻', minLevel: 'B1', descriptionVi: 'Họp kỹ thuật, báo lỗi, mô tả hệ thống.' },
];

export function findTrack(id: TrackId): Track {
  const track = TRACKS.find((t) => t.id === id);
  if (!track) throw new Error(`Unknown track ${id}`);
  return track;
}

/**
 * Tình huống luyện hội thoại tự do theo chuyên ngành. Không gắn với ngôn ngữ nào,
 * nên dùng được cả với ngôn ngữ chưa có giáo trình soạn sẵn.
 */
export const SCENARIO_LIBRARY: Record<TrackId, Array<Scenario & { minLevel: Level }>> = {
  general: [
    { minLevel: 'A1', title: 'Làm quen đồng nghiệp mới', botRole: 'a friendly new colleague on their first day', learnerRole: 'yourself', goal: 'Introduce yourself and ask 3 questions about the colleague', targetPhrases: [] },
    { minLevel: 'A2', title: 'Hẹn cà phê cuối tuần', botRole: 'a friend who is busy this weekend', learnerRole: 'yourself', goal: 'Agree on a day, time and place to meet', targetPhrases: [] },
  ],
  travel: [
    { minLevel: 'A2', title: 'Nhận phòng khách sạn', botRole: 'a hotel receptionist; the booked room type is not available', learnerRole: 'a guest with a reservation', goal: 'Check in and get a fair solution for the room problem', targetPhrases: [] },
    { minLevel: 'B1', title: 'Chuyến bay bị huỷ', botRole: 'an airline ground staff member', learnerRole: 'a passenger whose flight was cancelled', goal: 'Get rebooked on the next flight and ask about compensation', targetPhrases: [] },
  ],
  sales: [
    { minLevel: 'A2', title: 'Khách hỏi sản phẩm', botRole: 'a customer comparing two products', learnerRole: 'a sales assistant', goal: 'Find out the customer\'s needs and recommend one product', targetPhrases: [] },
    { minLevel: 'B1', title: 'Khách phàn nàn giao hàng trễ', botRole: 'an annoyed customer whose order is 5 days late', learnerRole: 'a customer service agent', goal: 'Calm the customer, explain, and offer a solution', targetPhrases: [] },
  ],
  hospitality: [
    { minLevel: 'A2', title: 'Nhận đặt bàn qua điện thoại', botRole: 'a customer calling to book a table for a group', learnerRole: 'restaurant staff', goal: 'Take the booking with date, time, number of people and special requests', targetPhrases: [] },
  ],
  business: [
    { minLevel: 'B1', title: 'Cập nhật tiến độ trong họp', botRole: 'your manager running a weekly meeting', learnerRole: 'a team member', goal: 'Report progress, one delay, and what help you need', targetPhrases: [] },
    { minLevel: 'B2', title: 'Đàm phán điều khoản hợp đồng', botRole: 'a partner who wants a longer payment term', learnerRole: 'the account manager', goal: 'Reach a compromise on payment terms without losing margin', targetPhrases: [] },
  ],
  purchasing: [
    { minLevel: 'B1', title: 'Xin báo giá nhà cung cấp', botRole: 'a sales rep at a packaging supplier', learnerRole: 'a purchasing officer', goal: 'Get price, MOQ, lead time and payment terms for 10,000 cartons', targetPhrases: ['request for quotation', 'lead time', 'MOQ'] },
    { minLevel: 'B2', title: 'Đàm phán giảm giá', botRole: 'a supplier who has just raised prices by 8%', learnerRole: 'a purchasing manager', goal: 'Negotiate the increase down to 3% or less', targetPhrases: [] },
  ],
  accounting: [
    { minLevel: 'B1', title: 'Đối chiếu công nợ', botRole: 'an accountant at a customer company whose figures differ from yours', learnerRole: 'an accounts receivable officer', goal: 'Find the reason for the difference and agree next steps', targetPhrases: ['reconcile', 'outstanding balance', 'invoice'] },
  ],
  hr: [
    { minLevel: 'B1', title: 'Phỏng vấn ứng viên', botRole: 'a job candidate for a sales position', learnerRole: 'the HR interviewer', goal: 'Ask about experience, strengths and salary expectations', targetPhrases: [] },
  ],
  tech: [
    { minLevel: 'B1', title: 'Báo lỗi hệ thống', botRole: 'an IT support engineer', learnerRole: 'a user whose system is not working', goal: 'Describe the problem clearly and agree on a fix time', targetPhrases: [] },
  ],
};
