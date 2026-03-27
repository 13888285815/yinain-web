import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '图文广告生成器 - AI自动生成 · 一键分发',
  description: '输入产品信息，AI自动生成图文广告，一键分发到微博/微信/邮件/短信/网站，支持8种语言',
  keywords: '广告生成器, 图文广告, 社交媒体分发, 多语言',
  authors: [{ name: 'yinain' }],
  openGraph: {
    title: '图文广告生成器',
    description: 'AI自动生成 · 一键分发全网',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 0.5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" dir="ltr">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
