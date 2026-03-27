/**
 * H5 页面管理路由
 */

import { Router, Request, Response } from 'express';
import { listH5Pages, deleteH5Page } from '../services/h5Generator.js';

const router = Router();

// 获取 H5 页面列表
router.get('/list', (req: Request, res: Response) => {
  try {
    const pages = listH5Pages();
    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    });
  }
});

// 删除 H5 页面
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = deleteH5Page(req.params.id);
    if (deleted) {
      res.json({ success: true, message: '删除成功' });
    } else {
      res.status(404).json({ success: false, error: '页面不存在' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    });
  }
});

export default router;
