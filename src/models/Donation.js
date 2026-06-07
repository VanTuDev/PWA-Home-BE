import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  petId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', default: null },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  donorName:  { type: String, default: 'Mạnh thường quân ẩn danh' },
  donorEmail: { type: String, default: '' },
  amount:     { type: Number, required: true },
  message:    { type: String, default: '' },
  type:       { type: String, enum: ['general', 'adoption'], default: 'general' },
  status:     { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
  payosOrderCode:     { type: Number, default: 0 },
  payosTransactionId: { type: String, default: '' },
}, { timestamps: true });

donationSchema.virtual('id').get(function () { return this._id.toHexString(); });
donationSchema.set('toJSON', { virtuals: true, transform: (_, ret) => { delete ret._id; delete ret.__v; } });

export default mongoose.model('Donation', donationSchema);
