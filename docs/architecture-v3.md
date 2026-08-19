# FLIXO CI Repair Agent v3 — Architecture

## هدف v3

إضافة وعي سياقي وتخطيط متعدد الخطوات فوق Agent v1/v2 دون إعطاء LLM أو ML سلطة تجاوز العقود أو التحقق.

## المسار الحالي

```text
CI failure
  -> context.mjs
  -> cognitive/project-graph + decision-log
  -> cognitive/cognitive-engine.mjs
  -> diagnose.mjs (deterministic classification)
  -> planning/strategic-planner.mjs
  -> verifier.mjs
  -> dry-run / approval
  -> executor.mjs
  -> GitHub
  -> CI proof
```

## Cognitive Engine

`cognitive-engine.mjs` حتمي في الإصدار الأول. يستخدم:

- تشخيص `diagnose.mjs`.
- علاقات Project Graph.
- قرارات سابقة من Decision Log.
- تشابهًا نصيًا حتميًا للحالات السابقة.
- إشارات تأثير بسيطة للاعتماديات والـWorkflow.

Semantic embeddings وVector DB مؤجلة حتى يثبت الأساس الحتمي.

## Strategic Planner

`strategic-planner.mjs` ينتج خطوات مرتبطة بشروط:

- لكل خطوة `dependsOn`.
- لكل خطوة بوابة تحقق.
- لا يوجد `autoApply` افتراضيًا.
- لا تتجاوز الخطة ثلاث محاولات لنفس السبب الجذري.
- حالات `UNKNOWN` تتحول إلى `manual-review` بدل التخمين.

## حدود الأمان

- Verifier هو نقطة الحراسة النهائية.
- Dependency changes تمر عبر `dependency-executor`.
- Protected release workflow لا يدخل نطاق الإصلاح الاعتيادي.
- CI الأخضر على SHA الناتج هو شرط الإثبات النهائي.
- الذاكرة التاريخية تزيد الثقة لكنها لا تتغلب على الأدلة الحالية.

## الطبقات المؤجلة

بعد إثبات Cognitive Engine + Strategic Planner في CI:

1. risk evaluator
2. alternatives generator
3. confidence scorer
4. trust interface
5. learning loop
6. proactive health system
7. optional LLM/semantic retrieval layer
