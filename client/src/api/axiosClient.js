import axios from 'axios';
import {
  clearAuthSessionStorage,
  readStorage,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  timeout: 10000,
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
    const reqUrl = String(originalRequest?.url || '');
    const isAuthEndpoint =
      reqUrl.includes('/auth/login') ||
      reqUrl.includes('/auth/register') ||
      reqUrl.includes('/auth/refresh-token');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      const refreshToken = readStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
      if (!refreshToken) {
        clearAuthSessionStorage();
        const msg =
          error.response?.data?.message ||
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        return Promise.reject(new Error(msg));
      }

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
        const res = await axios.post(
          `${axiosClient.defaults.baseURL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        const tokenPayload = res.data?.data || res.data || {};
        const newAccessToken = tokenPayload.accessToken;
        const newRefreshToken = tokenPayload.refreshToken;

        if (newAccessToken) {
          writeStorage(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          if (newRefreshToken) {
            writeStorage(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthSessionStorage();
        return Promise.reject(
          new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        );
      } finally {
        isRefreshing = false;
      }
    }

    const validationErrors = error.response?.data?.errors;
    const firstFieldError =
      Array.isArray(validationErrors) && validationErrors[0]?.message
        ? validationErrors[0].message
        : null;

    const friendlyMessage =
      firstFieldError ||
      error.response?.data?.message ||
      'Không thể kết nối tới máy chủ Backend (cổng 5001). Vui lòng kiểm tra server và thử lại.';
    const wrappedError = new Error(friendlyMessage);
    if (Array.isArray(validationErrors)) {
      wrappedError.fieldErrors = validationErrors;
    }
    return Promise.reject(wrappedError);
  }
);

export default axiosClient;
