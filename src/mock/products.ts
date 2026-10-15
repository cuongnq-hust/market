import type { Product } from '../types/database';

export const MOCK_PRODUCTS: Product[] = [
  // User 1 - Phố Cổ (Hoàn Kiếm)
  {
    id: 'prod-1',
    sellerId: 'user-1',
    title: 'Máy ảnh Film Canon AE-1 kèm Lens 50mm f/1.8',
    description: 'Máy chụp tốt, cơ quang hoạt động mượt mà, view ngắm sáng rõ, tặng kèm cuộn film Kodak Gold 200.',
    category: 'electronics',
    price: 2600000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    sellerId: 'user-1',
    title: 'Đồng hồ để bàn cơ cổ điển vỏ đồng Châu Âu',
    description: 'Chuông điểm giờ boong boong rất hay, quả lắc chuyển động nhịp nhàng, decor phòng khách cực sang.',
    category: 'other',
    price: 'negotiable',
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-02T11:00:00Z',
  },
  {
    id: 'prod-3',
    sellerId: 'user-1',
    title: 'Áo khoác da Biker Vintage size L',
    description: 'Da thật 100% dày dặn lên form ngầu, khóa kéo YKK đồng thau nguyên bản.',
    category: 'fashion',
    price: 850000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-03T15:20:00Z',
  },

  // User 2 - Cầu Giấy (Điện tử & Linh kiện)
  {
    id: 'prod-4',
    sellerId: 'user-2',
    title: 'Màn hình Dell Ultrasharp 24 inch U2414H',
    description: 'Màn hình hiển thị màu chuẩn IPS, viền siêu mỏng, đầy đủ chân đế xoay dọc, cổng HDMI và DisplayPort.',
    category: 'electronics',
    price: 1650000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-04T09:15:00Z',
  },
  {
    id: 'prod-5',
    sellerId: 'user-2',
    title: 'Xác 3 laptop Thinkpad T440/T450 chết nguồn',
    description: 'Bán rã xác lấy màn hình, bàn phím và vỏ cho thợ kỹ thuật, không kèm ổ cứng và sạc.',
    category: 'scrap',
    price: 500000,
    condition: 'scrap',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-04T14:00:00Z',
  },
  {
    id: 'prod-6',
    sellerId: 'user-2',
    title: 'Bàn phím cơ DareU EK87 Switch Blue',
    description: 'Bàn phím gõ nảy lách cách vui tai, LED đỏ nổi bật, tất cả phím bấm nhận 100%.',
    category: 'electronics',
    price: 250000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-05T08:30:00Z',
  },

  // User 3 - Đống Đa (Nội thất)
  {
    id: 'prod-7',
    sellerId: 'user-3',
    title: 'Ghế công thái học Sihoo M57 màu xám',
    description: 'Đệm lưới thoáng khí không lo nóng lưng, ngả lưng 130 độ êm ái, mới mua 4 tháng dọn văn phòng nên pass.',
    category: 'furniture',
    price: 1800000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-06T10:45:00Z',
  },
  {
    id: 'prod-8',
    sellerId: 'user-3',
    title: 'Bàn làm việc chân sắt mặt gỗ cao su 1m2 x 60cm',
    description: 'Chân sắt sơn tĩnh điện chắc chắn không rung lắc, mặt gỗ phủ bóng chống nước trầy xước.',
    category: 'furniture',
    price: 380000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-06T13:00:00Z',
  },
  {
    id: 'prod-9',
    sellerId: 'user-3',
    title: 'Tủ giày thông minh 3 tầng cánh lật sức chứa 25 đôi',
    description: 'Gỗ MDF phủ Melamine chống ẩm, gọn gàng tiết kiệm diện tích cho căn hộ chung cư.',
    category: 'furniture',
    price: 'negotiable',
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-07T16:00:00Z',
  },

  // User 4 - Bách Khoa (Sách)
  {
    id: 'prod-10',
    sellerId: 'user-4',
    title: 'Trọn bộ Giáo trình Giải tích & Đại số tuyến tính ĐH Bách Khoa',
    description: 'Sách bìa mềm có ghi chú cẩn thận của thủ khoa K64, giúp ôn thi qua môn điểm A.',
    category: 'books',
    price: 60000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-08T09:00:00Z',
  },
  {
    id: 'prod-11',
    sellerId: 'user-4',
    title: 'Bộ truyện Doraemon bóng chày (Đôrêmon thêm) 1-15 tập',
    description: 'Truyện tuổi thơ xuất bản năm 2005, giấy vàng hoài niệm, đủ tập không rách trang.',
    category: 'books',
    price: 220000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-08T11:20:00Z',
  },
  {
    id: 'prod-12',
    sellerId: 'user-4',
    title: 'Thùng 30 cuốn tiểu thuyết văn học nước ngoài tặng sinh viên',
    description: 'Tủ sách cá nhân chuyển trọ không mang hết, xin tặng miễn phí 0đ cho bạn nào yêu đọc sách ghé lấy.',
    category: 'books',
    price: 'free',
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-08T14:00:00Z',
  },

  // User 5 - Ba Đình (Nhật Bãi)
  {
    id: 'prod-13',
    sellerId: 'user-5',
    title: 'Nồi cơm điện cao tần Zojirushi IH 1.0L nội địa Nhật',
    description: 'Nấu cơm cực dẻo ngon, giữ ấm 24h cơm không thiu, chạy điện 100V kèm biến áp Lioa.',
    category: 'appliances',
    price: 950000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-09T08:15:00Z',
  },
  {
    id: 'prod-14',
    sellerId: 'user-5',
    title: 'Quạt cây National cổ 4 cánh cối gang nặng trịch',
    description: 'Quạt chạy êm ru như tiếng gió thoảng, nguyên zin từ dây cắm đến túp năng đảo chiều.',
    category: 'appliances',
    price: 1400000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1618941716939-553df3c6c278?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-09T10:45:00Z',
  },

  // User 6 - Tây Hồ (Ve chai / Phế liệu)
  {
    id: 'prod-15',
    sellerId: 'user-6',
    title: '20kg dây điện đồng trần & nhôm công trình dỡ kho',
    description: 'Thu mua hoặc bán lại theo cân, đồng sáng đẹp nguyên chất, có xe cân tận nơi quanh Tây Hồ.',
    category: 'scrap',
    price: 'negotiable',
    condition: 'scrap',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-10T13:30:00Z',
  },
  {
    id: 'prod-16',
    sellerId: 'user-6',
    title: 'Xác máy giặt Electrolux cửa ngang 7kg bị kẹt lồng',
    description: 'Bo mạch và mô tơ inverter vẫn sống nguyên, rã xác lấy đồ phụ tùng thay thế.',
    category: 'scrap',
    price: 300000,
    condition: 'scrap',
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-10T15:00:00Z',
  },

  // User 7 - Hà Đông (Mẹ & Bé)
  {
    id: 'prod-17',
    sellerId: 'user-7',
    title: 'Xe đẩy em bé Aprica Karoon gấp gọn 2 chiều 3 tư thế',
    description: 'Bé lớn không dùng nữa nên pass, đệm còn thơm tho sạch sẽ, gập mở bằng một tay tiện lợi.',
    category: 'baby',
    price: 750000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-11T09:20:00Z',
  },
  {
    id: 'prod-18',
    sellerId: 'user-7',
    title: 'Cũi gỗ quế tự nhiên sơn trắng chống mối mọt tặng kèm đệm',
    description: 'Cũi 2 tầng có bánh xe khóa an toàn, hạ thành áp sát giường bố mẹ.',
    category: 'baby',
    price: 600000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-11T14:15:00Z',
  },

  // User 8 - Thanh Xuân (Quán Cafe)
  {
    id: 'prod-19',
    sellerId: 'user-8',
    title: 'Máy pha Cafe Espresso Gemilai CRM 3200B 1 Group',
    description: 'Máy dùng lướt 5 tháng quán cafe mang đi, áp suất bơm Ulka 15 bar chuẩn vị Crema, tặng kèm tay cầm và tamper nén.',
    category: 'cafe',
    price: 7800000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-12T10:00:00Z',
  },
  {
    id: 'prod-20',
    sellerId: 'user-8',
    title: 'Bộ 4 bàn tròn sắt sơn đen kèm 16 ghế Tolix phong cách Industrial',
    description: 'Thanh lý cả lô hoặc bán lẻ từ 2 bộ, sơn tĩnh điện ngoài trời không bong tróc.',
    category: 'cafe',
    price: 'negotiable',
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-12T16:30:00Z',
  },

  // INDIVIDUAL SELLER PRODUCTS (Người bán đơn lẻ)
  {
    id: 'prod-indiv-1',
    sellerId: 'indiv-1',
    title: 'Tủ lạnh mini Sanaky 75L dọn phòng trọ pass nhanh',
    description: 'Tủ chạy êm, làm đá nhanh, tiết kiệm điện cho bạn nào ở 1 mình.',
    category: 'appliances',
    price: 750000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-14T08:00:00Z',
  },
  {
    id: 'prod-indiv-2',
    sellerId: 'indiv-1',
    title: 'Bàn học gấp gọn chân sắt kèm ghế xoay',
    description: 'Bàn còn rất chắc chắn, tặng kèm đèn bàn chống cận.',
    category: 'furniture',
    price: 180000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-14T08:30:00Z',
  },
  {
    id: 'prod-indiv-3',
    sellerId: 'indiv-2',
    title: 'Xe đạp thể thao Asama vành 26 inch nguyên bản',
    description: 'Xe ít đi để trong nhà xe chung cư, phanh đĩa trước sau nhạy bén.',
    category: 'other',
    price: 1200000,
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80'
    ],
    status: 'available',
    createdAt: '2024-03-15T09:00:00Z',
  },
];
