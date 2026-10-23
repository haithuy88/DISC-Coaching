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
    { minLevel: 'A1', title: 'Làm quen đồng nghiệp mới', botRole: 'a friendly new colleague on their first day', learnerRole: 'chính bạn', goal: 'Giới thiệu bản thân và hỏi đồng nghiệp 3 câu', targetPhrases: [] },
    { minLevel: 'A2', title: 'Hẹn cà phê cuối tuần', botRole: 'a friend who is busy this weekend', learnerRole: 'chính bạn', goal: 'Thống nhất ngày, giờ và địa điểm gặp', targetPhrases: [] },
  ],
  travel: [
    { minLevel: 'A2', title: 'Nhận phòng khách sạn', botRole: 'a hotel receptionist; the booked room type is not available', learnerRole: 'khách đã đặt phòng', goal: 'Nhận phòng và có được giải pháp hợp lý cho sự cố phòng', targetPhrases: [] },
    { minLevel: 'B1', title: 'Chuyến bay bị huỷ', botRole: 'an airline ground staff member', learnerRole: 'hành khách bị huỷ chuyến bay', goal: 'Được đổi sang chuyến bay tiếp theo và hỏi về bồi thường', targetPhrases: [] },
  ],
  sales: [
    { minLevel: 'A2', title: 'Khách hỏi sản phẩm', botRole: 'a customer comparing two products', learnerRole: 'nhân viên bán hàng', goal: 'Find out the customer\'s needs and recommend one product', targetPhrases: [] },
    { minLevel: 'B1', title: 'Khách phàn nàn giao hàng trễ', botRole: 'an annoyed customer whose order is 5 days late', learnerRole: 'nhân viên chăm sóc khách hàng', goal: 'Làm khách dịu lại, giải thích và đưa ra giải pháp', targetPhrases: [] },
  ],
  hospitality: [
    { minLevel: 'A2', title: 'Nhận đặt bàn qua điện thoại', botRole: 'a customer calling to book a table for a group', learnerRole: 'nhân viên nhà hàng', goal: 'Nhận đặt bàn: ngày, giờ, số người và yêu cầu đặc biệt', targetPhrases: [] },
  ],
  business: [
    { minLevel: 'B1', title: 'Cập nhật tiến độ trong họp', botRole: 'your manager running a weekly meeting', learnerRole: 'thành viên trong nhóm', goal: 'Báo cáo tiến độ, một việc bị chậm và hỗ trợ bạn cần', targetPhrases: [] },
    { minLevel: 'B2', title: 'Đàm phán điều khoản hợp đồng', botRole: 'a partner who wants a longer payment term', learnerRole: 'người phụ trách khách hàng', goal: 'Thoả hiệp về điều khoản thanh toán mà không mất lợi nhuận', targetPhrases: [] },
  ],
  purchasing: [
    { minLevel: 'B1', title: 'Xin báo giá nhà cung cấp', botRole: 'a sales rep at a packaging supplier', learnerRole: 'nhân viên thu mua', goal: 'Hỏi được giá, MOQ, thời gian giao và điều khoản thanh toán cho 10.000 thùng carton', targetPhrases: ['request for quotation', 'lead time', 'MOQ'] },
    { minLevel: 'B2', title: 'Đàm phán giảm giá', botRole: 'a supplier who has just raised prices by 8%', learnerRole: 'trưởng phòng thu mua', goal: 'Đàm phán mức tăng giá xuống 3% hoặc thấp hơn', targetPhrases: [] },
  ],
  accounting: [
    { minLevel: 'B1', title: 'Đối chiếu công nợ', botRole: 'an accountant at a customer company whose figures differ from yours', learnerRole: 'kế toán công nợ phải thu', goal: 'Tìm ra nguyên nhân chênh lệch và thống nhất bước tiếp theo', targetPhrases: ['reconcile', 'outstanding balance', 'invoice'] },
  ],
  hr: [
    { minLevel: 'B1', title: 'Phỏng vấn ứng viên', botRole: 'a job candidate for a sales position', learnerRole: 'người phỏng vấn của phòng Nhân sự', goal: 'Hỏi về kinh nghiệm, điểm mạnh và mức lương mong muốn', targetPhrases: [] },
  ],
  tech: [
    { minLevel: 'B1', title: 'Báo lỗi hệ thống', botRole: 'an IT support engineer', learnerRole: 'người dùng có hệ thống đang bị lỗi', goal: 'Mô tả rõ sự cố và chốt thời gian khắc phục', targetPhrases: [] },
  ],
};
