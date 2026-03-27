/**
 * H5 页面生成服务
 * 生成可分享的移动端展示页面
 */

import fs from 'fs';
import path from 'path';

export interface H5PageConfig {
  id: string;
  title: string;
  subtitle: string;
  coverImage?: string;
  content: {
    image?: string;
    text: string;
  }[];
  cta: string;
  ctaLink?: string;
  contact?: {
    phone?: string;
    wechat?: string;
    email?: string;
  };
  style: {
    primaryColor: string;
    backgroundColor: string;
    fontColor: string;
  };
  language?: string;
}

// H5 页面模板
function generateH5Template(config: H5PageConfig): string {
  const isRTL = config.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  return `<!DOCTYPE html>
<html lang="${config.language || 'zh-CN'}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(config.title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: ${config.style.backgroundColor};
      color: ${config.style.fontColor};
      line-height: 1.6;
      min-height: 100vh;
    }
    
    .container {
      max-width: 100%;
      overflow-x: hidden;
    }
    
    /* Hero Section */
    .hero {
      position: relative;
      background: linear-gradient(135deg, ${config.style.primaryColor}, ${adjustColor(config.style.primaryColor, -20)});
      padding: 60px 20px 80px;
      text-align: center;
      color: white;
    }
    
    .hero::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 40px;
      background: ${config.style.backgroundColor};
      border-radius: 50% 50% 0 0;
    }
    
    .hero h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .hero p {
      font-size: 16px;
      opacity: 0.9;
      max-width: 300px;
      margin: 0 auto;
    }
    
    /* Cover Image */
    .cover {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      display: block;
    }
    
    /* Content Section */
    .content {
      padding: 30px 20px;
      background: white;
    }
    
    .content-text {
      font-size: 16px;
      line-height: 1.8;
      white-space: pre-line;
      color: #333;
    }
    
    .content-text p {
      margin-bottom: 16px;
    }
    
    /* Feature List */
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    
    .feature-item {
      background: ${config.style.backgroundColor};
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      padding: 20px 16px;
      text-align: center;
    }
    
    .feature-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .feature-text {
      font-size: 14px;
      color: #666;
    }
    
    /* CTA Section */
    .cta-section {
      padding: 40px 20px;
      text-align: center;
      background: linear-gradient(180deg, white, #f5f5f5);
    }
    
    .cta-button {
      display: inline-block;
      background: ${config.style.primaryColor};
      color: white;
      padding: 16px 48px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 15px ${hexToRgba(config.style.primaryColor, 0.4)};
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${hexToRgba(config.style.primaryColor, 0.5)};
    }
    
    .cta-button:active {
      transform: translateY(0);
    }
    
    /* Contact Section */
    .contact {
      padding: 30px 20px;
      background: #fafafa;
    }
    
    .contact h3 {
      font-size: 18px;
      margin-bottom: 16px;
      text-align: center;
    }
    
    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 300px;
      margin: 0 auto;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e8e8e8;
    }
    
    .contact-icon {
      font-size: 20px;
    }
    
    .contact-text {
      font-size: 14px;
      color: #666;
    }
    
    /* Footer */
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      background: #f5f5f5;
    }
    
    /* Share Section */
    .share-section {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-around;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 100;
    }
    
    .share-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 16px;
    }
    
    .share-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    .share-label {
      font-size: 11px;
      color: #666;
    }
    
    /* Loading State */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid ${config.style.primaryColor};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* QR Code */
    .qr-section {
      text-align: center;
      padding: 20px;
      background: white;
    }
    
    .qr-code {
      width: 150px;
      height: 150px;
      margin: 0 auto 10px;
      background: #f0f0f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .qr-text {
      font-size: 12px;
      color: #999;
    }
    
    /* Responsive */
    @media (min-width: 768px) {
      .hero {
        padding: 80px 20px 100px;
      }
      .hero h1 {
        font-size: 36px;
      }
      .content {
        padding: 40px 30%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Section -->
    <section class="hero">
      ${config.coverImage ? `<img src="${config.coverImage}" alt="cover" class="cover" style="display:none">` : ''}
      <h1>${escapeHtml(config.title)}</h1>
      <p>${escapeHtml(config.subtitle)}</p>
    </section>
    
    ${config.coverImage ? `<img src="${config.coverImage}" alt="cover" class="cover">` : ''}
    
    <!-- Content Section -->
    <section class="content">
      ${config.content.map(item => `
        ${item.image ? `<img src="${item.image}" alt="content" style="width:100%;border-radius:8px;margin-bottom:16px;">` : ''}
        <div class="content-text">${escapeHtml(item.text).replace(/\n/g, '<br>')}</div>
      `).join('')}
    </section>
    
    <!-- CTA Section -->
    <section class="cta-section">
      <a href="${config.ctaLink || 'javascript:void(0)'}" class="cta-button">
        ${escapeHtml(config.cta)}
      </a>
    </section>
    
    <!-- Contact Section -->
    ${config.contact ? `
    <section class="contact">
      <h3>${isRTL ? 'تواصل معنا' : '联系我们'}</h3>
      <div class="contact-list">
        ${config.contact.phone ? `
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span class="contact-text">${escapeHtml(config.contact.phone)}</span>
        </div>
        ` : ''}
        ${config.contact.wechat ? `
        <div class="contact-item">
          <span class="contact-icon">💬</span>
          <span class="contact-text">${escapeHtml(config.contact.wechat)}</span>
        </div>
        ` : ''}
        ${config.contact.email ? `
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <span class="contact-text">${escapeHtml(config.contact.email)}</span>
        </div>
        ` : ''}
      </div>
    </section>
    ` : ''}
    
    <!-- Footer -->
    <footer class="footer">
      <p>${isRTL ? 'توليدها بواسطة نظام الإعلان' : '由图文广告生成系统生成'}</p>
      <p style="margin-top:4px;">${new Date().toLocaleDateString()}</p>
    </footer>
  </div>
  
  <!-- Share Section -->
  <div class="share-section">
    <button class="share-btn" onclick="shareToWechat()">
      <span class="share-icon" style="background:#07c160;color:white;">💬</span>
      <span class="share-label">${isRTL ? 'ويتشات' : '微信'}</span>
    </button>
    <button class="share-btn" onclick="shareToWeibo()">
      <span class="share-icon" style="background:#e6162d;color:white;">�</span>
      <span class="share-label">${isRTL ? 'ويبو' : '微博'}</span>
    </button>
    <button class="share-btn" onclick="copyLink()">
      <span class="share-icon" style="background:#0066cc;color:white;">🔗</span>
      <span class="share-label">${isRTL ? 'نسخ الرابط' : '复制链接'}</span>
    </button>
    <button class="share-btn" onclick="shareToTimeline()">
      <span class="share-icon" style="background:#ff9500;color:white;">📤</span>
      <span class="share-label">${isRTL ? 'مشاركة' : '分享'}</span>
    </button>
  </div>
  
  <script>
    // Share functions
    function shareToWechat() {
      alert('${isRTL ? 'الرجاء استخدام رمز الاستجابة السريعة للمشاركة على ويتشات' : '请使用二维码在微信中分享'}');
    }
    
    function shareToWeibo() {
      const url = encodeURIComponent(window.location.href);
      window.open('https://service.weibo.com/share/share.php?url=' + url + '&title=' + encodeURIComponent('${escapeHtml(config.title)}'), '_blank');
    }
    
    function copyLink() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('${isRTL ? 'تم نسخ الرابط!' : '链接已复制!'}');
      });
    }
    
    function shareToTimeline() {
      if (navigator.share) {
        navigator.share({
          title: '${escapeHtml(config.title)}',
          text: '${escapeHtml(config.subtitle)}',
          url: window.location.href,
        });
      } else {
        copyLink();
      }
    }
  </script>
</body>
</html>`;
}

