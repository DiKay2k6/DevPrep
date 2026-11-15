import mongoose from 'mongoose';
import { SPACED_REPETITION_QUEUE } from '../../client/src/data/analytics.mock.js';
import { ARTICLES_MOCK } from '../../client/src/data/articles.mock.js';
import { QUESTIONS_MOCK } from '../../client/src/data/questions.mock.js';
import { connectDatabase } from './config/db.js';
import { Article } from './models/Article.model.js';
import { MockTest } from './models/MockTest.model.js';
import { Question } from './models/Question.model.js';
import { ReviewQueue } from './models/ReviewQueue.model.js';
import { Submission } from './models/Submission.model.js';
import { User } from './models/User.model.js';

async function runSeed() {
  try {
    console.log('⏳ [Seed] Đang kết nối tới MongoDB...');
    await connectDatabase();

    // 1. Làm sạch dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Article.deleteMany({}),
      Question.deleteMany({}),
      Submission.deleteMany({}),
      ReviewQueue.deleteMany({}),
      MockTest.deleteMany({}),
    ]);
    console.log('🧹 [Seed] Đã làm sạch các collection cũ.');

    // 2. Tạo 2 tài khoản mẫu (demo@devprep.vn & admin@devprep.vn)
    const demoUser = await User.create({
      fullName: 'Nguyễn Duy Khang',
      email: 'demo@devprep.vn',
      passwordHash: 'DevPrep@2026',
      role: 'user',
      targetLevel: 'Fresher',
      targetTrack: 'Full-stack',
      selectedSkills: [
        'JavaScript',
        'ReactJS',
        'Tailwind CSS',
        'Node.js',
        'MongoDB',
        'Git',
      ],
      bio: 'Ứng viên Full-stack Web đang ôn luyện lộ trình Fresher → Junior trên DevPrep.',
      streak: { currentDays: 12, lastActiveDate: new Date() },
      completedArticleIds: [
        'art_js_event_loop_01',
        'art_mongo_compound_index_02',
      ],
      solvedQuestionIds: [
        'q_mcq_event_loop_01',
        'q_fill_event_loop_02',
        'q_fill_mongo_select_04',
        'q_coding_two_sum_07',
      ],
    });

    const adminUser = await User.create({
      fullName: 'Quản trị viên Chuyên môn DevPrep',
      email: 'admin@devprep.vn',
      passwordHash: 'Admin@2026',
      role: 'admin',
      targetLevel: 'Middle',
      targetTrack: 'Backend',
      selectedSkills: [
        'JavaScript',
        'Node.js',
        'MongoDB',
        'SQL',
        'ReactJS',
        'Python',
        'Java',
      ],
      bio: 'Tài khoản Quản trị viên phụ trách kiểm duyệt ngân hàng câu hỏi và bài viết Study Hub.',
      streak: { currentDays: 30, lastActiveDate: new Date() },
    });

    console.log(
      `👤 [Seed] Đã tạo 2 tài khoản mẫu: ${demoUser.email} (Mật khẩu: DevPrep@2026) & ${adminUser.email} (Mật khẩu: Admin@2026)`
    );

    // 3. Seed toàn bộ Bài viết chuyên sâu (Study Hub)
    const normalizedArticles = ARTICLES_MOCK.map((art) => ({
      _id: art._id,
      title: art.title,
      slug: art.slug,
      summary: art.summary,
      content: art.content,
      level: art.level,
      category: art.category,
      tags: art.tags || [],
      readingTimeMinutes: art.readingTimeMinutes || 8,
      author: art.author || 'Ban Chuyên môn DevPrep',
      updatedAtLabel: art.updatedAt || '2026-11-14',
      questionIds: art.questionIds || [],
    }));
    await Article.insertMany(normalizedArticles);
    console.log(
      `📚 [Seed] Đã nạp ${normalizedArticles.length} bài viết Markdown vào collection articles.`
    );

    // 4. Seed toàn bộ 16 Câu hỏi Polymorphic (4 cấp độ Intern, Fresher, Junior, Middle)
    const normalizedQuestions = QUESTIONS_MOCK.map((q) => ({
      _id: q._id,
      title: q.title,
      prompt: q.prompt,
      type: q.type,
      level: q.level,
      category: q.category,
      tags: q.tags || [],
      codeSnippet: q.codeSnippet || null,
      payload: q.payload,
      explanation: q.explanation || '',
      relatedArticleId: q.relatedArticleId || null,
      status: q.status || 'approved',
      submittedBy: q.submittedBy || adminUser.email,
      submittedAt: q.submittedAt || '2026-11-14 09:00',
    }));
    await Question.insertMany(normalizedQuestions);
    console.log(
      `🧩 [Seed] Đã nạp ${normalizedQuestions.length} câu hỏi đa hình (Polymorphic Schema) vào collection questions.`
    );

    // 5. Seed dữ liệu Lịch sử nộp bài mẫu (Submissions) và Hàng đợi Ôn tập Ngắt quãng (ReviewQueue) cho Demo User
    const sampleSubmissions = [
      {
        userId: demoUser._id,
        questionId: 'q_mcq_event_loop_01',
        type: 'mcq',
        submittedAnswer: ['opt_a', 'opt_c'],
        isCorrect: true,
        status: 'Accepted',
        passedCount: 2,
        totalCount: 2,
        runtimeMs: 0,
      },
      {
        userId: demoUser._id,
        questionId: 'q_coding_longest_substr_08',
        type: 'coding',
        language: 'javascript',
        submittedAnswer: 'function solve(s) { return 0; }',
        isCorrect: false,
        status: 'Wrong Answer',
        passedCount: 1,
        totalCount: 3,
        runtimeMs: 14,
      },
      {
        userId: demoUser._id,
        questionId: 'q_mcq_mongo_esr_03',
        type: 'mcq',
        submittedAnswer: ['opt_b'],
        isCorrect: false,
        status: 'Wrong Answer',
        passedCount: 0,
        totalCount: 1,
        runtimeMs: 0,
      },
      {
        userId: demoUser._id,
        questionId: 'q_coding_two_sum_07',
        type: 'coding',
        language: 'javascript',
        submittedAnswer: 'function solve() {}',
        isCorrect: true,
        status: 'Accepted',
        passedCount: 3,
        totalCount: 3,
        runtimeMs: 12,
      },
      {
        userId: demoUser._id,
        questionId: 'q_fill_event_loop_02',
        type: 'fill_blank',
        submittedAnswer: '1 3 4 2',
        isCorrect: true,
        status: 'Accepted',
        passedCount: 1,
        totalCount: 1,
        runtimeMs: 2,
      },
    ];
    await Submission.insertMany(sampleSubmissions);

    const reviewItems = SPACED_REPETITION_QUEUE.map((item) => ({
      userId: demoUser._id,
      questionId: item.questionId,
      title: item.title,
      type: item.type,
      level: item.level,
      category: item.category,
      tags: item.tags || [],
      currentStage: item.currentStage || 1,
      intervalDays: item.intervalDays || 1,
      nextReviewAt: new Date(),
      lastAttemptResult: item.lastAttemptResult || 'Đến hạn ôn tập',
    }));
    await ReviewQueue.insertMany(reviewItems);

    await MockTest.create({
      userId: demoUser._id,
      templateId: 'tpl_junior_fullstack',
      templateTitle: 'Đề Sát Hạch Kỹ Sư Junior Full-stack MERN',
      level: 'Junior',
      track: 'Full-stack',
      durationMinutes: 45,
      timeSpentSeconds: 1840,
      scorePercent: 83,
      correctCount: 5,
      totalQuestions: 6,
      passingScore: 75,
      statusBadge: 'Đạt chuẩn phỏng vấn (Passed)',
      breakdownByFormat: [
        { format: 'Trắc nghiệm (MCQ)', correct: 3, total: 3, accuracy: 100 },
        { format: 'Điền đáp án / Output', correct: 1, total: 1, accuracy: 100 },
        { format: 'Thực hành Code (Sandbox)', correct: 1, total: 2, accuracy: 50 },
      ],
      questionReviews: [
        {
          questionId: 'q_mcq_event_loop_01',
          title: 'Thứ tự ưu tiên giữa Microtask Queue và Macrotask Queue',
          type: 'mcq',
          tags: ['JavaScript', 'Event Loop'],
          isCorrect: true,
          userAnswerText: 'opt_a, opt_c',
          expectedAnswerText: 'opt_a, opt_c',
          timeSpentSec: 180,
        },
        {
          questionId: 'q_coding_longest_substr_08',
          title: 'Độ dài chuỗi con dài nhất không lặp ký tự (Sliding Window)',
          type: 'coding',
          tags: ['Algorithms', 'Sliding Window'],
          isCorrect: false,
          userAnswerText: 'Wrong Answer (1/4 Test Cases - javascript)',
          expectedAnswerText: '4/4 Test Cases Passed',
          timeSpentSec: 620,
        },
      ],
    });

    console.log(
      `📊 [Seed] Đã nạp ${sampleSubmissions.length} lượt nộp bài, ${reviewItems.length} mục Spaced Repetition & 1 đề thi thử cho tài khoản Demo.`
    );

    console.log('✅ [Seed] Hoàn tất khởi tạo dữ liệu mẫu DevPrep!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed] Lỗi trong quá trình seed dữ liệu:', err);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

runSeed();
