import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
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
    readingTimeMinutes: {
      type: Number,
      default: 5,
    },
    author: {
      type: String,
      default: 'Ban Chuyên môn DevPrep',
    },
    updatedAtLabel: {
      type: String,
      default: '2026-11-14',
    },
    questionIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

articleSchema.index({ level: 1, category: 1, tags: 1 });

export const Article = mongoose.model('Article', articleSchema);