// HTML 转义
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 调整颜色亮度
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// HEX 转 RGBA
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 生成 H5 页面文件
export async function generateH5Page(config: H5PageConfig): Promise<string> {
  const html = generateH5Template(config);
  
  // 保存到 public/h5 目录
  const h5Dir = path.join(process.cwd(), '../frontend/public/h5');
  if (!fs.existsSync(h5Dir)) {
    fs.mkdirSync(h5Dir, { recursive: true });
  }
  
  const filePath = path.join(h5Dir, `${config.id}.html`);
  fs.writeFileSync(filePath, html, 'utf-8');
  
  return `/h5/${config.id}.html`;
}

// 获取 H5 页面列表
export function listH5Pages(): H5PageConfig[] {
  const h5Dir = path.join(process.cwd(), '../frontend/public/h5');
  if (!fs.existsSync(h5Dir)) {
    return [];
  }
  
  const files = fs.readdirSync(h5Dir).filter(f => f.endsWith('.html'));
  const pages: H5PageConfig[] = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(h5Dir, file), 'utf-8');
      const id = file.replace('.html', '');
      
      // 简单解析标题
      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      const primaryColorMatch = content.match(/primaryColor['"]:?\s*['"]([^'"]+)['"]/);
      
      pages.push({
        id,
        title: titleMatch?.[1] || '未命名',
        subtitle: '',
        content: [],
        cta: '',
        style: {
          primaryColor: primaryColorMatch?.[1] || '#1890ff',
          backgroundColor: '#ffffff',
          fontColor: '#333333',
        },
      });
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
    }
  }
  
  return pages.sort((a, b) => b.id.localeCompare(a.id));
}

// 删除 H5 页面
export function deleteH5Page(id: string): boolean {
  const filePath = path.join(process.cwd(), '../frontend/public/h5', `${id}.html`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
