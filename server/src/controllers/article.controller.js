import {
  getArticleDetailBySlug,
  listArticles,
  toggleUserCompletedArticle,
} from '../services/article.service.js';
import { getUserProfileById } from '../services/auth.service.js';

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

export async function getArticles(req, res, next) {
  try {
    const { level, category, skills, matchMySkills, q, page, limit } = req.query;
    let skillList = parseSkillsQuery(skills);

    // Nếu người dùng truyền cờ matchMySkills=true và đã xác thực JWT, lấy selectedSkills trong hồ sơ
    if (
      skillList.length === 0 &&
      (matchMySkills === 'true' || matchMySkills === '1') &&
      req.user?.id
    ) {
      const profile = await getUserProfileById(req.user.id);
      skillList = profile.selectedSkills || [];
    }

    const result = await listArticles({
      level,
      category,
      skills: skillList,
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

export async function getArticleBySlug(req, res, next) {
  try {
    const detail = await getArticleDetailBySlug(
      req.params.slug,
      req.user?.id || null
    );
    return res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (err) {
    return next(err);
  }
}

export async function toggleCompleteArticle(req, res, next) {
  try {
    const result = await toggleUserCompletedArticle(
      req.user.id,
      req.params.articleId
    );
    return res.status(200).json({
      success: true,
      message: result.isCompleted
        ? 'Đã đánh dấu hoàn thành bài học.'
        : 'Đã bỏ đánh dấu hoàn thành bài học.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}
