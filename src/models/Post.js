import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  content:    { type: String, required: true, maxlength: 500 },
  createdAt:  { type: Date, default: Date.now }
}, { _id: true });

const postSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName:     { type: String, required: true },
  authorAvatar:   { type: String, default: '' },
  authorIsExpert: { type: Boolean, default: false },
  content:        { type: String, required: true, maxlength: 2000 },
  image:          { type: String, default: '' },
  likedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentList:    [commentSchema],
  shares:         { type: Number, default: 0 },
  savedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

postSchema.virtual('id').get(function () { return this._id.toHexString(); });
postSchema.set('toJSON',   { virtuals: true });
postSchema.set('toObject', { virtuals: true });

export default mongoose.model('Post', postSchema);
