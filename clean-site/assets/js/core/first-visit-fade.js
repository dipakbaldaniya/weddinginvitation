/**
 * Fades the page in on a visitor's first page view of the session (desktop only, >= 980px).
 * Skipped for search-engine/social crawlers so they see content immediately.
 *
 * Loaded synchronously in <head> so the hiding style is in place before first paint.
 */
(function () {
  'use strict';

  var CRAWLER_PATTERN = /bot|google|yandex|baidu|bing|msn|duckduckbot|teoma|slurp|crawler|spider|robot|crawling|facebook/i;
  var VISITED_KEY = 'visited';

  var FADE_CSS =
    '@media screen and (min-width: 980px) {' +
    '.t-records {opacity: 0;}' +
    '.t-records_animated {transition: opacity ease-in-out .2s;}' +
    '.t-records.t-records_visible {opacity: 1;}' +
    '}';

  function hasVisitedThisSession() {
    try {
      return sessionStorage.getItem(VISITED_KEY) === 'y';
    } catch (e) {
      return true; // storage blocked: just show the page
    }
  }

  function markVisited() {
    try {
      sessionStorage.setItem(VISITED_KEY, 'y');
    } catch (e) { /* storage blocked */ }
  }

  if (CRAWLER_PATTERN.test(navigator.userAgent) || hasVisitedThisSession() || !document.visibilityState) return;

  var style = document.createElement('style');
  style.textContent = FADE_CSS;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', function () {
    var records = document.querySelectorAll('.t-records');

    Array.prototype.forEach.call(records, function (el) {
      el.classList.add('t-records_animated');
    });

    setTimeout(function () {
      Array.prototype.forEach.call(records, function (el) {
        el.classList.add('t-records_visible');
      });
      markVisited();
    }, 400);
  });
})();
