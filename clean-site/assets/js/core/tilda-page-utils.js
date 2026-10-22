/**
 * Small globals Tilda's page code expects: iOS detection and a throttle helper.
 */

window.isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

/** [major, minor, patch] on iOS, '' elsewhere. */
window.isiOSVersion = '';
if (window.isiOS) {
  var iosVersionMatch = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (iosVersionMatch !== null) {
    window.isiOSVersion = [
      parseInt(iosVersionMatch[1], 10),
      parseInt(iosVersionMatch[2], 10),
      parseInt(iosVersionMatch[3] || 0, 10),
    ];
  }
}

/**
 * Throttle `fn` to run at most once per `threshold` ms (default 250).
 * The last call inside a window is still delivered once the window ends.
 */
function t_throttle(fn, threshold, scope) {
  var lastRun;
  var deferTimer;
  threshold = threshold || 250;

  return function () {
    var context = scope || this;
    var now = Date.now();
    var args = arguments;

    if (lastRun && now < lastRun + threshold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        lastRun = now;
        fn.apply(context, args);
      }, threshold);
    } else {
      lastRun = now;
      fn.apply(context, args);
    }
  };
}
