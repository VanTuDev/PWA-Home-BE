import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  roomId:      { type: String, required: true, index: true }, // userId string (mỗi user có 1 phòng)
  senderId:    { type: String, required: true },               // userId hoặc adminId
  content:     { type: String, required: true },
  isFromAdmin: { type: Boolean, default: false },
  isRead:      { type: Boolean, default: false },
}, { timestamps: true });

chatMessageSchema.virtual('id').get(function () { return this._id.toHexString(); });
chatMessageSchema.set('toJSON', { virtuals: true, transform: (_, ret) => { delete ret._id; delete ret.__v; } });

export default mongoose.model('ChatMessage', chatMessageSchema);
