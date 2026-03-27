/**
 * 多平台分发服务
 * 支持：微博、微信、邮件、短信
 */

import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// 邮件配置
interface EmailConfig {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
}

// 短信配置
interface SMSConfig {
  to: string;
  content: string;
}

// 分发记录
interface DistributionRecord {
  id: string;
  platform: 'weibo' | 'wechat' | 'email' | 'sms' | 'website';
  status: 'pending' | 'success' | 'failed';
  error?: string;
  timestamp: Date;
}

// 分发结果
interface DistributionResult {
  platform: string;
  status: 'success' | 'failed' | 'pending';
  message?: string;
  link?: string;
  recordId: string;
}

// ==================== 微博分发 ====================

export interface WeiboPostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export async function postToWeibo(content: {
  title: string;
  body: string;
  image?: string;
  hashtags?: string[];
}): Promise<WeiboPostResult> {
  // 注意：实际使用需要微博开放平台 App Key
  const WEIBO_APP_KEY = process.env.WEIBO_APP_KEY;
  const WEIBO_ACCESS_TOKEN = process.env.WEIBO_ACCESS_TOKEN;
  
  if (!WEIBO_ACCESS_TOKEN) {
    // 模拟成功（无真实token时）
    console.log('📝 [模拟] 发布到微博:', content.title);
    return {
      success: true,
      postId: `mock_${Date.now()}`,
      url: `https://weibo.com/mock/${Date.now()}`,
      error: '模拟模式：需要配置 WEIBO_ACCESS_TOKEN',
    };
  }
  
  try {
    // 实际微博 API 调用
    const text = `${content.title}\n\n${content.body}\n\n${(content.hashtags || []).join(' ')}`;
    
    const formData = new URLSearchParams();
    formData.append('status', text);
    
    if (content.image) {
      // 图片需要先上传
      // formData.append('pic', content.image);
    }
    
    const response = await fetch('https://api.weibo.com/2/statuses/share.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEIBO_ACCESS_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.idstr) {
      return {
        success: true,
        postId: data.idstr,
        url: `https://weibo.com/${data.user?.id || 'u'}/${data.idstr}`,
      };
    }
    
    return {
      success: false,
      error: data.error || '发布失败',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// ==================== 微信分发 ====================

export interface WechatPostResult {
  success: boolean;
  articleId?: string;
  url?: string;
  error?: string;
}

export async function postToWechat(content: {
  title: string;
  body: string;
  coverImage?: string;
  digest?: string;
}): Promise<WechatPostResult> {
  // 注意：实际使用需要微信公众号 AppID 和 Secret
  const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
  const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;
  
  if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
    console.log('📝 [模拟] 发布到微信公众号:', content.title);
    return {
      success: true,
      articleId: `mock_${Date.now()}`,
      url: `https://mp.weixin.qq.com/mock/${Date.now()}`,
      error: '模拟模式：需要配置 WECHAT_APP_ID 和 WECHAT_APP_SECRET',
    };
  }
  
  try {
    // 获取 Access Token
    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}`
    );
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return {
        success: false,
        error: tokenData.errmsg || '获取 Access Token 失败',
      };
    }
    
    // 创建草稿
    const draftResponse = await fetch(
      `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${tokenData.access_token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: [{
            title: content.title,
            author: '',
            digest: content.digest || content.body.slice(0, 54),
            content: content.body,
            content_source_url: '',
            thumb_media_id: '',
            show_cover_pic: content.coverImage ? 1 : 0,
            need_open_comment: 1,
            only_fans_can_comment: 0,
          }],
        }),
      }
    );
    
    const draftData = await draftResponse.json();
    
    if (draftData.media_id) {
      return {
        success: true,
        articleId: draftData.media_id,
        url: 'https://mp.weixin.qq.com/',
      };
    }
    
    return {
      success: false,
      error: draftData.errmsg || '创建草稿失败',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// ==================== 邮件分发 ====================

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(config: EmailConfig): Promise<EmailResult> {
  // 邮件配置
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
  
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('📧 [模拟] 发送邮件:', config.subject);
    return {
      success: true,
      messageId: `mock_email_${Date.now()}`,
      error: '模拟模式：需要配置 SMTP 环境变量',
    };
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    
    const toEmails = Array.isArray(config.to) ? config.to.join(', ') : config.to;
    
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmails,
      cc: config.cc?.join(', '),
      bcc: config.bcc?.join(', '),
      subject: config.subject,
      html: config.html,
    });
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// 生成广告邮件模板
export function generateAdEmail(ad: {
  title: string;
  body: string;
  cta: string;
  ctaLink?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #1890ff, #140f40); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .content p { line-height: 1.8; color: #333; }
    .cta-button { display: inline-block; background: #1890ff; color: white; padding: 14px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { background: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${ad.title}</h1>
    </div>
    <div class="content">
      <p>${ad.body.replace(/\n/g, '<br>')}</p>
      <div style="text-align: center;">
        <a href="${ad.ctaLink || '#'}" class="cta-button">${ad.cta}</a>
      </div>
    </div>
    <div class="footer">
      <p>您收到此邮件是因为订阅了我们的服务</p>
      <p><a href="#">取消订阅</a> | <a href="#">查看网页版</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ==================== 短信分发 ====================

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSMS(config: SMSConfig): Promise<SMSResult> {
  // 短信配置（阿里云/腾讯云）
  const SMS_ACCESS_KEY_ID = process.env.SMS_ACCESS_KEY_ID;
  const SMS_ACCESS_KEY_SECRET = process.env.SMS_ACCESS_KEY_SECRET;
  const SMS_SIGN_NAME = process.env.SMS_SIGN_NAME;
  const SMS_TEMPLATE_CODE = process.env.SMS_TEMPLATE_CODE;
  
  if (!SMS_ACCESS_KEY_ID || !SMS_ACCESS_KEY_SECRET) {
    console.log('📱 [模拟] 发送短信:', config.content);
    return {
      success: true,
      messageId: `mock_sms_${Date.now()}`,
      error: '模拟模式：需要配置短信 API',
    };
  }
  
  try {
    // 阿里云短信 API
    // 实际实现需要使用阿里云 SDK
    const response = await fetch('https://dysmsapi.aliyuncs.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        AccessKeyId: SMS_ACCESS_KEY_ID,
        Action: 'SendSms',
        SignName: SMS_SIGN_NAME,
        TemplateCode: SMS_TEMPLATE_CODE,
        PhoneNumbers: config.to,
        TemplateParam: JSON.stringify({ content: config.content }),
      }),
    });
    
    const data = await response.json();
    
    if (data.Code === 'OK') {
      return {
        success: true,
        messageId: data.BizId,
      };
    }
    
    return {
      success: false,
      error: data.Message || '发送失败',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// 短信字数限制（每条70字，超过需拆分成多条）
export function generateSMSContent(ad: {
  title: string;
  body: string;
  cta: string;
  ctaLink?: string;
}): string[] {
  const maxLength = 70;
  const fullContent = `${ad.title}\n\n${ad.body}\n\n${ad.cta}: ${ad.ctaLink || '点击链接查看'}`;
  
  const messages: string[] = [];
  let remaining = fullContent;
  
  while (remaining.length > 0) {
    const isLong = messages.length > 0;
    const prefix = isLong ? `(${messages.length + 1}) ` : '';
    const maxLen = maxLength - prefix.length;
    
    if (remaining.length <= maxLen) {
      messages.push(prefix + remaining);
      break;
    }
    
    messages.push(prefix + remaining.slice(0, maxLen - 3) + '...');
    remaining = remaining.slice(maxLen);
  }
  
  return messages;
}

// ==================== 统一分发接口 ====================

export interface DistributeOptions {
  platforms: ('weibo' | 'wechat' | 'email' | 'sms')[];
  emailList?: string[];
  phoneList?: string[];
  h5Url?: string;
  ad: {
    title: string;
    body: string;
    cta: string;
    ctaLink?: string;
    image?: string;
    hashtags?: string[];
  };
}

export async function distributeToAll(options: DistributeOptions): Promise<DistributionResult[]> {
  const results: DistributionResult[] = [];
  
  for (const platform of options.platforms) {
    const recordId = uuidv4();
    
    try {
      switch (platform) {
        case 'weibo': {
          const result = await postToWeibo({
            title: options.ad.title,
            body: options.ad.body,
            image: options.ad.image,
            hashtags: options.ad.hashtags,
          });
          results.push({
            platform: 'weibo',
            status: result.success ? 'success' : 'failed',
            message: result.error,
            link: result.url,
            recordId,
          });
          break;
        }
        
        case 'wechat': {
          const result = await postToWechat({
            title: options.ad.title,
            body: options.ad.body,
            coverImage: options.ad.image,
          });
          results.push({
            platform: 'wechat',
            status: result.success ? 'success' : 'failed',
            message: result.error,
            link: result.url,
            recordId,
          });
          break;
        }
        
        case 'email': {
          if (!options.emailList?.length) {
            results.push({
              platform: 'email',
              status: 'failed',
              message: '未提供邮箱列表',
              recordId,
            });
            break;
          }
          const result = await sendEmail({
            to: options.emailList,
            subject: options.ad.title,
            html: generateAdEmail(options.ad),
          });
          results.push({
            platform: 'email',
            status: result.success ? 'success' : 'failed',
            message: result.error,
            recordId,
          });
          break;
        }
        
        case 'sms': {
          if (!options.phoneList?.length) {
            results.push({
              platform: 'sms',
              status: 'failed',
              message: '未提供手机号码',
              recordId,
            });
            break;
          }
          const messages = generateSMSContent(options.ad);
          const smsPromises = options.phoneList.map(phone => 
            sendSMS({ to: phone, content: messages[0] })
          );
          const smsResults = await Promise.all(smsPromises);
          const allSuccess = smsResults.every(r => r.success);
          results.push({
            platform: 'sms',
            status: allSuccess ? 'success' : 'failed',
            message: smsResults.map(r => r.error).filter(Boolean).join(', '),
            recordId,
          });
          break;
        }
      }
    } catch (error) {
      results.push({
        platform,
        status: 'failed',
        message: error instanceof Error ? error.message : '未知错误',
        recordId,
      });
    }
  }
  
  return results;
}
