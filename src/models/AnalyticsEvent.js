import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['landing_view', 'pet_view', 'adopt_click', 'bounce'],
    required: true
  },
  visitorId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    default: null
  }
}, {
  timestamps: true
});

analyticsEventSchema.index({ type: 1, createdAt: 1 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
