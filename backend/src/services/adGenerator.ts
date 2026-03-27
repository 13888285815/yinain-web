/**
 * 广告文案生成服务
 * 使用模板 + AI 增强生成营销文案
 */

// 广告文案模板
const adTemplates = {
  product: {
    title: [
      '🔥 {product}震撼登场!限时优惠不容错过',
      '💎 揭秘!{product}为何引爆全网',
      '⏰ 重磅!{product}最新消息刚刚曝光',
      '✨ {product}惊艳登场,抢先体验',
    ],
    body: [
      '还在为{problem}烦恼吗？{product}帮你轻松解决！\n\n✅ {feature1}\n✅ {feature2}\n✅ {feature3}\n\n立即行动,名额有限,错过等一年!',
      '{product}——你的品质之选!\n\n专为{target}设计\n• {feature1}\n• {feature2}\n• {feature3}\n\n👉 点击了解详情',
      '为什么都在买{product}?\n\n因为它能帮你{benefit}!\n\n{user}正在使用,效果看得见\n超{count}人已入手,好评如潮',
    ],
    cta: ['立即抢购', '了解详情', '免费试用', '立刻咨询', '马上领取'],
  },
  event: {
    title: [
      '🎉 {event}火热进行中!',
      '📢 重大通知:{event}限时开启',
      '🏃 错过等一年!{event}',
      '🎊 {event}正式拉开帷幕',
    ],
    body: [
      '{event}\n\n📅 {date}\n📍 {location}\n\n精彩内容:\n• {activity1}\n• {activity2}\n• {activity3}\n\n快来参加吧!',
    ],
    cta: ['立即报名', '抢占名额', '了解详情', '立刻加入'],
  },
  personal: {
    title: [
      '👋 你好,我是{name}',
      '🌟 认识一下,{name}很高兴为您服务',
      '💼 专业{name}团队竭诚为您',
    ],
    body: [
      '我是{name},{title}\n\n我可以帮你:\n• {service1}\n• {service2}\n• {service3}\n\n📞 {contact}\n期待与您合作!',
    ],
    cta: ['联系我', '在线咨询', '预约服务'],
  },
};

// 从模板随机选择
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 填充模板变量
function fillTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
}

// 生成广告文案
export interface AdContent {
  title: string;
  body: string;
  cta: string;
  hashtags: string[];
  tags: string[];
}

export interface GenerateAdParams {
  type: 'product' | 'event' | 'personal';
  product?: string;
  problem?: string;
  features?: string[];
  benefits?: string[];
  target?: string;
  user?: string;
  event?: string;
  date?: string;
  location?: string;
  activities?: string[];
  name?: string;
  title?: string;
  services?: string[];
  contact?: string;
  keywords?: string[];
}

export function generateAdContent(params: GenerateAdParams): AdContent {
  const template = adTemplates[params.type] || adTemplates.product;
  
  // 默认数据
  const defaults: Record<string, string> = {
    product: params.product || '新品',
    problem: params.problem || '选择困难',
    feature1: params.features?.[0] || '高品质',
    feature2: params.features?.[1] || '高性价比',
    feature3: params.features?.[2] || '优质服务',
    target: params.target || '追求品质的你',
    benefit: params.benefits?.[0] || '省时省力',
    user: params.user || '众多消费者',
    count: '10000+',
    event: params.event || '精彩活动',
    date: params.date || new Date().toLocaleDateString('zh-CN'),
    location: params.location || '线上',
    activity1: params.activities?.[0] || '精彩分享',
    activity2: params.activities?.[1] || '互动环节',
    activity3: params.activities?.[2] || '惊喜礼品',
    name: params.name || '专业人士',
    title: params.title || '服务提供者',
    service1: params.services?.[0] || '专业咨询',
    service2: params.services?.[1] || '定制方案',
    service3: params.services?.[2] || '售后服务',
    contact: params.contact || '请私信联系',
  };

  // 生成标题和正文
  const title = fillTemplate(randomPick(template.title), defaults);
  const body = fillTemplate(randomPick(template.body), defaults);
  const cta = randomPick(template.cta);

  // 生成话题标签
  const keywords = params.keywords || [params.product, params.event, params.name].filter(Boolean);
  const hashtags = generateHashtags(keywords as string[]);

  return {
    title,
    body,
    cta,
    hashtags,
    tags: keywords,
  };
}

// 生成社交媒体话题标签
function generateHashtags(keywords: string[]): string[] {
  const prefix = ['#', '##', '🔥', '💎', '✨', '🎉', '👀'];
  return keywords.map(kw => `${randomPick(prefix)}${kw}`.slice(0, 12));
}

// 生成 H5 页面内容
export interface H5Content {
  title: string;
  subtitle: string;
  coverImage?: string;
  qrCode?: string;
  content: {
    image?: string;
    text: string;
  }[];
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
}

export function generateH5Content(ad: AdContent, customizations?: Partial<H5Content>): H5Content {
  return {
    title: ad.title,
    subtitle: ad.body.split('\n')[0],
    content: [
      {
        text: ad.body,
      },
    ],
    style: {
      primaryColor: '#1890ff',
      backgroundColor: '#ffffff',
      fontColor: '#333333',
    },
    ...customizations,
  };
}
