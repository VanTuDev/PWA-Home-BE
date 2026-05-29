import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  donorName: {
    type: String,
    required: true,
    default: 'Mạnh thường quân ẩn danh'
  },
  amount: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Configure Virtual field to return string id instead of _id for easy frontend consumption
donationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

donationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model('Donation', donationSchema);
