(function () {
  try {
    var supported = ["en", "ar"];
    var stored = localStorage.getItem("flixo-lang");
    if (supported.indexOf(stored) === -1) {
      stored = null;
      var browserLanguages = navigator.languages || [navigator.language];
      for (var i = 0; i < browserLanguages.length; i++) {
        var browserLanguage = browserLanguages[i] || "";
        for (var j = 0; j < supported.length; j++) {
          if (browserLanguage.toLowerCase().indexOf(supported[j]) === 0) {
            stored = supported[j];
            break;
          }
        }
        if (stored) break;
      }
    }
    var locale = stored || "en";
    var root = document.documentElement;
    root.setAttribute("lang", locale);
    root.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  } catch (_) {}
})();
