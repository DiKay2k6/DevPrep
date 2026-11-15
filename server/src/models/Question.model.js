import mongoose from 'mongoose';

/**
 * Question Polymorphic Schema:
 * Hỗ trợ chung 3 định dạng câu hỏi ('mcq' | 'fill_blank' | 'coding') thông qua trường payload động.
 * Đánh Compound Index theo quy tắc ESR: { status: 1, level: 1, category: 1, tags: 1 }
 */
const questionSchema = new mongoose.Schema(
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
    prompt: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'fill_blank', 'coding'],
      required: true,
      index: true,
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
    codeSnippet: {
      type: String,
      default: null,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    explanation: {
      type: String,
      default: '',
    },
    relatedArticleId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Compound Index chuẩn ESR phục vụ lọc đa điều kiện và đề xuất theo nhóm kỹ năng ($in trên tags)
questionSchema.index({ status: 1, level: 1, category: 1, tags: 1 });
questionSchema.index({ status: 1, level: 1, createdAt: -1 });

/**
 * Đảm bảo chống lộ đáp án (Anti-Cheating):
 * Loại bỏ thêm các testCases có isHidden === true trên câu hỏi coding trước khi gửi về Client.
 */
questionSchema.statics.sanitizeForClient = function sanitizeForClient(rawDoc) {
  if (!rawDoc) return null;
  const doc = typeof rawDoc.toObject === 'function' ? rawDoc.toObject() : { ...rawDoc };
  if (doc.payload) {
    const safePayload = { ...doc.payload };
    delete safePayload.correctOptionIds;
    delete safePayload.acceptedAnswers;

    if (Array.isArray(safePayload.testCases)) {
      const totalTestCases = safePayload.testCases.length;
      const publicTestCases = safePayload.testCases.filter(
        (tc) => !tc.isHidden
      );
      safePayload.testCases = publicTestCases;
      safePayload.hiddenTestCasesCount =
        totalTestCases - publicTestCases.length;
    }
    doc.payload = safePayload;
  }
  return doc;
};

export const Question = mongoose.model('Question', questionSchema);
