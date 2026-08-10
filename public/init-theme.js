(function () {
  try {
    var theme = localStorage.getItem("flixo-theme");
    document.documentElement.classList.toggle("dark", theme !== "light");
  } catch (_) {}
})();
