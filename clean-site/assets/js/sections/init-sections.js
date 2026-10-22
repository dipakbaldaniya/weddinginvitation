/**
 * Initialises every Tilda block on the page, in page order.
 * Each call waits for its Tilda library to finish loading (they load async).
 */
(function () {
  'use strict';

  var S = window.PAGE_SECTIONS;

  // Zero Blocks (T396): free-form layouts.
  var ZERO_BLOCKS = [
    S.envelopeIntro,
    S.heroVideo,
    S.dateReveal,
    S.welcomeMessage,
    S.schedule,
    S.venue,
    S.dressCode,
    S.dressCodeColours,
    S.rsvpCallToAction,
    S.closing,
  ];

  var RSVP_ATTENDANCE_FIELD_ID = '2221855674631'; // "Will you come?" checkbox group

  t_onReady(function () {
    ZERO_BLOCKS.forEach(function (recId) {
      t_onFuncLoad('t396_init', function () {
        t396_init(recId);
      });
    });

    // Dress-code image slider (T1148).
    t_onFuncLoad('t_slider__init', function () {
      t_slider__init(S.dressCodeGallery, 't1148');
    });

    // RSVP "Will you come?" checkboxes need Tilda's variant-select helper.
    t_onFuncLoad('t_loadJsFile', function () {
      t_loadJsFile('assets/js/vendor/tilda/tilda-variant-select-1.0.min.js', function () {
        t_onFuncLoad('t_input_checkboxes_init', function () {
          t_input_checkboxes_init(S.rsvpPopup, RSVP_ATTENDANCE_FIELD_ID);
        });
      });
    });

    // RSVP popup (T702).
    t_onFuncLoad('t702_initPopup', function () {
      t702_initPopup(S.rsvpPopup);
    });
  });
})();
