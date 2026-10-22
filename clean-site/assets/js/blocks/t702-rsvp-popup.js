/**
 * T702 popup block: the RSVP form popup, opened by any link to `#popup:myform`.
 *
 * Function names are global and must stay as-is: Tilda's forms library calls
 * `t702_onSuccess` (via data-success-callback on the form) and the section
 * initialiser calls `t702_initPopup`.
 */

function t702_initPopup(recId) {
  var rec = document.getElementById('rec' + recId);
  if (!rec) return;
  var container = rec.querySelector('.t702');
  if (!container) return;

  rec.setAttribute('data-animationappear', 'off');
  rec.setAttribute('data-popup-subscribe-inited', 'y');
  rec.style.opacity = 1;

  var documentBody = document.body;
  var popup = rec.querySelector('.t-popup');
  var popupHook = popup.getAttribute('data-tooltip-hook'); // e.g. "#popup:myform"
  var analyticsName = popup.getAttribute('data-track-popup');
  var closeButton = popup.querySelector('.t-popup__close');
  var links = rec.querySelectorAll('a[href*="#"]');
  var submitLink = rec.querySelector('.t-submit[href*="#"]');

  if (popupHook) {
    t_onFuncLoad('t_popup__addAttributesForAccessibility', function () {
      t_popup__addAttributesForAccessibility(popupHook);
    });

    // Open on click of any link ending with the hook, anywhere on the page.
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target.closest('a[href$="' + popupHook + '"]')) return;

      event.preventDefault();
      t702_showPopup(recId);
      t_onFuncLoad('t_popup__resizePopup', function () {
        t_popup__resizePopup(recId);
      });
      t702__lazyLoad();
      if (analyticsName && window.Tilda) {
        Tilda.sendEventToStatistics(analyticsName, popupHook);
      }
    });

    t_onFuncLoad('t_popup__addClassOnTriggerButton', function () {
      t_popup__addClassOnTriggerButton(document, popupHook);
    });
  }

  popup.addEventListener('scroll', t_throttle(function () {
    t702__lazyLoad();
  }));

  // Close when clicking the backdrop (but not the scrollbar area).
  popup.addEventListener('click', function (event) {
    var scrollbarEdge = window.innerWidth - 17;
    if (event.clientX > scrollbarEdge) return;
    if (event.target === popup) t702_closePopup(recId);
  });

  closeButton.addEventListener('click', function () {
    t702_closePopup(recId);
  });

  if (submitLink) {
    submitLink.addEventListener('click', function () {
      documentBody.classList.remove('t-body_scroll-locked');
    });
  }

  // Links inside the popup close it, except "#price:" links (shop variants).
  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function () {
      var url = link.getAttribute('href');
      if (url && url.substring(0, 7) === '#price:') return;

      t702_closePopup(recId);

      // Link opens another popup: re-flag the body once this one has closed.
      if (!url || url.substring(0, 7) === '#popup:') {
        setTimeout(function () {
          if (typeof t_triggerEvent === 'function') t_triggerEvent(document.body, 'popupShowed');
          documentBody.classList.add('t-body_popupshowed');
        }, 300);
      }
    });
  });

  function closeOnEscape(event) {
    if (event.key === 'Escape') t702_closePopup(recId);
  }

  popup.addEventListener('tildamodal:show' + popupHook, function () {
    document.addEventListener('keydown', closeOnEscape);
  });
  popup.addEventListener('tildamodal:close' + popupHook, function () {
    document.removeEventListener('keydown', closeOnEscape);
  });

  rec.addEventListener('conditional-form-init', function () {
    t_onFuncLoad('t_form__conditionals_addFieldsListeners', function () {
      t_form__conditionals_addFieldsListeners(recId, function () {
        t_popup__resizePopup(recId);
      });
    });
  }, { once: true });
}

/** iOS 11 workaround: pin the body so the page behind the popup can't scroll. */
function t702_lockScroll() {
  var body = document.body;
  if (body.classList.contains('t-body_scroll-locked')) return;

  var scrollTop = typeof window.pageYOffset !== 'undefined'
    ? window.pageYOffset
    : (document.documentElement || body.parentNode || body).scrollTop;

  body.classList.add('t-body_scroll-locked');
  body.style.top = '-' + scrollTop + 'px';
  body.setAttribute('data-popup-scrolltop', scrollTop);
}

function t702_unlockScroll() {
  var body = document.body;
  if (!body.classList.contains('t-body_scroll-locked')) return;

  var scrollTop = body.getAttribute('data-popup-scrolltop');
  body.classList.remove('t-body_scroll-locked');
  body.style.top = null;
  body.removeAttribute('data-popup-scrolltop');
  document.documentElement.scrollTop = parseInt(scrollTop, 10);
}

function t702__isIOS11() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream &&
    window.isiOSVersion && window.isiOSVersion[0] === 11;
}

