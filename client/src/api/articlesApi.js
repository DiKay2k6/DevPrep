import {
  getCompletedArticleIds,
  setCompletedArticleIds,
} from '../utils/storage.js';
import axiosClient from './axiosClient.js';

export async function getArticles(filters = {}) {
  const {
    level = 'All',
    category = 'All',
    onlyMySkills = false,
    selectedSkills = [],
    searchQuery = '',
  } = filters;

  const params = {};
  if (level && level !== 'All') params.level = level;
  if (category && category !== 'All') params.category = category;
  if (onlyMySkills) {
    if (Array.isArray(selectedSkills) && selectedSkills.length > 0) {
      params.skills = selectedSkills.join(',');
    } else {
      params.matchMySkills = 'true';
    }
  }
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }

  const res = await axiosClient.get('/articles', { params });
  const localCompletedIds = getCompletedArticleIds();
  const items = Array.isArray(res.data) ? res.data : [];

  return items.map((art) => ({
    ...art,
    isCompleted:
      Boolean(art.isCompleted) || localCompletedIds.includes(art._id),
  }));
}

export async function getArticleBySlug(slug) {
  const res = await axiosClient.get(`/articles/${encodeURIComponent(slug)}`);
  const localCompletedIds = getCompletedArticleIds();
  const article = res.data;

  return {
    ...article,
    isCompleted:
      Boolean(article?.isCompleted) || localCompletedIds.includes(article?._id),
  };
}

export async function toggleArticleCompleted(articleId) {
  const res = await axiosClient.post(
    `/articles/${encodeURIComponent(articleId)}/complete`
  );
  const data = res.data;
  if (Array.isArray(data?.completedArticleIds)) {
    setCompletedArticleIds(data.completedArticleIds);
  } else {
    const current = getCompletedArticleIds();
    const next = data?.isCompleted
      ? [...new Set([...current, articleId])]
      : current.filter((id) => id !== articleId);
    setCompletedArticleIds(next);
  }
  return data;
}
