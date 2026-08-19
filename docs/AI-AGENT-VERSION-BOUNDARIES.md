# FLIXO CI Repair Agent — Version Boundaries

## الهدف

الإصدارات v1 وv2 وv3 هي runtimes مستقلة. لا يوجد اعتماد تنفيذي من إصدار إلى إصدار.

```text
scripts/flixo-agent/
├── v1/   # Repair Agent v1 — deterministic diagnosis/plan/verify/execute
├── v2/   # Repair Agent v2 — v1 capabilities reimplemented + cognitive context
└── v3/   # Repair Agent v3 — v2 capabilities reimplemented + strategic planning
```

## قواعد الاستقلال

1. لكل إصدار `index.mjs` خاص به.
2. لكل إصدار `VERSION.json` خاص به.
3. يمنع الاستيراد من `v1` إلى `v2` أو `v3`، والعكس.
4. لا يعتمد أي إصدار على runtime تنفيذي من إصدار آخر.
5. أي تحسين في إصدار لا يغيّر runtime لإصدار آخر تلقائيًا.
6. الترقية بين الإصدارات قرار صريح وليست side effect.
7. الاختبار `scripts/flixo-agent/tests/version-isolation.test.mjs` يمنع كسر هذه الحدود.

## الفرق بين الإصدارات

### v1
نواة إصلاح حتمية: تشخيص، تخطيط، تحقق، Dry Run وتنفيذ مقيّد.

### v2
نواة مستقلة تضيف Project Graph وDecision Memory فوق قدراتها الخاصة، دون استدعاء v1.

### v3
نواة مستقلة تضيف Cognitive Context وStrategic Planning المشروط، دون استدعاء v1 أو v2.

## مبدأ الترقية

الكود يمكن أن يُعاد استخدامه كمصدر تصميم، لكن runtime لا يُورث ضمنيًا. هذا يمنع أن يؤثر تحديث v3 على سلوك v1 أو v2.
