# Flixo Survey System

## Admin review

The admin layer has two separate responsibilities:

- **Tool manual review** is private QA and never uses the public star.
- **Survey management** creates the questions that visitors answer through public survey links.

The admin survey builder is available at `/admin/surveys` behind `AdminGate`.

## Supported question types

1. Single choice
2. Multiple choice
3. Dropdown
4. Scale
5. Star rating
6. NPS (0–10)
7. Yes / No
8. Short text
9. Long text
10. Number
11. Date
12. Email
13. URL
14. Ranking
15. Matrix / single selection per row
16. Matrix / multiple selections per row
17. Consent / agreement

## Per-question configuration

`survey_questions.config` is JSON so the same database model can safely represent different controls.

Examples:

- `scale`: `{ "min": 1, "max": 5, "minLabel": "الأقل", "maxLabel": "الأعلى" }`
- `rating`: `{ "max": 5 }`
- `nps`: `{ "min": 0, "max": 10, "detractorMax": 6, "promoterMin": 9 }`
- `text` / `textarea`: `{ "maxLength": 300 }`
- `number`: `{ "min": 0, "max": 100, "step": 1 }`
- `matrix_single`: `{ "rows": ["سهولة الاستخدام", "السرعة"], "columns": ["سيئ", "مقبول", "ممتاز"] }`
- `matrix_multi`: `{ "rows": ["ميزة 1", "ميزة 2"], "columns": ["مهم", "مفيد", "غير مهم"] }`
- `consent`: `{ "label": "أوافق على المشاركة" }`

## Public participation

Active surveys can be rendered at `/survey/<slug>`. The public endpoint exposes only active, scheduled surveys and does not expose respondent identity.

Responses carry only an optional session-scoped random identifier and locale. No name, email, IP address, or user-agent is required by the survey response schema.

## Important limitation

File-upload questions are intentionally not enabled yet. A real upload flow needs an approved storage backend, MIME validation, size limits, malware scanning policy, retention policy, and secure object access. The system does not pretend that a file-upload control works until those pieces exist.

## Quality rules

- A survey can remain Draft until the admin activates it.
- Start/end dates are validated.
- Maximum responses can close a survey automatically.
- Required questions are validated on submission.
- Unknown question IDs are rejected.
- Matrix questions require rows and columns.
- Public survey pages are `noindex` because they are interactive campaign surfaces, not evergreen SEO pages.
