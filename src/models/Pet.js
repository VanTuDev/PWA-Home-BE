import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  image: {
    type: String,
    required: true
  },
  rescuePartner: {
    type: String,
    default: 'PAW Home Rescue'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Ready', 'Treatment', 'Adopted'],
    default: 'Ready'
  },
  tags: {
    type: [String],
    default: []
  },
  aiMatching: {
    type: Number,
    default: 80
  },
  story: {
    type: String,
    default: ''
  },
  donationAmount: {
    type: Number,
    default: 0
  },
  healthInfo: {
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Configure Virtual field to return string id instead of _id for easy frontend consumption
petSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

petSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model('Pet', petSchema);
