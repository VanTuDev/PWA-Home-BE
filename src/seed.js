/**
 * Seed script — chạy 1 lần duy nhất
 * node --env-file=.env src/seed.js
 *
 * Xoá toàn bộ data cũ → tạo data mới từ ngày 3/6/2026
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

import User         from './models/User.js';
import Pet          from './models/Pet.js';
import Product      from './models/Product.js';
import Order        from './models/Order.js';
import Adoption     from './models/Adoption.js';
import Donation     from './models/Donation.js';
import Post         from './models/Post.js';
import ChatMessage  from './models/ChatMessage.js';
import Notification from './models/Notification.js';

// ─── helpers ──────────────────────────────────────────────────────────────────
const d = (y, mo, day, h = 9, mi = 0) => new Date(y, mo - 1, day, h, mi);
const hash = pw => bcrypt.hashSync(pw, 10);

// ─── connect ──────────────────────────────────────────────────────────────────
await connectDB();

console.log('🗑  Đang xoá data cũ...');
await Promise.all([
  User.deleteMany({ role: 'user' }),
  Pet.deleteMany({}),
  Product.deleteMany({}),
  Order.deleteMany({}),
  Adoption.deleteMany({}),
  Donation.deleteMany({}),
  Post.deleteMany({}),
  ChatMessage.deleteMany({}),
  Notification.deleteMany({}),
]);
console.log('✅ Đã xoá data cũ.\n');

// ══════════════════════════════════════════════════════════════════════════════
// 1. USERS  (16 người dùng)
// ══════════════════════════════════════════════════════════════════════════════
console.log('👥 Tạo users...');

const usersData = [
  // 3 người nhận nuôi (adopters)
  { name: 'Phạm Thị Lan',      email: 'pham.thi.lan@gmail.com',      phone: '0901234561', address: '45 Bạch Đằng, Hải Châu, Đà Nẵng',    bio: 'Yêu động vật từ nhỏ. Hiện nuôi 2 mèo, muốn mở rộng gia đình thêm chú chó.',  job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=pham.thi.lan' },
  { name: 'Nguyễn Hoài Nam',   email: 'nguyen.hoai.nam@gmail.com',   phone: '0901234562', address: '12 Lê Lợi, Sơn Trà, Đà Nẵng',         bio: 'Kỹ sư IT, thích chạy bộ và chơi với mèo cuối tuần.',                          job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=nguyen.hoai.nam' },
  { name: 'Trần Minh Khoa',    email: 'tran.minh.khoa@gmail.com',    phone: '0901234563', address: '88 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng', bio: 'Sinh viên năm 4, đang thuê nhà riêng có sân nhỏ. Muốn nuôi mèo làm bạn.', job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=tran.minh.khoa' },
  // Chuyên gia / bác sĩ
  { name: 'Lê Thị Thu Hằng',  email: 'le.thu.hang@gmail.com',       phone: '0901234564', address: '3 Trần Phú, Hải Châu, Đà Nẵng',       bio: 'Bác sĩ thú y tại phòng khám Thú Cưng Đà Nẵng. Chia sẻ kiến thức chăm sóc thú cưng.', job: 'Đi làm', avatar: 'https://i.pravatar.cc/150?u=le.thu.hang' },
  // Người dùng thường
  { name: 'Võ Quốc Hùng',     email: 'vo.quoc.hung@gmail.com',      phone: '0901234565', address: '21 Phan Châu Trinh, Hải Châu, Đà Nẵng', bio: 'Mê chó husky và bắc kinh. Đang tìm hiểu để nhận nuôi.',                      job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=vo.quoc.hung' },
  { name: 'Đỗ Thị Bích Ngọc', email: 'do.bich.ngoc@gmail.com',      phone: '0901234566', address: '56 Hoàng Diệu, Hải Châu, Đà Nẵng',    bio: 'Giáo viên tiểu học. Nhà có sân vườn, muốn nuôi thêm mèo cho con.',           job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=do.bich.ngoc' },
  { name: 'Bùi Văn Đức',      email: 'bui.van.duc@gmail.com',       phone: '0901234567', address: '99 Điện Biên Phủ, Thanh Khê, Đà Nẵng',  bio: 'Đang nuôi 1 chú cún lai. Rất quan tâm đến sức khoẻ thú cưng.',              job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=bui.van.duc' },
  { name: 'Hoàng Thị Mai',    email: 'hoang.thi.mai@gmail.com',     phone: '0901234568', address: '7 Lý Tự Trọng, Sơn Trà, Đà Nẵng',     bio: 'Làm việc tại nhà, có nhiều thời gian chăm sóc thú cưng. Thích mèo lông dài.', job: 'Đi làm',  avatar: 'https://i.pravatar.cc/150?u=hoang.thi.mai' },
  { name: 'Đinh Minh Tuấn',   email: 'dinh.minh.tuan@gmail.com',    phone: '0901234569', address: '14 Ngô Quyền, Sơn Trà, Đà Nẵng',      bio: 'Thích photography và chụp ảnh thú cưng. Nuôi 1 mèo anh lông ngắn.',         job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=dinh.minh.tuan' },
  { name: 'Phan Thị Hoa',     email: 'phan.thi.hoa@gmail.com',      phone: '0901234570', address: '30 Cù Chính Lan, Hải Châu, Đà Nẵng',   bio: 'Yêu động vật và hay quyên góp cho các trung tâm cứu hộ.',                    job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=phan.thi.hoa' },
  { name: 'Đặng Văn Thắng',   email: 'dang.van.thang@gmail.com',    phone: '0901234571', address: '62 Trần Cao Vân, Thanh Khê, Đà Nẵng',  bio: 'Nuôi chó Shiba Inu 2 năm. Muốn nhận nuôi thêm 1 bé mèo.',                   job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=dang.van.thang' },
  { name: 'Trịnh Thị Thanh',  email: 'trinh.thi.thanh@gmail.com',   phone: '0901234572', address: '8 Đống Đa, Hải Châu, Đà Nẵng',        bio: 'Blogger chia sẻ về cuộc sống nuôi mèo trong căn hộ.',                        job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=trinh.thi.thanh' },
  { name: 'Lý Minh Quân',     email: 'ly.minh.quan@gmail.com',      phone: '0901234573', address: '44 Hùng Vương, Hải Châu, Đà Nẵng',    bio: 'Kỹ thuật viên thú y. Có thể hỗ trợ tư vấn sức khoẻ cho thú cưng.',          job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=ly.minh.quan' },
  { name: 'Ngô Thị Linh',     email: 'ngo.thi.linh@gmail.com',      phone: '0901234574', address: '19 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng', bio: 'Chuyên gia dinh dưỡng thú cưng với 5 năm kinh nghiệm. Tư vấn miễn phí.', job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=ngo.thi.linh' },
  { name: 'Cao Văn Phong',    email: 'cao.van.phong@gmail.com',      phone: '0901234575', address: '77 Núi Thành, Hải Châu, Đà Nẵng',     bio: 'Nhân viên văn phòng. Sống cùng mèo 3 năm, hiểu rõ tính cách mèo.',          job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=cao.van.phong' },
  { name: 'Hồ Thị Hương',     email: 'ho.thi.huong@gmail.com',      phone: '0901234576', address: '5 Võ Văn Kiệt, Sơn Trà, Đà Nẵng',    bio: 'Mẹ 2 con, gia đình muốn nuôi thú cưng để dạy bé yêu thương động vật.',      job: 'Đi làm',   avatar: 'https://i.pravatar.cc/150?u=ho.thi.huong' },
];

const users = await User.insertMany(
  usersData.map(u => ({ ...u, password: hash('Matkhau123@'), role: 'user' }))
);

const [uLan, uNam, uKhoa, uHang, uHung, uNgoc, uDuc, uMai, uTuan, uHoa, uThang, uThanh, uQuan, uLinh, uPhong, uHuong] = users;
console.log(`  ✅ ${users.length} users\n`);

// ══════════════════════════════════════════════════════════════════════════════
// 2. PETS  (9 con: 6 sẵn sàng, 3 đang được nhận nuôi)
// ══════════════════════════════════════════════════════════════════════════════
console.log('🐾 Tạo pets...');

const petsData = [
  // ── SẴN SÀNG NHẬN NUÔI ────────────────────────────────────────────────────
  {
    name: 'Bơ',
    breed: 'Mèo Anh Lông Ngắn',
    age: '8 tháng',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    rescuePartner: 'Cứu hộ PAW Đà Nẵng',
    description: 'Bơ là chú mèo vàng cam cực kỳ thân thiện và hòa đồng. Bé được cứu từ vụ bỏ rơi tại chợ Cồn và đã được tiêm phòng đầy đủ. Bơ thích được ôm và rất ngoan với trẻ em.',
    status: 'Ready',
    tags: ['thân thiện', 'tiêm phòng', 'phù hợp trẻ em', 'trong nhà'],
    aiMatching: 92,
    donationAmount: 300000,
    story: 'Bơ bị bỏ lại ở thùng carton trước cổng chợ Cồn lúc mưa. Tình nguyện viên PAW tìm thấy và đưa về chăm sóc. Sau 3 tuần điều trị viêm đường hô hấp, Bơ đã khoẻ mạnh hoàn toàn.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: false },
    createdAt: d(2026, 6, 3),
  },
  {
    name: 'Tuyết',
    breed: 'Mèo Ba Tư',
    age: '1 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600',
    rescuePartner: 'Trạm cứu hộ Sơn Trà',
    description: 'Tuyết là cô mèo trắng muốt với đôi mắt xanh dịu dàng. Bé cực kỳ hiền lành, thích ngồi lòng chủ và xem TV. Phù hợp với gia đình ở căn hộ.',
    status: 'Ready',
    tags: ['hiền lành', 'lông dài', 'trong nhà', 'đã triệt sản'],
    aiMatching: 88,
    donationAmount: 200000,
    story: 'Tuyết được một người dân mang đến trạm cứu hộ sau khi tìm thấy bé lang thang ở khu chung cư. Bé đã được kiểm tra sức khoẻ toàn diện và tiêm phòng đầy đủ.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true },
    createdAt: d(2026, 6, 4),
  },
  {
    name: 'Cam',
    breed: 'Mèo Ta (Domestic Shorthair)',
    age: '5 tháng',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600',
    rescuePartner: 'Cứu hộ PAW Đà Nẵng',
    description: 'Cam là chú mèo con hiếu động và nghịch ngợm. Bé rất thích chơi đùa và học hỏi. Nếu bạn muốn một người bạn đồng hành vui vẻ, Cam chính là lựa chọn hoàn hảo!',
    status: 'Ready',
    tags: ['mèo con', 'hiếu động', 'vui vẻ', 'phù hợp trẻ em'],
    aiMatching: 85,
    donationAmount: 150000,
    story: 'Cam cùng 2 anh chị em bị bỏ trong túi nilon ven đường Nguyễn Tất Thành. Tất cả đều được cứu và điều trị ký sinh trùng. Hai bé kia đã được nhận nuôi, chỉ còn Cam đang chờ chủ.',
    healthInfo: { vaccinated: true, neutered: false, microchipped: false },
    createdAt: d(2026, 6, 5),
  },
  {
    name: 'Milo',
    breed: 'Chó Phốc Sóc (Pomeranian)',
    age: '2 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    rescuePartner: 'Hội bảo vệ động vật Đà Nẵng',
    description: 'Milo là chú chó Phốc Sóc lông vàng rực rỡ, luôn năng động và vui vẻ. Bé đã được huấn luyện cơ bản, biết ngồi, nằm và không cắn. Rất thân thiện với người lạ.',
    status: 'Ready',
    tags: ['đã huấn luyện', 'thân thiện', 'năng động', 'lông đẹp'],
    aiMatching: 90,
    donationAmount: 500000,
    story: 'Milo từng là thú cưng của một gia đình trẻ. Khi chủ cũ chuyển nhà ra nước ngoài không thể mang theo, họ đã gửi bé về cho PAW Home với hy vọng tìm được gia đình mới tốt bụng.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true },
    createdAt: d(2026, 6, 5),
  },
  {
    name: 'Bông',
    breed: 'Chó Bắc Kinh (Pekingese)',
    age: '3 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
    rescuePartner: 'Trạm cứu hộ Ngũ Hành Sơn',
    description: 'Bông là cô chó quý phái và dịu dàng. Bé thích được chải lông và tắm sạch. Rất phù hợp với gia đình ít vận động, thích nuôi chó cảnh trong nhà.',
    status: 'Ready',
    tags: ['dịu dàng', 'cảnh', 'trong nhà', 'triệt sản'],
    aiMatching: 82,
    donationAmount: 350000,
    story: 'Bông bị bỏ lại tại trạm xe buýt kèm theo mảnh giấy "Con không thể nuôi em nữa, mong ai nhận em về". Bé khá nhút nhát ban đầu nhưng sau 2 tuần chăm sóc đã rất thân thiện.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: false },
    createdAt: d(2026, 6, 6),
  },
  {
    name: 'Kitty',
    breed: 'Mèo Mướp (Tabby)',
    age: '1.5 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=600',
    rescuePartner: 'Cứu hộ PAW Đà Nẵng',
    description: 'Kitty là cô mèo mướp điệu đà và thông minh. Bé biết mở cửa tủ, tự ăn đúng giờ và không cào phá đồ đạc. Kitty rất thích trẻ nhỏ và hòa đồng với chó.',
    status: 'Ready',
    tags: ['thông minh', 'hòa đồng với chó', 'phù hợp trẻ em', 'trong nhà'],
    aiMatching: 87,
    donationAmount: 250000,
    story: 'Kitty được tìm thấy bị thương ở chân sau vụ tai nạn nhỏ. Sau 1 tháng điều trị tại phòng khám đối tác, bé đã hồi phục hoàn toàn và đang chờ gia đình mới.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true },
    createdAt: d(2026, 6, 7),
  },
  // ── ĐANG ĐƯỢC NHẬN NUÔI (3 con) ──────────────────────────────────────────
  {
    name: 'Cún Vàng',
    breed: 'Chó Vàng (Golden Mix)',
    age: '1.5 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
    rescuePartner: 'Cứu hộ PAW Đà Nẵng',
    description: 'Cún Vàng là chú chó lai vàng rực rỡ, cực kỳ trung thành và ham học hỏi. Bé đã được huấn luyện cơ bản và thích chạy ngoài trời. Đang ở trong giai đoạn theo dõi nhận nuôi.',
    status: 'Adopted',
    tags: ['trung thành', 'đã huấn luyện', 'năng động', 'sân vườn'],
    aiMatching: 94,
    donationAmount: 600000,
    story: 'Cún Vàng bị bỏ ở bãi biển Mỹ Khê khi còn là chó con. Tình nguyện viên PAW đã chăm sóc bé suốt 1 năm và huấn luyện kỹ năng cơ bản.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true },
    createdAt: d(2026, 6, 3),
  },
  {
    name: 'Luna',
    breed: 'Mèo Anh Lông Ngắn (Scottish)',
    age: '2 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
    rescuePartner: 'Trạm cứu hộ Sơn Trà',
    description: 'Luna là cô mèo Scottish Fold xinh đẹp với đôi tai xếp và cặp mắt tròn to. Bé hiền lành, sạch sẽ và rất ngoan. Hiện đang trong giai đoạn theo dõi nhận nuôi.',
    status: 'Adopted',
    tags: ['hiền lành', 'sạch sẽ', 'trong nhà', 'lông dài'],
    aiMatching: 91,
    donationAmount: 450000,
    story: 'Luna được cứu từ một trang trại nhân giống không giấy phép. Bé bị suy dinh dưỡng nhẹ nhưng sau 6 tuần chăm sóc chuyên biệt đã hồi phục và tăng cân tốt.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true },
    createdAt: d(2026, 6, 3),
  },
  {
    name: 'Mochi',
    breed: 'Mèo Calico (Tam Thể)',
    age: '1 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600',
    rescuePartner: 'Cứu hộ PAW Đà Nẵng',
    description: 'Mochi là cô mèo tam thể rất dễ thương với bộ lông đặc trưng trắng-đen-cam. Bé hay kêu và thích "nói chuyện" với chủ. Đang được theo dõi nuôi dưỡng sau nhận nuôi.',
    status: 'Adopted',
    tags: ['hoạt bát', 'hay kêu', 'vui vẻ', 'trong nhà'],
    aiMatching: 89,
    donationAmount: 380000,
    story: 'Mochi được một bạn học sinh mang đến PAW sau khi tìm thấy bé ở trường. Do không thể nuôi, bạn ấy đã nhờ PAW tìm chủ mới. Mochi đã được nhận nuôi và đang thích nghi tốt.',
    healthInfo: { vaccinated: true, neutered: false, microchipped: false },
    createdAt: d(2026, 6, 4),
  },
];

const pets = await Pet.insertMany(petsData);
const [pBo, pTuyet, pCam, pMilo, pBong, pKitty, pCunVang, pLuna, pMochi] = pets;
console.log(`  ✅ ${pets.length} pets\n`);

// ══════════════════════════════════════════════════════════════════════════════
// 3. PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════
console.log('🛍  Tạo products...');

const productsData = [
  {
    name: 'Thức ăn mèo Royal Canin Indoor 2kg',
    description: 'Thức ăn hạt khô dành riêng cho mèo nuôi trong nhà. Giàu protein, hỗ trợ tiêu hoá và kiểm soát cân nặng. Phù hợp mèo từ 12 tháng tuổi trở lên.',
    category: 'Thức ăn',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400',
    stock: 45, isNew: false, rating: 4.8, soldCount: 127,
  },
  {
    name: 'Thức ăn chó Pedigree Adult 3kg',
    description: 'Thức ăn hạt cho chó trưởng thành mọi giống. Bổ sung omega-6, canxi và vitamin. Hương vị thịt bò và rau củ, chó rất thích.',
    category: 'Thức ăn',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
    stock: 60, isNew: false, rating: 4.5, soldCount: 89,
  },
  {
    name: 'Pate mèo Whiskas vị cá hồi (12 gói)',
    description: 'Pate ướt dành cho mèo với vị cá hồi thơm ngon. Bổ sung taurine tốt cho mắt và tim mạch. Phù hợp mèo từ 1 tuổi trở lên.',
    category: 'Thức ăn',
    price: 96000,
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400',
    stock: 80, isNew: true, rating: 4.7, soldCount: 210,
  },
  {
    name: 'Thức ăn mèo con Royal Canin Kitten 400g',
    description: 'Thức ăn hạt đặc biệt cho mèo con dưới 12 tháng. Giàu DHA hỗ trợ phát triển não bộ và thị lực.',
    category: 'Thức ăn',
    price: 145000,
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400',
    stock: 35, isNew: false, rating: 4.9, soldCount: 74,
  },
  {
    name: 'Thuốc xổ giun Drontal cho mèo (4 viên)',
    description: 'Thuốc tẩy giun đường ruột cho mèo trên 6 tuần tuổi. Tác dụng diệt giun đũa, giun móc, giun dây. Nên tẩy giun định kỳ 3 tháng/lần.',
    category: 'Khác',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    stock: 50, isNew: false, rating: 4.6, soldCount: 95,
  },
  {
    name: 'Nhỏ gáy phòng ve rận Frontline Plus cho mèo',
    description: 'Thuốc nhỏ gáy phòng và trị ve, bọ chét, rận cho mèo trên 8 tuần tuổi. Hiệu lực 1 tháng/tuýp.',
    category: 'Khác',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    stock: 40, isNew: true, rating: 4.7, soldCount: 63,
  },
  {
    name: 'Sữa bột thay thế cho chó mèo con Beaphar',
    description: 'Sữa bột dinh dưỡng cho thú cưng sơ sinh và mồ côi. Giàu canxi và protein cần thiết cho sự phát triển.',
    category: 'Thức ăn',
    price: 165000,
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400',
    stock: 25, isNew: false, rating: 4.8, soldCount: 42,
  },
  {
    name: 'Cần câu mèo lông vũ tự động xoay 360°',
    description: 'Đồ chơi tự động cho mèo với lông vũ xoay tự động. Kích thích bản năng săn mồi, giúp mèo vận động. Pin AA, tự tắt sau 15 phút.',
    category: 'Đồ chơi',
    price: 189000,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    stock: 30, isNew: true, rating: 4.4, soldCount: 58,
  },
  {
    name: 'Bóng đồ chơi chó có tiếng kêu (bộ 3 cái)',
    description: 'Bóng cao su đàn hồi cao có gắn còi kêu khi bóp. Màu sắc nổi bật để chó dễ nhìn thấy. An toàn không chứa BPA.',
    category: 'Đồ chơi',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    stock: 55, isNew: false, rating: 4.3, soldCount: 112,
  },
  {
    name: 'Nhà cây cho mèo 5 tầng (gỗ + sisal)',
    description: 'Nhà cây nhiều tầng với bảng cào móng, ổ nằm lót nỉ và đường hầm. Chất liệu gỗ thông tự nhiên và dây sisal bền chắc. Chiều cao 1m5.',
    category: 'Phụ kiện',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400',
    stock: 12, isNew: false, rating: 4.6, soldCount: 31,
  },
  {
    name: 'Vòng cổ chống bọ chét cho mèo Seresto',
    description: 'Vòng cổ phòng ve bọ chét cho mèo, hiệu lực lên đến 8 tháng. Khoá an toàn tự mở khi mèo bị mắc kẹt.',
    category: 'Phụ kiện',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400',
    stock: 20, isNew: false, rating: 4.7, soldCount: 47,
  },
  {
    name: 'Bát ăn đôi inox chân cao chống trượt',
    description: 'Bộ bát ăn đôi bằng inox 304 không gỉ, chân cao giúp thú cưng ăn đúng tư thế. Đáy silicon chống trượt.',
    category: 'Phụ kiện',
    price: 129000,
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400',
    stock: 65, isNew: true, rating: 4.5, soldCount: 83,
  },
  {
    name: 'Cát vệ sinh mèo Biokats Clumping 10L',
    description: 'Cát bentonite vón cục nhanh, khử mùi hiệu quả. Không bụi, không dính chân mèo. 1 túi dùng được 3-4 tuần cho 1 mèo.',
    category: 'Vệ sinh',
    price: 145000,
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400',
    stock: 70, isNew: false, rating: 4.8, soldCount: 195,
  },
  {
    name: 'Dầu gội khô cho chó mèo (không cần nước)',
    description: 'Dầu gội khô dạng xịt tiện lợi. Làm sạch bụi bẩn, khử mùi và làm mềm lông. An toàn cho thú cưng liếm sau khi xịt.',
    category: 'Vệ sinh',
    price: 98000,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
    stock: 38, isNew: true, rating: 4.2, soldCount: 67,
  },
];

const products = await Product.insertMany(productsData);
console.log(`  ✅ ${products.length} products\n`);

// ══════════════════════════════════════════════════════════════════════════════
// 4. ADOPTIONS
// ══════════════════════════════════════════════════════════════════════════════
console.log('📋 Tạo adoptions...');

// Adoption 1: Phạm Thị Lan nhận Cún Vàng (2 tracking reports)
await Adoption.create({
  petId: pCunVang._id, userId: uLan._id,
  fullName: 'Phạm Thị Lan', phone: '0901234561',
  facebookLink: 'https://facebook.com/pham.thi.lan.dn',
  job: 'Đi làm', monthlyIncome: '10 - 20 triệu',
  address: '45 Bạch Đằng, Hải Châu, Đà Nẵng',
  housingType: 'Nhà phố', experience: 'Đã từng nuôi',
  reason: 'Gia đình mình có sân rộng, rất hợp để nuôi chó. Mình yêu chó từ nhỏ và hiểu rõ trách nhiệm khi nhận nuôi.',
  idCardFront: 'https://picsum.photos/seed/cccd1f/400/250',
  idCardBack:  'https://picsum.photos/seed/cccd1b/400/250',
  status: 'FollowUp', deliveryOption: 'shipping',
  trackingReports: [
    { weekNumber: 1, image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', comment: 'Cún Vàng đã về nhà được 1 tuần! Bé đang thích nghi rất tốt, ăn ngủ đều đặn. Hôm nay bé còn tự ra hiệu muốn ra ngoài đi vệ sinh, quá thông minh! 🐾', submittedAt: d(2026, 6, 8, 19, 30) },
    { weekNumber: 2, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500', comment: 'Tuần 2 Cún Vàng đã quen với ngôi nhà mới. Bé hay chạy ra đón mình từ cổng mỗi khi đi làm về. Đã dạy bé ngồi và lăn ra, học rất nhanh! Cân nặng: 8.5kg (tăng 0.5kg so với tuần trước).', submittedAt: d(2026, 6, 14, 20, 0) },
  ],
  submittedAt: d(2026, 6, 3, 8, 0),
  createdAt: d(2026, 6, 3, 8, 0),
});

// Adoption 2: Nguyễn Hoài Nam nhận Luna (1 tracking report)
await Adoption.create({
  petId: pLuna._id, userId: uNam._id,
  fullName: 'Nguyễn Hoài Nam', phone: '0901234562',
  facebookLink: '',
  job: 'Đi làm', monthlyIncome: '10 - 20 triệu',
  address: '12 Lê Lợi, Sơn Trà, Đà Nẵng',
  housingType: 'Căn hộ', experience: 'Đã từng nuôi',
  reason: 'Mình đã nuôi mèo 5 năm, biết cách chăm sóc và có đủ điều kiện kinh tế. Luna trông rất hợp với không gian căn hộ của mình.',
  idCardFront: 'https://picsum.photos/seed/cccd2f/400/250',
  idCardBack:  'https://picsum.photos/seed/cccd2b/400/250',
  status: 'Approved', deliveryOption: 'pickup',
  trackingReports: [
    { weekNumber: 1, image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500', comment: 'Luna về nhà được đúng 1 tuần rồi. Bé đã quen với lịch ăn uống mới, hay ngồi bên cửa sổ ngắm phố. Tối ngủ bé hay nằm cạnh mình, ấm lòng lắm! Sức khoẻ bình thường, ăn hết phần ăn mỗi bữa. 🐱', submittedAt: d(2026, 6, 13, 21, 0) },
  ],
  submittedAt: d(2026, 6, 5, 9, 0),
  createdAt: d(2026, 6, 5, 9, 0),
});

// Adoption 3: Trần Minh Khoa nhận Mochi (2 tracking reports)
await Adoption.create({
  petId: pMochi._id, userId: uKhoa._id,
  fullName: 'Trần Minh Khoa', phone: '0901234563',
  facebookLink: 'https://facebook.com/tran.minh.khoa.2026',
  job: 'Đi làm', monthlyIncome: '5 - 10 triệu',
  address: '88 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng',
  housingType: 'Nhà phố', experience: 'Chưa từng nuôi',
  reason: 'Mình sống một mình, muốn có bạn đồng hành. Đã tìm hiểu kỹ về cách chăm sóc mèo trước khi đăng ký.',
  idCardFront: 'https://picsum.photos/seed/cccd3f/400/250',
  idCardBack:  'https://picsum.photos/seed/cccd3b/400/250',
  status: 'FollowUp', deliveryOption: 'shipping',
  trackingReports: [
    { weekNumber: 1, image: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=500', comment: 'Mochi về nhà 7 ngày! Bé rất hay kêu, cứ 6 giờ sáng là đánh thức mình dậy cho ăn 😂. Đã mua thêm nhà cây và cào móng. Bé đang khám phá khắp nhà.', submittedAt: d(2026, 6, 11, 18, 0) },
    { weekNumber: 2, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500', comment: 'Tuần 2 Mochi đã quen với mình hơn, bắt đầu cho bế mà không cào. Đã đưa bé đi khám tổng quát, bác sĩ nói sức khoẻ tốt. Cân nặng 3.2kg. 😸', submittedAt: d(2026, 6, 13, 19, 30) },
  ],
  submittedAt: d(2026, 6, 3, 15, 0),
  createdAt: d(2026, 6, 3, 15, 0),
});

// Đơn chờ duyệt / từ chối
await Adoption.insertMany([
  {
    petId: pBo._id, userId: uHung._id,
    fullName: 'Võ Quốc Hùng', phone: '0901234565',
    job: 'Đi làm', monthlyIncome: '10 - 20 triệu',
    address: '21 Phan Châu Trinh, Hải Châu, Đà Nẵng',
    housingType: 'Nhà phố', experience: 'Đã từng nuôi',
    reason: 'Mình có kinh nghiệm nuôi chó 3 năm, muốn thêm 1 bé mèo. Nhà có không gian rộng.',
    idCardFront: 'https://picsum.photos/seed/cccd4f/400/250',
    idCardBack:  'https://picsum.photos/seed/cccd4b/400/250',
    status: 'Pending', deliveryOption: 'pickup',
    submittedAt: d(2026, 6, 8),
  },
  {
    petId: pTuyet._id, userId: uMai._id,
    fullName: 'Hoàng Thị Mai', phone: '0901234568',
    job: 'Đi làm', monthlyIncome: '5 - 10 triệu',
    address: '7 Lý Tự Trọng, Sơn Trà, Đà Nẵng',
    housingType: 'Căn hộ', experience: 'Chưa từng nuôi',
    reason: 'Làm việc ở nhà nên có nhiều thời gian chăm mèo. Đã đọc sách về chăm sóc mèo Ba Tư.',
    idCardFront: 'https://picsum.photos/seed/cccd5f/400/250',
    idCardBack:  'https://picsum.photos/seed/cccd5b/400/250',
    status: 'Pending', deliveryOption: 'pickup',
    submittedAt: d(2026, 6, 10),
  },
  {
    petId: pKitty._id, userId: uNgoc._id,
    fullName: 'Đỗ Thị Bích Ngọc', phone: '0901234566',
    job: 'Đi làm', monthlyIncome: '5 - 10 triệu',
    address: '56 Hoàng Diệu, Hải Châu, Đà Nẵng',
    housingType: 'Nhà phố', experience: 'Chưa từng nuôi',
    reason: 'Con gái 7 tuổi rất mê mèo. Gia đình muốn nuôi để dạy bé yêu thương động vật.',
    idCardFront: 'https://picsum.photos/seed/cccd6f/400/250',
    idCardBack:  'https://picsum.photos/seed/cccd6b/400/250',
    status: 'Rejected', deliveryOption: 'pickup',
    submittedAt: d(2026, 6, 6),
  },
]);

console.log('  ✅ adoptions\n');

// ══════════════════════════════════════════════════════════════════════════════
// 5. DONATIONS  — chiến dịch nhận nuôi miễn phí, chỉ có 1 giao dịch 200k từ admin
// ══════════════════════════════════════════════════════════════════════════════
console.log('💰 Tạo donations...');

const adminUser = await User.findOne({ role: 'admin' });

await Donation.create({
  petId:      null,
  userId:     adminUser?._id ?? null,
  donorName:  adminUser?.name ?? 'Nguyễn Minh Tuấn',
  donorEmail: adminUser?.email ?? '',
  amount:     200000,
  type:       'general',
  status:     'paid',
  billImage:  'https://picsum.photos/seed/bill_admin/400/600',
  message:    'Ủng hộ chiến dịch nhận nuôi miễn phí PAW Home tháng 6.',
  createdAt:  d(2026, 6, 3, 9, 0),
});

console.log('  ✅ donations (1 giao dịch · 200k)\n');

// ══════════════════════════════════════════════════════════════════════════════
// 6. COMMUNITY POSTS
// ══════════════════════════════════════════════════════════════════════════════
console.log('📝 Tạo community posts...');

const posts = await Post.insertMany([
  {
    userId: uHang._id, authorName: uHang.name, authorAvatar: uHang.avatar, authorIsExpert: true,
    content: `🐾 [BỆNH PARVO Ở CHÓ - NGUY HIỂM KHÔNG KÉM COVID!]

Parvo (Parvovirus) là bệnh siêu nguy hiểm ở chó con, tỷ lệ tử vong lên tới 91% nếu không điều trị.

🔴 DẤU HIỆU NHẬN BIẾT:
• Nôn mửa liên tục (có thể có máu)
• Tiêu chảy nặng, phân đen và rất thối
• Bỏ ăn hoàn toàn, uể oải, nằm một chỗ
• Sốt cao hoặc hạ thân nhiệt đột ngột
• Mất nước nhanh (da mất đàn hồi)

✅ PHÒNG NGỪA:
• Tiêm phòng vaccine DHPP từ 6-8 tuần tuổi
• Nhắc lại sau 3-4 tuần, tổng 3 mũi cơ bản
• Nhắc lại hàng năm
• Không đưa chó con ra ngoài chưa tiêm đủ mũi

⚠️ Nếu thấy dấu hiệu trên, NGAY LẬP TỨC đưa bé đến bác sĩ thú y. Đừng chờ xem có khỏi không!

#Parvo #BệnhChó #TiêmPhòng #ThúCưng`,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    likedBy: [uHung._id, uDuc._id, uTuan._id, uNgoc._id, uPhong._id, uQuan._id],
    shares: 12, createdAt: d(2026, 6, 3, 10, 0),
    commentList: [
      { userId: uDuc._id,  authorName: 'Bùi Văn Đức',  content: 'Cảm ơn bác sĩ! Chó nhà em 3 tháng chưa tiêm mũi 3, mai đi tiêm ngay.', createdAt: d(2026, 6, 3, 10, 30) },
      { userId: uHung._id, authorName: 'Võ Quốc Hùng', content: 'Parvo nguy hiểm thật, hàng xóm em năm ngoái mất cả đàn chó con vì bệnh này.', createdAt: d(2026, 6, 3, 11, 0) },
      { userId: uQuan._id, authorName: 'Lý Minh Quân',  content: 'Bổ sung thêm: Parvo sống được rất lâu trong môi trường (đất, sàn nhà). Chỉ dùng dung dịch Bleach 1:30 mới diệt được.', createdAt: d(2026, 6, 3, 11, 30) },
    ],
  },
  {
    userId: uLinh._id, authorName: uLinh.name, authorAvatar: uLinh.avatar, authorIsExpert: true,
    content: `🍽️ [DINH DƯỠNG CHO MÈO - NHỮNG SAI LẦM THƯỜNG GẶP]

Nhiều bạn nuôi mèo mà không biết mình đang cho bé ăn sai, dẫn đến bệnh sỏi thận, tiểu đường rất thường gặp ở mèo!

❌ KHÔNG NÊN:
1. Cho ăn thức ăn cho người (cơm, mì, bánh mì) — mèo không cần carbohydrate
2. Cho uống sữa bò — 70% mèo trưởng thành không tiêu hoá được lactose
3. Cho ăn cá sống thường xuyên — có enzyme phá huỷ vitamin B1
4. Bỏ đói mèo hơn 24 tiếng — gây gan nhiễm mỡ (Hepatic Lipidosis)
5. Cho ăn đồ có hành tỏi, nho, socola — cực độc với mèo

✅ NÊN:
• Thức ăn hạt khô hoặc pate chuyên dụng cho mèo
• Nước sạch luôn có sẵn (mèo hay bị thận vì uống ít nước)
• Chia 2-3 bữa/ngày thay vì để cả ngày
• Bổ sung taurine (có sẵn trong thức ăn chuyên dụng)

💡 Mèo là động vật ăn thịt bắt buộc (obligate carnivore), cần protein động vật để tồn tại!

#DinhDưỡngMèo #SứcKhoẻThúCưng #MẹoNuôiMèo`,
    likedBy: [uHang._id, uTuan._id, uMai._id, uThanh._id, uHoa._id, uKhoa._id, uNam._id],
    shares: 8, createdAt: d(2026, 6, 4, 9, 0),
    commentList: [
      { userId: uMai._id,   authorName: 'Hoàng Thị Mai',   content: 'Ôi trời, mình hay cho mèo uống sữa bò lắm, nghĩ nó thích :(', createdAt: d(2026, 6, 4, 9, 30) },
      { userId: uLinh._id,  authorName: 'Ngô Thị Linh',    content: '@Hoàng Thị Mai Nếu mèo uống mà không tiêu chảy thì may mắn, nhưng tốt nhất không nên cho uống bạn nhé!', createdAt: d(2026, 6, 4, 9, 45) },
      { userId: uThanh._id, authorName: 'Trịnh Thị Thanh', content: 'Thông tin rất hữu ích! Lưu lại ngay. Mình nuôi mèo 2 năm mới biết những điều này 😅', createdAt: d(2026, 6, 4, 10, 0) },
    ],
  },
  {
    userId: uHang._id, authorName: uHang.name, authorAvatar: uHang.avatar, authorIsExpert: true,
    content: `🐱 [NẤM DA Ở MÈO (RINGWORM) — LÂY SANG NGƯỜI ĐƯỢC!]

Nấm da (Dermatophytosis) là bệnh rất phổ biến ở mèo đường phố và mèo con, đặc biệt nguy hiểm vì CÓ THỂ LÂY SANG NGƯỜI.

🔍 DẤU HIỆU:
• Rụng lông thành từng vùng tròn, bờ rõ ràng
• Da đỏ, bong vảy, có thể đóng vảy màu xám
• Ngứa (mèo hay gãi, liếm vùng bị)
• Thường xuất hiện ở đầu, tai, chân trước

🏥 ĐIỀU TRỊ:
• Thuốc bôi Miconazole/Clotrimazole 2 lần/ngày × 4-6 tuần
• Thuốc uống Itraconazole (theo chỉ định BS)
• Dầu gội Malaseb tắm 2-3 lần/tuần
• Khử trùng môi trường bằng Bleach pha loãng

👨‍👩‍👧 LƯU Ý CHO NGƯỜI:
Nếu tiếp xúc với mèo bệnh mà thấy vùng da đỏ hình tròn → đến da liễu ngay!

Đang điều trị mèo bệnh nên đeo găng tay, rửa tay kỹ sau khi chạm vào.

#NấmDaMèo #Ringworm #BệnhLâySangNgười #ThúCưng`,
    likedBy: [uDuc._id, uNgoc._id, uHoa._id, uTuan._id, uHuong._id],
    shares: 15, createdAt: d(2026, 6, 5, 8, 0),
    commentList: [
      { userId: uHuong._id, authorName: 'Hồ Thị Hương',    content: 'Mèo nhà em đang bị rụng lông ở tai, cần đưa đi khám gấp không ạ?', createdAt: d(2026, 6, 5, 8, 30) },
      { userId: uHang._id,  authorName: 'Lê Thị Thu Hằng', content: '@Hồ Thị Hương Đúng rồi bạn ơi, cần đưa đi khám để xác định có phải nấm không. Đừng tự điều trị nhé!', createdAt: d(2026, 6, 5, 8, 45) },
      { userId: uQuan._id,  authorName: 'Lý Minh Quân',    content: 'Phòng khám có dịch vụ soi da bằng đèn Wood Lamp để chẩn đoán nấm nhanh, chi phí 50k thôi.', createdAt: d(2026, 6, 5, 9, 0) },
    ],
  },
  {
    userId: uLan._id, authorName: uLan.name, authorAvatar: uLan.avatar, authorIsExpert: false,
    content: `🐕 Tuần 1 cùng Cún Vàng — Nhật ký nhận nuôi 🌟

Cún Vàng về nhà được 7 ngày rồi mà cảm giác như đã quen từ lâu lắm rồi!

Ngày đầu tiên bé còn rụt rè, nằm một góc nhìn mình. Đến ngày 3 thì bắt đầu ra ăn bình thường. Hôm nay là ngày thứ 7, bé chạy ra tận cổng đón mình từ lúc xa xa! ❤️

Mình đã chuẩn bị:
✅ Góc ăn uống riêng
✅ Ổ nằm mềm trong nhà
✅ Đồ chơi cắn an toàn
✅ Lịch tiêm phòng tiếp theo vào 15/6

Cún Vàng ơi, chào mừng đến ngôi nhà mới của mình! 🏡🐾

#NhậnNuôiChó #CúnVàng #PAWHome #NhậtKýNuôiChó`,
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
    likedBy: [uNam._id, uKhoa._id, uHoa._id, uThanh._id, uNgoc._id, uPhong._id, uHuong._id],
    shares: 3, createdAt: d(2026, 6, 8, 20, 0),
    commentList: [
      { userId: uNam._id,  authorName: 'Nguyễn Hoài Nam', content: 'Chúc mừng chị và Cún Vàng! Bé trông khoẻ lắm 😍', createdAt: d(2026, 6, 8, 20, 30) },
      { userId: uHoa._id,  authorName: 'Phan Thị Hoa',    content: 'Cún Vàng xinh quá! Chị nuôi tốt, bé sẽ hạnh phúc ở đây ❤️', createdAt: d(2026, 6, 8, 21, 0) },
      { userId: uLinh._id, authorName: 'Ngô Thị Linh',    content: 'Giai đoạn 2 tuần đầu rất quan trọng chị nhé! Cho bé ăn đúng giờ và đừng thay đổi thức ăn đột ngột để tránh tiêu chảy.', createdAt: d(2026, 6, 8, 21, 30) },
    ],
  },
  {
    userId: uKhoa._id, authorName: uKhoa.name, authorAvatar: uKhoa.avatar, authorIsExpert: false,
    content: `😹 Mochi 2 tuần đầu tiên — Câu chuyện "nuôi mèo lần đầu"

Nói thật không giấu: mình hoàn toàn không biết gì về mèo trước khi nhận nuôi Mochi 😅

Tuần 1: Mochi kêu "meo" liên tục từ 5 giờ sáng. Mình tưởng bé đói, đổ đầy thức ăn. Kết quả: bé ăn một miếng rồi bỏ, tiếp tục kêu 😩. Hỏi group nuôi mèo mới biết — bé muốn CHƠI, không phải đói!

Tuần 2: Mua ngay cần câu lông vũ. Chơi 15 phút buổi tối, Mochi mệt phờ và ngủ ngon đến sáng. Mình cũng ngủ được 😂

Bài học:
💡 Mèo cần VẬN ĐỘNG hàng ngày, không chỉ ăn ngủ
💡 Mèo kêu không hẳn là đói — có thể cần chú ý, chơi
💡 Mua đồ chơi TRƯỚC khi nhận mèo về

Mochi bây giờ đã nhận mình là "người phục vụ" chính thức rồi 👑

#MèoLầnĐầu #Mochi #NuôiMèo #HọcTừSaiLầm`,
    image: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600',
    likedBy: [uLan._id, uThanh._id, uMai._id, uTuan._id, uNgoc._id, uPhong._id],
    shares: 5, createdAt: d(2026, 6, 13, 19, 0),
    commentList: [
      { userId: uThanh._id, authorName: 'Trịnh Thị Thanh', content: 'Haha đúng y chang trải nghiệm của mình năm đầu nuôi mèo 😂 Mochi đẹp quá!', createdAt: d(2026, 6, 13, 19, 30) },
      { userId: uMai._id,   authorName: 'Hoàng Thị Mai',   content: 'Mình cũng đang chuẩn bị nhận nuôi, bài này giúp ích ghê! Lưu lại rồi.', createdAt: d(2026, 6, 13, 20, 0) },
      { userId: uLinh._id,  authorName: 'Ngô Thị Linh',    content: 'Bạn có thể cho mèo chơi đồ chơi nhét thức ăn bên trong, vừa vận động vừa kích thích trí tuệ!', createdAt: d(2026, 6, 13, 20, 30) },
    ],
  },
  {
    userId: uHung._id, authorName: uHung.name, authorAvatar: uHung.avatar, authorIsExpert: false,
    content: `🐱 TÌM CHỦ NHÂN CHO MÈO TAM THỂ CẦN GẤP!

Hàng xóm nhà mình chuyển nhà không thể mang theo mèo, nhờ mình tìm chủ mới.

🐾 Thông tin bé:
• Giống: Mèo ta (tam thể trắng-đen-vàng)
• Tuổi: khoảng 2 tuổi
• Giới tính: Cái, chưa triệt sản
• Đã tiêm phòng: Có (1 mũi cơ bản)
• Tính cách: Hiền lành, ít kêu, thích được vuốt

📍 Khu vực: Hải Châu, Đà Nẵng
📞 Liên hệ: 0901234565 (Hùng)

Ưu tiên người có kinh nghiệm nuôi mèo và nhà rộng. KHÔNG nhận ở xa.

Chia sẻ giúp mình để bé sớm tìm được nhà nhé! 🙏

#TìmChủMèo #MèoTamThể #ĐàNẵng #CầnGấp`,
    likedBy: [uNgoc._id, uThanh._id, uHoa._id, uMai._id],
    shares: 8, createdAt: d(2026, 6, 6, 14, 0),
    commentList: [
      { userId: uNgoc._id, authorName: 'Đỗ Thị Bích Ngọc', content: 'Mình quan tâm! Bé tam thể thường rất khôn đó. Inbox cho bạn.', createdAt: d(2026, 6, 6, 14, 30) },
      { userId: uMai._id,  authorName: 'Hoàng Thị Mai',    content: 'Bé có ảnh không bạn? Share thêm để mình xem với!', createdAt: d(2026, 6, 6, 15, 0) },
      { userId: uHung._id, authorName: 'Võ Quốc Hùng',     content: '@Hoàng Thị Mai Mình sẽ đăng ảnh bé lên sau nhé! Hiện tại bé đang ở nhà mình tạm.', createdAt: d(2026, 6, 6, 15, 30) },
    ],
  },
  {
    userId: uTuan._id, authorName: uTuan.name, authorAvatar: uTuan.avatar, authorIsExpert: false,
    content: `📸 Tìm hiểu về nhận nuôi tại PAW Home — Trải nghiệm thực tế

Mình vừa hoàn thành hồ sơ đăng ký nhận nuôi, chia sẻ trải nghiệm cho các bạn đang muốn tham gia!

📝 QUY TRÌNH:
1. Đăng ký tài khoản trên paw-home.vercel.app
2. Vào trang "Thú Cưng" → chọn bé mình thích
3. Nhấn "Nhận nuôi" → điền hồ sơ (mất khoảng 15 phút)
4. Upload ảnh CCCD 2 mặt
5. Đóng phí hỗ trợ qua PayOS (rất tiện, quét QR là xong)
6. Chờ admin xem xét hồ sơ (1-3 ngày)

💡 TIPS ĐỂ HỒ SƠ ĐƯỢC DUYỆT NHANH:
• Điền đầy đủ thông tin, đặc biệt phần "Lý do nhận nuôi"
• Ảnh CCCD phải rõ nét
• Link Facebook giúp admin verify danh tính nhanh hơn

🏅 Điểm cộng: Có tính năng theo dõi sau nhận nuôi, phải đăng ảnh cập nhật hàng tuần!

#PAWHome #NhậnNuôiThúCưng #HướngDẫn #ĐàNẵng`,
    likedBy: [uLan._id, uNam._id, uHoa._id, uNgoc._id, uHuong._id, uPhong._id],
    shares: 11, createdAt: d(2026, 6, 7, 11, 0),
    commentList: [
      { userId: uHuong._id, authorName: 'Hồ Thị Hương',  content: 'Cảm ơn bạn đã chia sẻ! Cả nhà mình đang xem xét nhận nuôi, bài này giúp ích nhiều.', createdAt: d(2026, 6, 7, 11, 30) },
      { userId: uPhong._id, authorName: 'Cao Văn Phong',  content: 'Quy trình đúng như bạn nói, rất chuyên nghiệp!', createdAt: d(2026, 6, 7, 12, 0) },
      { userId: uTuan._id,  authorName: 'Đinh Minh Tuấn', content: 'Update: Hồ sơ của mình đã được admin xem, đang chờ phê duyệt! 🤞', createdAt: d(2026, 6, 9, 18, 0) },
    ],
  },
  {
    userId: uThang._id, authorName: uThang.name, authorAvatar: uThang.avatar, authorIsExpert: false,
    content: `🔍 AI PHÁN MÈO NHÀ MÌNH HỢP VỚI BÉ NÀO NHẤT?

Thú vị quá! PAW Home có tính năng AI gợi ý thú cưng phù hợp với mình. Mình làm thử survey và kết quả:

🥇 Độ phù hợp cao nhất: Bé "Bơ" (Mèo Anh Lông Ngắn) - 92%
Lý do AI đưa ra: Bạn sống trong nhà phố, có kinh nghiệm nuôi thú cưng, tính cách điềm tĩnh → phù hợp với mèo thân thiện, ít vận động.

Đúng vãi, mình nuôi Shiba Inu 2 năm nên biết cách chăm thú cưng. Sắp đăng ký nhận nuôi bé Bơ rồi 🥺

Ai chưa dùng tính năng AI Matching thì thử đi, khá chính xác đó!

#AIMatching #PAWHome #MèoAnhLôngNgắn #Bơ`,
    likedBy: [uDuc._id, uThanh._id, uNgoc._id, uTuan._id],
    shares: 4, createdAt: d(2026, 6, 9, 16, 0),
    commentList: [
      { userId: uDuc._id,   authorName: 'Bùi Văn Đức',    content: 'AI phán chó nhà em hợp với bé Milo 90% 😂 Đúng hệt tính cách mình thích!', createdAt: d(2026, 6, 9, 16, 30) },
      { userId: uThanh._id, authorName: 'Trịnh Thị Thanh', content: 'Bé Bơ xinh lắm! Mình cũng được AI gợi ý bé này nhưng đã nhận nuôi rồi nên nhường cho bạn nhé 😊', createdAt: d(2026, 6, 9, 17, 0) },
    ],
  },
  {
    userId: uHuong._id, authorName: uHuong.name, authorAvatar: uHuong.avatar, authorIsExpert: false,
    content: `🆘 Nhờ các bạn tư vấn: Mèo nhà mình bỗng dưng bỏ ăn 2 ngày

Mèo nhà mình (cái, 3 tuổi, đã triệt sản) bỗng dưng từ tối qua không chịu ăn. Sáng nay vẫn uống nước bình thường, không nôn, không tiêu chảy, đi vệ sinh bình thường.

Mình thử đổi sang pate bé cũng không quan tâm. Bé chỉ nằm và thỉnh thoảng kêu khẽ.

🌡️ Nhiệt độ cơ thể đo được: 38.8°C (bình thường là 38-39)

Có cần đưa đi khám không ạ? Hay chờ thêm? Gia đình mình lo lắm...`,
    likedBy: [uHang._id, uQuan._id],
    shares: 1, createdAt: d(2026, 6, 10, 8, 0),
    commentList: [
      { userId: uHang._id,  authorName: 'Lê Thị Thu Hằng', content: 'Nhiệt độ 38.8 vẫn trong giới hạn bình thường. Nhưng bỏ ăn 2 ngày thì nên đi khám, đặc biệt kiểm tra thận và gan. Mèo bỏ ăn lâu rất dễ dẫn đến gan nhiễm mỡ!', createdAt: d(2026, 6, 10, 8, 30) },
      { userId: uQuan._id,  authorName: 'Lý Minh Quân',    content: 'Bạn kiểm tra xem mèo có bị táo bón không? Đôi khi táo bón nặng khiến mèo không muốn ăn. Nếu 3 ngày không ăn → cần đi khám gấp.', createdAt: d(2026, 6, 10, 9, 0) },
      { userId: uHuong._id, authorName: 'Hồ Thị Hương',   content: 'Mình đã đưa bé đi khám rồi. Bác sĩ nói bé bị viêm dạ dày nhẹ, cho thuốc về uống. Tối nay bé đã ăn 1 ít rồi, may quá! 🙏', createdAt: d(2026, 6, 10, 20, 0) },
    ],
  },
  {
    userId: uDuc._id, authorName: uDuc.name, authorAvatar: uDuc.avatar, authorIsExpert: false,
    content: `🐕 CHIA SẺ: Chó nhà mình bị ghẻ — Hành trình 3 tuần điều trị

Cún nhà mình (Mix, 2 tuổi) bị ghẻ Sarcoptes — đây là bài học đắt giá mình muốn chia sẻ.

🔴 BAN ĐẦU:
• Thấy chó gãi nhiều, rụng lông ở tai và khuỷu
• Tưởng dị ứng thức ăn nên đổi đồ ăn → không khỏi
• 2 tuần sau da đỏ, đóng vảy, chó gầy đi

💊 ĐIỀU TRỊ:
1. Tiêm Ivermectin × 3 mũi cách 2 tuần
2. Bôi thuốc Advocate hàng tuần
3. Tắm dầu gội diệt ghẻ 2 lần/tuần
4. Khử trùng toàn bộ chăn, gối, sàn nhà

📅 3 TUẦN SAU: Cún đã khỏi hoàn toàn, lông mọc lại đẹp!

Bài học: GÃI NHIỀU + RỤNG LÔNG = ĐI KHÁM NGAY. Đừng tự điều trị!

#GhèChó #BệnhNgoàiDa #ChữaBệnhThúCưng`,
    likedBy: [uHang._id, uLan._id, uQuan._id, uThanh._id, uHuong._id],
    shares: 7, createdAt: d(2026, 6, 11, 10, 0),
    commentList: [
      { userId: uHang._id, authorName: 'Lê Thị Thu Hằng', content: 'Cảm ơn bạn đã chia sẻ! Ghẻ Sarcoptes khác hoàn toàn với ghẻ thông thường, cần tiêm Ivermectin mới trị dứt.', createdAt: d(2026, 6, 11, 10, 30) },
      { userId: uLan._id,  authorName: 'Phạm Thị Lan',    content: 'Mình cũng có lo con Cún Vàng nhà mình bị ghẻ khi mới về vì hay gãi. Nhưng bác sĩ nói chỉ là dị ứng nhẹ với thức ăn mới, đổi sang Royal Canin là hết.', createdAt: d(2026, 6, 11, 11, 0) },
    ],
  },
  {
    userId: uNam._id, authorName: uNam.name, authorAvatar: uNam.avatar, authorIsExpert: false,
    content: `🐾 Luna tuần đầu tiên — "Cô ấy" đã chiếm mọi trái tim trong nhà 🌙

Mình không nghĩ nuôi mèo lại thay đổi cuộc sống nhiều đến vậy. Từ ngày có Luna:
• Mình dậy đúng giờ hơn (vì bé lên mặt đòi ăn lúc 6h30)
• Ít ở lại công ty muộn hơn (sợ Luna buồn một mình)
• Nhà cửa sạch sẽ hơn vì sợ bé nuốt phải đồ linh tinh
• Bạn bè qua nhà nhiều hơn hẳn để "thăm" Luna 😄

Luna bây giờ đã quen với ổ nằm, biết dùng khay cát, không cào phá đồ.

Cảm ơn PAW Home đã tạo ra mối duyên này! Nếu bạn đang đắn đo có nên nhận nuôi không — câu trả lời là CÓ! 🐱❤️

#Luna #NhậtKýNuôiMèo #PAWHome #MèoScottishFold`,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
    likedBy: [uLan._id, uKhoa._id, uHoa._id, uTuan._id, uMai._id, uPhong._id, uHuong._id, uHang._id],
    shares: 6, createdAt: d(2026, 6, 13, 21, 0),
    commentList: [
      { userId: uLan._id,  authorName: 'Phạm Thị Lan',   content: 'Đồng cảm 100%!! Nhà mình Cún Vàng cũng vậy, bao nhiêu thứ thay đổi kể từ khi có bé 😂❤️', createdAt: d(2026, 6, 13, 21, 30) },
      { userId: uKhoa._id, authorName: 'Trần Minh Khoa', content: 'Luna xinh quá! Mochi nhà mình cũng vừa qua tuần 2 rồi. Chúng mình cùng "nuôi mèo lần đầu" hehe!', createdAt: d(2026, 6, 13, 22, 0) },
      { userId: uMai._id,  authorName: 'Hoàng Thị Mai',  content: 'Đẹp quá! Mình đang làm hồ sơ nhận nuôi bé Tuyết. Xem bài này lại càng hào hứng hơn!', createdAt: d(2026, 6, 13, 22, 30) },
    ],
  },
  {
    userId: uNgoc._id, authorName: uNgoc.name, authorAvatar: uNgoc.avatar, authorIsExpert: false,
    content: `❓ HỎI: Royal Canin Indoor hay Purina ONE - chọn loại nào cho mèo trong nhà?

Mình sắp nhận nuôi mèo lần đầu, đang phân vân giữa 2 loại thức ăn này. Ngân sách tầm 300-350k/tháng.

Mèo nhà mình sẽ nuôi trong căn hộ, không ra ngoài. Mọi người có kinh nghiệm cho ý kiến với ạ! 🙏`,
    likedBy: [uLinh._id, uThanh._id, uMai._id],
    createdAt: d(2026, 6, 12, 15, 0),
    commentList: [
      { userId: uLinh._id,  authorName: 'Ngô Thị Linh',    content: 'Royal Canin Indoor tốt hơn vì được thiết kế riêng cho mèo nhà, kiểm soát cân nặng và giảm mùi phân. Ngân sách của bạn hoàn toàn đủ cho RC Indoor 2kg/tháng.', createdAt: d(2026, 6, 12, 15, 30) },
      { userId: uThanh._id, authorName: 'Trịnh Thị Thanh', content: 'Mình dùng RC Indoor 3 năm, mèo không bao giờ chán, cân nặng ổn định. Highly recommend!', createdAt: d(2026, 6, 12, 16, 0) },
      { userId: uKhoa._id,  authorName: 'Trần Minh Khoa',  content: 'Mình cũng dùng RC cho Mochi! Mua ở shop PAW Home là được, giao nhanh và giá chuẩn.', createdAt: d(2026, 6, 12, 16, 30) },
    ],
  },
]);

console.log(`  ✅ ${posts.length} posts\n`);

// ══════════════════════════════════════════════════════════════════════════════
// 7. CHAT MESSAGES
// ══════════════════════════════════════════════════════════════════════════════
console.log('💬 Tạo chat messages...');

const admin = await User.findOne({ role: 'admin' });
const adminId = admin?._id?.toString() || 'admin';

const chatRooms = [
  {
    roomId: uHung._id.toString(),
    msgs: [
      { senderId: uHung._id.toString(), content: 'Xin chào PAW Home! Mình đang quan tâm đến bé Bơ (mèo Anh Lông Ngắn). Mình cần chuẩn bị gì để đăng ký nhận nuôi ạ?', isFromAdmin: false, createdAt: d(2026, 6, 6, 10, 0) },
      { senderId: adminId, content: 'Chào bạn Hùng! Rất vui được hỗ trợ ạ. Để đăng ký nhận nuôi bé Bơ, bạn cần: 1) CCCD/CMND 2 mặt rõ nét, 2) Thông tin về nơi ở (loại nhà, diện tích), 3) Đóng phí hỗ trợ nuôi dưỡng 300.000đ qua PayOS. Bạn có thể điền hồ sơ trực tiếp trên website nhé!', isFromAdmin: true, createdAt: d(2026, 6, 6, 10, 15) },
      { senderId: uHung._id.toString(), content: 'Mình đang nuôi Shiba Inu, liệu có ảnh hưởng đến việc xét duyệt hồ sơ không ạ? Hai bé có sống chung được không?', isFromAdmin: false, createdAt: d(2026, 6, 6, 10, 20) },
      { senderId: adminId, content: 'Điều đó không ảnh hưởng xấu đâu bạn nhé! Thực ra việc đã có kinh nghiệm nuôi thú cưng là điểm CỘNG cho hồ sơ. Bé Bơ đã được đánh giá là hòa đồng với chó rồi.', isFromAdmin: true, createdAt: d(2026, 6, 6, 10, 30) },
      { senderId: uHung._id.toString(), content: 'Tuyệt vời! Mình sẽ điền hồ sơ ngay hôm nay. Sau khi nộp hồ sơ bao lâu thì có kết quả ạ?', isFromAdmin: false, createdAt: d(2026, 6, 6, 10, 35) },
      { senderId: adminId, content: 'Thông thường 1-3 ngày làm việc bạn nhé. Trường hợp cần thêm thông tin mình sẽ nhắn tin trực tiếp. Chúc bạn và bé Bơ sớm gặp nhau! 🐾', isFromAdmin: true, createdAt: d(2026, 6, 6, 10, 40) },
    ],
  },
  {
    roomId: uHuong._id.toString(),
    msgs: [
      { senderId: uHuong._id.toString(), content: 'Chào PAW Home! Mèo nhà mình bỗng nhiên bỏ ăn 2 ngày, sáng nay vẫn uống nước. Không nôn không tiêu chảy. Mình nên làm gì ạ?', isFromAdmin: false, createdAt: d(2026, 6, 10, 8, 0) },
      { senderId: adminId, content: 'Chào bạn Hương! Mèo bỏ ăn 2 ngày là dấu hiệu cần chú ý dù vẫn uống nước. Mình khuyên bạn đưa bé đi khám càng sớm càng tốt nhé.', isFromAdmin: true, createdAt: d(2026, 6, 10, 8, 20) },
      { senderId: uHuong._id.toString(), content: 'Nhiệt độ đo được 38.8°C có ổn không ạ?', isFromAdmin: false, createdAt: d(2026, 6, 10, 8, 25) },
      { senderId: adminId, content: '38.8°C vẫn trong khoảng bình thường (38-39°C) nên không phải sốt. Nhưng kết hợp bỏ ăn 2 ngày thì vẫn cần kiểm tra để loại trừ các vấn đề về tiêu hóa hoặc thận bạn nhé!', isFromAdmin: true, createdAt: d(2026, 6, 10, 8, 35) },
      { senderId: uHuong._id.toString(), content: 'Mình đã đưa bé đi khám rồi ạ. Bé bị viêm dạ dày nhẹ, bác sĩ kê thuốc về. Tối nay bé đã ăn được rồi. Cảm ơn PAW đã tư vấn ạ! 🙏', isFromAdmin: false, createdAt: d(2026, 6, 10, 20, 0) },
      { senderId: adminId, content: 'Vui quá! Mình mừng bé đã ổn. Bạn nhớ cho bé uống thuốc đủ liều nhé, đừng bỏ giữa chừng khi thấy bé khoẻ rồi. Chúc bé mau hồi phục hoàn toàn! 🐱', isFromAdmin: true, createdAt: d(2026, 6, 10, 20, 15) },
    ],
  },
  {
    roomId: uNgoc._id.toString(),
    msgs: [
      { senderId: uNgoc._id.toString(), content: 'Xin chào, mình nhận được thông báo hồ sơ nhận nuôi bé Kitty bị từ chối. Mình muốn biết lý do để cải thiện ạ?', isFromAdmin: false, createdAt: d(2026, 6, 7, 14, 0) },
      { senderId: adminId, content: 'Chào bạn Ngọc! Hồ sơ của bạn bị từ chối vì phần "Kinh nghiệm nuôi thú cưng" ghi chưa từng nuôi, trong khi bé Kitty cần người có kinh nghiệm do bé đang trong giai đoạn phục hồi sau chấn thương.', isFromAdmin: true, createdAt: d(2026, 6, 7, 14, 20) },
      { senderId: uNgoc._id.toString(), content: 'Mình hiểu rồi. Vậy mình nên nhận nuôi bé nào phù hợp hơn với người mới bắt đầu ạ?', isFromAdmin: false, createdAt: d(2026, 6, 7, 14, 30) },
      { senderId: adminId, content: 'Với gia đình có trẻ nhỏ và lần đầu nuôi mèo, mình gợi ý bé Tuyết (Mèo Ba Tư) hoặc bé Bơ (Anh Lông Ngắn). Cả hai đều rất hiền, thích trẻ em và dễ chăm sóc!', isFromAdmin: true, createdAt: d(2026, 6, 7, 14, 40) },
      { senderId: uNgoc._id.toString(), content: 'Cảm ơn bạn! Mình sẽ xem xét bé Tuyết. Nhà mình có sân nhỏ, bé có cần ra ngoài thường xuyên không ạ?', isFromAdmin: false, createdAt: d(2026, 6, 7, 14, 45) },
      { senderId: adminId, content: 'Mèo Ba Tư hoàn toàn phù hợp sống trong nhà, không cần ra ngoài. Sân nhà bạn có thể làm khu vui chơi có mái che cho bé là lý tưởng nhất! 😊', isFromAdmin: true, createdAt: d(2026, 6, 7, 15, 0) },
    ],
  },
  {
    roomId: uTuan._id.toString(),
    msgs: [
      { senderId: uTuan._id.toString(), content: 'PAW Home ơi, mình muốn mua thức ăn cho chó nhà mình trên shop. Shop có giao hàng đến Sơn Trà không ạ?', isFromAdmin: false, createdAt: d(2026, 6, 8, 9, 0) },
      { senderId: adminId, content: 'Chào bạn! Shop PAW Home giao hàng toàn Đà Nẵng bao gồm Sơn Trà nhé. Đơn từ 200k được miễn phí ship. Bạn đặt hàng trên website, chọn thanh toán COD hoặc PayOS đều được.', isFromAdmin: true, createdAt: d(2026, 6, 8, 9, 15) },
      { senderId: uTuan._id.toString(), content: 'Tuyệt! Mình đang xem sản phẩm Pedigree Adult cho chó Mix 15kg. Nên cho ăn bao nhiêu g/ngày ạ?', isFromAdmin: false, createdAt: d(2026, 6, 8, 9, 20) },
      { senderId: adminId, content: 'Theo khuyến cáo nhà sản xuất: Chó 15kg nên cho ăn khoảng 210-250g/ngày chia 2 bữa sáng-tối. Bạn điều chỉnh tuỳ theo mức độ vận động nhé!', isFromAdmin: true, createdAt: d(2026, 6, 8, 9, 30) },
      { senderId: uTuan._id.toString(), content: 'Cảm ơn bạn nhiều! Mình đặt 2 túi Pedigree và 1 bộ bóng đồ chơi luôn nhé 😄', isFromAdmin: false, createdAt: d(2026, 6, 8, 9, 35) },
    ],
  },
  {
    roomId: uHang._id.toString(),
    msgs: [
      { senderId: uHang._id.toString(), content: 'Xin chào PAW Home! Mình là bác sĩ thú y, muốn hỏi về khả năng hợp tác khám sức khoẻ định kỳ cho các bé thú cưng tại trung tâm cứu hộ. Liên hệ người phụ trách được không ạ?', isFromAdmin: false, createdAt: d(2026, 6, 4, 11, 0) },
      { senderId: adminId, content: 'Chào bác sĩ Hằng! Rất vui khi nhận được đề xuất hợp tác. Chúng mình rất cần sự hỗ trợ chuyên môn từ các bác sĩ thú y. Bạn có thể chia sẻ thêm về hình thức hợp tác mà bạn dự kiến không ạ?', isFromAdmin: true, createdAt: d(2026, 6, 4, 11, 30) },
      { senderId: uHang._id.toString(), content: 'Mình đề xuất khám sức khoẻ miễn phí cho các bé mới về trung tâm, và tư vấn online cho người nhận nuôi khi cần. Đổi lại PAW có thể giới thiệu phòng khám của mình đến người nhận nuôi.', isFromAdmin: false, createdAt: d(2026, 6, 4, 11, 40) },
      { senderId: adminId, content: 'Thật tuyệt vời! Đây chính xác là loại hợp tác chúng mình đang tìm kiếm. Mình sẽ chuyển thông tin cho ban quản lý và liên hệ lại trong vòng 2 ngày làm việc nhé!', isFromAdmin: true, createdAt: d(2026, 6, 4, 11, 50) },
      { senderId: uHang._id.toString(), content: 'Cảm ơn! Mình cũng đang chia sẻ nhiều bài về sức khoẻ thú cưng trên cộng đồng PAW, mong giúp ích được cho mọi người.', isFromAdmin: false, createdAt: d(2026, 6, 4, 12, 0) },
      { senderId: adminId, content: 'Bác sĩ chia sẻ rất chất lượng, nhiều thành viên đã comment cảm ơn rồi! Mình sẽ liên hệ sớm! 🙏', isFromAdmin: true, createdAt: d(2026, 6, 4, 12, 15) },
    ],
  },
];

for (const room of chatRooms) {
  const docs = room.msgs.map(m => ({
    roomId: room.roomId, senderId: m.senderId, content: m.content,
    isFromAdmin: m.isFromAdmin, isRead: true, createdAt: m.createdAt,
  }));
  await ChatMessage.insertMany(docs);
}
console.log('  ✅ chat messages\n');

// ══════════════════════════════════════════════════════════════════════════════
// 8. NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
console.log('🔔 Tạo notifications...');

await Notification.insertMany([
  { userId: uLan._id,  type: 'adoption', title: 'Đơn nhận nuôi được duyệt! 🎉', body: 'Chúc mừng! Đơn đăng ký nhận nuôi bé Cún Vàng của bạn đã được phê duyệt. Chúng tôi sẽ liên hệ để sắp xếp lịch nhận bé.', link: '/history', read: true,  createdAt: d(2026, 6, 3, 10, 0) },
  { userId: uNam._id,  type: 'adoption', title: 'Đơn nhận nuôi được duyệt! 🎉', body: 'Chúc mừng! Đơn đăng ký nhận nuôi bé Luna của bạn đã được phê duyệt. Vui lòng đến trạm cứu hộ để nhận bé.', link: '/history', read: true,  createdAt: d(2026, 6, 7, 11, 0) },
  { userId: uKhoa._id, type: 'adoption', title: 'Đơn nhận nuôi được duyệt! 🎉', body: 'Chúc mừng! Đơn đăng ký nhận nuôi bé Mochi của bạn đã được phê duyệt. Chúng tôi sẽ giao bé đến địa chỉ của bạn.', link: '/history', read: true,  createdAt: d(2026, 6, 5, 9, 0) },
  { userId: uNgoc._id, type: 'adoption', title: 'Đơn nhận nuôi chưa được duyệt', body: 'Hồ sơ nhận nuôi bé Kitty cần bổ sung thêm kinh nghiệm chăm sóc thú cưng. Vui lòng liên hệ qua chat để được tư vấn chi tiết.', link: '/history', read: true,  createdAt: d(2026, 6, 6, 15, 0) },
  { userId: uLan._id,  type: 'system',   title: '⏰ Nhắc nhở nhiệm vụ tuần 2', body: 'Đã đến tuần 2 của hành trình theo dõi bé Cún Vàng! Hãy đăng bài có ảnh cập nhật lên Cộng đồng để hoàn thành nhiệm vụ.', link: '/community', read: false, createdAt: d(2026, 6, 10, 9, 0) },
  { userId: uKhoa._id, type: 'system',   title: '⏰ Nhắc nhở nhiệm vụ tuần 2', body: 'Đã đến tuần 2 của hành trình theo dõi bé Mochi! Hãy đăng bài cập nhật tình trạng của bé nhé.', link: '/community', read: false, createdAt: d(2026, 6, 10, 9, 0) },
  { userId: uTuan._id, type: 'order',    title: 'Đơn hàng đã xác nhận ✅', body: 'Đơn hàng Pedigree Adult + Bóng đồ chơi của bạn đã được xác nhận. Dự kiến giao hàng trong 1-2 ngày.', link: '/history', read: true, createdAt: d(2026, 6, 9, 10, 0) },
  { userId: uHung._id, type: 'system',   title: '🐾 Chào mừng đến PAW Home!',  body: 'Cảm ơn bạn đã tham gia cộng đồng PAW Home. Khám phá các bé thú cưng đang chờ mái ấm mới và chia sẻ tình yêu thương với cộng đồng!', link: '/pets', read: false, createdAt: d(2026, 6, 3, 8, 0) },
]);

console.log('  ✅ notifications\n');

// ══════════════════════════════════════════════════════════════════════════════
await mongoose.disconnect();
console.log('════════════════════════════════════════════');
console.log('✅  SEED HOÀN THÀNH!');
console.log('════════════════════════════════════════════');
console.log(`👥  16 users`);
console.log(`🐾  ${pets.length} pets (6 sẵn sàng, 3 đang theo dõi)`);
console.log(`🛍   ${products.length} products`);
console.log('📋  6 adoptions (2 FollowUp, 1 Approved, 2 Pending, 1 Rejected)');
console.log('💰  1 donation · 200k (chiến dịch nhận nuôi miễn phí)   ');
console.log(`📝  ${posts.length} community posts`);
console.log('💬  5 chat rooms');
console.log('🔔  8 notifications');
console.log('════════════════════════════════════════════\n');
console.log('🔑  Tất cả users login với password: Matkhau123@');
