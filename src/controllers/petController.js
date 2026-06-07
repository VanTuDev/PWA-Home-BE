import Pet from '../models/Pet.js';
import { ask, parseJSON, hasApiKey } from '../services/geminiService.js';

// @desc    Get all pets (with query filter and search)
// @route   GET /api/pets
// @access  Public
export const getPets = async (req, res) => {
  try {
    const { search, status, breed, gender } = req.query;
    let query = {};

    // Apply Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply Status Filter
    if (status) {
      query.status = status;
    }

    // Apply Breed Filter
    if (breed) {
      query.breed = { $regex: breed, $options: 'i' };
    }

    // Apply Gender Filter
    if (gender) {
      query.gender = gender;
    }

    const pets = await Pet.find(query).sort({ createdAt: -1 });
    return res.status(200).json(pets);
  } catch (error) {
    console.error('Get pets error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách thú cưng.' });
  }
};

// @desc    Get single pet details
// @route   GET /api/pets/:id
// @access  Public
export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Không tìm thấy thú cưng yêu cầu.' });
    }
    return res.status(200).json(pet);
  } catch (error) {
    console.error('Get pet by ID error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Định dạng mã thú cưng không hợp lệ.' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải thông tin thú cưng.' });
  }
};

// @desc    Create a new pet entry
// @route   POST /api/pets
// @access  Private/Admin
export const createPet = async (req, res) => {
  try {
    const { name, breed, age, gender, description, tags, rescuePartner, story, vaccinated, neutered, microchipped } = req.body;

    if (!name || !breed || !age || !gender || !description) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ các trường thông tin cơ bản.' });
    }

    // req.file.path = Cloudinary URL | req.file.filename = local filename
    let image = '';
    if (req.file) {
      image = req.file.path || `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    } else {
      return res.status(400).json({ message: 'Thiếu hình ảnh của bé thú cưng.' });
    }

    // Parse tags (handles either stringified array or native array)
    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        tagsArray = tags.split(',').map(t => t.trim());
      }
    }

    const pet = new Pet({
      name,
      breed,
      age,
      gender,
      image,
      rescuePartner,
      description,
      status: req.body.status || 'Ready',
      tags: tagsArray,
      aiMatching: req.body.aiMatching || Math.floor(Math.random() * 30) + 70,
      story: story || '',
      donationAmount: Number(req.body.donationAmount) || 0,
      healthInfo: {
        vaccinated: vaccinated === 'true' || vaccinated === true,
        neutered: neutered === 'true' || neutered === true,
        microchipped: microchipped === 'true' || microchipped === true
      }
    });

    const createdPet = await pet.save();
    return res.status(201).json(createdPet);
  } catch (error) {
    console.error('Create pet error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo mới thú cưng.' });
  }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Private/Admin
export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Không tìm thấy thú cưng cần xóa.' });
    await pet.deleteOne();
    return res.status(200).json({ message: 'Đã xóa thú cưng thành công.' });
  } catch (error) {
    console.error('Delete pet error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xóa thú cưng.' });
  }
};

// @desc    Match pets to user survey answers using Gemini AI
// @route   POST /api/pets/match
// @access  Public
export const matchPets = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || answers.length < 6) {
      return res.status(400).json({ message: 'Thiếu câu trả lời khảo sát.' });
    }

    // Lấy tất cả pets (ưu tiên Ready, nhưng không bỏ qua pets khác)
    const pets = await Pet.find({}).sort({ status: 1, createdAt: -1 }).lean();
    if (!pets.length) {
      return res.status(200).json([]);
    }

    const petList = pets.map(p => ({
      id: p._id.toString(),
      name: p.name,
      breed: p.breed,
      age: p.age,
      gender: p.gender,
      status: p.status,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      description: p.description || ''
    }));

    let matches = [];

    if (hasApiKey()) {
      const prompt = `Bạn là chuyên gia tư vấn nhận nuôi thú cưng tại Việt Nam.

Thông tin người dùng:
1. Loại thú cưng muốn nuôi: ${answers[0]}
2. Không gian sống: ${answers[1]}
3. Thời gian dành cho thú cưng mỗi ngày: ${answers[2]}
4. Tính cách mong muốn: ${answers[3]}
5. Kinh nghiệm nuôi thú cưng: ${answers[4]}
6. Thành viên gia đình: ${answers[5]}

Danh sách thú cưng trong hệ thống:
${JSON.stringify(petList, null, 2)}

Nhiệm vụ: Phân tích và xếp hạng MỌI thú cưng theo mức độ phù hợp với người dùng.
- Bắt buộc trả về ÍT NHẤT 3 bé có điểm cao nhất, dù điểm thấp.
- Ưu tiên bé có status="Ready" nhưng vẫn xét tất cả.
- score từ 1-100 (không được để trống).
- reason: 1-2 câu ngắn gọn tiếng Việt, giải thích tại sao phù hợp.

Trả về JSON array (không markdown, không giải thích thêm):
[{ "petId": "id_của_bé", "score": 85, "reason": "Lý do phù hợp..." }]

Sắp xếp giảm dần theo score, tối đa 5 bé.`;

      const raw = await ask(prompt);
      matches = parseJSON(raw);
    }

    // Nếu AI không trả về đủ 3 kết quả, bổ sung bằng fallback
    const MINIMUM = 3;
    const matchedIds = new Set(matches.map(m => m.petId));

    if (matches.length < MINIMUM) {
      const remaining = pets
        .filter(p => !matchedIds.has(p._id.toString()))
        .slice(0, MINIMUM - matches.length);
      remaining.forEach((p, i) => {
        matches.push({
          petId: p._id.toString(),
          score: Math.max(50 - i * 5, 40),
          reason: 'Bé này cũng có thể phù hợp với bạn dựa trên các tiêu chí cơ bản.'
        });
      });
    }

    // Enrich với đầy đủ thông tin pet
    const petMap = Object.fromEntries(pets.map(p => [p._id.toString(), p]));
    const result = matches
      .map(m => {
        const pet = petMap[m.petId];
        if (!pet) return null;
        return { pet, score: m.score, reason: m.reason };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Match pets error:', err.message);
    return res.status(500).json({ message: 'Lỗi khi phân tích tương thích.' });
  }
};

// @desc    Update an existing pet details
// @route   PUT /api/pets/:id
// @access  Private/Admin
export const updatePet = async (req, res) => {
  try {
    const { name, breed, age, gender, description, status, tags, rescuePartner, story, vaccinated, neutered, microchipped } = req.body;
    
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Không tìm thấy bé thú cưng cần cập nhật.' });
    }

    // Update simple fields
    if (name) pet.name = name;
    if (breed) pet.breed = breed;
    if (age) pet.age = age;
    if (gender) pet.gender = gender;
    if (description) pet.description = description;
    if (status) pet.status = status;
    if (rescuePartner) pet.rescuePartner = rescuePartner;
    if (story) pet.story = story;

    // Handle Image
    if (req.file) {
      pet.image = req.file.path || `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      pet.image = req.body.image;
    }

    // Handle Tags
    if (tags) {
      try {
        pet.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        pet.tags = tags.split(',').map(t => t.trim());
      }
    }

    // Handle donationAmount
    if (req.body.donationAmount !== undefined) pet.donationAmount = Number(req.body.donationAmount) || 0;

    // Handle Health Info
    if (vaccinated !== undefined) pet.healthInfo.vaccinated = vaccinated === 'true' || vaccinated === true;
    if (neutered !== undefined) pet.healthInfo.neutered = neutered === 'true' || neutered === true;
    if (microchipped !== undefined) pet.healthInfo.microchipped = microchipped === 'true' || microchipped === true;

    const updatedPet = await pet.save();
    return res.status(200).json(updatedPet);
  } catch (error) {
    console.error('Update pet error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật thông tin thú cưng.' });
  }
};
