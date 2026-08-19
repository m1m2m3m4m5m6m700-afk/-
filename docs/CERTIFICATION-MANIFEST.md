# Flixo Certification Manifest

## الهدف

يوحّد Gate Manifest شكل الأدلة وقرار الإصدار عبر الأدوات، ويربط كل Gate بالـcommit وRun ID وSHA-256 والصلاحية والـbaseline.

## الدورة

`Implement → Verify → Certify → Freeze → Promote → Next Tool`

## المكونات

- `scripts/certification/create-gate-manifest.mjs`: إنشاء manifest وحساب SHA-256.
- `scripts/certification/verify-gate-manifest.mjs`: التحقق من commit/run/hash/expiry وحالة Gate.
- `scripts/certification/verify-evidence-integrity.mjs`: تحقق مستقل من دليل واحد.
- `scripts/certification/verify-baseline.mjs`: تحقق من Baseline وProvenance وimmutability.
- `scripts/certification/release-decision.mjs`: جمع البوابات وإصدار `CERTIFIED` أو `REJECTED` مع فصل root/cascade failures.
- `scripts/certification/generate-gates.mjs`: جسر Workflow لإنشاء manifest موحد في نهاية كل Gate.

## بنية الـartifacts

```text
.artifacts/<tool>/
  <gate>/
    gate-evidence.json
    gate-manifest.json
  release/
    release-decision.json
```

## قواعد الإصدار

لا يُعتمد Gate إلا إذا كانت حالته `success`، والـcommit مطابقًا للـHEAD الحالي، والـRun ID مطابقًا لدورة الاعتماد، وSHA-256 للدليل صحيحًا، والـmanifest غير منتهٍ.

لا يُعتبر غياب البوابات اللاحقة بعد Root Failure أخطاء جذور مستقلة؛ تُسجل كـ`cascade`.

## Baseline

الـBaseline المجمّد لا يتغير عند إعادة التشغيل العابر. إعادة التشغيل تعني re-validation. لا يُنشأ Baseline جديد إلا بعد دورة Certification كاملة.

## أوامر التحقق

```bash
npm run test:certification
```

لإنشاء Manifest داخل Workflow:

```bash
TOOL=pdf-merge \
GATE=fast \
GATE_STATUS=success \
EVIDENCE_PATH=.artifacts/pdf-merge/fast/gate-evidence.json \
node scripts/certification/generate-gates.mjs
```
