/**
 * Tilda runtime bootstrap.
 *
 * Loaded synchronously in <head>, before every Tilda library: those libraries
 * (and the page scripts) call these helpers as globals, so the names must not change.
 */

window.dataLayer = window.dataLayer || [];

/**
 * Run `callback` once the DOM has been parsed (immediately if it already has).
 */
function t_onReady(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

/**
 * Wait until `window[funcName]` exists (Tilda libraries load async), then run `callback`.
 * Polls every `interval` ms (default 100).
 */
function t_onFuncLoad(funcName, callback, interval) {
  if (typeof window[funcName] === 'function') {
    callback();
  } else {
    setTimeout(function () {
      t_onFuncLoad(funcName, callback, interval);
    }, interval || 100);
  }
}

/* -------------------------------------------------------------------------
 * Zero Block (T396) initial scaling
 *
 * Before tilda-zero.js has loaded, pre-scales "grid" elements of centred
 * artboards so the first paint matches the final layout (avoids a jump).
 * ---------------------------------------------------------------------- */

window.TN_SCALE_INITIAL_VER = '1.0';
window.tn_scale_initial_window_width = null;

var T396_DEFAULT_SCREENS = [320, 480, 640, 960, 1200];

function t396_initialScale(recId) {
  var rec = document.getElementById('rec' + recId);
  if (!rec) return;

  var artboard = rec.querySelector('.t396__artboard');
  if (!artboard) return;

  // Lock in the width measured on first call so later calls scale consistently.
  if (!window.tn_scale_initial_window_width) {
    window.tn_scale_initial_window_width = document.documentElement.clientWidth;
  }
  var windowWidth = window.tn_scale_initial_window_width;

  var screensAttr = artboard.getAttribute('data-artboard-screens');
  var screens = screensAttr
    ? screensAttr.split(',').map(function (value) { return parseInt(value, 10); })
    : T396_DEFAULT_SCREENS.slice();

  // Largest breakpoint that fits the window (screens are ascending).
  var currentScreen;
  screens.forEach(function (screen) {
    if (windowWidth >= screen) currentScreen = screen;
  });

  var allRecords = document.getElementById('allrecords');
  var isEditMode = !!allRecords && allRecords.getAttribute('data-tilda-mode') === 'edit';
  var isCentered = t396_scaleInitial__getFieldValue(artboard, 'valign', currentScreen, screens) === 'center';
  var isGridUpscale = t396_scaleInitial__getFieldValue(artboard, 'upscale', currentScreen, screens) === 'grid';
  var heightVh = t396_scaleInitial__getFieldValue(artboard, 'height_vh', currentScreen, screens);
  var height = t396_scaleInitial__getFieldValue(artboard, 'height', currentScreen, screens);
  var isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') !== -1;

  if (isEditMode || !isCentered || isGridUpscale || heightVh || !height || isOpera) return;

  var scale = parseFloat((windowWidth / currentScreen).toFixed(3));
  var scaledHeight = Math.floor(parseInt(height, 10) * scale) + 'px';

  artboard.style.setProperty('--initial-scale-height', scaledHeight);
  [artboard, artboard.querySelector('.t396__carrier'), artboard.querySelector('.t396__filter')].forEach(function (el) {
    if (el) el.style.setProperty('height', 'var(--initial-scale-height)');
  });

  t396_scaleInitial__getElementsToScale(artboard, currentScreen, screens).forEach(function (el) {
    el.style.zoom = scale;
  });
}

/** Direct artboard children (elements/groups with content) positioned on the "grid" container. */
function t396_scaleInitial__getElementsToScale(artboard, screen, screens) {
  if (!artboard) return [];

  return Array.prototype.slice.call(artboard.children).filter(function (el) {
    if (!el) return false;
    if (!el.classList.contains('t396__elem') && !el.classList.contains('t396__group')) return false;
    if (!el.querySelector('.tn-molecule, .tn-atom')) return false;

    var isUntypedGroup = !el.getAttribute('data-elem-type') && el.classList.contains('tn-group');
    var container = t396_scaleInitial__getFieldValue(el, 'container', screen, screens);
    if (!container && isUntypedGroup) container = 'grid';

    return container === 'grid';
  });
}

/**
 * Read a responsive field value. Falls back to the next larger breakpoint
 * that defines it, mirroring how Tilda inherits values between screens.
 */
function t396_scaleInitial__getFieldValue(el, field, screen, screens) {
  if (!el) return null;

  var largestScreen = screens[screens.length - 1];
  var value = el.getAttribute(t396_scaleInitial__getFieldAttribute(el, field, screen, largestScreen));

  if (value === null) {
    for (var i = 0; i < screens.length; i++) {
      var candidate = screens[i];
      if (candidate <= screen) continue;
      value = el.getAttribute(t396_scaleInitial__getFieldAttribute(el, field, candidate, largestScreen));
      if (value !== null) break;
    }
  }

  return value;
}

/** Build the data-attribute name, e.g. `data-field-left-res-480-value`. */
function t396_scaleInitial__getFieldAttribute(el, field, screen, largestScreen) {
  var fieldsWithoutValueSuffix = ['widthmode', 'heightmode', 'flex'];
  var isArtboard = el.classList.contains('t396__artboard');
  var isGroup = !isArtboard && el.classList.contains('tn-group');

  var prefix = isArtboard ? 'data-artboard-' : isGroup ? 'data-group-' : 'data-field-';
  var suffix = isArtboard || (isGroup && fieldsWithoutValueSuffix.indexOf(field) !== -1) ? '' : '-value';
  var resolution = screen === largestScreen ? '' : '-res-' + screen;

  return prefix + field + resolution + suffix;
}
