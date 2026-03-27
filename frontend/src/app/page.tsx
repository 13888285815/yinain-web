'use client';

import { useState } from 'react';
import axios from 'axios';
import { 
  Sparkles, Send, Copy, Check, Globe, Mail, MessageCircle, 
  Share2, Smartphone, Loader2, Trash2, ExternalLink, Wand2
} from 'lucide-react';

// 广告类型
const adTypes = [
  { id: 'product', name: '产品推广', icon: '🛍️', placeholder: '产品名称' },
  { id: 'event', name: '活动宣传', icon: '🎉', placeholder: '活动名称' },
  { id: 'personal', name: '个人名片', icon: '👤', placeholder: '您的姓名' },
];

// 平台选项
const platforms = [
  { id: 'weibo', name: '微博', icon: '📝', color: 'bg-red-500' },
  { id: 'wechat', name: '微信', icon: '💬', color: 'bg-green-500' },
  { id: 'email', name: '邮件', icon: '📧', color: 'bg-blue-500' },
  { id: 'sms', name: '短信', icon: '📱', color: 'bg-orange-500' },
  { id: 'website', name: '网站/H5', icon: '🌐', color: 'bg-purple-500' },
];

// 语言选项
const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳', native: '简体中文' },
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', native: '日本語' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية', rtl: true },
];

interface GeneratedAd {
  id: string;
  title: string;
  body: string;
  cta: string;
  hashtags: string[];
  h5Url: string;
}

interface DistributionResult {
  platform: string;
  status: string;
  message?: string;
  link?: string;
}

