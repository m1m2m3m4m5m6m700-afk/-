import { createRoute, Link, useParams } from '@tanstack/react-router';
import { ArrowRight, Check, Lock, Sparkles, Zap } from 'lucide-react';
import { getIntentSEO } from '../config/intents';
import { getWorkflow } from '../lib/workflows/registry';
import { planFromWorkflow } from '../lib/ai/planner';
import { INTENT_I18N } from '../lib/i18n/locales';
import { rootRoute } from './__root';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

export const arUseCaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ar/use-case/$slug',
  head: ({ params }) => {
    const intent = getIntentSEO(params.slug);
    const copy = INTENT_I18N[params.slug];
    if (!intent || !copy) return { meta: [{ title: 'حالة استخدام | FLIXO' }, { name: 'robots', content: 'noindex' }] };
    const canonical = `${SITE_URL}/ar/use-case/${intent.slug}`;
    const plan = planFromWorkflow(intent.workflowId, intent.preset ? { ...intent.preset } : {});
    const graph = {
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'SoftwareApplication', name: `FLIXO — ${copy.title}`, applicationCategory: 'MultimediaApplication', operatingSystem: 'Any', url: canonical, description: copy.description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
        { '@type': 'HowTo', name: copy.title, description: copy.description, step: (plan?.steps ?? []).map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.toolId, text: Object.keys(step.params ?? {}).length ? `نفّذ ${step.toolId} بالمعايير المحددة.` : `نفّذ ${step.toolId} على الصورة.` })) },
      ],
    };
    return { meta: [
      { title: `${copy.title} | FLIXO` }, { name: 'description', content: copy.description }, { name: 'keywords', content: copy.keywords.join(', ') },
      { name: 'robots', content: 'index,follow,max-image-preview:large' }, { property: 'og:title', content: copy.title }, { property: 'og:description', content: copy.description }, { property: 'og:locale', content: 'ar_EG' },
    ], links: [
      { rel: 'canonical', href: canonical }, { rel: 'alternate', hrefLang: 'ar', href: canonical }, { rel: 'alternate', hrefLang: 'en', href: `${SITE_URL}/en/use-case/${intent.slug}` }, { rel: 'alternate', hrefLang: 'x-default', href: `${SITE_URL}/en/use-case/${intent.slug}` },
    ], scripts: [{ type: 'application/ld+json', children: JSON.stringify(graph) }] };
  },
  component: function ArabicUseCasePage() {
    const { slug } = useParams({ from: '/ar/use-case/$slug' });
    const intent = getIntentSEO(slug); const copy = INTENT_I18N[slug];
    if (!intent || !copy) return <main dir="rtl" className="image-tool-shell"><div className="image-tool-container"><h1>حالة الاستخدام غير موجودة</h1><Link className="primary-button" to="/ar">العودة إلى FLIXO</Link></div></main>;
    const workflow = getWorkflow(intent.workflowId);
    const quickFlowUrl = `/ar/quickflow/${intent.workflowId}?preset=${encodeURIComponent(intent.slug)}`;
    return <main dir="rtl" className="image-tool-shell"><div className="image-tool-container"><Link to="/ar" className="language-link">← FLIXO</Link><section style={{ maxWidth: 860, paddingTop: 48 }}><p className="image-tool-eyebrow">FLIXO · حل جاهز للنتيجة</p><h1>{copy.title}</h1><p className="image-tool-lead">{copy.description}</p><div className="quickflow-ai-box" style={{ marginTop: 24 }}><div><strong>{copy.outcome}</strong><span>ابدأ بصورة واحدة؛ ويحافظ FLIXO على المسار مختصرًا ويستخدم المعالجة المحلية عندما تدعمها الأدوات.</span></div><a href={quickFlowUrl} className="primary-button">ابدأ هذا المسار <ArrowRight size={17} /></a></div><div className="home-workflow-grid" style={{ marginTop: 24 }}>{(workflow?.steps ?? []).map((step, index) => <div key={step.toolId}><span>{String(index + 1).padStart(2, '0')}</span><Check size={18} /><strong>{step.title}</strong><p>{step.optional ? 'خطوة اختيارية عند الحاجة.' : 'خطوة موصى بها لهذه النتيجة.'}</p></div>)}</div><div className="home-principles" style={{ marginTop: 28 }}><div><Zap size={18} /><strong>النتيجة أولًا</strong><span>ابدأ بهدف واضح بدل البحث عن اسم أداة.</span></div><div><Lock size={18} /><strong>محلي أولًا</strong><span>الخطوات المدعومة يمكن تنفيذها داخل المتصفح.</span></div><div><Sparkles size={18} /><strong>قابل للتكرار</strong><span>أعد استخدام المسار دون إعداد كل خطوة من جديد.</span></div></div></section></div></main>;
  },
});
