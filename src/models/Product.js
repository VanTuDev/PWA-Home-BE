import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category:    {
    type: String,
    enum: ['Thức ăn', 'Đồ chơi', 'Phụ kiện', 'Vệ sinh', 'Khác'],
    default: 'Khác'
  },
  price:     { type: Number, required: true, min: 0 },
  image:     { type: String, default: '' },
  stock:     { type: Number, default: 0, min: 0 },
  isNew:     { type: Boolean, default: false },
  rating:    { type: Number, default: 5, min: 1, max: 5 },
  soldCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.virtual('id').get(function () { return this._id.toHexString(); });
productSchema.set('toJSON',   { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
