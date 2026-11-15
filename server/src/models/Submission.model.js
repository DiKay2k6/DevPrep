import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
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
      index: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'fill_blank', 'coding'],
      required: true,
    },
    language: {
      type: String,
      default: null,
    },
    submittedAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Compilation Error',
        'Runtime Error',
        'Time Limit Exceeded',
      ],
      default: 'Accepted',
    },
    passedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 1,
    },
    runtimeMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ userId: 1, questionId: 1, createdAt: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);
