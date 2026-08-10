import type { CategoryId } from "./categories";

export type KnowledgeArticleTemplate = "how-to" | "best" | "compare" | "guide" | "faq";

export interface KnowledgeArticleSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  templateId: KnowledgeArticleTemplate;
  summary: string;
  toolIds: string[];
  categoryId: CategoryId;
  relatedArticleSlugs: string[];
  relatedComparisonSlug?: string;
  faqs?: Array<{ question: string; answer: string }>;
  sections: KnowledgeArticleSection[];
}

export interface BestToolsPage {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  categoryId: CategoryId;
  summary: string;
  recommendedToolIds: string[];
  relatedArticleSlugs: string[];
  faqs?: Array<{ question: string; answer: string }>;
}

export const knowledgeHubArticles: KnowledgeArticle[] = [
  {
    id: "translator-how-to",
    slug: "how-to-translate-text-accurately-in-seconds",
    title: "How to Translate Text Accurately in Seconds",
    metaDescription:
      "Learn how to translate text privately and accurately with Flixo Translator for everyday work, support, and multilingual communication.",
    keywords: ["translate text online", "how to translate", "private translation guide"],
    templateId: "how-to",
    summary:
      "A practical walkthrough for using browser-based translation tools without sacrificing privacy or speed.",
    toolIds: ["translator"],
    categoryId: "translation",
    relatedArticleSlugs: [
      "flixo-translator-guide",
      "best-translation-tools-for-privacy-conscious-teams",
    ],
    relatedComparisonSlug: "translator-vs-google-translate",
    faqs: [
      {
        question: "Can I translate sensitive text safely in a browser?",
        answer:
          "Yes. Browser-based translation keeps your text in the active session and avoids unnecessary cloud storage.",
      },
    ],
    sections: [
      {
        heading: "Why an accurate workflow matters",
        body: "Translation quality depends on context, tone, and the ability to preserve meaning without introducing awkward phrasing.",
        bullets: [
          "Paste short messages, emails, or support replies directly into the tool.",
          "Choose the source language automatically or override it when you know the input language.",
          "Review the output for product names, tone, and cultural nuance before sharing it.",
        ],
      },
      {
        heading: "A reliable step-by-step process",
        body: "A fast translation workflow is usually faster than copying text into multiple apps because it keeps the output near the original context.",
        bullets: [
          "Paste the content into Flixo Translator.",
          "Select the target language and review the output.",
          "Copy, export, or refine the result for your audience.",
        ],
      },
      {
        heading: "Best practices for polished results",
        body: "For product copy, support replies, or onboarding messages, a quick human review is still the best final step.",
      },
    ],
  },
  {
    id: "translator-guide",
    slug: "flixo-translator-guide",
    title: "Flixo Translator Guide: Fast, Private Language Translation",
    metaDescription:
      "Use Flixo Translator as a lightweight language workflow for support, content localization, and everyday multilingual tasks.",
    keywords: ["flixo translator guide", "browser translation", "private translator"],
    templateId: "guide",
    summary: "A focused guide for turning translation into a repeatable browser-based workflow.",
    toolIds: ["translator"],
    categoryId: "translation",
    relatedArticleSlugs: ["how-to-translate-text-accurately-in-seconds"],
    relatedComparisonSlug: "translator-vs-google-translate",
    faqs: [
      {
        question: "Is Flixo Translator good for business workflows?",
        answer:
          "Yes. It is especially useful for customer support replies, internal documents, and multilingual marketing copy.",
      },
    ],
    sections: [
      {
        heading: "What makes this workflow useful",
        body: "The main advantage is speed. Translation can happen in the same place where the original text is drafted, reviewed, and shared.",
      },
      {
        heading: "When to use it",
        body: "Use it for short-form content, communication, onboarding notes, and fast localization tasks.",
      },
    ],
  },
  {
    id: "best-translation-tools",
    slug: "best-translation-tools-for-privacy-conscious-teams",
    title: "Best Translation Tools for Privacy-Conscious Teams",
    metaDescription:
      "Compare lightweight translation tools that respect privacy, simplify workflows, and stay accessible from the browser.",
    keywords: ["best translation tools", "private translation tools", "browser translator"],
    templateId: "best",
    summary:
      "A shortlist of translation tools that prioritize privacy, speed, and a simpler experience than large cloud suites.",
    toolIds: ["translator"],
    categoryId: "translation",
    relatedArticleSlugs: ["flixo-translator-guide"],
    relatedComparisonSlug: "translator-vs-google-translate",
    faqs: [
      {
        question: "Why pick a smaller translator over a popular app?",
        answer:
          "Smaller tools remove friction, reduce account overhead, and stay useful for quick everyday tasks.",
      },
    ],
    sections: [
      {
        heading: "Why these tools stand out",
        body: "The best options are easy to launch, don’t require a full signup flow, and fit into daily workflows without bloating the process.",
        bullets: ["Fast access", "No heavy setup", "Useful for frequent copy review"],
      },
      {
        heading: "Who should use them",
        body: "They are ideal for founders, marketers, support teams, and anyone working across multiple languages on a daily basis.",
      },
    ],
  },
  {
    id: "image-enhancer-guide",
    slug: "how-to-enhance-photos-in-your-browser",
    title: "How to Enhance Photos in Your Browser",
    metaDescription:
      "Learn how to sharpen, upscale, and restore images in a private browser-based workflow with Flixo Image Enhancer.",
    keywords: ["enhance photos online", "browser image upscaling", "photo restoration guide"],
    templateId: "how-to",
    summary:
      "A practical introduction to upgrading photo quality without truckloads of software or cloud uploads.",
    toolIds: ["image-enhancer"],
    categoryId: "images",
    relatedArticleSlugs: [
      "best-image-upscaling-tools-for-ecommerce",
      "how-to-remove-backgrounds-for-product-photos",
    ],
    relatedComparisonSlug: "image-enhancer-vs-adobe-express",
    faqs: [
      {
        question: "Can I sharpen photos without uploading them to a cloud service?",
        answer:
          "Yes. Browser-based enhancers process the image locally in memory and keep the workflow private.",
      },
    ],
    sections: [
      {
        heading: "A simple enhancement process",
        body: "Upload the image, choose the strength of enhancement, and review the result before saving the new version.",
        bullets: [
          "Aim for clarity instead of over-processing.",
          "Use lower settings for portraits and higher settings for old scans.",
        ],
      },
      {
        heading: "When to use it",
        body: "It is helpful for product photos, social posts, old family photos, and any image that needs a quick quality upgrade.",
      },
    ],
  },
  {
    id: "best-image-upscaling",
    slug: "best-image-upscaling-tools-for-ecommerce",
    title: "Best Image Upscaling Tools for E-Commerce",
    metaDescription:
      "Find the right tools for increasing image quality and clarity for product photography and storefronts.",
    keywords: ["best image upscaling tools", "ecommerce image quality"],
    templateId: "best",
    summary:
      "A simple guide to choosing the right image enhancement workflow for online stores and content teams.",
    toolIds: ["image-enhancer", "image-compressor"],
    categoryId: "images",
    relatedArticleSlugs: ["how-to-enhance-photos-in-your-browser"],
    relatedComparisonSlug: "image-enhancer-vs-adobe-express",
    faqs: [
      {
        question: "Which tool should I pick first?",
        answer:
          "Start with an enhancer for quality upgrades, then compress the final export for web use.",
      },
    ],
    sections: [
      {
        heading: "What matters most",
        body: "The best choice balances clarity, speed, and file size so the final image still loads quickly on mobile devices.",
      },
    ],
  },
  {
    id: "background-remover-guide",
    slug: "how-to-remove-backgrounds-for-product-photos",
    title: "How to Remove Backgrounds for Product Photos",
    metaDescription:
      "Use a browser-based background removal workflow to create clean product cutouts without credits, signups, or watermarks.",
    keywords: ["remove background online", "product photo cutout guide"],
    templateId: "guide",
    summary:
      "A practical walkthrough for turning messy photos into clean cutouts for ecommerce and marketing.",
    toolIds: ["background-remover"],
    categoryId: "images",
    relatedArticleSlugs: ["best-image-upscaling-tools-for-ecommerce"],
    relatedComparisonSlug: "background-remover-vs-remove-bg",
    faqs: [
      {
        question: "Can I export a full-resolution product cutout?",
        answer:
          "Yes. Full-resolution transparent PNG export helps you keep the original product quality for storefronts and ads.",
      },
    ],
    sections: [
      {
        heading: "Workflow overview",
        body: "Start with a clear product photo, remove the background, and export a transparent cutout that is ready for a storefront or campaign.",
      },
    ],
  },
  {
    id: "image-compressor-guide",
    slug: "how-to-compress-images-for-faster-websites",
    title: "How to Compress Images for Faster Websites",
    metaDescription:
      "Shrink images for faster web pages and smoother email delivery without sacrificing readability.",
    keywords: ["compress images", "image optimization guide", "faster website images"],
    templateId: "guide",
    summary:
      "A lightweight guide to making images smaller, faster, and easier to share across the web.",
    toolIds: ["image-compressor"],
    categoryId: "images",
    relatedArticleSlugs: ["how-to-enhance-photos-in-your-browser"],
    faqs: [
      {
        question: "Will compression hurt the visual quality too much?",
        answer:
          "When done carefully, it reduces file size while preserving a high-quality visual result for everyday web use.",
      },
    ],
    sections: [
      {
        heading: "Why image size matters",
        body: "Large files slow page speed and make sharing harder, especially on mobile networks.",
      },
      {
        heading: "A simple workflow",
        body: "Compress the final export after editing so the image stays sharp but loads faster.",
      },
    ],
  },
  {
    id: "password-generator-guide",
    slug: "how-to-create-secure-passwords-in-seconds",
    title: "How to Create Secure Passwords in Seconds",
    metaDescription:
      "Use a privacy-first password generator to create strong credentials without relying on memorable patterns or weak reuse.",
    keywords: ["secure password generator", "create strong password"],
    templateId: "guide",
    summary:
      "A simple guide to generating strong passwords that are safe for work accounts, personal apps, and subscriptions.",
    toolIds: ["password-generator"],
    categoryId: "utilities",
    relatedArticleSlugs: [],
    faqs: [
      {
        question: "Should I use one password for everything?",
        answer:
          "No. A password generator helps create unique values for each account and reduces the impact of breaches.",
      },
    ],
    sections: [
      {
        heading: "Why unique passwords matter",
        body: "Reusing passwords creates compounding risk when only one service is breached.",
      },
      {
        heading: "Best habits",
        body: "Generate a long random password, store it safely, and rotate it when a service is compromised.",
      },
    ],
  },
  {
    id: "qr-guide",
    slug: "how-to-create-qr-codes-that-never-break",
    title: "How to Create QR Codes That Never Break",
    metaDescription:
      "Generate vector QR codes that remain dependable for Wi-Fi, URLs, and product links without external redirects.",
    keywords: ["create qr code", "wifi qr code generator", "persistent qr code"],
    templateId: "guide",
    summary:
      "A guide to creating static QR codes that stay stable and useful in physical and digital campaigns.",
    toolIds: ["qr-generator"],
    categoryId: "utilities",
    relatedArticleSlugs: [],
    faqs: [
      {
        question: "Why choose a static QR code?",
        answer:
          "Static codes are more reliable because they contain the exact payload and do not depend on a third-party redirect service.",
      },
    ],
    sections: [
      {
        heading: "What makes QR codes powerful",
        body: "They connect physical objects, packaging, and brochures to digital content instantly without extra setup.",
      },
    ],
  },
];

