import {
  getCompletedArticleIds,
  getSolvedQuestionIds,
  getStoredFormatStats,
  getStoredReviewQueue,
  getStoredTagStats,
  setStoredReviewQueue,
} from '../utils/storage.js';
import { simulateApiCall } from './axiosClient.js';

const CYCLE_DAYS = [1, 3, 7, 14];

export async function getAnalyticsDashboard() {
  return simulateApiCall(() => {
    const tagStats = [...getStoredTagStats()].sort(
      (a, b) => a.accuracy - b.accuracy
    );
    const formatStats = getStoredFormatStats();
    const reviewQueue = getStoredReviewQueue();
    const solvedIds = getSolvedQuestionIds();
    const completedArticles = getCompletedArticleIds();

    return {
      tagStats,
      formatStats,
      reviewQueue,
      solvedCount: solvedIds.length,
      completedArticlesCount: completedArticles.length,
    };
  }, 100);
}

/**
 * Tăng chu kỳ ôn tập ngắt quãng (1 ngày → 3 ngày → 7 ngày → 14 ngày → Hoàn tất).
 */
export async function advanceSpacedRepetitionCycle(itemId) {
  return simulateApiCall(() => {
    const queue = getStoredReviewQueue();
    const target = queue.find((item) => item.id === itemId);
    if (!target) {
      return { completedAllStages: false, queue };
    }

    const nextStageIndex = Math.min(target.currentStage, CYCLE_DAYS.length);
    if (nextStageIndex >= CYCLE_DAYS.length) {
      // Đã hoàn thành mốc 14 ngày -> loại khỏi hàng đợi cần ôn gấp
      const remaining = queue.filter((item) => item.id !== itemId);
      setStoredReviewQueue(remaining);
      return {
        completedAllStages: true,
        item: target,
        queue: remaining,
      };
    }

    const nextDays = CYCLE_DAYS[nextStageIndex];
    const nextStage = nextStageIndex + 1;
    const updatedItem = {
      ...target,
      currentStage: nextStage,
      intervalDays: nextDays,
      cycleLabel: `Chu kỳ ${nextDays} ngày`,
      dueStatus: `Còn ${nextDays} ngày nữa`,
      lastAttemptResult: 'Đã ôn tập thành công vừa xong',
    };

    const updatedQueue = queue.map((item) =>
      item.id === itemId ? updatedItem : item
    );
    setStoredReviewQueue(updatedQueue);

    return {
      completedAllStages: false,
      item: updatedItem,
      queue: updatedQueue,
    };
  }, 100);
}
