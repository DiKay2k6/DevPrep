import { ARTICLES_MOCK } from '../data/articles.mock.js';
import {
  getCompletedArticleIds,
  getStoredQuestions,
  setCompletedArticleIds,
} from '../utils/storage.js';
import { simulateApiCall } from './axiosClient.js';

export async function getArticles(filters = {}) {
  return simulateApiCall(() => {
    const completedIds = getCompletedArticleIds();
    const {
      level = 'All',
      category = 'All',
      onlyMySkills = false,
      selectedSkills = [],
      searchQuery = '',
    } = filters;

    const q = String(searchQuery || '').trim().toLowerCase();

    return ARTICLES_MOCK.filter((article) => {
      const matchLevel = level === 'All' || article.level === level;
      const matchCat = category === 'All' || article.category === category;
      const matchSkills =
        !onlyMySkills ||
        selectedSkills.length === 0 ||
        article.tags.some((t) => selectedSkills.includes(t));
      const matchQuery =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q));
      return matchLevel && matchCat && matchSkills && matchQuery;
    }).map((art) => ({
      ...art,
      isCompleted: completedIds.includes(art._id),
    }));
  }, 100);
}

export async function getArticleBySlug(slug) {
  return simulateApiCall(() => {
    const completedIds = getCompletedArticleIds();
    const allQuestions = getStoredQuestions();
    const article =
      ARTICLES_MOCK.find((item) => item.slug === slug) || ARTICLES_MOCK[0];

    const relatedQuestions = allQuestions.filter(
      (q) =>
        q.status === 'approved' &&
        (article.questionIds.includes(q._id) ||
          q.relatedArticleId === article._id)
    );

    return {
      ...article,
      isCompleted: completedIds.includes(article._id),
      relatedQuestions,
    };
  }, 100);
}

export async function toggleArticleCompleted(articleId) {
  return simulateApiCall(() => {
    const current = getCompletedArticleIds();
    const exists = current.includes(articleId);
    const updated = exists
      ? current.filter((id) => id !== articleId)
      : [...current, articleId];

    setCompletedArticleIds(updated);
    return {
      articleId,
      isCompleted: !exists,
      totalCompleted: updated.length,
    };
  }, 90);
}
