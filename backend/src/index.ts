/**
 * 图文广告自动生成 + 多平台分发系统
 * 自动生成文案+海报，一键分发到微博/微信/邮箱/短信/网站
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// 路由
import adRoutes from './routes/ad.js';
import distributeRoutes from './routes/distribute.js';
import h5Routes from './routes/h5.js';
import geoRoutes from './routes/geo.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件 - H5页面
const h5Dir = path.join(process.cwd(), '../frontend/public/h5');
if (!fs.existsSync(h5Dir)) {
  fs.mkdirSync(h5Dir, { recursive: true });
}
app.use('/h5', express.static(h5Dir));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ad-generator',
    timestamp: new Date().toISOString() 
  });
});

// API 路由
app.use('/api/ad', adRoutes);
app.use('/api/distribute', distributeRoutes);
app.use('/api/h5', h5Routes);
app.use('/api/geo', geoRoutes);

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message 
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║  🚀 图文广告生成系统 启动成功!                     ║
║  📡 API: http://localhost:${PORT}                   ║
║  📄 H5: http://localhost:${PORT}/h5                ║
╚════════════════════════════════════════════════════╝
  `);
});

export default app;