function t702_showPopup(recId) {
  var rec = document.getElementById('rec' + recId);
  if (!rec) return;
  var container = rec.querySelector('.t702');
  if (!container) return;

  // Respect the block's "show only on screens between X and Y" setting.
  var windowWidth = window.innerWidth;
  var screenMin = rec.getAttribute('data-screen-min');
  var screenMax = rec.getAttribute('data-screen-max');
  if (screenMin && windowWidth < parseInt(screenMin, 10)) return;
  if (screenMax && windowWidth > parseInt(screenMax, 10)) return;

  var popup = rec.querySelector('.t-popup');
  var popupHook = popup.getAttribute('data-tooltip-hook');
  var ranges = rec.querySelectorAll('.t-range');
  var body = document.body;

  Array.prototype.forEach.call(ranges, function (range) {
    t702__triggerEvent(range, 'popupOpened');
  });

  t_onFuncLoad('t_popup__showPopup', function () {
    t_popup__showPopup(popup);
  });

  if (typeof t_triggerEvent === 'function') t_triggerEvent(document.body, 'popupShowed');
  body.classList.add('t-body_popupshowed');
  body.classList.add('t702__body_popupshowed');

  if (t702__isIOS11()) {
    setTimeout(t702_lockScroll, 500);
  }

  t702__lazyLoad();
  t702__triggerEvent(popup, 'tildamodal:show' + popupHook);
  t_onFuncLoad('t_forms__calculateInputsWidth', function () {
    t_forms__calculateInputsWidth(recId);
  });
}

function t702_closePopup(recId) {
  var rec = document.getElementById('rec' + recId);
  var popup = rec.querySelector('.t-popup');
  var popupHook = popup.getAttribute('data-tooltip-hook');
  var openPopups = document.querySelectorAll('.t-popup_show:not(.t-feed__post-popup):not(.t945__popup)');

  if (openPopups.length === 1) {
    if (typeof t_triggerEvent === 'function') t_triggerEvent(document.body, 'popupHidden');
    document.body.classList.remove('t-body_popupshowed');
  } else {
    // Several popups open: close every one sharing this hook.
    var closedPopups = [];
    for (var i = 0; i < openPopups.length; i++) {
      if (openPopups[i].getAttribute('data-tooltip-hook') === popupHook) {
        openPopups[i].classList.remove('t-popup_show');
        closedPopups.push(openPopups[i]);
      }
    }
    if (closedPopups.length === openPopups.length) {
      if (typeof t_triggerEvent === 'function') t_triggerEvent(document.body, 'popupHidden');
      document.body.classList.remove('t-body_popupshowed');
    }
  }

  if (typeof t_triggerEvent === 'function') t_triggerEvent(document.body, 'popupHidden');
  popup.classList.remove('t-popup_show');
  document.body.classList.remove('t702__body_popupshowed');

  if (t702__isIOS11()) {
    t702_unlockScroll();
  }

  t_onFuncLoad('t_popup__addFocusOnTriggerButton', function () {
    t_popup__addFocusOnTriggerButton();
  });

  // Hide after the close transition finishes.
  setTimeout(function () {
    var hiddenPopups = document.querySelectorAll('.t-popup:not(.t-popup_show)');
    for (var i = 0; i < hiddenPopups.length; i++) {
      hiddenPopups[i].style.display = 'none';
    }
  }, 300);

  t702__triggerEvent(popup, 'tildamodal:close' + popupHook);
}

/** Report a popup open as a virtual pageview (Tilda stats, or GA / Yandex Metrika if present). */
function t702_sendPopupEventToStatistics(popupName) {
  if (popupName.substring(0, 7) === '#popup:') {
    popupName = popupName.substring(7);
  }
  var virtualPage = '/tilda/popup/' + popupName;
  var virtualTitle = 'Popup: ' + popupName;

  if (window.Tilda && typeof Tilda.sendEventToStatistics === 'function') {
    Tilda.sendEventToStatistics(virtualPage, virtualTitle, '', 0);
    return;
  }

  // `typeof` check: a bare `ga` reference throws when Google Analytics isn't loaded.
  if (typeof window.ga === 'function' && window.mainTracker !== 'tilda') {
    window.ga('send', { hitType: 'pageview', page: virtualPage, title: virtualTitle });
  }

  if (window.mainMetrika && window[window.mainMetrika]) {
    window[window.mainMetrika].hit(virtualPage, { title: virtualTitle, referer: window.location.href });
  }
}

/** Form success callback (referenced by the form's data-success-callback attribute). */
function t702_onSuccess(form) {
  t_onFuncLoad('t_forms__onSuccess', function () {
    t_forms__onSuccess(form);
  });
}

function t702__lazyLoad() {
  var allRecords = document.getElementById('allrecords');
  var lazyEnabled = window.lazy === 'y' || (allRecords && allRecords.getAttribute('data-tilda-lazy') === 'yes');
  if (!lazyEnabled) return;

  t_onFuncLoad('t_lazyload_update', function () {
    t_lazyload_update();
  });
}

/** Dispatch a custom DOM event, with fallbacks for very old browsers. */
function t702__triggerEvent(el, eventName) {
  var event;

  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(eventName);
  } else if (document.createEvent) {
    event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, false);
  } else if (document.createEventObject) {
    event = document.createEventObject();
    event.eventType = eventName;
  }

  event.eventName = eventName;

  if (el.dispatchEvent) {
    el.dispatchEvent(event);
  } else if (el.fireEvent) {
    el.fireEvent('on' + event.eventType, event);
  } else if (el[eventName]) {
    el[eventName]();
  } else if (el['on' + eventName]) {
    el['on' + eventName]();
  }
}
