import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['adoption', 'order', 'system'], default: 'system' },
  title:   { type: String, required: true },
  body:    { type: String, default: '' },
  link:    { type: String, default: '' },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.virtual('id').get(function () { return this._id.toHexString(); });
notificationSchema.set('toJSON', { virtuals: true, transform: (_, ret) => { delete ret._id; delete ret.__v; } });

export default mongoose.model('Notification', notificationSchema);
