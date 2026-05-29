import Pet from '../models/Pet.js';

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
