import type { ForumComment } from '../types/database';

export const MOCK_FORUM_COMMENTS: ForumComment[] = [
  // Comments for post-sell-1 (Tủ lạnh mini Aqua + Nệm)
  {
    id: 'cmt-1',
    postId: 'post-sell-1',
    authorId: 'user-cmt-1',
    authorName: 'Đặng Quốc Huy',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    content: 'Tủ lạnh còn bảo hành không bạn ơi? Mình ở ngay ngõ 255 Cầu Giấy tối nay qua xem được không?',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'cmt-2',
    postId: 'post-sell-1',
    authorId: 'user-cmt-2',
    authorName: 'Vũ Minh Đức',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    content: 'Em xin gửi 950k bốc cả tủ và nệm luôn trong chiều nay nhé chủ thớt!',
    offerPrice: 950000,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'cmt-3',
    postId: 'post-sell-1',
    authorId: 'author-1',
    authorName: 'Nguyễn Phương Thảo (Chủ bài)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    content: '@Vũ Minh Đức: Bác lên 1 triệu chẵn em để luôn cho gọn phòng nhé!',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },

  // Comments for post-sell-2 (Case máy tính cũ văn phòng)
  {
    id: 'cmt-4',
    postId: 'post-sell-2',
    authorId: 'user-cmt-3',
    authorName: 'Quân Tech Cầu Giấy',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    content: 'Em có xe ba gác qua ôm hết lô này. Gửi bác 750k trọn gói nhé!',
    offerPrice: 750000,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cmt-5',
    postId: 'post-sell-2',
    authorId: 'author-2',
    authorName: 'Trần Văn Hoàng (Chủ bài)',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    content: 'Ok bác Quân, bác gọi số 0912998877 hẹn giờ qua bốc trước 18h nhé.',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },

  // Comments for post-sell-3 (Tặng miễn phí quần áo và sách)
  {
    id: 'cmt-6',
    postId: 'post-sell-3',
    authorId: 'user-cmt-4',
    authorName: 'CLB Tình Nguyện Sinh Viên',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
    content: 'Dạ chào cô Mai Lan, bên cháu đang quyên góp đồ ấm cho các em nhỏ vùng cao Hà Giang. Chiều nay 15h chúng cháu xin phép qua nhận ạ. Cảm ơn tấm lòng của cô!',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },

  // Comments for post-buy-1 (Vựa phế liệu thu gom)
  {
    id: 'cmt-7',
    postId: 'post-buy-1',
    authorId: 'user-cmt-5',
    authorName: 'Bác Hưng Công Trình',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80',
    content: 'Bên mình đang sửa toà nhà ở Minh Khai có khoảng hơn 200kg sắt thép và nhôm cửa cũ, bên bác có xe qua bốc được không?',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'cmt-8',
    postId: 'post-buy-1',
    authorId: 'author-6',
    authorName: 'Vựa Phế Liệu Hải Phát (Chủ bài)',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    content: 'Dạ có xe tải 1.25 tấn qua tận nơi luôn bác nhé! Bác nhắn tin qua Zalo số 0936112233 em gửi bảng giá hôm nay ạ.',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },

  // Comments for post-buy-4 (Sinh viên tìm tủ lạnh)
  {
    id: 'cmt-9',
    postId: 'post-buy-4',
    authorId: 'user-cmt-6',
    authorName: 'Chị Mai Hoa',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    content: 'Chị có tủ Sanyo 90L cũ dùng tốt để ở ngõ 165 Cầu Giấy, pass lại đúng 600k cho sinh viên. Em ưng thì nhắn Zalo chị nhé!',
    offerPrice: 600000,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];
