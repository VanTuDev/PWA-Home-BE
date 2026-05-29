import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      String,
  image:     String,
  price:     Number,
  quantity:  { type: Number, default: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:  [itemSchema],
  shippingInfo: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, default: 'Đà Nẵng' }
  },
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal:             { type: Number, default: 0 },
  discount:             { type: Number, default: 0 },
  total:                { type: Number, default: 0 },
  note:                 { type: String, default: '' },
  vnpayTxnRef:          { type: String, default: '' },
  vnpayTransactionId:   { type: String, default: '' }
}, { timestamps: true });

orderSchema.virtual('id').get(function () { return this._id.toHexString(); });
orderSchema.set('toJSON',   { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.model('Order', orderSchema);
