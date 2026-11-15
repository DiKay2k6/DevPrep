import mongoose from 'mongoose';

const reviewQueueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      ref: 'Question',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'fill_blank', 'coding'],
      required: true,
    },
    level: {
      type: String,
      enum: ['Intern', 'Fresher', 'Junior', 'Middle'],
      required: true,
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Full-stack', 'Mobile', 'Database'],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    currentStage: {
      type: Number,
      min: 1,
      max: 4,
      default: 1,
    },
    intervalDays: {
      type: Number,
      enum: [1, 3, 7, 14],
      default: 1,
    },
    nextReviewAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastAttemptResult: {
      type: String,
      default: 'Vừa làm sai — Cần ôn lại',
    },
  },
  {
    timestamps: true,
  }
);

reviewQueueSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const ReviewQueue = mongoose.model('ReviewQueue', reviewQueueSchema);
