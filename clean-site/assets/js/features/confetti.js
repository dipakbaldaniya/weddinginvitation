/**
 * One-shot confetti animation on a full-window <canvas>.
 * Exposed as `window.Invitation.launchConfetti(canvas)`.
 */
(function () {
  'use strict';

  var PIECE_COUNT = 80;
  var DURATION_FRAMES = 320; // ~5s at 60fps; pieces fade out over this time

  var PALETTE = [
    '#c8aa78', '#dfc48e', '#ede5cc', '#f5ede0', '#1a1916',
    '#d4c090', 'rgba(200,170,120,0.55)', 'rgba(245,237,220,0.65)', '#b89050', '#e8d8a8',
  ];

  var SHAPE_RECT = 0;
  var SHAPE_DOT = 1;

  function fitToWindow(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createPiece(canvas) {
    return {
      x: Math.random() * canvas.width,
      y: -15 - Math.random() * 160, // start above the viewport
      vy: Math.random() * 1.1 + 0.5,
      vx: (Math.random() - 0.5) * 0.9,
      w: Math.random() * 10 + 2.5,
      h: Math.random() * 3.5 + 1.2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.055,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      alpha: Math.random() * 0.6 + 0.38,
      drift: Math.random() * Math.PI * 2, // phase of the side-to-side sway
      driftSpeed: Math.random() * 0.016 + 0.007,
      shape: Math.random() > 0.45 ? SHAPE_RECT : SHAPE_DOT,
    };
  }

  function drawPiece(ctx, piece, fade) {
    ctx.save();
    ctx.globalAlpha = piece.alpha * fade;
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    if (piece.shape === SHAPE_RECT) {
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, piece.h, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function movePiece(piece, canvas) {
    piece.y += piece.vy;
    piece.x += piece.vx + Math.sin(piece.drift) * 0.4;
    piece.rotation += piece.rotationSpeed;
    piece.drift += piece.driftSpeed;

    // Recycle pieces that fall off the bottom.
    if (piece.y > canvas.height + 20) {
      piece.y = -15;
      piece.x = Math.random() * canvas.width;
    }
  }

  function launchConfetti(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    fitToWindow(canvas);

    var pieces = [];
    for (var i = 0; i < PIECE_COUNT; i++) pieces.push(createPiece(canvas));

    var frame = 0;
    (function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var fade = Math.max(0, 1 - frame / DURATION_FRAMES);

      pieces.forEach(function (piece) {
        drawPiece(ctx, piece, fade);
        movePiece(piece, canvas);
      });

      frame++;
      if (frame < DURATION_FRAMES) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    })();
  }

  window.Invitation = window.Invitation || {};
  window.Invitation.launchConfetti = launchConfetti;
  window.Invitation.fitCanvasToWindow = fitToWindow;
})();
