/**
 * Tilda page-view statistics.
 *
 * The key below belongs to the Tilda project this page was downloaded from,
 * so with stats enabled every visit to this copy is reported to that
 * project's dashboard. Disabled by default; set ENABLED to true only if this
 * copy is published as that same Tilda project.
 */
(function () {
  'use strict';

  var ENABLED = false;
  var PROJECT_STATS_KEY = 'aed5bb11e83b8f0989507efd8c6904b3';
  var STATS_SCRIPT_URL = 'https://static.tildacdn.net/js/tilda-stat-1.0.min.js';
  var LOAD_DELAY_MS = 2000;

  if (!window.mainTracker) window.mainTracker = 'tilda';
  window.tildastatcookie = 'no';

  if (!ENABLED) return;

  setTimeout(function () {
    var script = document.createElement('script');
    script.async = true;
    script.key = PROJECT_STATS_KEY;
    script.id = 'tildastatscript';
    script.src = STATS_SCRIPT_URL;
    document.head.appendChild(script);
  }, LOAD_DELAY_MS);
})();
