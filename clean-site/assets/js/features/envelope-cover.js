/**
 * Makes the "Click to open" envelope a true full-screen cover.
 *
 * In the Tilda design the envelope is simply the first ~850px of the page, so
 * the rest of the invitation shows below it (on tall screens) and guests can
 * scroll past it without opening it.
 *
 * While the page has the `envelope-closed` class (added in <head> by
 * core/envelope-lock.js), css/features/envelope.css pins the envelope over the
 * window, hides the other sections and disables scrolling. This script:
 *   - scales the envelope to cover any screen size with the seal centred
 *     (Tilda's artwork is ~1000px wide; the flap animations scale with it),
 *   - on click, unlocks the page (`envelope-opening`) while the flaps slide away,
 *   - removes the envelope once its opening animation has finished.
 */
(function () {
  'use strict';

  // Longest flap animation: 2500ms delay + 2000ms slide + 500ms fade (data-animate-sbs-opts).
  var OPEN_ANIMATION_MS = 5200;
  var OVERSCAN = 1.06;

  var root = document.documentElement;

  t_onReady(function () {
    var rec = document.getElementById('rec' + window.PAGE_SECTIONS.envelopeIntro);
    var artboard = rec && rec.querySelector('.t396__artboard');
    var seal = rec && rec.querySelector('.popup-enter');

    // Never leave the page locked if the envelope isn't there.
    if (!artboard || !seal) {
      root.classList.remove('envelope-closed');
      return;
    }

    var isOpened = false;

    /** Envelope artwork bounds (union of its elements) at scale 1, relative to the artboard. */
    function measureEnvelope() {
      var left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      Array.prototype.forEach.call(artboard.querySelectorAll('.t396__elem'), function (el) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        left = Math.min(left, r.left);
        right = Math.max(right, r.right);
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
      });
      var box = artboard.getBoundingClientRect();
      return {
        width: right - left,
        height: bottom - top,
        centerX: (left + right) / 2 - box.left,
        centerY: (top + bottom) / 2 - box.top,
      };
    }

    function fit() {
      // Once opened, the flaps are mid-animation: measuring now would be wrong.
      if (isOpened) return;

      artboard.style.transform = '';
      var size = measureEnvelope();
      if (!size.width || !size.height) return;

      var viewportWidth = root.clientWidth;
      var viewportHeight = window.innerHeight;
      // Grow (never shrink) so the artwork covers the window, like background-size: cover.
      // OVERSCAN: the flap images have soft/transparent edges, so cover a bit more than exactly.
      var scale = Math.max(1, viewportWidth / size.width, viewportHeight / size.height) * OVERSCAN;

      // Scale around the envelope's centre and move that centre to the middle
      // of the window, so the seal sits mid-screen. (Tilda may have laid the
      // artwork out slightly off-centre.)
      artboard.style.transformOrigin = size.centerX + 'px ' + size.centerY + 'px';
      artboard.style.transform =
        'translate(' + (viewportWidth / 2 - size.centerX) + 'px, ' + (viewportHeight / 2 - size.centerY) + 'px) ' +
        'scale(' + scale.toFixed(3) + ')';
    }

    window.scrollTo(0, 0);

    seal.addEventListener('click', function () {
      if (isOpened) return;
      isOpened = true;

      // Reveal and unlock the page while the flaps slide away.
      root.classList.add('envelope-opening');
      root.classList.remove('envelope-closed');

      // Once the flaps have slid away and faded, remove the (now invisible)
      // envelope so its empty boxes can't intercept clicks on the page underneath.
      // display:none rather than visibility, which Tilda overrides on the children.
      setTimeout(function () {
        rec.style.display = 'none';
        root.classList.remove('envelope-opening');
      }, OPEN_ANIMATION_MS);
    });

    // Zero Block positions its elements asynchronously; refit as layout settles.
    fit();
    t_onFuncLoad('t396_init', function () {
      setTimeout(fit, 300);
    });
    window.addEventListener('load', function () {
      if (!isOpened) window.scrollTo(0, 0);
      fit();
    });
    window.addEventListener('resize', fit);
  });
})();
