import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Product from '../models/Product.js';
import Donation from '../models/Donation.js';
import Post from '../models/Post.js';

dotenv.config();

const petsMock = [
  {
    name: 'Milo',
    breed: 'Golden Retriever',
    age: '2 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Hanoi Pet Rescue',
    description: 'Năng động, thân thiện và rất quấn người.',
    status: 'Ready',
    tags: ['Thân thiện', 'Đã tiêm phòng', 'Năng động'],
    aiMatching: 98,
    story: 'Milo được tìm thấy lạc bước ở khu vực công viên Thống Nhất. Sau 3 tháng tại trung tâm cứu hộ, chú đã sẵn sàng để về với gia đình mới. Milo rất thích chơi bóng và đi dạo vào sáng sớm.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Luna',
    breed: 'Mèo Xiêm',
    age: '1.5 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1513245538231-152046ad2446?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Saigon Cat Rescue',
    description: 'Trầm tính, thích ngủ và rất tình cảm.',
    status: 'Ready',
    tags: ['Điềm tĩnh', 'Tình cảm', 'Mèo ta'],
    aiMatching: 85,
    story: 'Luna bị chủ cũ bỏ rơi trong hộp các-tông bên đường khi mới 2 tháng tuổi. Hiện em đã phát triển khoẻ mạnh, lanh lợi, cực kỳ thích chui vào lòng người ngủ và cọ đầu làm nũng.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: false }
  },
  {
    name: 'Cooper',
    breed: 'Corgi',
    age: '3 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Da Nang Pet Aid',
    description: 'Thông minh, ham học hỏi và thích chạy nhảy.',
    status: 'Treatment',
    tags: ['Thông minh', 'Đang điều trị', 'Năng động'],
    aiMatching: 75,
    story: 'Cooper đang được chăm sóc và điều trị viêm da dị ứng tại trạm cứu hộ miền Trung. Bé rất ngoan, hợp tác tốt với bác sĩ thú y khi bôi thuốc và ăn uống khoẻ mạnh.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Bella',
    breed: 'Mèo Anh Lông Ngắn',
    age: '1 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Hanoi Pet Rescue',
    description: 'Bộ lông xám tro dày mượt, rất quý phái và ngoan ngoãn.',
    status: 'Ready',
    tags: ['Điềm tĩnh', 'Bé Gái', 'Mèo Tây'],
    aiMatching: 92,
    story: 'Bella đi lạc ở khu đô thị Times City, dù đã đăng tin tìm chủ cũ nhưng không ai nhận lại. Em ăn hạt rất ngoan, biết đi vệ sinh đúng chậu cát và cực kỳ sạch sẽ.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Rocky',
    breed: 'Siberian Husky',
    age: '2.5 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Saigon Pet Rescue',
    description: 'Mắt xanh quyến rũ, thích hú theo nhạc và thân thiện.',
    status: 'Ready',
    tags: ['Ngáo', 'Husky', 'Ngộ nghĩnh'],
    aiMatching: 89,
    story: 'Rocky ban đầu có tính khí bướng bỉnh nhưng sau 4 tháng huấn luyện tại trạm, bé đã biết nghe các lệnh cơ bản: Ngồi, nằm, bắt tay. Rocky vô cùng yêu thích trẻ em.',
    healthInfo: { vaccinated: true, neutered: false, microchipped: true }
  },
  {
    name: 'Daisy',
    breed: 'Poodle',
    age: '8 tháng',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Da Nang Pet Aid',
    description: 'Bộ lông xoăn màu nâu đỏ, bé nhỏ lanh lợi.',
    status: 'Ready',
    tags: ['Quấn người', 'Nhỏ nhắn', 'Tình cảm'],
    aiMatching: 95,
    story: 'Daisy bị đi lạc ngoài chợ lớn trong trời mưa rét, được các bạn tình nguyện viên cứu trợ về sấy khô và chăm sóc. Em lanh lợi như một đứa trẻ, thích nằm ngửa để được xoa bụng.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: false }
  },
  {
    name: 'Max',
    breed: 'Chihuahua',
    age: '4 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Hanoi Pet Rescue',
    description: 'Dũng cảm, trung thành và bảo vệ chủ cực tốt.',
    status: 'Adopted',
    tags: ['Trung thành', 'Chihuahua', 'Đã nhận nuôi'],
    aiMatching: 80,
    story: 'Max đã được một gia đình bác sĩ tại quận Tây Hồ nhận nuôi. Bé đang có một cuộc sống cực kỳ sung túc và thường xuyên đi du lịch cùng chủ mới.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Lucy',
    breed: 'Mèo Tam Thể',
    age: '2 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'PAW Home Rescue',
    description: 'Mang sắc lông tam thể may mắn, bắt chuột giỏi.',
    status: 'Ready',
    tags: ['Bắt chuột', 'May mắn', 'Nhanh nhẹn'],
    aiMatching: 86,
    story: 'Lucy được cứu khỏi một công trường xây dựng đang dỡ bỏ. Em rất tự lập, không kén ăn và biết tự chơi đùa với các cuộn len nhỏ.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: false }
  },
  {
    name: 'Charlie',
    breed: 'Pug',
    age: '1.5 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Saigon Pet Rescue',
    description: 'Mặt nhăn ngộ nghĩnh, tham ăn và đáng yêu.',
    status: 'Treatment',
    tags: ['Ngộ nghĩnh', 'Tham ăn', 'Đang chữa trị'],
    aiMatching: 78,
    story: 'Charlie đang điều trị viêm tai giữa. Hàng ngày em đều được nhỏ thuốc và bổ sung thêm vitamin tăng đề kháng. Bé cực kỳ háu ăn, hễ thấy đồ ăn là vẫy đuôi không ngừng.',
    healthInfo: { vaccinated: false, neutered: false, microchipped: true }
  },
  {
    name: 'Coco',
    breed: 'Mèo Ba Tư',
    age: '3 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Hanoi Pet Rescue',
    description: 'Lông trắng muốt bông xù, thích chải chuốt.',
    status: 'Ready',
    tags: ['Quý phái', 'Lông xù', 'Trầm tính'],
    aiMatching: 90,
    story: 'Coco là một bé mèo Ba Tư thuần chủng bị bỏ rơi. Ban đầu em khá nhút nhát nhưng giờ đã chịu cho tình nguyện viên chải lông hàng ngày và thích ngắm mưa qua cửa sổ.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Toby',
    breed: 'Beagle',
    age: '2 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'PAW Home Rescue',
    description: 'Thính giác nhạy bén, tai dài rủ xuống, rất ham chơi.',
    status: 'Ready',
    tags: ['Mũi thính', 'Thân thiện', 'Beagle'],
    aiMatching: 93,
    story: 'Toby rất năng động và yêu thích các trò chơi tìm đồ vật bằng mũi. Bé thích hợp với các gia đình có sân vườn hoặc người chủ đam mê chạy bộ dạo công viên.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Mimi',
    breed: 'Mèo Mướp',
    age: '6 tháng',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'PAW Home Rescue',
    description: 'Kẻ sọc tinh nghịch, nhanh nhẹn, săn mồi siêu đẳng.',
    status: 'Ready',
    tags: ['Nghịch ngợm', 'Lanh lợi', 'Dễ nuôi'],
    aiMatching: 87,
    story: 'Mimi đi lạc trên mái nhà và bị kẹt suốt 2 ngày trước khi được các anh cứu hộ trèo lên đưa xuống. Em rất hiếu động, thích leo trèo và vồ bắt các chấm laser đỏ.',
    healthInfo: { vaccinated: true, neutered: false, microchipped: false }
  },
  {
    name: 'Buddy',
    breed: 'Shiba Inu',
    age: '3 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Saigon Pet Rescue',
    description: 'Gương mặt cười hạnh phúc đặc trưng của dòng Shiba.',
    status: 'Ready',
    tags: ['Cười tươi', 'Shiba', 'Thông minh'],
    aiMatching: 94,
    story: 'Buddy bị chủ cũ chuyển nhà sang nước ngoài bỏ lại. Bé rất sạch sẽ, có thói quen tự liếm láp chân và chỉ đi vệ sinh ở bãi cỏ ngoài trời.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Lola',
    breed: 'Mèo Munchkin',
    age: '1 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Da Nang Pet Aid',
    description: 'Bốn chân ngắn ngủn vô cùng hài hước, mắt to tròn.',
    status: 'Ready',
    tags: ['Chân ngắn', 'Mắt tròn', 'Cực đáng yêu'],
    aiMatching: 96,
    story: 'Lola lùn nhưng di chuyển cực nhanh. Bé thích chạy vòng quanh nhà và trốn tìm dưới gầm giường. Lola ăn hạt và pate rất khỏe.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Oliver',
    breed: 'Cocker Spaniel',
    age: '2 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1477884213960-b131f7502b41?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Hanoi Pet Rescue',
    description: 'Tai dài xoăn bồng bềnh, tính cách hiền lành.',
    status: 'Treatment',
    tags: ['Hiền lành', 'Tai xoăn', 'Đang hồi phục'],
    aiMatching: 82,
    story: 'Oliver đang trong giai đoạn hồi phục sau phẫu thuật nối xương đùi do tai nạn giao thông. Bé đang tập đi lại nhẹ nhàng và rất kiên cường.',
    healthInfo: { vaccinated: true, neutered: false, microchipped: true }
  },
  {
    name: 'Lily',
    breed: 'Mèo Ragdoll',
    age: '1.5 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Saigon Cat Rescue',
    description: 'Mắt xanh như ngọc bích, siêu mềm mại ấm áp.',
    status: 'Adopted',
    tags: ['Mắt xanh', 'Ragdoll', 'Đã tìm được nhà'],
    aiMatching: 88,
    story: 'Lily được giải cứu khỏi một hộ gia đình nuôi nhốt số lượng lớn không đảm bảo vệ sinh. Bé đã tìm thấy hạnh phúc mới bên một bạn nữ lập trình viên ấm áp.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Buster',
    breed: 'French Bulldog',
    age: '1 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Da Nang Pet Aid',
    description: 'Ngoại hình cơ bắp ngộ nghĩnh, thích ngủ ngáy.',
    status: 'Ready',
    tags: ['Ủn ỉn', 'Bull Pháp', 'Ham ngủ'],
    aiMatching: 91,
    story: 'Buster là một cậu bé hài hước. Bé có thói quen ngậm đồ chơi đi khắp trạm và nằm ngửa ngủ khò khò phát ra tiếng ngáy nhẹ vô cùng dễ thương.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Nala',
    breed: 'Mèo Bengal',
    age: '2 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1574158622643-69d34d72650a?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Hanoi Pet Rescue',
    description: 'Vân báo hoang dã, leo trèo cực đỉnh và thông minh.',
    status: 'Ready',
    tags: ['Vân báo', 'Năng động', 'Thông minh'],
    aiMatching: 89,
    story: 'Nala có bộ lông gấm vân báo óng ánh tuyệt đẹp. Bé vô cùng hoạt bát, thích chơi đùa với vòi nước chảy và nhảy lên vai các tình nguyện viên để quan sát.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Teddy',
    breed: 'Samoyed',
    age: '3 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1529429617329-84d103655b29?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'PAW Home Rescue',
    description: 'Bộ lông trắng muốt như tuyết, luôn mỉm cười thân thiện.',
    status: 'Ready',
    tags: ['Công chúa tuyết', 'Bông trắng', 'Thân thiện'],
    aiMatching: 97,
    story: 'Teddy được giải cứu từ một trạm nhân giống bỏ hoang. Trái ngược với quá khứ u buồn, chú vô cùng rạng rỡ, thích ôm chầm lấy mọi người và vô cùng ngoan.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  },
  {
    name: 'Chloe',
    breed: 'Mèo Scottish Fold',
    age: '10 tháng',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Saigon Cat Rescue',
    description: 'Đôi tai cụp ngộ nghĩnh, gương mặt tròn xoe như chiếc bánh bao.',
    status: 'Ready',
    tags: ['Tai cụp', 'Tròn trịa', 'Bánh bao'],
    aiMatching: 95,
    story: 'Chloe bị rơi từ ban công chung cư tầng 2 xuống cỏ, may mắn chỉ bị xây xước nhẹ nhưng chủ cũ không tìm kiếm. Bé cực kỳ điềm tĩnh, thích ngắm lá rơi và nằm cuộn tròn.',
    healthInfo: { vaccinated: true, neutered: true, microchipped: true }
  }
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pwa_home';
    console.log(`[Seed] Connecting to MongoDB: ${connStr.replace(/:([^@:]+)@/, ':****@')}`);
    await mongoose.connect(connStr);
    console.log('[Seed] Connected. Dropping existing collections...');

    // Clear existing data
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Donation.deleteMany({});
    await Post.deleteMany({});

    console.log('[Seed] Database cleared. Seeding administrators...');

    // 1. Seed default Admin and Users
    const adminSalt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', adminSalt);
    const userPassword = await bcrypt.hash('user123', adminSalt);

    const seededAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@pawhome.vn',
      password: adminPassword,
      phone: '0988888888',
      role: 'admin',
      job: 'Giám đốc hệ thống cứu hộ',
      salary: 'Trên 20 triệu',
      address: '88 Kim Mã, Ba Đình, Hà Nội'
    });

    const seededUser = await User.create({
      name: 'Nguyễn Văn A',
      email: 'usera@gmail.com',
      password: userPassword,
      phone: '0977777777',
      role: 'user',
      job: 'Đi làm',
      salary: '10 - 20 triệu',
      address: '22 Hàng Bông, Hoàn Kiếm, Hà Nội'
    });

    console.log('[Seed] Seeded default administrator (admin@pawhome.vn / admin123)');
    console.log('[Seed] Seeded default user (usera@gmail.com / user123)');

    // 2. Seed 20 Pets
    console.log(`[Seed] Seeding ${petsMock.length} realistic pet profiles...`);
    const seededPets = await Pet.insertMany(petsMock);
    console.log(`[Seed] Successfully seeded all 20 pets.`);

    // 3. Seed some default Donations
    console.log('[Seed] Seeding sample donations...');
    const petCooper = seededPets.find(p => p.name === 'Cooper');
    const petOliver = seededPets.find(p => p.name === 'Oliver');

    await Donation.create([
      {
        petId: petCooper ? petCooper._id : null,
        userId: seededUser._id,
        donorName: 'Nguyễn Văn A',
        amount: 200000,
        message: 'Thương bé Cooper đang chữa trị da quá. Mong con mau khoẻ để về nhà mới!'
      },
      {
        petId: petOliver ? petOliver._id : null,
        userId: null,
        donorName: 'Phạm Minh Trí',
        amount: 500000,
        message: 'Ủng hộ bé Oliver tai dài bồi bổ sau phẫu thuật nối xương nhé trạm cứu hộ.'
      },
      {
        petId: null,
        userId: null,
        donorName: 'Mạnh thường quân ẩn danh',
        amount: 1000000,
        message: 'Gửi quỹ chung của trạm cứu hộ để mua thức ăn và cát vệ sinh cho các bé mèo.'
      }
    ]);
    console.log('[Seed] Seeded donations.');

    // 4. Seed some community posts
    console.log('[Seed] Seeding community posts...');
    const petMilo = seededPets.find(p => p.name === 'Milo');
    
    await Post.create([
      {
        userId: seededUser._id,
        authorName: 'Nguyễn Văn A',
        authorAvatar: 'https://i.pravatar.cc/150?u=seededuser',
        authorIsExpert: false,
        content: 'Hôm nay ghé qua trạm cứu hộ PAW Home bế thử bé Milo đi dạo một vòng công viên. Bé Milo cực kỳ quấn người, thân thiện và năng động luôn. Mọi người ai thích cún hãy qua giao lưu và nhận nuôi bé nha!',
        image: petMilo ? petMilo.image : '',
        likes: 124,
        comments: 18
      },
      {
        userId: seededAdmin._id,
        authorName: 'Bác sĩ Lê Minh (PAW Home)',
        authorAvatar: 'https://i.pravatar.cc/150?u=seededadmin',
        authorIsExpert: true,
        content: 'Lưu ý cực kỳ quan trọng về việc chăm sóc thú cưng vào mùa nắng nóng đỉnh điểm sắp tới: Hãy đảm bảo khay nước sạch của các bé luôn đầy, không xích dắt chó đi dạo ngoài đường nhựa nóng giữa trưa để tránh bỏng đệm chân và sốc nhiệt nguy hiểm!',
        image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800',
        likes: 245,
        comments: 32
      }
    ]);
    console.log('[Seed] Seeded community posts.');

    console.log('[Seed] Database seeding process completed successfully! 🎉');
    mongoose.connection.close();
  } catch (error) {
    console.error(`[Seed Error] Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Seed sản phẩm độc lập (gọi khi Product collection trống)
export const seedProducts = async () => {
  const products = [
    { name: 'Hạt Royal Canin Medium Adult 10kg', category: 'Thức ăn', price: 650000, stock: 50, rating: 4.9, isNew: false, description: 'Thức ăn hạt cao cấp cho chó trưởng thành cỡ vừa, giàu protein và vitamin.', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600' },
    { name: 'Pate Whiskas Cá Ngừ cho Mèo (12 gói)', category: 'Thức ăn', price: 120000, stock: 100, rating: 4.7, isNew: true, description: 'Pate cá ngừ thơm ngon cho mèo mọi lứa tuổi, đóng gói tiện lợi.', image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=600' },
    { name: 'Cần câu lông vũ tương tác cho mèo', category: 'Đồ chơi', price: 85000, stock: 200, rating: 4.8, isNew: true, description: 'Cần câu gắn lông vũ đầy màu sắc, kích thích bản năng săn mồi của mèo.', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600' },
    { name: 'Bóng cao su kêu PawBall cho chó', category: 'Đồ chơi', price: 65000, stock: 150, rating: 4.6, isNew: false, description: 'Bóng cao su an toàn, phát ra tiếng kêu vui nhộn khi nhai, size vừa cho chó nhỏ đến trung.', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600' },
    { name: 'Vòng cổ da bò handmade size M', category: 'Phụ kiện', price: 185000, stock: 80, rating: 4.5, isNew: false, description: 'Vòng cổ da bò thật, khóa kim loại chắc chắn, nhiều màu sắc thời trang.', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600' },
    { name: 'Áo len thú cưng PAW Collection', category: 'Phụ kiện', price: 220000, stock: 60, rating: 4.8, isNew: true, description: 'Áo len mùa đông cho chó mèo, chất liệu cotton mềm mại, giữ ấm tốt.', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600' },
    { name: 'Sữa tắm Bio-Groom cho chó lông dài', category: 'Vệ sinh', price: 145000, stock: 90, rating: 4.7, isNew: false, description: 'Sữa tắm chuyên dụng cho chó lông dài, giúp lông mềm mượt, thơm lâu và chống rối.', image: 'https://images.unsplash.com/photo-1512237798647-84b57b22b517?auto=format&fit=crop&q=80&w=600' },
    { name: 'Cát vệ sinh tofu mèo 6L (không mùi)', category: 'Vệ sinh', price: 98000, stock: 200, rating: 4.9, isNew: false, description: 'Cát đậu nành tự nhiên, kết cục tốt, không bụi, an toàn cho mèo liếm chân.', image: 'https://images.unsplash.com/photo-1574158622643-69d34d72650a?auto=format&fit=crop&q=80&w=600' },
    { name: 'Nhà gỗ thú cưng 2 tầng Premium', category: 'Phụ kiện', price: 890000, stock: 20, rating: 4.9, isNew: true, description: 'Nhà gỗ thông 2 tầng sang trọng cho chó mèo nhỏ, dễ lắp ráp, bền đẹp.', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600' },
    { name: 'Bánh thưởng xương da cừu sấy khô', category: 'Thức ăn', price: 75000, stock: 300, rating: 4.6, isNew: false, description: 'Bánh thưởng 100% da cừu thiên nhiên sấy khô, tốt cho răng và tiêu hóa của chó.', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600' },
    { name: 'Bình nước uống tự động 2L inox', category: 'Phụ kiện', price: 310000, stock: 45, rating: 4.7, isNew: true, description: 'Đài nước tự động inox 304, lọc than hoạt tính, giữ nước luôn sạch và mát.', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600' },
    { name: 'Lược chải lông FURminator Size S', category: 'Vệ sinh', price: 259000, stock: 70, rating: 4.8, isNew: false, description: 'Lược chải lông chuyên dụng giúp loại bỏ lông rụng hiệu quả, không gây đau cho thú cưng.' , image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=600' }
  ];
  await Product.insertMany(products);
  console.log(`[Seed] Seeded ${products.length} products.`);
};

// Run the script directly if invoked
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedDB();
}

export default seedDB;