export const bestToolsPages: BestToolsPage[] = [
  {
    id: "best-translation-tools-page",
    slug: "best-tools-for-translation",
    title: "Best Tools for Translation Workflows",
    metaDescription:
      "Find the best browser-based translation tools for private, fast multilingual communication.",
    keywords: ["best translation tools", "translation workflow", "browser translation"],
    categoryId: "translation",
    summary:
      "A focused collection of translation tools for support, localization, and everyday multilingual work.",
    recommendedToolIds: ["translator"],
    relatedArticleSlugs: ["flixo-translator-guide", "how-to-translate-text-accurately-in-seconds"],
    faqs: [
      {
        question: "What is the best option for low-friction translation?",
        answer:
          "A lightweight browser tool is often better than a large app when you need to get the job done quickly.",
      },
    ],
  },
  {
    id: "best-image-tools-page",
    slug: "best-tools-for-image-workflows",
    title: "Best Tools for Image Workflows",
    metaDescription:
      "Discover the best browser-based tools for enhancing, removing backgrounds, and compressing images.",
    keywords: ["best image tools", "image workflow tools", "browser image tools"],
    categoryId: "images",
    summary:
      "A practical starting point for creators, marketers, and ecommerce teams working with photos.",
    recommendedToolIds: ["image-enhancer", "background-remover", "image-compressor"],
    relatedArticleSlugs: [
      "how-to-enhance-photos-in-your-browser",
      "how-to-remove-backgrounds-for-product-photos",
    ],
    faqs: [
      {
        question: "Which image tool should I use first?",
        answer:
          "Use an enhancer for quality, a background remover for product cutouts, and a compressor for performance.",
      },
    ],
  },
  {
    id: "best-utilities-page",
    slug: "best-tools-for-productivity-and-security",
    title: "Best Tools for Productivity and Security",
    metaDescription:
      "Find the best utilities for secure passwords, QR links, and simple daily browser tasks.",
    keywords: ["best productivity tools", "security tools", "browser utilities"],
    categoryId: "utilities",
    summary:
      "A quick overview of lightweight utilities that support security, sharing, and everyday workflows.",
    recommendedToolIds: ["password-generator", "qr-generator"],
    relatedArticleSlugs: [
      "how-to-create-secure-passwords-in-seconds",
      "how-to-create-qr-codes-that-never-break",
    ],
    faqs: [
      {
        question: "Are these tools useful for daily work?",
        answer:
          "Yes. They remove friction from repetitive tasks and help keep secure data flowing cleanly.",
      },
    ],
  },
];

export function getKnowledgeArticle(slug: string) {
  return knowledgeHubArticles.find((article) => article.slug === slug || article.id === slug);
}

export function getBestToolsPage(slug: string) {
  return bestToolsPages.find((page) => page.slug === slug || page.id === slug);
}
