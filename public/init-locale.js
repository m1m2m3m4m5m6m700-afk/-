(function () {
  try {
    var supported = [
      "en",
      "ar",
      "es",
      "zh-CN",
      "hi",
      "pt",
      "fr",
      "de",
      "ja",
      "ko",
      "tr",
      "it",
      "vi",
      "id",
      "th",
      "pl",
      "nl",
      "sv",
      "uk",
      "ro",
      "el",
      "cs",
      "he",
      "bn",
      "fa",
    ];
    var rtl = ["ar", "he", "fa"];
    var stored = localStorage.getItem("flixo-lang");
    if (supported.indexOf(stored) === -1) {
      stored = null;
      var browserLanguages = navigator.languages || [navigator.language];
      outer: for (var i = 0; i < browserLanguages.length; i++) {
        var browserLanguage = (browserLanguages[i] || "").toLowerCase();
        // Exact match first so "zh-cn" → "zh-CN" is honored.
        for (var j = 0; j < supported.length; j++) {
          if (browserLanguage === supported[j].toLowerCase()) {
            stored = supported[j];
            break outer;
          }
        }
        // Then a prefix match on the primary subtag (e.g. "de-at" → "de").
        var primary = browserLanguage.split("-")[0];
        for (var k = 0; k < supported.length; k++) {
          if (primary === supported[k].toLowerCase()) {
            stored = supported[k];
            break outer;
          }
        }
      }
    }
    var locale = stored || "en";
    var root = document.documentElement;
    root.setAttribute("lang", locale);
    root.setAttribute("dir", rtl.indexOf(locale) === -1 ? "ltr" : "rtl");
  } catch (_) {}
})();
