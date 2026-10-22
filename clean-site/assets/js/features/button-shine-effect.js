/**
 * Adds the animated "shine" sweep to Zero Block buttons marked with
 * `data-animate-btn-effect` in the RSVP call-to-action section.
 * Wider buttons get a wider shine (styles in the section CSS).
 */
(function () {
  'use strict';

  var MEDIUM_WIDTH = 230;
  var LARGE_WIDTH = 750;

  t_onReady(function () {
    var rec = document.getElementById('rec' + window.PAGE_SECTIONS.rsvpCallToAction);
    if (!rec) return;

    var buttons = rec.querySelectorAll('[data-animate-btn-effect] .tn-atom');

    Array.prototype.forEach.call(buttons, function (button) {
      var effect = button.querySelector('.t-btn_wrap-effects');
      if (!effect) {
        button.insertAdjacentHTML('beforeend', '<div class="t-btn_wrap-effects"><div class="t-btn_effects"></div></div>');
        effect = button.querySelector('.t-btn_wrap-effects');
      }

      if (button.offsetWidth > LARGE_WIDTH) {
        effect.classList.add('t-btn_wrap-effects_lg');
      } else if (button.offsetWidth > MEDIUM_WIDTH) {
        effect.classList.add('t-btn_wrap-effects_md');
      }
    });
  });
})();