export default function AdGeneratorPage() {
  // 状态
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [adType, setAdType] = useState<'product' | 'event' | 'personal'>('product');
  const [language, setLanguage] = useState('zh');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['website']);
  const [copied, setCopied] = useState(false);
  const [distributionResults, setDistributionResults] = useState<DistributionResult[]>([]);
  
  // 表单数据
  const [formData, setFormData] = useState({
    // 产品
    product: '',
    problem: '',
    features: '',
    benefits: '',
    target: '',
    // 活动
    event: '',
    date: '',
    location: '',
    activities: '',
    // 个人
    name: '',
    title: '',
    services: '',
    contact: '',
    // 通用
    keywords: '',
    coverImage: '',
    // 联系信息
    phone: '',
    wechat: '',
    email: '',
  });

  // 生成广告
  const generateAd = async () => {
    setIsGenerating(true);
    try {
      const features = formData.features.split('\n').filter(Boolean);
      const benefits = formData.benefits.split('\n').filter(Boolean);
      const activities = formData.activities.split('\n').filter(Boolean);
      const services = formData.services.split('\n').filter(Boolean);
      const keywords = formData.keywords.split(/[,\s]+/).filter(Boolean);

      const payload: any = {
        type: adType,
        language,
        coverImage: formData.coverImage,
        keywords,
      };

      if (adType === 'product') {
        payload.product = formData.product;
        payload.problem = formData.problem;
        payload.features = features;
        payload.benefits = benefits;
        payload.target = formData.target;
      } else if (adType === 'event') {
        payload.event = formData.event;
        payload.date = formData.date;
        payload.location = formData.location;
        payload.activities = activities;
      } else {
        payload.name = formData.name;
        payload.title = formData.title;
        payload.services = services;
        payload.contact = formData.contact;
      }

      const response = await axios.post('http://localhost:3001/api/ad/generate', payload);
      
      if (response.data.success) {
        setGeneratedAd(response.data.data);
        setStep(2);
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 分发广告
  const distributeAd = async () => {
    if (!generatedAd) return;
    
    setIsDistributing(true);
    try {
      const response = await axios.post('http://localhost:3001/api/distribute/publish', {
        platforms: selectedPlatforms,
        emailList: formData.email ? [formData.email] : [],
        phoneList: formData.phone ? [formData.phone] : [],
        ad: {
          title: generatedAd.title,
          body: generatedAd.body,
          cta: generatedAd.cta,
          ctaLink: `http://localhost:3001${generatedAd.h5Url}`,
          hashtags: generatedAd.hashtags,
        },
      });

      if (response.data.success) {
        setDistributionResults(response.data.data.results);
        setStep(3);
      }
    } catch (error) {
      console.error('分发失败:', error);
      alert('分发失败，请重试');
    } finally {
      setIsDistributing(false);
    }
  };

  // 复制内容
  const copyContent = () => {
    if (!generatedAd) return;
    const content = `${generatedAd.title}\n\n${generatedAd.body}\n\n${generatedAd.hashtags.join(' ')}\n\n${generatedAd.cta}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 语言切换
  const currentLang = languages.find(l => l.code === language) || languages[0];
  const isRTL = currentLang.rtl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📢</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">图文广告生成器</h1>
                <p className="text-sm text-gray-500">AI自动生成 · 一键分发全网</p>
              </div>
            </div>
            
            {/* 语言选择 */}
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <div className="flex gap-1">
                {languages.slice(0, 4).map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 rounded text-lg transition ${
                      language === lang.code 
                        ? 'bg-blue-100 ring-2 ring-blue-500' 
                        : 'hover:bg-gray-100'
                    }`}
                    title={lang.native}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: '填写信息' },
            { num: 2, label: '预览分发' },
            { num: 3, label: '完成' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s.num 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`ml-2 font-medium ${
                step >= s.num ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-20 h-1 mx-4 rounded ${
                  step > s.num ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: 填写信息 */}
        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* 左侧：表单 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-blue-500" />
                输入内容信息
              </h2>

              {/* 广告类型选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">广告类型</label>
                <div className="grid grid-cols-3 gap-3">
                  {adTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setAdType(type.id as any)}
                      className={`p-4 rounded-xl border-2 transition ${
                        adType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-medium">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 动态表单 */}
              <div className="space-y-4">
                {adType === 'product' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
                      <input
                        type="text"
                        value={formData.product}
                        onChange={e => setFormData({...formData, product: e.target.value})}
                        placeholder="输入产品名称"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">解决什么问题</label>
                      <input
                        type="text"
                        value={formData.problem}
                        onChange={e => setFormData({...formData, problem: e.target.value})}
                        placeholder="产品解决了用户什么痛点"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">产品特点 (每行一个)</label>
                      <textarea
                        value={formData.features}
                        onChange={e => setFormData({...formData, features: e.target.value})}
                        placeholder="高品质&#10;高性价比&#10;优质服务"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">产品优势 (每行一个)</label>
                      <textarea
                        value={formData.benefits}
                        onChange={e => setFormData({...formData, benefits: e.target.value})}
                        placeholder="省时省力&#10;效果显著&#10;值得信赖"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {adType === 'event' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">活动名称 *</label>
                      <input
                        type="text"
                        value={formData.event}
                        onChange={e => setFormData({...formData, event: e.target.value})}
                        placeholder="输入活动名称"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">活动时间</label>
                        <input
                          type="text"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          placeholder="2024年3月15日"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">活动地点</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          placeholder="线上/线下地址"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">活动内容 (每行一个)</label>
                      <textarea
                        value={formData.activities}
                        onChange={e => setFormData({...formData, activities: e.target.value})}
                        placeholder="精彩分享&#10;互动环节&#10;惊喜礼品"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {adType === 'personal' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="您的姓名"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">职位/头衔</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          placeholder="您的职业头衔"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">提供服务 (每行一个)</label>
                      <textarea
                        value={formData.services}
                        onChange={e => setFormData({...formData, services: e.target.value})}
                        placeholder="专业咨询&#10;定制方案&#10;售后服务"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">联系方式</label>
                      <input
                        type="text"
                        value={formData.contact}
                        onChange={e => setFormData({...formData, contact: e.target.value})}
                        placeholder="微信号/手机/邮箱"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* 通用字段 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关键词 (用逗号分隔)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={e => setFormData({...formData, keywords: e.target.value})}
                    placeholder="用于生成话题标签"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">封面图片URL (可选)</label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={e => setFormData({...formData, coverImage: e.target.value})}
                    placeholder="输入图片链接"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                onClick={generateAd}
                disabled={isGenerating || !formData.product && !formData.event && !formData.name}
                className="w-full mt-6 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 正在生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    一键生成广告
                  </>
                )}
              </button>
            </div>

            {/* 右侧：预览 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-blue-500" />
                H5 页面预览
              </h2>
              
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Phone frame */}
                  <div className="h-8 bg-gray-900 flex items-center justify-center">
                    <div className="w-20 h-4 bg-gray-800 rounded-full" />
                  </div>
                  <div className="p-4">
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                      <span className="text-lg font-bold">广告标题</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="mt-6 flex gap-2">
                      <div className="h-10 bg-blue-500 rounded-full flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                填写信息后，AI 将自动生成专业广告文案和精美的 H5 分享页面
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 预览分发 */}
        {step === 2 && generatedAd && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* 生成的广告内容 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Check className="w-6 h-6 text-green-500" />
                广告已生成！
              </h2>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6">
                <h3 className="text-xl font-bold mb-2">{generatedAd.title}</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {generatedAd.body}
                </pre>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {generatedAd.hashtags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={copyContent}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? '已复制' : '复制内容'}
                </button>
                <a
                  href={`http://localhost:3001${generatedAd.h5Url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  查看 H5
                </a>
              </div>
            </div>

            {/* 分发选项 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-purple-500" />
                选择分发平台
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {platforms.map(platform => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, platform.id]);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-2xl mb-2 mx-auto`}>
                        {platform.id === 'weibo' && '📝'}
                        {platform.id === 'wechat' && '💬'}
                        {platform.id === 'email' && '📧'}
                        {platform.id === 'sms' && '📱'}
                        {platform.id === 'website' && '🌐'}
                      </div>
                      <div className="font-medium text-center">{platform.name}</div>
                      {isSelected && (
                        <div className="text-green-500 text-xs text-center mt-1">✓ 已选择</div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* 联系方式 */}
              {(selectedPlatforms.includes('email') || selectedPlatforms.includes('sms')) && (
                <div className="border-t pt-4 mb-6">
                  <h3 className="font-medium mb-3">联系方式</h3>
                  <div className="space-y-3">
                    {selectedPlatforms.includes('email') && (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="输入邮箱地址"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                      />
                    )}
                    {selectedPlatforms.includes('sms') && (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="输入手机号码"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                      />
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={distributeAd}
                disabled={isDistributing || selectedPlatforms.length === 0}
                className="w-full btn-success flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDistributing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    分发中...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    一键分发到 {selectedPlatforms.length} 个平台
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 完成 */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">分发成功！</h2>
              <p className="text-gray-500 mb-8">您的广告已成功分发到以下平台</p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {distributionResults.map((result, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-xl ${
                      result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">
                      {result.platform === 'weibo' && '📝'}
                      {result.platform === 'wechat' && '💬'}
                      {result.platform === 'email' && '📧'}
                      {result.platform === 'sms' && '📱'}
                      {result.platform === 'website' && '🌐'}
                    </div>
                    <div className="font-medium capitalize">{result.platform}</div>
                    <div className={`text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.status === 'success' ? '✓ 成功' : '✗ 失败'}
                    </div>
                    {result.link && (
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        查看 →
                      </a>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setStep(1);
                    setGeneratedAd(null);
                    setDistributionResults([]);
                  }}
                  className="btn-secondary"
                >
                  创建新广告
                </button>
                {generatedAd && (
                  <a
                    href={`http://localhost:3001${generatedAd.h5Url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    查看 H5 页面 →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>图文广告生成器 - 支持中/英/日/德/阿拉伯语 · 无需安装即可访问</p>
        </div>
      </footer>
    </div>
  );
}
