import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateId: {
      type: String,
      required: true,
    },
    templateTitle: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['Intern', 'Fresher', 'Junior', 'Middle'],
      required: true,
    },
    track: {
      type: String,
      enum: ['Frontend', 'Backend', 'Full-stack', 'Mobile', 'Database'],
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    scorePercent: {
      type: Number,
      required: true,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    statusBadge: {
      type: String,
      default: '',
    },
    breakdownByFormat: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    questionReviews: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

mockTestSchema.index({ userId: 1, createdAt: -1 });

export const MockTest = mongoose.model('MockTest', mockTestSchema);
