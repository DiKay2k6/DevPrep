import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'contributor', 'admin'],
      default: 'user',
      index: true,
    },
    targetLevel: {
      type: String,
      enum: ['Intern', 'Fresher', 'Junior', 'Middle'],
      default: 'Fresher',
    },
    targetTrack: {
      type: String,
      enum: ['Frontend', 'Backend', 'Full-stack', 'Mobile', 'Database'],
      default: 'Full-stack',
    },
    selectedSkills: {
      type: [String],
      default: ['JavaScript', 'ReactJS', 'Tailwind CSS', 'Node.js', 'MongoDB'],
    },
    bio: {
      type: String,
      default: 'Ứng viên đang ôn luyện phỏng vấn kỹ thuật trên DevPrep.',
      maxlength: 300,
    },
    streak: {
      currentDays: { type: Number, default: 1 },
      lastActiveDate: { type: Date, default: Date.now },
    },
    completedArticleIds: {
      type: [String],
      default: [],
    },
    solvedQuestionIds: {
      type: [String],
      default: [],
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPasswordIfModified(next) {
  if (!this.isModified('passwordHash')) return next();
  // Nếu passwordHash chưa phải chuỗi bcrypt ($2a$ / $2b$) thì tiến hành băm
  if (!/^\$2[aby]\$/.test(this.passwordHash)) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(
  plainPassword
) {
  return bcrypt.compare(String(plainPassword || ''), this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
