import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devprep',
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    'devprep_default_access_secret_dev_only',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    'devprep_default_refresh_secret_dev_only',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PISTON_API_URL:
    process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute',
  SANDBOX_TIMEOUT_MS: Math.min(
    5000,
    Math.max(1000, Number(process.env.SANDBOX_TIMEOUT_MS) || 4000)
  ),
};
