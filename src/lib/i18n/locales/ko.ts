import type { Dictionary } from "./en";
import { en } from "./en";

export const ko: Dictionary = {
  ...en,

  "lang.name": "한국어",
  "lang.switch": "언어 변경",

  "nav.tools": "도구",
  "nav.categories": "카테고리",
  "nav.popular": "인기",
  "nav.why": "Flixo를 선택하는 이유",
  "nav.faq": "자주 묻는 질문",
  "nav.openTranslator": "번역기 열기",
  "nav.toggleTheme": "테마 전환",
  "nav.toggleMenu": "메뉴 열기",

  "hero.badge": "하나의 워크스페이스, 모든 AI 도구",
  "hero.title": "모든 AI 도구를 위한 하나의 워크스페이스",
  "hero.description":
    "번역, 이미지, PDF, 글쓰기 및 유틸리티 — 다섯 개의 도구 허브가 하나의 차분한 인터페이스에 있습니다. 계정이나 API 키 없이 도구를 열면 바로 시작할 수 있습니다.",
  "hero.promo.badge": "신규",
  "hero.promo.body":
    "AI 이미지 인헨서를 지금 체험하세요 — 사진을 선명하게, 확대하고 노이즈를 즉시 제거합니다.",
  "hero.searchLabel": "무엇을 하고 싶은지 설명하세요",
  "hero.searchPlaceholder": "예: “아랍어로 번역”, “PDF 요약”, “이미지 생성”…",
  "hero.browse": "도구 둘러보기",
  "hero.cta": "번역기 체험",
  "hero.note": "무료 · 가입 불필요",

  "assistant.eyebrow": "AI 어시스턴트",
  "assistant.title": "필요한 것을 말씀하세요 — 알맞은 도구를 찾아드립니다",
  "assistant.placeholder": "작업을 설명하세요… 예: “문단을 프랑스어로 번역”",
  "assistant.button": "도구 찾기",
  "assistant.thinking": "생각하는 중…",
  "assistant.reset": "다른 질문하기",
  "assistant.result.category": "카테고리",
  "assistant.result.matched": "일치",
  "assistant.result.open": "도구 열기",
  "assistant.result.soon": "곧 출시",
  "assistant.suggestion.translation":
    "텍스트를 번역하시려는 것 같습니다. 번역기가 준비되어 있습니다.",
  "assistant.suggestion.images":
    "이미지 작업을 원하시는군요. 아직 이미지 도구가 없습니다 — 요청해 주시면 우선 개발합니다.",
  "assistant.suggestion.pdf":
    "PDF를 언급하셨습니다. 아직 PDF 도구가 없습니다 — 요청해 주시면 우선 개발합니다.",
  "assistant.suggestion.writing":
    "글쓰기 도움이 필요하시군요. 아직 도구가 없습니다 — 요청해 주시면 우선 개발합니다.",
  "assistant.suggestion.utilities":
    "유틸리티가 필요하시군요. 아직 없습니다 — 요청해 주시면 우선 개발합니다.",
  "assistant.suggestion.unknown":
    "어느 카테고리에 해당하는지 확신이 없습니다. 더 자세히 설명하거나 새 도구를 요청하세요.",
  "assistant.empty.title": "제안이 여기에 표시됩니다",
  "assistant.empty.body":
    "위에 작업을 입력하면 어시스턴트가 알맞은 Flixo 도구로 안내합니다 — 또는 새 도구를 요청하도록 도와드립니다.",

  "request.trigger": "도구 요청",
  "request.title": "새 도구 요청",
  "request.description": "필요한 것을 알려주시면 다음 버전에 우선 반영합니다.",
  "request.label": "이 도구는 무엇을 해야 하나요?",
  "request.placeholder": "예: 서식을 유지하며 PDF를 Word로 변환하는 도구…",
  "request.submit": "요청 제출",
  "request.cancel": "취소",
  "request.success": "감사합니다! 요청이 기록되었습니다 — 다음 버전에 우선 반영하겠습니다.",
  "request.ok": "완료",

  "categories.eyebrow": "도구 허브",
  "categories.title": "다섯 허브, 하나의 워크스페이스",
  "categories.description":
    "모든 Flixo 도구는 이러한 허브 중 하나에 속합니다. 현재는 자리 표시자이지만 성장할 준비가 되어 있습니다.",
  "categories.status.coming": "곧 출시",
  "categories.status.live": "{count}개 사용 가능",
  "categories.toolsLabel": "계획된 도구",
  "status.live": "사용 가능",
  "status.soon": "곧",

  "category.translation.name": "번역 허브",
  "category.translation.blurb": "자동 감지로 20개 이상의 언어를 번역, 현지화 및 자막 작업합니다.",
  "category.translation.tools": "번역기 · 현지화 도구 · 자막 번역기",
  "category.images.name": "이미지 도구",
  "category.images.blurb": "이미지를 생성, 확대하고 배경을 제거합니다.",
  "category.images.tools": "이미지 생성기 · 확대 도구 · 배경 제거",
  "category.pdf.name": "PDF 도구",
  "category.pdf.blurb": "PDF 문서를 병합, 분할, 압축 및 변환합니다.",
  "category.pdf.tools": "병합 · 분할 · 압축 · PDF를 Word로",
  "category.writing.name": "AI 글쓰기",
  "category.writing.blurb": "적절한 어조로 요약, 재작성 및 초안을 작성합니다.",
  "category.writing.tools": "요약기 · 재작성기 · 이메일 초안",
  "category.utilities.name": "유틸리티",
  "category.utilities.blurb": "일상적인 기술 스니펫을 서식 지정, 변환 및 생성합니다.",
  "category.utilities.tools": "JSON 포매터 · QR 생성기 · Base64 변환기",
  "category.developer.name": "개발자 도구",
  "category.developer.blurb": "일상적인 코드용 포매터, 검증기 및 생성기.",
  "category.developer.tools": "JSON 포매터 · XML 검증기 · Cron 파서",

  "tool.back": "모든 도구",

  "why.eyebrow": "Flixo를 선택하는 이유",
  "why.title": "기능 추가가 아니라 마찰을 줄이기 위해 설계",
  "why.speed.title": "기본적으로 즉시",
  "why.speed.body":
    "도구는 1초 미만으로 열리고 브라우저에서 실행됩니다 — 대기열이나 콜드 스타트가 없습니다.",
  "why.consistency.title": "일관된 인터페이스",
  "why.consistency.body":
    "모든 도구가 동일한 레이아웃, 단축키 및 결과 작업을 공유하여 다시 배울 필요가 없습니다.",
  "why.privacy.title": "프라이버시 우선",
  "why.privacy.body": "세션 간에 아무것도 저장하지 않습니다. 입력은 입력한 탭에 머무릅니다.",
  "why.access.title": "계정 없음, 키 없음",
  "why.access.body": "API 키, 대시보드 또는 좌석 관리 없이 도구를 열고 시작하세요.",
  "stats.tasks": "처리된 작업",
  "stats.languages": "지원 언어",
  "stats.latency": "중앙 응답 시간",
  "stats.uptime": "최근 12개월 가동률",

  "faq.eyebrow": "자주 묻는 질문",
  "faq.title": "질문에 답합니다",
  "faq.description": "첫 도구를 열기 전에 알아두면 좋은 모든 것.",
  "faq.q1": "Flixo는 무료인가요?",
  "faq.a1":
    "네. 현재 Flixo에서 사용 가능한 모든 도구는 무료이며 계정이나 카드가 필요하지 않습니다.",
  "faq.q2": "번역기는 어떻게 작동하나요?",
  "faq.a2":
    "텍스트를 붙여넣고 원본 및 대상 언어를 선택하거나(자동 감지에 맡기기 가능) Flixo가 번역을 반환합니다. 현재 빌드는 로컬 데모 엔진을 사용해 오프라인으로 전체 흐름을 탐색할 수 있습니다.",
  "faq.q3": "제가 입력한 내용을 저장하나요?",
  "faq.a3": "아니요. 입력과 출력은 브라우저 탭에만 존재하며 도구를 닫거나 지우면 사라집니다.",
  "faq.q4": "어떤 언어를 지원하나요?",
  "faq.a4": "라틴, 키릴, 아랍, 히브리, 인도계 및 CJK 문자의 스무 언어에 자동 원본 감지를 더합니다.",
  "faq.q5": "나머지 도구는 언제 출시되나요?",
  "faq.a5":
    "다섯 허브 — 번역, 이미지, PDF, 글쓰기, 유틸리티 — 가 로드맵입니다. 새 도구는 동일한 레지스트리에 연결되고 공유 레이아웃을 상속합니다.",

  "footer.tagline": "팀이 하루 동안 찾는 모든 AI 도구를 위한 차분한 워크스페이스.",
  "footer.product": "제품",
  "footer.featured": "추천 도구",
  "footer.popular": "인기 도구",
  "footer.numbers": "숫자",
  "footer.categories": "카테고리",
  "footer.tools": "도구",
  "footer.more": "더 보기 곧 출시",
  "footer.rights": "© {year} Flixo. 모든 권리 보유.",
  "footer.built": "빠르게 출시하는 팀을 위해 제작됨.",

  "translator.pageDescription": "원본 언어를 자동으로 감지하고 몇 초 만에 번역합니다.",
  "translator.from": "원본",
  "translator.to": "대상",
  "translator.auto": "자동 감지",
  "translator.swap": "언어 교환",
  "translator.inputPlaceholder": "번역할 텍스트를 입력하거나 붙여넣으세요…",
  "translator.inputLabel": "번역할 텍스트",
  "translator.detected": "{language} 감지됨",
  "translator.copy": "복사",
  "translator.copied": "복사됨",
  "translator.copyError": "클립보드에 복사할 수 없습니다.",
  "translator.genericError": "문제가 발생했습니다. 다시 시도하세요.",
  "translator.clear": "지우기",
  "translator.translate": "번역",
  "translator.translating": "번역 중…",
  "translator.emptyTitle": "번역 결과가 여기에 표시됩니다",
  "translator.emptyBody":
    "대상 언어를 선택하고 텍스트를 입력한 뒤 번역을 누르세요. 자동 감지가 원본을 찾습니다.",
};
