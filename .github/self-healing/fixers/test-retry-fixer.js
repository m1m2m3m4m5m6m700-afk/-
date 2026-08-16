export const policy = {
  name: 'test-retry-fixer',
  autoApply: false,
  reason: 'Flaky E2E behavior requires evidence before changing timing, retry, or runtime semantics.',
  escalation: 'human-review',
};
