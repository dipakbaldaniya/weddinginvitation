/**
 * Hero background video: start muted autoplay; if the browser blocked it
 * (iOS low-power mode etc.), retry on the first touch.
 */
(function () {
  'use strict';

  t_onReady(function () {
    var video = document.getElementById('bgVideo2');
    if (!video) return;

    function tryPlay() {
      var result = video.play();
      if (result && typeof result.catch === 'function') result.catch(function () {});
    }

    tryPlay();

    document.addEventListener('touchstart', function () {
      if (video.paused) tryPlay();
    }, { once: true, passive: true });
  });
})();
