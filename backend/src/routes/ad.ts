/**
 * 广告生成 API 路由
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateAdContent, generateH5Content, H5Content } from '../services/adGenerator.js';
import { generateH5Page } from '../services/h5Generator.js';

const router = Router();

// 存储生成的广告
const ads = new Map<string, any>();

// 生成广告
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      type = 'product',
      product,
      problem,
      features,
      benefits,
      target,
      user,
      event,
      date,
      location,
      activities,
      name,
      title,
      services,
      contact,
      keywords,
      coverImage,
      style,
      contact: adContact,
    } = req.body;

    // 生成文案
    const adContent = generateAdContent({
      type,
      product,
      problem,
      features,
      benefits,
      target,
      user,
      event,
      date,
      location,
      activities,
      name,
      title,
      services,
      contact,
      keywords,
    });

    // 生成 H5 内容
    const h5Content = generateH5Content(adContent, {
      coverImage,
      contact: adContact,
      style: style || {
        primaryColor: '#1890ff',
        backgroundColor: '#ffffff',
        fontColor: '#333333',
      },
    });

    // 生成唯一 ID
    const adId = uuidv4().slice(0, 8);

    // 生成 H5 页面
    const h5PageConfig = {
      id: adId,
      ...h5Content,
      cta: adContent.cta,
      ctaLink: `https://your-domain.com/h5/${adId}`,
      language: req.body.language || 'zh',
    };

    const h5Path = await generateH5Page(h5PageConfig);

    // 存储广告数据
    const ad = {
      id: adId,
      content: adContent,
      h5Content,
      h5Url: h5Path,
      createdAt: new Date().toISOString(),
      status: 'generated',
    };

    ads.set(adId, ad);

    res.json({
      success: true,
      data: {
        id: adId,
        ...adContent,
        h5Url: h5Path,
      },
    });
  } catch (error) {
    console.error('生成广告失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '生成失败',
    });
  }
});

// 获取广告详情
router.get('/:id', (req: Request, res: Response) => {
  const ad = ads.get(req.params.id);
  if (!ad) {
    return res.status(404).json({
      success: false,
      error: '广告不存在',
    });
  }
  res.json({
    success: true,
    data: ad,
  });
});

// 获取广告列表
router.get('/', (req: Request, res: Response) => {
  const adList = Array.from(ads.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({
    success: true,
    data: adList,
  });
});

// 删除广告
router.delete('/:id', (req: Request, res: Response) => {
  if (ads.has(req.params.id)) {
    ads.delete(req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: '广告不存在' });
  }
});

export default router;
