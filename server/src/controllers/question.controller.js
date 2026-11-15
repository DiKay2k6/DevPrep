import { z } from 'zod';
import { getUserProfileById } from '../services/auth.service.js';
import {
  createContributedQuestion,
  getQuestionDetailForPractice,
  listQuestionsForPractice,
} from '../services/question.service.js';

export const createQuestionSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Tiêu đề câu hỏi là bắt buộc.' })
      .trim()
      .min(5, 'Tiêu đề cần tối thiểu 5 ký tự.')
      .max(180),
    type: z.enum(['mcq', 'fill_blank', 'coding']),
    level: z.enum(['Intern', 'Fresher', 'Junior', 'Middle']),
    category: z.enum([
      'Frontend',
      'Backend',
      'Full-stack',
      'Mobile',
      'Database',
    ]),
    tags: z.array(z.string().trim()).min(1, 'Cần gắn ít nhất 1 tag kỹ năng.'),
    prompt: z
      .string({ required_error: 'Nội dung câu hỏi là bắt buộc.' })
      .trim()
      .min(10, 'Nội dung câu hỏi cần tối thiểu 10 ký tự.'),
    codeSnippet: z.string().nullable().optional(),
    payload: z.record(z.any()),
    explanation: z
      .string()
      .trim()
      .min(5, 'Vui lòng cung cấp giải thích đáp án.'),
    relatedArticleId: z.string().nullable().optional(),
  }),
});

function parseSkillsQuery(skillsParam) {
  if (!skillsParam) return [];
  if (Array.isArray(skillsParam)) {
    return skillsParam.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(skillsParam)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getQuestions(req, res, next) {
  try {
    const {
      level,
      category,
      type,
      skills,
      matchMySkills,
      articleId,
      q,
      page,
      limit,
    } = req.query;

    let skillList = parseSkillsQuery(skills);
    if (
      skillList.length === 0 &&
      (matchMySkills === 'true' || matchMySkills === '1') &&
      req.user?.id
    ) {
      const profile = await getUserProfileById(req.user.id);
      skillList = profile.selectedSkills || [];
    }

    const result = await listQuestionsForPractice({
      level,
      category,
      type,
      skills: skillList,
      articleId,
      q,
      page,
      limit,
      userId: req.user?.id || null,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getQuestionById(req, res, next) {
  try {
    const result = await getQuestionDetailForPractice(
      req.params.questionId,
      req.user?.id || null
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function contributeQuestion(req, res, next) {
  try {
    const created = await createContributedQuestion(req.user, req.body);
    return res.status(201).json({
      success: true,
      message:
        req.user.role === 'admin'
          ? 'Câu hỏi đã được xuất bản trực tiếp vào ngân hàng đề.'
          : 'Câu hỏi đã được gửi vào hàng đợi kiểm duyệt của Admin.',
      data: created,
    });
  } catch (err) {
    return next(err);
  }
}
