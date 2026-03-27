/**
 * 分发 API 路由
 */

import { Router, Request, Response } from 'express';
import { distributeToAll } from '../services/distribution.js';

const router = Router();

// 分发到多个平台
router.post('/publish', async (req: Request, res: Response) => {
  try {
    const {
      platforms = ['website'],
      emailList = [],
      phoneList = [],
      ad,
    } = req.body;

    if (!ad) {
      return res.status(400).json({
        success: false,
        error: '缺少广告内容',
      });
    }

    const results = await distributeToAll({
      platforms,
      emailList,
      phoneList,
      ad,
    });

    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount,
        },
      },
      message: `分发完成: ${successCount}成功, ${failCount}失败`,
    });
  } catch (error) {
    console.error('分发失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '分发失败',
    });
  }
});

// 获取支持的平台列表
router.get('/platforms', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'weibo',
        name: '微博',
        icon: '📝',
        description: '发布到微博动态',
        required: ['content'],
      },
      {
        id: 'wechat',
        name: '微信公众号',
        icon: '💬',
        description: '创建微信图文消息',
        required: ['title', 'content'],
      },
      {
        id: 'email',
        name: '邮件',
        icon: '📧',
        description: '发送邮件推广',
        required: ['emailList'],
      },
      {
        id: 'sms',
        name: '短信',
        icon: '📱',
        description: '发送短信通知',
        required: ['phoneList'],
      },
      {
        id: 'website',
        name: '网站/H5',
        icon: '🌐',
        description: '生成可分享的H5页面',
        required: [],
      },
    ],
  });
});

export default router;
