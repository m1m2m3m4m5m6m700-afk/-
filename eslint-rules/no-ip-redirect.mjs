export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow automatic locale redirects based on browser locale or request headers.' },
    schema: [],
    messages: {
      localeRedirect: 'SEO rule violation: do not automatically redirect based on navigator.language or request language headers.',
    },
  },
  create(context) {
    const source = context.sourceCode.getText();
    const hasBrowserLocaleSignal = /navigator\.language|navigator\.languages/.test(source);
    const hasRedirectSignal = /(?:window\.)?location(?:\.href|\.assign|\.replace)?\s*=|location\.(?:assign|replace)\s*\(/.test(source);
    const hasRequestLanguageSignal = /headers?\s*\([^)]*(?:accept-language|accept_language)|['"]accept-language['"]/.test(source);

    if (!((hasBrowserLocaleSignal || hasRequestLanguageSignal) && hasRedirectSignal)) return {};

    return {
      Program(node) {
        context.report({ node, messageId: 'localeRedirect' });
      },
    };
  },
};
