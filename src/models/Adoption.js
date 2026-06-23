import mongoose from 'mongoose';

const trackingReportSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  image: { type: String, required: true },
  comment: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});

const adoptionSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  facebookLink: {
    type: String,
    default: ''
  },
  job: {
    type: String,
    enum: ['Sinh viên', 'Đi làm', 'Khác'],
    default: 'Đi làm'
  },
  monthlyIncome: {
    type: String,
    default: '5 - 10 triệu'
  },
  address: {
    type: String,
    required: true
  },
  housingType: {
    type: String,
    enum: ['Căn hộ', 'Nhà phố', 'Sân vườn', 'Phòng trọ'],
    default: 'Nhà phố'
  },
  experience: {
    type: String,
    default: 'Chưa từng nuôi'
  },
  reason: {
    type: String,
    default: ''
  },
  idCardFront: {
    type: String,
    default: ''
  },
  idCardBack: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'FollowUp'],
    default: 'Pending'
  },
  approvedAt: {
    type: Date,
    default: null
  },
  deliveryOption: {
    type: String,
    enum: ['pickup', 'shipping'],
    default: 'pickup'
  },
  trackingReports: [trackingReportSchema]
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' }
});

// Configure Virtual field to return string id instead of _id for easy frontend consumption
adoptionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

adoptionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model('Adoption', adoptionSchema);
