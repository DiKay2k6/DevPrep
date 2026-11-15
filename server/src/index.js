import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  try {
    await connectDatabase();
    app.listen(env.PORT, () => {
      console.log(
        `🚀 [Server] DevPrep Backend đang chạy tại http://localhost:${env.PORT}/api/v1/health (${env.NODE_ENV})`
      );
    });
  } catch (err) {
    console.error('❌ [Server] Khởi động thất bại:', err.message);
    process.exit(1);
  }
}

bootstrap();
