/**
 * "Scratch to reveal the date" card.
 *
 * Each of the three tiles (day / month / year) is covered by a canvas painted
 * with a pale-blue metallic foil. Scratching erases the foil; once ~40% of a
 * tile is clear its foil fades away. When all three are revealed, the
 * "You're invited!" line appears with a flash and confetti.
 *
 * Markup lives in index.html (section `dateReveal`), styles in
 * assets/css/sections/04-date-reveal.css.
 */
(function () {
  'use strict';

  var TILES = [
    { tileId: 'tdr-tile-day', canvasId: 'tdr-cvs-day' },
    { tileId: 'tdr-tile-month', canvasId: 'tdr-cvs-month' },
    { tileId: 'tdr-tile-year', canvasId: 'tdr-cvs-year' },
  ];

  var BRUSH_RADIUS = 36;
  var REVEAL_THRESHOLD = 0.4; // fraction of foil cleared before auto-reveal
  var CHECK_PROBABILITY = 0.12; // pixel scan is costly: only check on ~12% of strokes
  var PIXEL_SAMPLE_STEP = 12; // read the alpha byte of every 3rd pixel (4 bytes each)
  var FADE_STEP = 0.055;
  var FADE_INTERVAL_MS = 22;
  var CELEBRATE_DELAY_MS = 550;

  var revealedCount = 0;
  var celebrated = false;

  /** Paint the scratch-off foil: gradient, sheen, diagonal brushing and sparkles. */
  function paintFoil(ctx, w, h) {
    var base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, '#dce8ee');
    base.addColorStop(0.25, '#d2dfe6');
    base.addColorStop(0.55, '#c8d7df');
    base.addColorStop(0.8, '#d0dde5');
    base.addColorStop(1, '#c4d3dc');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    var sheen = ctx.createRadialGradient(w * 0.28, h * 0.24, 0, w * 0.28, h * 0.24, w * 0.65);
    sheen.addColorStop(0, 'rgba(240,248,252,0.65)');
    sheen.addColorStop(0.45, 'rgba(230,242,248,0.22)');
    sheen.addColorStop(1, 'rgba(230,242,248,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    drawDiagonalStripes(ctx, w, h, 0, '#eef4f8', 9, 0.1);
    drawDiagonalStripes(ctx, w, h, 10, '#fff', 3, 0.05);
    ctx.globalAlpha = 1;

    var sparkles = [
      [0.14, 0.18], [0.5, 0.1], [0.84, 0.22], [0.22, 0.78], [0.72, 0.82],
      [0.88, 0.58], [0.08, 0.52], [0.62, 0.42], [0.38, 0.62],
    ];
    sparkles.forEach(function (point) {
      var x = w * point[0];
      var y = h * point[1];
      var glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
      glow.addColorStop(0, 'rgba(220,238,248,0.95)');
      glow.addColorStop(0.5, 'rgba(180,210,228,0.45)');
      glow.addColorStop(1, 'rgba(180,210,228,0)');
      ctx.fillStyle = glow;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(220,238,248,0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);
  }

  function drawDiagonalStripes(ctx, w, h, offset, color, lineWidth, alpha) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    for (var x = -h + offset; x < w + h; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h * 0.75, h);
      ctx.stroke();
    }
  }

  function setupTile(tileId, canvasId) {
    var tile = document.getElementById(tileId);
    var canvas = document.getElementById(canvasId);
    if (!tile || !canvas) return;

    // willReadFrequently: maybeReveal() reads pixels back often while scratching.
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    var isScratching = false;
    var isRevealed = false;
    var isSized = false;

    function resize() {
      var rect = tile.getBoundingClientRect();
      var width = Math.round(rect.width);
      var height = Math.round(rect.height);

      // Resizing a canvas wipes it. Mobile browsers fire `resize` while
      // scrolling (address bar show/hide) without the tile changing size,
      // so skip those to keep the guest's scratch progress.
      if (isSized && width === canvas.width && height === canvas.height) return;

      isSized = true;
      canvas.width = width;
      canvas.height = height;
      if (!isRevealed) paintFoil(ctx, width, height);
    }

    resize();
    window.addEventListener('resize', resize);
    // Fonts/layout can still be settling right after load.
    setTimeout(resize, 200);
    setTimeout(resize, 600);

    function toCanvasPoint(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    function scratchAt(point) {
      if (isRevealed) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(point.x, point.y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      maybeReveal();
    }

    function maybeReveal() {
      if (Math.random() > CHECK_PROBABILITY) return;
      if (!canvas.width || !canvas.height) return; // getImageData throws on a 0-size canvas

      var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var visible = 0;
      var total = 0;
      for (var i = 3; i < pixels.length; i += PIXEL_SAMPLE_STEP) {
        total++;
        if (pixels[i] > 10) visible++;
      }
      if ((total - visible) / total > REVEAL_THRESHOLD) reveal();
    }

    function reveal() {
      if (isRevealed) return;
      isRevealed = true;

      var alpha = 1;
      var fade = setInterval(function () {
        alpha -= FADE_STEP;
        if (alpha <= 0) {
          clearInterval(fade);
          canvas.style.display = 'none';
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = Math.max(0, alpha);
        paintFoil(ctx, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }, FADE_INTERVAL_MS);

      revealedCount++;
      if (revealedCount === TILES.length && !celebrated) {
        celebrated = true;
        setTimeout(celebrate, CELEBRATE_DELAY_MS);
      }
    }

    // Mouse
    canvas.addEventListener('mousedown', function (e) {
      isScratching = true;
      scratchAt(toCanvasPoint(e.clientX, e.clientY));
    });
    canvas.addEventListener('mousemove', function (e) {
      if (!isScratching) return;
      scratchAt(toCanvasPoint(e.clientX, e.clientY));
    });
    canvas.addEventListener('mouseup', function () { isScratching = false; });
    canvas.addEventListener('mouseleave', function () { isScratching = false; });

    // Touch: preventDefault so scratching doesn't scroll the page.
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isScratching = true;
      var touch = e.touches[0];
      scratchAt(toCanvasPoint(touch.clientX, touch.clientY));
    }, { passive: false });
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isScratching) return;
      var touch = e.touches[0];
      scratchAt(toCanvasPoint(touch.clientX, touch.clientY));
    }, { passive: false });
    canvas.addEventListener('touchend', function (e) {
      e.preventDefault();
      isScratching = false;
    }, { passive: false });
  }

  function celebrate() {
    var message = document.getElementById('tdr-married');
    var flash = document.getElementById('tdr-flash');
    if (message) message.classList.add('tdr-show');
    if (flash) flash.classList.add('tdr-go');
    window.Invitation.launchConfetti(document.getElementById('tdr-confetti'));
  }

  t_onReady(function () {
    TILES.forEach(function (tile) {
      setupTile(tile.tileId, tile.canvasId);
    });

    window.addEventListener('resize', function () {
      var confettiCanvas = document.getElementById('tdr-confetti');
      if (confettiCanvas) window.Invitation.fitCanvasToWindow(confettiCanvas);
    });
  });
})();
