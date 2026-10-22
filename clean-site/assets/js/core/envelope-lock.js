/**
 * Marks the page as "envelope closed" before the first paint, so
 * assets/css/features/envelope.css can hide the scrollbar and the rest of the
 * invitation right away. assets/js/features/envelope-cover.js removes the
 * class when the guest clicks the seal.
 *
 * Loaded synchronously in <head>.
 */
document.documentElement.classList.add('envelope-closed');

// On reload, browsers jump back to the previous scroll position (after the
// page has loaded). The invitation must always start at the top, behind the
// envelope, so turn that off.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
