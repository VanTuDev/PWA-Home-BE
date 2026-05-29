import Product from '../models/Product.js';

// @desc  GET /api/products  — public, with filters
export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category:    { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'Tất cả') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest:     { createdAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { rating: -1 },
      bestseller: { soldCount: -1 }
    };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const products = await Product.find(query).sort(sortOpt);
    return res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error.message);
    return res.status(500).json({ message: 'Lỗi khi tải sản phẩm.' });
  }
};

// @desc  GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi tải sản phẩm.' });
  }
};

// @desc  POST /api/products  — admin/manager
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, isNew, rating } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Tên và giá là bắt buộc.' });

    let image = req.file
      ? (req.file.path || `/uploads/${req.file.filename}`)
      : (req.body.image || '');

    const product = await Product.create({
      name, description: description || '', category: category || 'Khác',
      price:  Number(price),
      stock:  Number(stock)  || 0,
      rating: Number(rating) || 5,
      isNew:  isNew === 'true' || isNew === true,
      image
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error.message);
    return res.status(500).json({ message: 'Lỗi khi tạo sản phẩm.' });
  }
};

// @desc  PUT /api/products/:id  — admin/manager
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });

    const { name, description, category, price, stock, isNew, rating } = req.body;
    if (name        !== undefined) product.name        = name;
    if (description !== undefined) product.description = description;
    if (category    !== undefined) product.category    = category;
    if (price       !== undefined) product.price       = Number(price);
    if (stock       !== undefined) product.stock       = Number(stock);
    if (rating      !== undefined) product.rating      = Number(rating);
    if (isNew       !== undefined) product.isNew       = isNew === 'true' || isNew === true;
    if (req.file)        product.image = req.file.path || `/uploads/${req.file.filename}`;
    else if (req.body.image) product.image = req.body.image;

    const updated = await product.save();
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm.' });
  }
};

// @desc  DELETE /api/products/:id  — admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    await product.deleteOne();
    return res.status(200).json({ message: 'Đã xóa sản phẩm.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi xóa sản phẩm.' });
  }
};
