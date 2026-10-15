import type { ForumPost } from '../types/database';

export const MOCK_FORUM_POSTS: ForumPost[] = [
  // ==========================================
  // TAB 1: CẦN BÁN / THANH LÝ GẤP (type: 'sell')
  // ==========================================
  {
    id: 'post-sell-1',
    type: 'sell',
    title: 'Dọn phòng trọ gấp cuối tháng: Tủ lạnh mini Aqua 90L + Nệm cao su non 1m6',
    content: 'Em hết hạn hợp đồng thuê nhà cần chuyển gấp về quê, cần pass nhanh: 1. Tủ lạnh Aqua 90L làm đá nhanh, không đóng tuyết dày, chạy êm ru; 2. Nệm cao su non 1m6 x 2m x 10cm có ga bọc sạch sẽ. Ưu tiên bác nào qua bốc cả 2 em để giá hữu nghị!',
    category: 'appliances',
    price: 1100000,
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    author: {
      id: 'author-1',
      name: 'Nguyễn Phương Thảo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      phone: '0981122334',
      zalo: '0981122334',
      role: 'buyer',
    },
    isUrgent: true,
    likesCount: 14,
    isLiked: false,
    commentsCount: 3,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
  },
  {
    id: 'post-sell-2',
    type: 'sell',
    title: '[Xả gấp trong ngày] 5 thùng case máy tính cũ, màn hình hỏng nguồn cho thợ',
    content: 'Văn phòng nâng cấp dàn máy mới, cần dọn kho gấp trước 18h hôm nay: khoảng 8 case máy tính Pentium/i3 thế hệ 4 còn ram và nguồn, 5 màn hình Samsung/LG bị sọc hoặc chết nguồn. Bán rẻ theo lô cho anh em thợ rã xác ve chai linh kiện.',
    category: 'scrap',
    price: 850000,
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Đống Đa',
    city: 'Hà Nội',
    author: {
      id: 'author-2',
      name: 'Trần Văn Hoàng',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      phone: '0912998877',
      zalo: '0912998877',
      role: 'seller',
    },
    isUrgent: true,
    likesCount: 22,
    isLiked: true,
    commentsCount: 5,
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(), // ~1.5 hours ago
  },
  {
    id: 'post-sell-3',
    type: 'sell',
    title: 'Tặng miễn phí 0đ: 3 bao quần áo cũ gia đình + 2 thùng sách truyện',
    content: 'Gia đình mình dọn tủ chuẩn bị sơn nhà, có phân loại sẵn 3 bao tải quần áo người lớn/trẻ em còn rất lành lặn và 2 thùng sách truyện thiếu nhi, tiểu thuyết. Tặng 0đ cho bạn nào làm từ thiện hoặc sinh viên khó khăn ghé lấy tại ngõ 20 Tạ Quang Bửu.',
    category: 'books',
    price: 'free',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Hai Bà Trưng',
    city: 'Hà Nội',
    author: {
      id: 'author-3',
      name: 'Cô Mai Lan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      phone: '0904332211',
      role: 'buyer',
    },
    isUrgent: false,
    likesCount: 45,
    isLiked: false,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: 'post-sell-4',
    type: 'sell',
    title: 'Thanh lý nhanh trọn bộ bàn ghế cafe gỗ thông + quầy thu ngân phong cách vintage',
    content: 'Quán cafe chuyển đổi mô hình kinh doanh, cần pass lại toàn bộ: 10 bàn gỗ thông vuông 60x60, 30 ghế đôn, 1 quầy bar dài 2m2 kèm mặt đá hoa cương. Tất cả gỗ đã chống ẩm mọt, hỗ trợ xe ba gác bốc xếp.',
    category: 'cafe',
    price: 'negotiable',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Thanh Xuân',
    city: 'Hà Nội',
    author: {
      id: 'author-4',
      name: 'Lê Minh Tuấn',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      phone: '0978334455',
      zalo: '0978334455',
      role: 'seller',
    },
    isUrgent: true,
    likesCount: 19,
    isLiked: false,
    commentsCount: 4,
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), // 7 hours ago
  },
  {
    id: 'post-sell-5',
    type: 'sell',
    title: 'Bàn ghế học sinh chống gù gấp gọn gỗ sồi cho bé',
    content: 'Bé nhà mình lên cấp 2 đổi bàn lớn nên pass lại bộ bàn ghế chống gù nâng hạ độ cao bằng tay quay, có ngăn kéo và giá để sách, tặng kèm đèn led chống cận thị.',
    category: 'baby',
    price: 650000,
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Hà Đông',
    city: 'Hà Nội',
    author: {
      id: 'author-5',
      name: 'Đỗ Thị Thu',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      phone: '0966778899',
      zalo: '0966778899',
      role: 'both',
    },
    isUrgent: false,
    likesCount: 8,
    isLiked: false,
    commentsCount: 2,
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), // 14 hours ago
  },

  // ==========================================
  // TAB 2: TÌM MUA / GOM HÀNG (type: 'buy')
  // ==========================================
  {
    id: 'post-buy-1',
    type: 'buy',
    title: '[Vựa phế liệu uy tín] Nhận thu mua gom đồng, nhôm, sắt thép công trình tận nơi giá cao',
    content: 'Cơ sở thu mua phế liệu Hải Phát nhận gom tất cả các loại: dây điện đồng cháy/trần, nhôm định hình cửa kính, sắt vụn xà gồ, bình ắc quy cũ hỏng. Có cân điện tử chuẩn xác, thanh toán tiền mặt hoặc chuyển khoản tại chỗ, hỗ trợ tháo dỡ và xe tải vận chuyển!',
    category: 'scrap',
    price: 'negotiable',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Hoàng Mai',
    city: 'Hà Nội',
    author: {
      id: 'author-6',
      name: 'Vựa Phế Liệu Hải Phát',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      phone: '0936112233',
      zalo: '0936112233',
      role: 'seller',
    },
    isUrgent: false,
    likesCount: 31,
    isLiked: true,
    commentsCount: 6,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 mins ago
  },
  {
    id: 'post-buy-2',
    type: 'buy',
    title: 'Thợ sửa cần gom xác máy lạnh, tủ lạnh, máy giặt cũ hỏng rã linh kiện',
    content: 'Mình làm thợ điện lạnh cần thu mua xác điều hòa từ 9000-18000btu hỏng bloc, tủ lạnh đóng tuyết hỏng dàn, máy giặt kẹt hộp số để lấy bo mạch và vỏ. Thu mua tại nhà quanh khu vực Cầu Giấy, Đống Đa, Nam Từ Liêm, không ngại xa.',
    category: 'appliances',
    price: 'negotiable',
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    author: {
      id: 'author-7',
      name: 'Anh Dũng Điện Lạnh',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
      phone: '0988665544',
      zalo: '0988665544',
      role: 'both',
    },
    isUrgent: false,
    likesCount: 16,
    isLiked: false,
    commentsCount: 3,
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // ~2 hours ago
  },
  {
    id: 'post-buy-3',
    type: 'buy',
    title: 'Cần gom 30 - 50 pallet gỗ thông cũ còn chắc để đóng kệ decor homestay',
    content: 'Xưởng decor bên mình cần gom pallet gỗ thông tiêu chuẩn 1m x 1m2 hoặc 1m1 x 1m1, gỗ chưa mục gãy. Bác nào ở công trình dỡ kiện hàng hoặc kho bãi thanh lý số lượng lớn nhắn em nhé, có xe bán tải qua chở.',
    category: 'furniture',
    price: 'negotiable',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Tây Hồ',
    city: 'Hà Nội',
    author: {
      id: 'author-8',
      name: 'Phạm Kiến Trúc Decor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      phone: '0902889900',
      zalo: '0902889900',
      role: 'buyer',
    },
    isUrgent: false,
    likesCount: 12,
    isLiked: false,
    commentsCount: 4,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: 'post-buy-4',
    type: 'buy',
    title: '[Tìm mua sinh viên] Tìm tủ lạnh mini cũ 50L - 90L ngân sách dưới 800k',
    content: 'Em là sinh viên ở trọ khu Chùa Láng, đang cần tìm 1 chiếc tủ lạnh mini cũ dùng tạm đựng đồ ăn nước uống. Yêu cầu chỉ cần chạy êm và làm đá được, hình thức cũ chút không sao. Bác nào chuyển trọ pass lại để lại cmt hoặc zalo giúp em nhé!',
    category: 'appliances',
    price: 800000,
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Đống Đa',
    city: 'Hà Nội',
    author: {
      id: 'author-9',
      name: 'Nguyễn Tiến Đạt',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      phone: '0971223344',
      zalo: '0971223344',
      role: 'buyer',
    },
    isUrgent: false,
    likesCount: 9,
    isLiked: false,
    commentsCount: 3,
    createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(), // 9 hours ago
  },
  {
    id: 'post-buy-5',
    type: 'buy',
    title: 'Hiệu sách cần gom tiểu thuyết văn học, truyện tranh Nhật cũ số lượng lớn',
    content: 'Tiệm sách cũ Bách Khoa nhận thu mua và gom số lượng lớn: truyện tranh manga (Conan, Dragon Ball, Doraemon...), giáo trình đại học kỹ thuật, tiểu thuyết văn học nước ngoài. Thu mua tận nhà, trả tiền liền tay.',
    category: 'books',
    price: 'negotiable',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80'
    ],
    district: 'Hai Bà Trưng',
    city: 'Hà Nội',
    author: {
      id: 'author-10',
      name: 'Trang Sách Cũ',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      phone: '0945223344',
      zalo: '0945223344',
      role: 'seller',
    },
    isUrgent: false,
    likesCount: 27,
    isLiked: false,
    commentsCount: 5,
    createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(), // 16 hours ago
  },
];
