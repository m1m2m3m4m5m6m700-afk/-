export type ProductEventName =
  | 'intent_submitted'
  | 'workflow_suggested'
  | 'workflow_started'
  | 'step_skipped'
  | 'workflow_completed'
  | 'download_clicked'
  | 'repeat_workflow';

export const trackProductEvent = (name: ProductEventName, payload: Record<string, string | number | boolean> = {}) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('flixo:product-event', { detail: { name, payload, at: Date.now() } }));
  try {
    const key = `flixo:event:${name}`;
    const current = Number(window.localStorage.getItem(key) ?? '0');
    window.localStorage.setItem(key, String(current + 1));
  } catch {
    // Analytics is observational only; never block the product flow.
  }
};
