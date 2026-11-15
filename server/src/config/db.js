import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(
      `[MongoDB] Đã kết nối thành công tới: ${conn.connection.host}/${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Lỗi kết nối cơ sở dữ liệu: ${error.message}`);
    throw error;
  }
}
