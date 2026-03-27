'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, Send, Copy, Check, Globe, Share2, Smartphone, 
  Loader2, ExternalLink, Wand2
} from 'lucide-react';
import { languages, t, getDirection, type LanguageCode } from '@/lib/i18n';

// 广告类型
const adTypes = [
  { id: 'product', nameKey: 'adType.product', icon: '🛍️' },
  { id: 'event', nameKey: 'adType.event', icon: '🎉' },
  { id: 'personal', nameKey: 'adType.personal', icon: '👤' },
];

// 平台选项
const platforms = [
  { id: 'weibo', nameKey: 'platform.weibo', icon: '📝', color: 'bg-red-500' },
  { id: 'wechat', nameKey: 'platform.wechat', icon: '💬', color: 'bg-green-500' },
  { id: 'email', nameKey: 'platform.email', icon: '📧', color: 'bg-blue-500' },
  { id: 'sms', nameKey: 'platform.sms', icon: '📱', color: 'bg-orange-500' },
  { id: 'website', nameKey: 'platform.website', icon: '🌐', color: 'bg-purple-500' },
];

// 语言选项
const langOptions = Object.entries(languages).map(([code, config]) => ({
  code: code as LanguageCode,
  ...config,
}));

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
  link?: string;
}

export default function AdGeneratorPage() {
  const [lang, setLang] = useState<LanguageCode>('zh');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [adType, setAdType] = useState<'product' | 'event' | 'personal'>('product');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['website']);
  const [copied, setCopied] = useState(false);
  const [distributionResults, setDistributionResults] = useState<DistributionResult[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState({
    product: '', problem: '', features: '', benefits: '', target: '',
    event: '', date: '', location: '', activities: '',
    name: '', title: '', services: '', contact: '',
    keywords: '', coverImage: '', phone: '', email: '',
  });

  // 客户端挂载后检测语言
  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('ad-generator-lang') as LanguageCode;
    if (savedLang && savedLang in languages) {
      setLang(savedLang);
    } else {
      // 从浏览器语言推断
      const browserLang = navigator.language.split('-')[0];
      if (browserLang in languages) {
        setLang(browserLang as LanguageCode);
      }
    }
  }, []);

  // 切换语言
  const changeLang = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('ad-generator-lang', newLang);
  };

  const tr = (key: string) => t(lang, key);
  const dir = getDirection(lang);
  const isRTL = dir === 'rtl';

  // 生成广告
  const generateAd = async () => {
    setIsGenerating(true);
    try {
      const features = formData.features.split('\n').filter(Boolean);
      const benefits = formData.benefits.split('\n').filter(Boolean);
      const activities = formData.activities.split('\n').filter(Boolean);
      const services = formData.services.split('\n').filter(Boolean);
      const keywords = formData.keywords.split(/[,\s]+/).filter(Boolean);

      const payload: any = { type: adType, language: lang, coverImage: formData.coverImage, keywords };

      if (adType === 'product') {
        Object.assign(payload, { product: formData.product, problem: formData.problem, features, benefits, target: formData.target });
      } else if (adType === 'event') {
        Object.assign(payload, { event: formData.event, date: formData.date, location: formData.location, activities });
      } else {
        Object.assign(payload, { name: formData.name, title: formData.title, services, contact: formData.contact });
      }

      // 模拟生成（实际项目调用后端API）
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAd: GeneratedAd = {
        id: Date.now().toString(36),
        title: formData.product || formData.event || formData.name || '精彩内容',
        body: generateMockBody(),
        cta: adType === 'product' ? '立即抢购' : adType === 'event' ? '立即报名' : '联系我',
        hashtags: keywords.slice(0, 5).map(k => `#${k}`),
        h5Url: `/h5/${Date.now().toString(36)}.html`,
      };
      
      setGeneratedAd(mockAd);
      setStep(2);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockBody = () => {
    if (adType === 'product') {
      return `${formData.product || '产品'}\n\n专为追求品质的你设计\n\n✅ ${formData.features?.split('\n')[0] || '高品质'}\n✅ ${formData.features?.split('\n')[1] || '高性价比'}\n✅ ${formData.features?.split('\n')[2] || '优质服务'}\n\n立即行动，名额有限！`;
    } else if (adType === 'event') {
      return `${formData.event || '精彩活动'}\n\n📅 ${formData.date || '近期'}\n📍 ${formData.location || '线上'}\n\n${formData.activities || '精彩内容'} \n\n快来参加吧！`;
    } else {
      return `你好，我是${formData.name || '专业人士'}\n\n我可以帮你：\n• ${formData.services?.split('\n')[0] || '专业咨询'}\n• ${formData.services?.split('\n')[1] || '定制方案'}\n• ${formData.services?.split('\n')[2] || '售后服务'}\n\n${formData.contact || '期待与您合作！'}`;
    }
  };

  // 分发广告
  const distributeAd = async () => {
    if (!generatedAd) return;
    setIsDistributing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results: DistributionResult[] = selectedPlatforms.map(p => ({
        platform: p,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        link: `https://${p}.com/mock/${Date.now()}`,
      }));
      
      setDistributionResults(results);
      setStep(3);
    } catch (error) {
      console.error('分发失败:', error);
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir={dir}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 safe-area-top">
        <div className="container py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📢</span>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">{tr('app.title')}</h1>
                <p className="text-xs md:text-sm text-gray-500 hide-mobile">{tr('app.subtitle')}</p>
              </div>
            </div>
            
            {/* 语言切换 */}
            <div className="lang-selector">
              {langOptions.slice(0, 6).map(l => (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className={`lang-btn ${lang === l.code ? 'active' : ''}`}
                  title={l.nativeName}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Progress Steps */}
        <div className="step-indicator flex-wrap gap-2 md:gap-4 mb-8">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`step-item`}>
                <div className={`step-circle ${step >= s ? (step > s ? 'completed' : 'active') : 'inactive'}`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`step-label ${step >= s ? 'active' : ''} hidden sm:inline`}>
                  {tr(`step.${s === 1 ? 'fillInfo' : s === 2 ? 'preview' : 'complete'}`)}
                </span>
              </div>
              {i < 2 && <div className={`step-line ${step > s ? 'active' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: 填写信息 */}
        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fadeIn">
            {/* 表单 */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-blue-500" />
                {tr('step.fillInfo')}
              </h2>

              {/* 广告类型 */}
              <div className="mb-6">
                <label className="form-label">{tr('adType.product')}</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {adTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setAdType(type.id as any)}
                      className={`platform-card ${adType === type.id ? 'selected' : ''}`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs md:text-sm font-medium">{tr(type.nameKey)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 动态表单 */}
              <div className="space-y-4">
                {adType === 'product' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">{tr('form.productName')} *</label>
                      <input type="text" className="form-input" value={formData.product}
                        onChange={e => setFormData({...formData, product: e.target.value})}
                        placeholder={tr('form.productNamePlaceholder')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{tr('form.problem')}</label>
                      <input type="text" className="form-input" value={formData.problem}
                        onChange={e => setFormData({...formData, problem: e.target.value})}
                        placeholder={tr('form.problemPlaceholder')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{tr('form.features')}</label>
                      <textarea className="form-input form-textarea" value={formData.features}
                        onChange={e => setFormData({...formData, features: e.target.value})}
                        placeholder={tr('form.featuresPlaceholder')} rows={3} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{tr('form.benefits')}</label>
                      <textarea className="form-input form-textarea" value={formData.benefits}
                        onChange={e => setFormData({...formData, benefits: e.target.value})}
                        placeholder={tr('form.benefitsPlaceholder')} rows={2} />
                    </div>
                  </>
                )}

                {adType === 'event' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">{tr('form.eventName')} *</label>
                      <input type="text" className="form-input" value={formData.event}
                        onChange={e => setFormData({...formData, event: e.target.value})}
                        placeholder={tr('form.eventNamePlaceholder')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">{tr('form.date')}</label>
                        <input type="text" className="form-input" value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          placeholder="2024年3月15日" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{tr('form.location')}</label>
                        <input type="text" className="form-input" value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          placeholder="线上/线下" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{tr('form.activities')}</label>
                      <textarea className="form-input form-textarea" value={formData.activities}
                        onChange={e => setFormData({...formData, activities: e.target.value})}
                        placeholder={tr('form.activitiesPlaceholder')} rows={3} />
                    </div>
                  </>
                )}

                {adType === 'personal' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">{tr('form.name')} *</label>
                        <input type="text" className="form-input" value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder={tr('form.namePlaceholder')} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{tr('form.title')}</label>
                        <input type="text" className="form-input" value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          placeholder={tr('form.titlePlaceholder')} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{tr('form.services')}</label>
                      <textarea className="form-input form-textarea" value={formData.services}
                        onChange={e => setFormData({...formData, services: e.target.value})}
                        placeholder={tr('form.servicesPlaceholder')} rows={3} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{tr('form.contact')}</label>
                      <input type="text" className="form-input" value={formData.contact}
                        onChange={e => setFormData({...formData, contact: e.target.value})}
                        placeholder={tr('form.contactPlaceholder')} />
                    </div>
                  </>
                )}

                {/* 通用字段 */}
                <div className="form-group">
                  <label className="form-label">{tr('form.keywords')}</label>
                  <input type="text" className="form-input" value={formData.keywords}
                    onChange={e => setFormData({...formData, keywords: e.target.value})}
                    placeholder={tr('form.keywordsPlaceholder')} />
                </div>
                <div className="form-group">
                  <label className="form-label">{tr('form.coverImage')}</label>
                  <input type="text" className="form-input" value={formData.coverImage}
                    onChange={e => setFormData({...formData, coverImage: e.target.value})}
                    placeholder={tr('form.coverImagePlaceholder')} />
                </div>
              </div>

              <button
                onClick={generateAd}
                disabled={isGenerating || (!formData.product && !formData.event && !formData.name)}
                className="btn btn-primary btn-lg btn-block mt-6"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{tr('btn.generating')}</>
                ) : (
                  <><Sparkles className="w-5 h-5" />{tr('btn.generate')}</>
                )}
              </button>
            </div>

            {/* 预览 */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-blue-500" />
                {tr('preview.title')}
              </h2>
              
              <div className="preview-frame">
                <div className="preview-phone">
                  <div className="preview-phone-header">
                    <div className="preview-phone-notch" />
                  </div>
                  <div className="preview-phone-content">
                    <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
                      <span className="font-bold text-sm">广告标题</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="mt-6 flex gap-2">
                      <div className="h-8 bg-blue-500 rounded-full flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                {tr('preview.description')}
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 预览分发 */}
        {step === 2 && generatedAd && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fadeIn">
            {/* 生成的广告 */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-green-500" />
                {tr('common.success')}！
              </h2>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white mb-4">
                <h3 className="text-lg md:text-xl font-bold">{generatedAd.title}</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{generatedAd.body}</pre>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {generatedAd.hashtags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">{tag}</span>
                ))}
              </div>
              
              <div className="flex gap-3 flex-col sm:flex-row">
                <button onClick={copyContent} className="btn btn-secondary flex-1">
                  {copied ? <><Check className="w-4 h-4" />{tr('common.copied')}</> : <><Copy className="w-4 h-4" />{tr('btn.copyContent')}</>}
                </button>
                <a href={generatedAd.h5Url} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex-1">
                  <ExternalLink className="w-4 h-4" />{tr('btn.viewH5')}
                </a>
              </div>
            </div>

            {/* 分发选项 */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-purple-500" />
                {tr('step.preview')}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-4">
                {platforms.map(p => {
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlatforms(selectedPlatforms.filter(x => x !== p.id));
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, p.id]);
                        }
                      }}
                      className={`platform-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className={`w-10 h-10 ${p.color} rounded-xl flex items-center justify-center text-xl mb-1 mx-auto`}>
                        {p.icon === '📝' && '📝'}
                        {p.icon === '💬' && '💬'}
                        {p.icon === '📧' && '📧'}
                        {p.icon === '📱' && '📱'}
                        {p.icon === '🌐' && '🌐'}
                      </div>
                      <div className="text-xs md:text-sm font-medium">{tr(p.nameKey)}</div>
                      {isSelected && <div className="text-success text-xs">✓</div>}
                    </button>
                  );
                })}
              </div>
              
              {/* 联系方式 */}
              {(selectedPlatforms.includes('email') || selectedPlatforms.includes('sms')) && (
                <div className="border-t pt-4 mb-4">
                  <div className="space-y-3">
                    {selectedPlatforms.includes('email') && (
                      <input type="email" className="form-input" value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder={tr('form.emailPlaceholder')} />
                    )}
                    {selectedPlatforms.includes('sms') && (
                      <input type="tel" className="form-input" value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder={tr('form.phonePlaceholder')} />
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={distributeAd}
                disabled={isDistributing || selectedPlatforms.length === 0}
                className="btn btn-success btn-lg btn-block"
              >
                {isDistributing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{tr('btn.distributing')}</>
                ) : (
                  <><Send className="w-5 h-5" />{tr('btn.distribute')} {selectedPlatforms.length} {tr('step.preview')}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 完成 */}
        {step === 3 && (
          <div className="card text-center animate-fadeIn max-w-2xl mx-auto">
            <div className="success-checkmark">✓</div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{tr('complete.title')}</h2>
            <p className="text-gray-500 mb-8">{tr('complete.subtitle')}</p>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
              {distributionResults.map((r, i) => (
                <div key={i} className={`p-3 rounded-xl ${r.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="text-2xl mb-1">
                    {r.platform === 'weibo' && '📝'}
                    {r.platform === 'wechat' && '💬'}
                    {r.platform === 'email' && '📧'}
                    {r.platform === 'sms' && '📱'}
                    {r.platform === 'website' && '🌐'}
                  </div>
                  <div className="font-medium text-sm capitalize">{r.platform}</div>
                  <div className={`text-xs ${r.status === 'success' ? 'text-success' : 'text-error'}`}>
                    {r.status === 'success' ? tr('complete.success') : tr('complete.failed')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 justify-center flex-col sm:flex-row">
              <button onClick={() => { setStep(1); setGeneratedAd(null); setDistributionResults([]); setFormData({product:'',problem:'',features:'',benefits:'',target:'',event:'',date:'',location:'',activities:'',name:'',title:'',services:'',contact:'',keywords:'',coverImage:'',phone:'',email: ''}); }} className="btn btn-secondary">
                {tr('btn.createNew')}
              </button>
              {generatedAd && (
                <a href={generatedAd.h5Url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <ExternalLink className="w-4 h-4" />{tr('btn.viewH5')}
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 py-4">
        <div className="container text-center text-gray-500 text-sm">
          <p>{tr('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
