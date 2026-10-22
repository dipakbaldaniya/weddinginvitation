/**
 * Background music.
 *
 * Browsers block autoplay with sound, so the song starts when the guest taps
 * the envelope seal ("Click to open"). A floating button then toggles play/pause.
 */
(function () {
  'use strict';

  var ENTER_BUTTON_SELECTOR = '.popup-enter';

  t_onReady(function () {
    var enterButton = document.querySelector(ENTER_BUTTON_SELECTOR);
    var audio = document.getElementById('invitation-audio');
    var control = document.getElementById('audio-control');
    var iconPlay = document.getElementById('icon-play');
    var iconPause = document.getElementById('icon-pause');
    if (!audio || !control || !iconPlay || !iconPause) return;

    // Keep the button icon in sync with the real playback state.
    function syncIcon() {
      var playing = !audio.paused;
      iconPlay.style.display = playing ? 'none' : 'block';
      iconPause.style.display = playing ? 'block' : 'none';
      control.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    }

    function play() {
      var result = audio.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function (err) {
          console.log('Audio play failed:', err);
          syncIcon();
        });
      }
    }

    function showControl() {
      control.classList.add('is-visible');
    }

    audio.addEventListener('play', syncIcon);
    audio.addEventListener('pause', syncIcon);

    if (enterButton) {
      enterButton.addEventListener('click', function () {
        audio.muted = false;
        play();
        showControl();
      });
    }

    control.addEventListener('click', function () {
      if (audio.paused) {
        play();
      } else {
        audio.pause();
      }
    });
  });
})();
