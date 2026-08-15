# Flixo localization rollout

## Rule
Each non-English locale is completed and verified independently before moving to the next language.

A locale is considered complete only when:
- Its dictionary contains every key from `src/lib/i18n/locales/en.ts`.
- No value falls back to English.
- No non-brand UI value is identical to the English source.
- Interpolation placeholders match the English key exactly.
- Tool names, categories, navigation, assistant, chat, forms, errors, SEO UI and tool-page chrome are translated.
- RTL languages pass directional UI review.
- The localized home route renders exclusively in the selected language.

## Order
1. Arabic (`ar`) — RTL, first complete production locale.
2. Spanish (`es`).
3. French (`fr`).
4. German (`de`).
5. Portuguese (`pt`).
6. Italian (`it`).
7. Turkish (`tr`).
8. Russian (`ru`).
9. Ukrainian (`uk`).
10. Polish (`pl`).
11. Dutch (`nl`).
12. Swedish (`sv`).
13. Romanian (`ro`).
14. Greek (`el`).
15. Czech (`cs`).
16. Persian (`fa`) — RTL.
17. Hebrew (`he`) — RTL.
18. Hindi (`hi`).
19. Bengali (`bn`).
20. Indonesian (`id`).
21. Malay (`ms`).
22. Vietnamese (`vi`).
23. Thai (`th`).
24. Korean (`ko`).
25. Japanese (`ja`).
26. Simplified Chinese (`zh-CN`).

## Per-language execution checklist
1. Freeze the English key set for the language task.
2. Audit the locale file for all inherited `...en` values.
3. Translate every dictionary value and remove English inheritance.
4. Translate dynamic UI strings outside dictionaries and route metadata.
5. Translate Flex prompts, status labels and error messages for the locale.
6. Verify tool/category names and descriptions use the locale dictionary.
7. Verify no English fallback exists in the active locale.
8. Run localization validation and typecheck.
9. Review the localized home page and key tool pages.
10. Mark the locale complete, then move to the next language.

Arabic is the first locale in this rollout. No other locale is considered complete until Arabic passes the full gate.
