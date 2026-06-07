import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  phone:    { type: String, required: true, trim: true },
  role:     { type: String, enum: ['admin', 'manager', 'staff', 'user'], default: 'user' },
  job:      { type: String, default: 'Chưa cập nhật' },
  salary:   { type: String, default: 'Chưa cập nhật' },
  address:  { type: String, default: 'Chưa cập nhật' },
  bio:      { type: String, default: '', maxlength: 300 },
  avatar:   { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  cccdFront:  { type: String, default: '' },
  cccdBack:   { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
