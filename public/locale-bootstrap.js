(() => {
  const locale = window.location.pathname.split('/')[1] === 'ar' ? 'ar' : 'en';
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
})();
