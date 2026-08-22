import type { ToolConfig } from '@/config/tools';

export type WorkflowId =
  | 'product-ready'
  | 'social-ready'
  | 'profile-ready'
  | 'web-ready'
  | 'print-ready'
  | 'improve-image';

export type WorkflowStep = {
  readonly toolId: ToolConfig['id'];
  readonly title: string;
  readonly optional?: boolean;
};

export type Workflow = {
  readonly id: WorkflowId;
  readonly title: string;
  readonly description: string;
  readonly intentPatterns: readonly string[];
  readonly steps: readonly WorkflowStep[];
};

export type IntentMatch = {
  readonly kind: 'tool' | 'workflow' | 'none';
  readonly id: string | null;
  readonly confidence: number;
  readonly matchedTerms: readonly string[];
};
