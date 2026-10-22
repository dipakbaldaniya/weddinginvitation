// TEMPORARY diagnostic: reports how/when the envelope opens to the local serve.py log. Remove after debugging.
(function () {
  var t0 = performance.now();
  var events = [];
  function ms() { return Math.round(performance.now() - t0); }
  function log(s) { if (events.length < 25) events.push(ms() + ':' + s); }

  // Every pointer/mouse/touch/key input, captured before any page handler.
  ['pointerdown', 'mousedown', 'click', 'touchstart', 'keydown'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var target = e.target && e.target.closest ? (e.target.closest('[class*="popup-enter"]') ? 'SEAL' : e.target.tagName) : '?';
      var stack = '';
      if (!e.isTrusted) stack = (new Error().stack || '').split('\n').slice(2, 5).join(' | ');
      log(type + ' trusted=' + e.isTrusted + ' ptr=' + (e.pointerType || '') + ' key=' + (e.key || '') +
        ' xy=' + Math.round(e.clientX || 0) + ',' + Math.round(e.clientY || 0) + ' target=' + target + (stack ? ' stack=' + stack : ''));
    }, true);
  });

  // When the html class changes (envelope-closed -> envelope-opening).
  new MutationObserver(function () {
    log('htmlClass=' + document.documentElement.className);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Scroll position changes.
  var lastY = -1;
  setInterval(function () {
    if (scrollY !== lastY) { log('scrollY=' + Math.round(scrollY)); lastY = scrollY; }
  }, 100);

  document.addEventListener('DOMContentLoaded', function () { log('DOMContentLoaded cls=' + document.documentElement.className); });
  window.addEventListener('load', function () {
    log('load cls=' + document.documentElement.className + ' nav=' +
      ((performance.getEntriesByType('navigation')[0] || {}).type) + ' restoration=' + history.scrollRestoration);
    setTimeout(function () {
      var h = document.documentElement;
      var data = {
        ua: navigator.userAgent.slice(-45),
        inner: innerWidth + 'x' + innerHeight,
        client: h.clientWidth + 'x' + h.clientHeight,
        touch: navigator.maxTouchPoints,
        cls: h.className,
        events: events,
      };
      new Image().src = '/__debug2?' + encodeURIComponent(JSON.stringify(data));
    }, 6000);
  });
})();
