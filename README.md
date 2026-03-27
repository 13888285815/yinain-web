# 📢 图文广告自动生成 + 多平台分发系统

> 输入产品/服务信息，AI 自动生成营销文案和精美 H5 页面，一键分发到微博/微信/邮件/短信/网站！

## ✨ 功能特性

### 🎨 广告生成
- **AI 智能文案** - 输入产品信息，自动生成吸引人的营销文案
- **多类型支持** - 产品推广、活动宣传、个人名片
- **话题标签** - 自动生成社交媒体话题标签
- **精美 H5** - 自动生成可分享的移动端页面

### 🌐 多平台分发
| 平台 | 状态 | 说明 |
|------|------|------|
| 🌐 网站/H5 | ✅ 可用 | 生成链接，无需安装即可访问 |
| 📝 微博 | ⚙️ 需配置 | 需要微博开放平台 App Key |
| 💬 微信 | ⚙️ 需配置 | 需要微信公众号 AppID |
| 📧 邮件 | ⚙️ 需配置 | 需要 SMTP 邮件服务器 |
| 📱 短信 | ⚙️ 需配置 | 需要阿里云/腾讯云短信服务 |

### 🌍 多语言支持
- 🇇�🇳 中文 (简体)
- 🇺🇸 English
- 🇯🇵 日本語
- 🇩🇪 Deutsch
- 🇸🇦 العربية (RTL 支持)

自动根据访客 IP 匹配语言版本！

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/13888285815/ad-generator.git
cd ad-generator
```

### 2. 启动后端
```bash
cd backend
npm install
cp .env.example .env  # 配置可选 API
npm run dev
```

### 3. 启动前端
```bash
cd frontend
npm install
npm run dev
```

### 4. 访问
- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- H5 页面: http://localhost:3001/h5/{id}.html

## 📱 使用流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   填写信息   │ -> │   AI 生成   │ -> │   预览调整   │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
        ┌──────────┬──────────┬──────────────┴──────────────┐
        ↓          ↓          ↓              ↓              ↓
    ┌────────┐ ┌────────┐ ┌────────┐      ┌────────┐      ┌────────┐
    │  微博  │ │  微信  │ │  邮件  │      │  短信  │      │  网站  │
    └────────┘ └────────┘ └────────┘      └────────┘      └────────┘
```

## 🔧 配置说明

### 微博 API
1. 访问 [微博开放平台](https://open.weibo.com/)
2. 创建应用获取 App Key
3. 配置 `WEIBO_ACCESS_TOKEN`

### 微信公众号
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 获取 AppID 和 AppSecret
3. 配置 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`

### 邮件服务
1. 配置 SMTP 服务器（QQ/网易/企业邮箱）
2. 配置 `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`

### 短信服务
1. 开通阿里云短信服务
2. 配置 `SMS_ACCESS_KEY_ID`, `SMS_SIGN_NAME`, `SMS_TEMPLATE_CODE`

## 📁 项目结构

```
ad-generator/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   └── app/
│   │       └── page.tsx    # 主页面
│   └── public/
│       └── h5/             # 生成的 H5 页面
├── backend/                  # Express 后端
│   └── src/
│       ├── routes/          # API 路由
│       ├── services/        # 业务逻辑
│       │   ├── adGenerator.ts   # 广告生成
│       │   ├── h5Generator.ts    # H5 页面生成
│       │   └── distribution.ts   # 分发服务
│       └── index.ts
└── README.md
```

## 🌐 H5 页面示例

生成的 H5 页面特点：
- 📱 移动端优化，自适应各种屏幕
- 🔗 微信内置可打开
- 📤 内置分享按钮
- 🌈 支持自定义配色
- 🌍 多语言自动适配（RTL 支持）

## 🚀 部署

### Vercel 部署前端
```bash
cd frontend
vercel
```

### 部署后端
```bash
cd backend
vercel
```

## 📄 License

MIT
