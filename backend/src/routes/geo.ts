/**
 * IP 地理位置检测路由
 */

import { Router, Request, Response } from 'express';

const router = Router();

// 国家到语言映射
const countryToLang: Record<string, { lang: string; name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  CN: { lang: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  HK: { lang: 'zh', name: '中文', flag: '🇭🇰', dir: 'ltr' },
  TW: { lang: 'zh', name: '中文', flag: '🇹🇼', dir: 'ltr' },
  MO: { lang: 'zh', name: '中文', flag: '🇲🇴', dir: 'ltr' },
  SG: { lang: 'zh', name: '中文', flag: '🇸🇬', dir: 'ltr' },
  JP: { lang: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  DE: { lang: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  AT: { lang: 'de', name: 'Deutsch', flag: '🇦🇹', dir: 'ltr' },
  CH: { lang: 'de', name: 'Deutsch', flag: '🇨🇭', dir: 'ltr' },
  SA: { lang: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  AE: { lang: 'ar', name: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  EG: { lang: 'ar', name: 'العربية', flag: '🇪🇬', dir: 'rtl' },
  US: { lang: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  GB: { lang: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  AU: { lang: 'en', name: 'English', flag: '🇦🇺', dir: 'ltr' },
  CA: { lang: 'en', name: 'English', flag: '🇨🇦', dir: 'ltr' },
};

// 检测 IP 并返回语言
router.get('/detect', async (req: Request, res: Response) => {
  try {
    const clientIP = req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
      || req.headers['x-real-ip']?.toString()
      || req.socket.remoteAddress
      || '127.0.0.1';
    
    const cleanIP = clientIP.replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1');
    
    // 本地 IP 返回默认
    if (cleanIP === '127.0.0.1' || cleanIP.startsWith('192.168.') || cleanIP.startsWith('10.')) {
      return res.json({
        success: true,
        data: {
          ip: cleanIP,
          country: 'US',
          countryName: 'Local',
          lang: 'en',
          name: 'English',
          flag: '🇺🇸',
          direction: 'ltr',
          isLocal: true,
        },
      });
    }
    
    // 调用 IP API
    try {
      const response = await fetch(`http://ip-api.com/json/${cleanIP}?fields=status,country,countryCode`);
      const data = await response.json();
      
      if (data.status === 'success') {
        const langInfo = countryToLang[data.countryCode] || { lang: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' as const };
        
        return res.json({
          success: true,
          data: {
            ip: cleanIP,
            country: data.countryCode,
            countryName: data.country,
            ...langInfo,
            isLocal: false,
          },
        });
      }
    } catch (e) {
      console.error('IP API error:', e);
    }
    
    // 降级
    return res.json({
      success: true,
      data: {
        ip: cleanIP,
        country: 'US',
        countryName: 'United States',
        lang: 'en',
        name: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
        fallback: true,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error instanceof Error ? error.message : '检测失败',
    });
  }
});

// 获取支持的语言列表
router.get('/languages', (req: Request, res: Response) => {
  const languages = [
    { code: 'zh', name: '中文', nativeName: '简体中文', flag: '🇨🇳', dir: 'ltr' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  ];
  
  res.json({
    success: true,
    data: languages,
  });
});

export default router;
