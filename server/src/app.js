import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import apiV1Routes, { healthCheckHandler } from './routes/index.js';

const app = express();

// Bảo mật HTTP headers
app.use(helmet());

// Cấu hình CORS cho Frontend Vite
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Parse JSON body (giới hạn kích thước chống DoS payload lớn)
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

// Endpoint kiểm tra sức khỏe server độc lập, không áp dụng Rate Limiter
app.get('/api/v1/health', healthCheckHandler);

// Giới hạn tần suất chung cho các API /api/v1
app.use('/api/v1', apiLimiter, apiV1Routes);

// Xử lý 404 & Error Handler tập trung
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
