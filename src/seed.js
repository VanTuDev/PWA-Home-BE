/**
 * SEED DATA — PAW Home
 * Chạy: node --env-file=.env src/seed.js
 * Xóa toàn bộ data cũ và tạo mới
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User        from './models/User.js';
import Pet         from './models/Pet.js';
import Post        from './models/Post.js';
import ChatMessage from './models/ChatMessage.js';
import Donation    from './models/Donation.js';
import Adoption    from './models/Adoption.js';
import Order       from './models/Order.js';
import Product     from './models/Product.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ MongoDB connected');

// ─── Xóa toàn bộ ────────────────────────────────────────────────────────────
await Promise.all([
  User.deleteMany({}),
  Pet.deleteMany({}),
  Post.deleteMany({}),
  ChatMessage.deleteMany({}),
  Donation.deleteMany({}),
  Adoption.deleteMany({}),
  Order.deleteMany({}),
  Product.deleteMany({}),
]);
console.log('🗑️  Cleared all collections');

const hash = (pw) => bcrypt.hash(pw, 10);

// ─── USERS ───────────────────────────────────────────────────────────────────
const usersData = [
  {
    name: 'Vân Tú', email: 'vantu.dev@gmail.com',
    phone: '0901234567', role: 'admin',
    job: 'Lập trình viên', salary: 'Trên 20 triệu',
    address: 'Quận Hải Châu, Đà Nẵng',
    bio: 'Admin của PAW Home — nền tảng cứu hộ thú cưng Đà Nẵng.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vantu',
  },
  {
    name: 'Nguyễn Minh Tuấn', email: 'tuan.nm@gmail.com',
    phone: '0912345678', role: 'user',
    job: 'Kỹ sư phần mềm', salary: '15 - 20 triệu',
    address: 'Quận Sơn Trà, Đà Nẵng',
    bio: 'Yêu thú cưng, đang nuôi 1 bé mèo tam thể.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tuan',
  },
  {
    name: 'Trần Thị Hoa', email: 'hoa.tt@gmail.com',
    phone: '0923456789', role: 'user',
    job: 'Giáo viên tiểu học', salary: '8 - 12 triệu',
    address: 'Quận Thanh Khê, Đà Nẵng',
    bio: 'Giáo viên yêu động vật, muốn nhận nuôi thêm một bé chó.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hoa',
  },
  {
    name: 'Lê Văn Khải', email: 'khai.lv@gmail.com',
    phone: '0934567890', role: 'user',
    job: 'Nhân viên kế toán', salary: '10 - 15 triệu',
    address: 'Quận Ngũ Hành Sơn, Đà Nẵng',
    bio: 'Mới chuyển về Đà Nẵng, muốn có thú cưng cho vui nhà.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khai',
  },
  {
    name: 'Phạm Thị Lan', email: 'lan.pt@gmail.com',
    phone: '0945678901', role: 'user',
    job: 'Bác sĩ', salary: 'Trên 20 triệu',
    address: 'Quận Liên Chiểu, Đà Nẵng',
    bio: 'Bác sĩ, có kinh nghiệm chăm sóc thú cưng hơn 5 năm.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan',
  },
  {
    name: 'Đỗ Quang Huy', email: 'huy.dq@gmail.com',
    phone: '0956789012', role: 'user',
    job: 'Sinh viên đại học', salary: 'Dưới 5 triệu',
    address: 'Quận Cẩm Lệ, Đà Nẵng',
    bio: 'Sinh viên năm 3 ĐH Đà Nẵng, rất thích mèo.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huy',
  },
  {
    name: 'Võ Thị Mai', email: 'mai.vt@gmail.com',
    phone: '0967890123', role: 'user',
    job: 'Chủ tiệm tạp hoá', salary: '12 - 18 triệu',
    address: 'Hòa Vang, Đà Nẵng',
    bio: 'Nhà rộng, có sân vườn — lý tưởng để nuôi chó lớn.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai',
  },
  {
    name: 'Bùi Thanh Long', email: 'long.bt@gmail.com',
    phone: '0978901234', role: 'staff',
    job: 'Nhân viên PAW Home', salary: '8 - 12 triệu',
    address: 'Quận Hải Châu, Đà Nẵng',
    bio: 'Tình nguyện viên và nhân viên cứu hộ PAW Home.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=long',
  },
  {
    name: 'Ngô Thị Thuỳ', email: 'thuy.nt@gmail.com',
    phone: '0989012345', role: 'user',
    job: 'Nhân viên văn phòng', salary: '8 - 12 triệu',
    address: 'Quận Sơn Trà, Đà Nẵng',
    bio: 'Yêu mèo hơn chó, đang tìm bé mèo nhỏ để nhận nuôi.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thuy',
  },
  {
    name: 'Hoàng Văn Đức', email: 'duc.hv@gmail.com',
    phone: '0990123456', role: 'user',
    job: 'Lái xe tải', salary: '12 - 18 triệu',
    address: 'Quận Cẩm Lệ, Đà Nẵng',
    bio: 'Thích chó to, đang nuôi Husky và muốn thêm 1 bé nữa.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duc',
  },
];

const users = [];
for (const u of usersData) {
  const pw = u.role === 'admin' ? 'Vantu16022003@' : 'password123';
  users.push(await User.create({ ...u, password: await hash(pw) }));
}
console.log(`👤 Created ${users.length} users`);

const admin  = users[0];
const user1  = users[1]; // Tuấn
const user2  = users[2]; // Hoa
const user3  = users[3]; // Khải
const user4  = users[4]; // Lan
const user5  = users[5]; // Huy
const user6  = users[6]; // Mai

// ─── PETS ────────────────────────────────────────────────────────────────────
const petsData = [
  {
    name: 'Mochi', breed: 'Mèo Anh lông ngắn', age: '8 tháng', gender: 'Female',
    image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&q=80',
    description: 'Mochi cực kỳ dịu dàng và thích được ôm ấp. Bé đã tiêm phòng đầy đủ.',
    story: 'Mochi được tìm thấy trước cửa trung tâm thương mại Vincom vào tháng 3/2024, bị bỏ rơi trong hộp carton. Sau 2 tháng điều trị và phục hồi, bé đã hoàn toàn khoẻ mạnh và sẵn sàng tìm gia đình mới.',
    status: 'Ready', tags: ['Thân thiện', 'Dịu dàng', 'Đã tiêm phòng', 'Phù hợp trẻ em'],
    healthInfo: { vaccinated: true, neutered: true, microchipped: true },
    aiMatching: 92, donationAmount: 200000,
  },
  {
    name: 'Bi', breed: 'Chó Shiba Inu', age: '2 tuổi', gender: 'Male',
    image: 'https://images.unsplash.com/photo-1523360149018-73f4ae6e2ff6?w=600&q=80',
    description: 'Bi rất thông minh, biết nhiều lệnh cơ bản. Tính cách trung thành và bảo vệ chủ.',
    story: 'Bi bị chủ cũ bỏ lại khi chuyển nhà đi Hà Nội. Tình nguyện viên PAW Home phát hiện bé đi lạc ở khu vực biển Mỹ Khê. Sau khi kiểm tra sức khoẻ, bé hoàn toàn khoẻ và đang chờ chủ mới.',
    status: 'Ready', tags: ['Thông minh', 'Trung thành', 'Năng động', 'Cần vận động'],
    healthInfo: { vaccinated: true, neutered: false, microchipped: true },
    aiMatching: 88, donationAmount: 300000,
  },
  {
    name: 'Luna', breed: 'Mèo Maine Coon', age: '1 tuổi', gender: 'Female',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    description: 'Luna có bộ lông dày đẹp, tính cách hiền lành. Bé rất thích chơi với đồ chơi.',
    story: 'Luna được cứu khỏi tình trạng nuôi nhốt bất hợp pháp ở chợ Đống Đa. Sau 3 tháng điều trị tâm lý và phục hồi sức khoẻ, bé đã trở nên thân thiện và vui vẻ.',
    status: 'Ready', tags: ['Lông đẹp', 'Dịu dàng', 'Thích chơi', 'Đã tiêm phòng'],
    healthInfo: { vaccinated: true, neutered: true, microchipped: false },
    aiMatching: 85, donationAmount: 0,
  },
  {
    name: 'Gấu', breed: 'Chó Husky Siberian', age: '3 tuổi', gender: 'Male',
    image: 'https://images.unsplash.com/photo-1617895153857-82fe0c43621b?w=600&q=80',
    description: 'Gấu là bé Husky cực kỳ năng động, thích chạy nhảy ngoài trời. Cần nhà có sân vườn.',
    story: 'Gấu được người dân ở Hoà Vang giao lại sau khi tìm thấy bé đang đói và kiệt sức bên đường. Chủ cũ không rõ. Bé đã được phục hồi hoàn toàn sau 1 tháng chăm sóc.',
    status: 'Ready', tags: ['Năng động', 'Cần sân vườn', 'Thân thiện', 'Đã tiêm phòng'],
    healthInfo: { vaccinated: true, neutered: false, microchipped: true },
    aiMatching: 79, donationAmount: 500000,
  },
  {
    name: 'Kitty', breed: 'Mèo ta (mèo vàng)', age: '6 tháng', gender: 'Female',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&q=80',
    description: 'Kitty nhỏ bé và tinh nghịch. Rất phù hợp với người lần đầu nuôi mèo.',
    story: 'Kitty được một học sinh lớp 7 mang đến trung tâm sau khi nhặt được ở cổng trường. Bé mắc giun nhưng đã được điều trị xong và khoẻ mạnh.',
    status: 'Ready', tags: ['Tinh nghịch', 'Dễ nuôi', 'Phù hợp người mới', 'Đã tiêm phòng'],
    healthInfo: { vaccinated: true, neutered: false, microchipped: false },
    aiMatching: 94, donationAmount: 0,
  },
  {
    name: 'Max', breed: 'Chó Phú Quốc', age: '4 tuổi', gender: 'Male',
    image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&q=80',
    description: 'Max rất khoẻ mạnh và thông minh. Đã được huấn luyện cơ bản, ngoan ngoãn.',
    story: 'Max từng là chó nuôi của một hộ gia đình ở quận Liên Chiểu, nhưng khi gia đình đó chuyển đi nước ngoài đã giao lại cho PAW Home. Bé rất thân thiện với người lạ.',
    status: 'Treatment', tags: ['Khoẻ mạnh', 'Thông minh', 'Đã huấn luyện', 'Thân thiện'],
    healthInfo: { vaccinated: true, neutered: true, microchipped: true },
    aiMatching: 82, donationAmount: 200000,
  },
  {
    name: 'Bông', breed: 'Mèo Ba Tư', age: '2 tuổi', gender: 'Female',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
    description: 'Bông có bộ lông trắng mượt như tuyết. Bé thích nằm im và tận hưởng sự yên tĩnh.',
    story: 'Bông bị bỏ lại ở công viên 29/3 sau khi chủ cũ không thể tiếp tục chăm sóc vì lý do sức khoẻ. Bé đã qua giai đoạn stress và hiện rất ổn định.',
    status: 'Ready', tags: ['Lông trắng đẹp', 'Yên tĩnh', 'Phù hợp nhà nhỏ', 'Đã tiêm phòng'],
    healthInfo: { vaccinated: true, neutered: true, microchipped: false },
    aiMatching: 87, donationAmount: 150000,
  },
  {
    name: 'Cún Vàng', breed: 'Chó vàng thuần Việt', age: '1 tuổi', gender: 'Male',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    description: 'Cún Vàng rất trung thành, hay vẫy đuôi và thích nghịch nước. Tính cách vui vẻ.',
    story: 'Cún Vàng bị bỏ rơi ở bãi biển Phạm Văn Đồng lúc còn nhỏ. Tình nguyện viên đã chăm sóc bé suốt 8 tháng. Giờ bé đã lớn và khoẻ mạnh.',
    status: 'Ready', tags: ['Trung thành', 'Vui vẻ', 'Thích nước', 'Dễ nuôi'],
    healthInfo: { vaccinated: true, neutered: false, microchipped: false },
    aiMatching: 90, donationAmount: 0,
  },
];

const pets = await Pet.insertMany(petsData);
console.log(`🐾 Created ${pets.length} pets`);

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const productsData = [
  { name: 'Thức ăn mèo Royal Canin 2kg', price: 285000, stock: 50, category: 'Thức ăn', image: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=400&q=80', description: 'Thức ăn hạt cao cấp cho mèo trưởng thành từ 1-7 tuổi.', rating: 4.8, soldCount: 124 },
  { name: 'Pate mèo Whiskas 12 gói', price: 95000, stock: 80, category: 'Thức ăn', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80', description: 'Pate mèo vị cá ngừ và cá hồi. Thích hợp cho mọi lứa tuổi.', rating: 4.5, soldCount: 237 },
  { name: 'Thức ăn chó Pedigree 3kg', price: 195000, stock: 40, category: 'Thức ăn', image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&q=80', description: 'Dinh dưỡng đầy đủ cho chó vừa và lớn, giúp xương chắc khoẻ.', rating: 4.6, soldCount: 89 },
  { name: 'Vòng cổ chó size M', price: 65000, stock: 30, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=400&q=80', description: 'Vòng cổ da PU cao cấp, có khắc tên theo yêu cầu.', rating: 4.7, soldCount: 56 },
  { name: 'Cát vệ sinh mèo 10L', price: 120000, stock: 60, category: 'Vệ sinh', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', description: 'Cát bentonite khử mùi tốt, vón cục nhanh, dễ dọn.', rating: 4.4, soldCount: 312 },
  { name: 'Đồ chơi chuột kéo dây cho mèo', price: 45000, stock: 100, category: 'Đồ chơi', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80', description: 'Đồ chơi kích thích săn mồi tự nhiên cho mèo, giúp bé vận động.', rating: 4.9, soldCount: 445 },
  { name: 'Sữa tắm chó mèo BioTop 300ml', price: 75000, stock: 45, category: 'Vệ sinh', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80', description: 'Sữa tắm chiết xuất thiên nhiên, an toàn cho da nhạy cảm.', rating: 4.6, soldCount: 178 },
  { name: 'Nhà cũi chó Luxury size L', price: 850000, stock: 12, category: 'Khác', image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=400&q=80', description: 'Cũi gỗ cao cấp có đệm êm, mái che, kích thước 80x60x70cm.', rating: 4.8, soldCount: 23 },
];

const products = await Product.insertMany(productsData);
console.log(`🛒 Created ${products.length} products`);

// ─── COMMUNITY POSTS ─────────────────────────────────────────────────────────
const postsData = [
  {
    userId: user1._id, authorName: 'Nguyễn Minh Tuấn',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tuan',
    content: 'Hôm nay mình vừa đưa bé Mochi nhà mình đi tiêm nhắc lại. Bác sĩ bảo bé rất khoẻ và tăng cân đúng chuẩn 😄 Ai nuôi mèo lần đầu thì nhớ lịch tiêm nghen: 8 tuần, 12 tuần, 16 tuần và nhắc lại mỗi năm. Đừng bỏ qua nhé vì có thể phòng được nhiều bệnh nguy hiểm!',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80',
    likedBy: [user2._id, user4._id, user6._id, admin._id],
    commentList: [
      { userId: user2._id, authorName: 'Trần Thị Hoa', content: 'Mình cũng đang nuôi mèo, cảm ơn bạn nhắc nhở nhé! Bé nhà mình vừa tiêm xong tuần trước 🐱' },
      { userId: user4._id, authorName: 'Phạm Thị Lan', content: 'Là bác sĩ mình xác nhận thông tin này hoàn toàn đúng! Tiêm phòng là bước quan trọng nhất để bảo vệ thú cưng.' },
    ],
  },
  {
    userId: user2._id, authorName: 'Trần Thị Hoa',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hoa',
    content: 'Xin hỏi cộng đồng: Bé chó nhà mình 3 tháng tuổi đang bỏ ăn 2 ngày nay, trước đó có đi tắm ngoài tiệm về. Bé vẫn uống nước bình thường và chạy nhảy được nhưng không ăn. Mọi người có kinh nghiệm xử lý không ạ? Mình lo quá 😢',
    image: '',
    likedBy: [user1._id, user4._id, user5._id],
    commentList: [
      { userId: user4._id, authorName: 'Phạm Thị Lan', content: 'Có thể do stress sau khi tắm hoặc nhiễm lạnh. Bạn thử chườm ấm và cho ăn pate mềm xem. Nếu 48h vẫn không ăn thì nên đưa đi khám ngay.' },
      { userId: user1._id, authorName: 'Nguyễn Minh Tuấn', content: 'Mình từng gặp tình huống tương tự, cho uống men tiêu hoá là hết thôi bạn ơi. Nhưng nếu có thêm biểu hiện khác thì đi bác sĩ nhé!' },
      { userId: user5._id, authorName: 'Đỗ Quang Huy', content: 'Bạn thử đổi loại thức ăn tạm thời xem, đôi khi chó bỗng chán đồ ăn quen 😅' },
    ],
  },
  {
    userId: user4._id, authorName: 'Phạm Thị Lan',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan',
    authorIsExpert: true,
    content: '🐱 CHIA SẺ KINH NGHIỆM: Chế độ ăn cho mèo theo từng giai đoạn tuổi:\n\n• Dưới 6 tháng: Ưu tiên pate mềm, chia 4 bữa/ngày\n• 6 tháng - 1 tuổi: Hạt khô + pate, 3 bữa/ngày\n• Trưởng thành 1-7 tuổi: Hạt khô + pate 2 bữa/ngày, bổ sung omega\n• Già trên 7 tuổi: Thức ăn senior, ít phosphorus\n\nLưu ý: KHÔNG cho mèo ăn hành, tỏi, nho, chocolate — rất độc! 🚫',
    image: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=600&q=80',
    likedBy: [user1._id, user2._id, user3._id, user5._id, user6._id, admin._id],
    commentList: [
      { userId: user2._id, authorName: 'Trần Thị Hoa', content: 'Cảm ơn chị bác sĩ đã chia sẻ! Lưu lại để tham khảo 📝' },
      { userId: user3._id, authorName: 'Lê Văn Khải', content: 'Ôi tôi không biết nho cũng độc với mèo! May mà đọc được bài này sớm.' },
    ],
  },
  {
    userId: user3._id, authorName: 'Lê Văn Khải',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khai',
    content: 'Mình vừa nhận nuôi bé Cún Vàng từ PAW Home tuần trước. Bé đã quen nhà và chạy nhảy vui lắm rồi 🐕 Cảm ơn anh chị PAW Home đã chăm sóc bé cẩn thận! Quy trình nhận nuôi rất chuyên nghiệp, mình rất yên tâm.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    likedBy: [admin._id, user1._id, user2._id, user4._id, user5._id, user6._id],
    commentList: [
      { userId: admin._id, authorName: 'Vân Tú', content: 'Chúc mừng gia đình mới của Cún Vàng! Bé ở với bạn là mình yên tâm lắm 🐾 Có gì cần hỗ trợ cứ nhắn PAW Home nhé!' },
      { userId: user2._id, authorName: 'Trần Thị Hoa', content: 'Nhìn ảnh thấy bé vui vẻ quá 😍 Chúc mừng bạn và Cún Vàng!' },
    ],
  },
  {
    userId: user5._id, authorName: 'Đỗ Quang Huy',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huy',
    content: 'Review tiệm thú y Đà Nẵng cho anh chị em tham khảo:\n\n⭐⭐⭐⭐⭐ Phòng khám thú y Minh Đức (Hải Châu): Bác sĩ nhiệt tình, giá hợp lý, có máy siêu âm hiện đại\n\n⭐⭐⭐⭐ Pet Clinic Sơn Trà: Chuyên về mèo, nhân viên thân thiện, hay quá tải cuối tuần\n\n⭐⭐⭐⭐⭐ PAW Vet (Thanh Khê): Mới mở, thiết bị tốt, bác sĩ trẻ và nhiệt huyết',
    image: '',
    likedBy: [user1._id, user2._id, user3._id, user4._id],
    commentList: [
      { userId: user1._id, authorName: 'Nguyễn Minh Tuấn', content: 'Cảm ơn bạn đã review! Mình đã đến Minh Đức 2 lần rồi, đồng ý là tốt lắm.' },
      { userId: user4._id, authorName: 'Phạm Thị Lan', content: 'Mình có quen bác sĩ ở PAW Vet, anh ấy tốt nghiệp HV Nông Nghiệp, rất giỏi chuyên môn!' },
    ],
  },
  {
    userId: user6._id, authorName: 'Võ Thị Mai',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai',
    content: '🆘 CẦU CỨU! Mình tìm thấy 1 bé mèo tam thể bị thương ở chân trước gần chợ Đống Đa sáng nay. Bé khoảng 3-4 tháng tuổi, đang rất yếu. Ai biết địa chỉ cơ sở cứu hộ gần nhất ở quận Hải Châu không? Mình cần giúp bé gấp 🙏',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&q=80',
    likedBy: [admin._id, user1._id, user2._id, user4._id],
    commentList: [
      { userId: admin._id, authorName: 'Vân Tú', content: '📍 PAW Home nhận cứu hộ 24/7! Địa chỉ: 123 Nguyễn Văn Linh, Hải Châu. Hotline: 0901234567. Bạn có thể mang bé đến hoặc mình sẽ cử người đến đón!' },
      { userId: user4._id, authorName: 'Phạm Thị Lan', content: 'Bạn ơi giữ bé ấm trước nhé, đừng cho ăn nước nếu bé bất tỉnh. Liên hệ PAW Home ngay!' },
      { userId: user6._id, authorName: 'Võ Thị Mai', content: 'Đã liên hệ PAW Home rồi, có người đến đón bé rồi. Cảm ơn mọi người nhiều lắm! 💕' },
    ],
  },
  {
    userId: admin._id, authorName: 'Vân Tú',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vantu',
    content: '🎉 THÔNG BÁO: PAW Home vừa cứu hộ thành công 8 bé chó con bị bỏ rơi ở bãi biển Non Nước. Các bé đang được chăm sóc tại trung tâm và sẽ sớm sẵn sàng nhận nuôi sau khi tiêm phòng đầy đủ.\n\nCảm ơn tất cả tình nguyện viên đã hỗ trợ! Ai muốn đăng ký nhận nuôi hoặc đóng góp cho các bé hãy liên hệ PAW Home nhé 🐾',
    image: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=600&q=80',
    likedBy: [user1._id, user2._id, user3._id, user4._id, user5._id, user6._id],
    commentList: [
      { userId: user1._id, authorName: 'Nguyễn Minh Tuấn', content: 'Tin vui quá! Chúc các bé chóng khoẻ 🐶' },
      { userId: user2._id, authorName: 'Trần Thị Hoa', content: 'Mình muốn nhận nuôi 1 bé khi các bé sẵn sàng ạ, có thể đăng ký trước không ạ?' },
      { userId: admin._id, authorName: 'Vân Tú', content: 'Được bạn ơi! Bạn cứ vào mục Nhận nuôi trên web để điền form đăng ký nhé, mình sẽ liên hệ khi các bé sẵn sàng!' },
    ],
  },
  {
    userId: user1._id, authorName: 'Nguyễn Minh Tuấn',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tuan',
    content: 'Tips nhỏ cho người nuôi chó lần đầu ở Đà Nẵng:\n\n1️⃣ Đăng ký chip điện tử ngay khi nhận nuôi — bắt buộc theo quy định thành phố\n2️⃣ Tiêm phòng dại hàng năm — miễn phí tại trạm thú y quận\n3️⃣ Không thả chó ra đường không dây dắt — phạt 300k-500k\n4️⃣ Có thể đăng ký thẻ thú cưng tại UBND phường\n\nMình học được từ kinh nghiệm xương máu 😅 Hy vọng giúp được mọi người!',
    image: '',
    likedBy: [user2._id, user3._id, user4._id, user5._id, admin._id],
    commentList: [
      { userId: user3._id, authorName: 'Lê Văn Khải', content: 'Thông tin quá cần thiết! Mình mới nhận nuôi Cún Vàng mà chưa biết mấy quy định này.' },
      { userId: admin._id, authorName: 'Vân Tú', content: 'Bài viết rất hữu ích! PAW Home sẽ hỗ trợ anh chị em hoàn thành thủ tục đăng ký nhé 🙌' },
    ],
  },
];

const posts = await Post.insertMany(postsData);
console.log(`📝 Created ${posts.length} posts`);

// ─── CHAT MESSAGES (User ↔ Admin) ────────────────────────────────────────────
const chatsData = [
  // Nguyễn Minh Tuấn chat với admin
  { roomId: user1._id.toString(), senderId: user1._id.toString(), content: 'Xin chào PAW Home! Mình muốn hỏi về bé Mochi. Bé có hay bị dị ứng thức ăn không ạ?', isFromAdmin: false, isRead: true },
  { roomId: user1._id.toString(), senderId: admin._id.toString(), content: 'Chào bạn Tuấn! Bé Mochi khoẻ mạnh và chưa phát hiện dị ứng gì. Bé đang ăn Royal Canin Kitten và rất thích 😊', isFromAdmin: true, isRead: true },
  { roomId: user1._id.toString(), senderId: user1._id.toString(), content: 'Cảm ơn bạn! Thế bé có quen với trẻ con không? Nhà mình có bé 4 tuổi.', isFromAdmin: false, isRead: true },
  { roomId: user1._id.toString(), senderId: admin._id.toString(), content: 'Mochi rất thân thiện với trẻ em! Trong thời gian ở trung tâm bé hay được các bạn nhỏ chơi cùng. Bạn có thể yên tâm 👍', isFromAdmin: true, isRead: true },
  { roomId: user1._id.toString(), senderId: user1._id.toString(), content: 'Vậy mình muốn đăng ký nhận nuôi bé Mochi. Cần chuẩn bị gì ạ?', isFromAdmin: false, isRead: false },

  // Trần Thị Hoa chat với admin
  { roomId: user2._id.toString(), senderId: user2._id.toString(), content: 'Chào PAW Home! Mình thấy bé Kitty rất dễ thương. Cho mình hỏi bé đã triệt sản chưa ạ?', isFromAdmin: false, isRead: true },
  { roomId: user2._id.toString(), senderId: admin._id.toString(), content: 'Chào bạn Hoa! Bé Kitty chưa triệt sản vì còn nhỏ (6 tháng). PAW Home khuyến khích triệt sản sau 8 tháng. Nếu bạn nhận nuôi, trung tâm có thể hỗ trợ chi phí triệt sản 50% 😊', isFromAdmin: true, isRead: true },
  { roomId: user2._id.toString(), senderId: user2._id.toString(), content: 'Ôi vậy thì tốt quá! Mình là giáo viên, thu nhập ổn định, có nhà riêng. Mình có đủ điều kiện nhận nuôi không ạ?', isFromAdmin: false, isRead: true },
  { roomId: user2._id.toString(), senderId: admin._id.toString(), content: 'Nghe qua thì bạn hoàn toàn đủ điều kiện! Điều kiện cơ bản là: có chỗ ở ổn định, thu nhập đủ để chăm sóc, có thời gian ở nhà với thú cưng. Bạn điền form đăng ký trên web nhé!', isFromAdmin: true, isRead: true },
  { roomId: user2._id.toString(), senderId: user2._id.toString(), content: 'Cảm ơn bạn rất nhiều! Mình sẽ điền form ngay hôm nay 🥰', isFromAdmin: false, isRead: false },

  // Lê Văn Khải chat với admin — hỏi sau khi nhận nuôi
  { roomId: user3._id.toString(), senderId: user3._id.toString(), content: 'Xin chào! Mình là Khải, vừa nhận nuôi Cún Vàng tuần trước. Bé đang ăn uống bình thường nhưng hay sủa ban đêm. Bình thường không ạ?', isFromAdmin: false, isRead: true },
  { roomId: user3._id.toString(), senderId: admin._id.toString(), content: 'Chào Khải! Hoàn toàn bình thường trong 1-2 tuần đầu vì bé đang làm quen với môi trường mới. Thử để đèn ngủ nhỏ và mặc áo cũ của bạn cạnh ổ ngủ của bé — mùi quen giúp bé an tâm hơn 🐕', isFromAdmin: true, isRead: true },
  { roomId: user3._id.toString(), senderId: user3._id.toString(), content: 'Hay quá! Mình thử ngay. Còn một câu nữa — bé nên tắm bao nhiêu lần một tuần?', isFromAdmin: false, isRead: true },
  { roomId: user3._id.toString(), senderId: admin._id.toString(), content: 'Chó nên tắm 1-2 lần/tuần là đủ. Tắm quá nhiều sẽ làm khô da và mất lớp dầu bảo vệ lông tự nhiên. Dùng sữa tắm chuyên dụng cho chó nhé, không dùng sữa người!', isFromAdmin: true, isRead: false },

  // Đỗ Quang Huy chat với admin
  { roomId: user5._id.toString(), senderId: user5._id.toString(), content: 'Bạn ơi, mình là sinh viên năm 3. Mình ở trọ phòng nhỏ, không có sân. Mình muốn nuôi mèo có được không?', isFromAdmin: false, isRead: true },
  { roomId: user5._id.toString(), senderId: admin._id.toString(), content: 'Chào bạn Huy! Mèo rất phù hợp với người ở trọ vì bé không cần nhiều không gian như chó. Chỉ cần nhà có cửa sổ, có chỗ đặt chuồng và khay vệ sinh là được. Bạn có thể nhận nuôi mèo nhỏ nhé! 🐱', isFromAdmin: true, isRead: true },
  { roomId: user5._id.toString(), senderId: user5._id.toString(), content: 'Ôi vui quá! Thế bé Kitty hoặc Mochi còn không ạ? Mình thích 2 bé đó lắm.', isFromAdmin: false, isRead: true },
  { roomId: user5._id.toString(), senderId: admin._id.toString(), content: 'Cả 2 bé vẫn đang chờ chủ mới! Nhưng vì bạn ở trọ, bạn nên hỏi phép chủ nhà trước. Một số chủ nhà không cho nuôi thú cưng. Khi được phép rồi hãy điền form đăng ký nhé!', isFromAdmin: true, isRead: false },
];

// Tạo chat messages với createdAt cách nhau vài phút
const now = new Date();
const chatMessages = await Promise.all(chatsData.map((msg, i) =>
  ChatMessage.create({ ...msg, createdAt: new Date(now - (chatsData.length - i) * 4 * 60 * 1000) })
));
console.log(`💬 Created ${chatMessages.length} chat messages`);

// ─── DONATIONS ───────────────────────────────────────────────────────────────
const donationsData = [
  { petId: pets[0]._id, userId: user1._id, donorName: 'Nguyễn Minh Tuấn', donorEmail: 'tuan.nm@gmail.com', amount: 200000, type: 'adoption', status: 'paid', message: 'Mong bé Mochi có gia đình tốt 💕' },
  { petId: null, userId: user2._id, donorName: 'Trần Thị Hoa', donorEmail: 'hoa.tt@gmail.com', amount: 500000, type: 'general', status: 'paid', message: 'Ủng hộ PAW Home tiếp tục cứu hộ nhé!' },
  { petId: pets[3]._id, userId: user6._id, donorName: 'Võ Thị Mai', donorEmail: 'mai.vt@gmail.com', amount: 500000, type: 'adoption', status: 'paid', message: 'Yêu bé Gấu quá 🐕' },
  { petId: null, userId: null, donorName: 'Mạnh thường quân ẩn danh', donorEmail: '', amount: 1000000, type: 'general', status: 'paid', message: '' },
  { petId: pets[1]._id, userId: user4._id, donorName: 'Phạm Thị Lan', donorEmail: 'lan.pt@gmail.com', amount: 300000, type: 'adoption', status: 'paid', message: 'Bé Bi chắc chắn sẽ được chăm sóc tốt!' },
];
await Donation.insertMany(donationsData);
console.log(`💰 Created ${donationsData.length} donations`);

// ─── ADOPTIONS ───────────────────────────────────────────────────────────────
const adoptionsData = [
  {
    petId: pets[7]._id, userId: user3._id,
    fullName: 'Lê Văn Khải', phone: '0934567890',
    facebookLink: 'facebook.com/khai.le', job: 'Đi làm',
    monthlyIncome: '10 - 15 triệu', address: 'Quận Ngũ Hành Sơn, Đà Nẵng',
    housingType: 'Nhà phố', experience: 'Đã từng nuôi',
    reason: 'Muốn có bạn đồng hành sau giờ làm, nhà rộng có thể chăm sóc tốt.',
    status: 'Approved',
  },
  {
    petId: pets[0]._id, userId: user1._id,
    fullName: 'Nguyễn Minh Tuấn', phone: '0912345678',
    facebookLink: 'facebook.com/tuan.nguyen', job: 'Đi làm',
    monthlyIncome: '15 - 20 triệu', address: 'Quận Sơn Trà, Đà Nẵng',
    housingType: 'Căn hộ', experience: 'Đã từng nuôi',
    reason: 'Con mình 4 tuổi rất muốn có bạn mèo. Nhà có khu vực riêng cho bé.',
    status: 'Pending',
  },
  {
    petId: pets[3]._id, userId: user6._id,
    fullName: 'Võ Thị Mai', phone: '0967890123',
    job: 'Đi làm', monthlyIncome: '12 - 18 triệu',
    address: 'Hòa Vang, Đà Nẵng', housingType: 'Sân vườn',
    experience: 'Đã từng nuôi', reason: 'Nhà có sân rộng, phù hợp để Gấu chạy nhảy.',
    status: 'Pending',
  },
];
await Adoption.insertMany(adoptionsData);
console.log(`🏠 Created ${adoptionsData.length} adoptions`);

console.log('\n✅ SEED COMPLETE!\n');
console.log('─────────────────────────────────');
console.log('📧 Admin login: vantu.dev@gmail.com / Vantu16022003@');
console.log('👤 User login:  tuan.nm@gmail.com  / password123');
console.log('─────────────────────────────────\n');

await mongoose.disconnect();
process.exit(0);
