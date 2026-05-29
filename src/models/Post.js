import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorAvatar: {
    type: String,
    default: 'https://i.pravatar.cc/150'
  },
  authorIsExpert: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Configure Virtual field to return string id instead of _id for easy frontend consumption
postSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

postSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model('Post', postSchema);
