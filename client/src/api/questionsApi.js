import { ARTICLES_MOCK } from '../data/articles.mock.js';
import {
  getSolvedQuestionIds,
  getStoredQuestions,
  setStoredQuestions,
} from '../utils/storage.js';
import { simulateApiCall } from './axiosClient.js';

export async function getQuestions(filters = {}) {
  return simulateApiCall(() => {
    const allQuestions = getStoredQuestions();
    const solvedIds = getSolvedQuestionIds();
    const {
      status = 'approved',
      level = 'All',
      category = 'All',
      type = 'All',
      onlyMySkills = false,
      selectedSkills = [],
      articleId = '',
      searchQuery = '',
    } = filters;

    const linkedArticle = articleId
      ? ARTICLES_MOCK.find((a) => a._id === articleId)
      : null;
    const kw = String(searchQuery || '').trim().toLowerCase();

    return allQuestions
      .filter((q) => {
        const matchStatus = status === 'All' || q.status === status;
        const matchLevel = level === 'All' || q.level === level;
        const matchCat = category === 'All' || q.category === category;
        const matchType = type === 'All' || q.type === type;
        const matchSkills =
          !onlyMySkills ||
          selectedSkills.length === 0 ||
          q.tags.some((t) => selectedSkills.includes(t));
        const matchArticle =
          !articleId ||
          q.relatedArticleId === articleId ||
          linkedArticle?.questionIds?.includes(q._id);
        const matchKw =
          !kw ||
          q.title.toLowerCase().includes(kw) ||
          q.prompt.toLowerCase().includes(kw) ||
          q.tags.some((t) => t.toLowerCase().includes(kw));

        return (
          matchStatus &&
          matchLevel &&
          matchCat &&
          matchType &&
          matchSkills &&
          matchArticle &&
          matchKw
        );
      })
      .map((q) => ({
        ...q,
        isSolved: solvedIds.includes(q._id),
      }));
  }, 100);
}

export async function getQuestionById(questionId) {
  return simulateApiCall(() => {
    const allQuestions = getStoredQuestions();
    const solvedIds = getSolvedQuestionIds();
    const approvedList = allQuestions.filter((q) => q.status === 'approved');
    const currentIndex = approvedList.findIndex((q) => q._id === questionId);
    const question =
      currentIndex >= 0 ? approvedList[currentIndex] : approvedList[0];
    const resolvedIndex = currentIndex >= 0 ? currentIndex : 0;

    const prevQuestion =
      resolvedIndex > 0 ? approvedList[resolvedIndex - 1] : null;
    const nextQuestion =
      resolvedIndex < approvedList.length - 1
        ? approvedList[resolvedIndex + 1]
        : null;
    const relatedArticle = ARTICLES_MOCK.find(
      (a) => a._id === question.relatedArticleId
    );

    return {
      question: {
        ...question,
        isSolved: solvedIds.includes(question._id),
      },
      currentIndex: resolvedIndex,
      totalApproved: approvedList.length,
      prevQuestion,
      nextQuestion,
      relatedArticle,
    };
  }, 90);
}

export async function moderateQuestion(questionId, newStatus) {
  return simulateApiCall(() => {
    const allQuestions = getStoredQuestions();
    const updated = allQuestions.map((q) =>
      q._id === questionId ? { ...q, status: newStatus } : q
    );
    setStoredQuestions(updated);
    const target = updated.find((q) => q._id === questionId);
    return {
      question: target,
      questions: updated,
    };
  }, 120);
}
