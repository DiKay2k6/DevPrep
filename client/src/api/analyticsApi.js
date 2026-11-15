import { setStoredReviewQueue } from '../utils/storage.js';
import axiosClient from './axiosClient.js';

export async function getAnalyticsDashboard() {
  const res = await axiosClient.get('/practice/analytics');
  const data = res.data || {};
  const reviewQueue = Array.isArray(data.reviewQueue) ? data.reviewQueue : [];
  setStoredReviewQueue(reviewQueue);

  return {
    tagStats: Array.isArray(data.tagStats)
      ? data.tagStats
      : Array.isArray(data.tagMastery)
        ? data.tagMastery
        : [],
    formatStats: Array.isArray(data.formatStats) ? data.formatStats : [],
    reviewQueue,
    solvedCount: data.solvedCount || 0,
    completedArticlesCount: data.completedArticlesCount || 0,
  };
}

/**
 * Tăng chu kỳ ôn tập ngắt quãng (1 ngày → 3 ngày → 7 ngày → 14 ngày → Hoàn tất) trên MongoDB.
 */
export async function advanceSpacedRepetitionCycle(itemId) {
  const res = await axiosClient.patch(
    `/practice/review-queue/${encodeURIComponent(itemId)}/advance`
  );
  const data = res.data || {};
  if (Array.isArray(data.queue)) {
    setStoredReviewQueue(data.queue);
  }
  return data;
}
