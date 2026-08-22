import { createRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Check, Lock, Search, Sparkles, Zap } from 'lucide-react';
import { HOMEPAGE_COPY } from '../lib/i18n/locales';
import { rootRoute } from './__root';

const arabicJobs = [
  ['صورة منتج جاهزة', '/ar/quickflow/product-ready'],
  ['منشور للسوشيال ميديا', '/ar/quickflow/social-ready'],
  ['تحسين صورة شخصية', '/ar/quickflow/profile-ready'],
  ['تحسين جودة الصورة', '/ar/quickflow/improve-image'],
] as const;

export const arIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ar',
  head: () => ({
    meta: [
      { title: HOMEPAGE_COPY.ar.title },
      { name: 'description', content: HOMEPAGE_COPY.ar.description },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
      { property: 'og:title', content: HOMEPAGE_COPY.ar.title },
      { property: 'og:description', content: HOMEPAGE_COPY.ar.description },
      { property: 'og:locale', content: 'ar_EG' },
    ],
    links: [
      { rel: 'canonical', href: 'https://flixo.app/ar' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://flixo.app/' },
      { rel: 'alternate', hrefLang: 'ar', href: 'https://flixo.app/ar' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://flixo.app/' },
    ],
  }),
  component: function ArabicHomePage() {
    return (
      <main dir="rtl" className="home-shell">
        <header className="home-nav-wrap"><div className="home-nav">
          <Link to="/ar" className="home-brand" aria-label="الصفحة الرئيسية FLIXO"><span className="home-brand-mark">F</span><span>FLIXO</span></Link>
          <nav className="home-nav-links" aria-label="التنقل الرئيسي"><a href="#quickflows">المسارات السريعة</a><a href="#tools">الأدوات</a><Link to="/">English</Link></nav>
          <Link to="/ar/image-compressor" className="home-nav-cta">ابدأ الآن</Link>
        </div></header>
        <div className="home-container home-modern">
          <section className="home-hero" aria-labelledby="ar-home-title">
            <div className="home-hero-copy">
              <p className="image-tool-eyebrow">FLIXO · مسارات صور محلية أولًا</p>
              <h1 id="ar-home-title">أخبر FLIXO بالنتيجة التي تريدها، واترك الباقي علينا.</h1>
              <p className="home-lead home-hero-lead">ابدأ بالهدف بدل البحث عن اسم الأداة. اختر مسارًا جاهزًا أو اشرح ما تحتاجه، وسيوجّهك FLIXO إلى أقصر طريق.</p>
              <div className="home-search" role="search">
                <Search size={20} aria-hidden="true" />
                <input placeholder="مثال: جهّز صورة المنتج للمتجر" aria-label="اكتب ما تريد إنجازه" />
                <kbd>/</kbd>
              </div>
              <div className="home-local-note"><Lock size={15} /><span>معالجة محلية أولًا: الأدوات التي تدعم المعالجة داخل المتصفح لا تحتاج إلى رفع الصورة إلى خادم FLIXO.</span></div>
            </div>
            <div className="home-hero-card">
              <div className="home-hero-card-top"><span className="home-card-badge"><Sparkles size={14} /> QuickFlow</span><span className="home-card-muted">بدون تعقيد</span></div>
              <div className="home-hero-card-content"><div className="home-hero-icon"><Zap size={30} /></div><p className="home-hero-card-title">هدف واحد. مسار واضح.</p><p className="home-hero-card-copy">FLIXO يخفي سلسلة الأدوات خلف خطوة بسيطة تركّز على النتيجة النهائية.</p><div className="home-hero-mini-flow"><span><b>1</b> الهدف</span><span><b>2</b> المسار</span><span><b>3</b> النتيجة</span></div><Link to="/ar/quickflow/product-ready" className="primary-button home-hero-button">جرّب Product Ready <ArrowUpRight size={17} /></Link></div>
            </div>
          </section>
          <section id="quickflows" className="home-quick-section" aria-labelledby="ar-quick-title">
            <div className="home-section-heading"><div><p className="home-section-kicker">ابدأ من النتيجة</p><h2 id="ar-quick-title">مسارات جاهزة للمهام الشائعة</h2></div><span>4 مسارات</span></div>
            <div className="home-featured-grid">{arabicJobs.map(([label, path]) => <Link key={path} to={path} className="home-featured-card"><span className="home-featured-copy"><strong>{label}</strong><span>ارفع الصورة ونفّذ المسار مباشرة.</span></span><ArrowUpRight className="home-featured-arrow" size={18} /></Link>)}</div>
          </section>
          <section id="tools" className="home-principles"><div><Check size={18} /><strong>نتيجة أولًا</strong><span>لا تحتاج لمعرفة أسماء الأدوات.</span></div><div><Lock size={18} /><strong>محلي أولًا</strong><span>المعالجة المحلية تبقى على جهازك عندما تدعمها الأداة.</span></div><div><Sparkles size={18} /><strong>ذكاء اختياري</strong><span>الذكاء الاصطناعي يخطط عند الطلب ولا يوقف التشغيل الأساسي.</span></div></section>
          <footer className="home-footer"><span>FLIXO · محرك مسارات لمعالجة الصور.</span><Link to="/">النسخة الإنجليزية <ArrowUpRight size={15} /></Link></footer>
        </div>
      </main>
    );
  },
});
