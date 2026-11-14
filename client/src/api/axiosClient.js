import axios from 'axios';
import {
  readStorage,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Tự động đính kèm Access Token vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = readStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi tập trung & cơ chế hàng đợi Refresh Token khi gặp 401
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = readStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
        const res = await axios.post(
          `${axiosClient.defaults.baseURL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) {
          writeStorage(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        writeStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
        writeStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const friendlyMessage =
      error.response?.data?.message ||
      'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.';
    return Promise.reject(new Error(friendlyMessage));
  }
);

/**
 * Adapter mô phỏng độ trễ mạng nhẹ ở Giai đoạn 2 trước khi nối Backend Express ở Giai đoạn 3.
 */
export function simulateApiCall(handler, delayMs = 120) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(handler());
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error('Đã xảy ra lỗi khi xử lý dữ liệu.')
        );
      }
    }, delayMs);
  });
}

export default axiosClient;
