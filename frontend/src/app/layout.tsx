import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '图文广告生成器 - 自动生成 · 一键分发',
  description: '输入产品信息，AI自动生成图文广告，一键分发到微博/微信/邮件/短信/网站',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
