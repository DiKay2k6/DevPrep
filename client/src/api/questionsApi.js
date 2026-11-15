import { getSolvedQuestionIds } from '../utils/storage.js';
import axiosClient from './axiosClient.js';

export async function getQuestions(filters = {}) {
  const {
    level = 'All',
    category = 'All',
    type = 'All',
    onlyMySkills = false,
    selectedSkills = [],
    articleId = '',
    searchQuery = '',
  } = filters;

  const params = {};
  if (level && level !== 'All') params.level = level;
  if (category && category !== 'All') params.category = category;
  if (type && type !== 'All') params.type = type;
  if (onlyMySkills) {
    if (Array.isArray(selectedSkills) && selectedSkills.length > 0) {
      params.skills = selectedSkills.join(',');
    } else {
      params.matchMySkills = 'true';
    }
  }
  if (articleId) params.articleId = articleId;
  if (searchQuery && searchQuery.trim()) params.q = searchQuery.trim();

  const res = await axiosClient.get('/questions', { params });
  const localSolvedIds = getSolvedQuestionIds();
  const items = Array.isArray(res.data) ? res.data : [];

  return items.map((q) => ({
    ...q,
    isSolved: Boolean(q.isSolved) || localSolvedIds.includes(q._id),
  }));
}

export async function getQuestionById(questionId) {
  const res = await axiosClient.get(
    `/questions/${encodeURIComponent(questionId)}`
  );
  const localSolvedIds = getSolvedQuestionIds();
  const data = res.data;

  return {
    ...data,
    question: {
      ...data.question,
      isSolved:
        Boolean(data.question?.isSolved) ||
        localSolvedIds.includes(data.question?._id),
    },
  };
}

export async function contributeQuestion(payloadData) {
  const res = await axiosClient.post('/questions', payloadData);
  return {
    question: res.data,
    message: res.message,
  };
}

export async function getAdminModerationQuestions(status = 'All') {
  const res = await axiosClient.get('/admin/questions', {
    params: { status },
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function moderateQuestion(questionId, newStatus) {
  const res = await axiosClient.patch(
    `/admin/questions/${encodeURIComponent(questionId)}/status`,
    { status: newStatus }
  );
  return {
    question: res.data,
    message: res.message,
  };
}
