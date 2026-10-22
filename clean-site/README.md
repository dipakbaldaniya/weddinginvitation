# Dolce Vita — Wedding Invitation

A one-page wedding invitation originally built with **Tilda** and exported with saveweb2zip.
It has been restructured into readable files. Behaviour and layout match the original;
an automated diff of all 203 laid-out elements at 375px and 1280px showed no regressions.

## Run locally

Use the included server, which turns off browser caching so every reload shows your latest edits:

```bash
python serve.py
```

Then open http://localhost:8080/. (`python -m http.server` also works, but browsers may keep
showing an old version after you edit files.) Open it at phone width for the full experience; the envelope intro is mobile-only.

## Structure

```
index.html                     Page markup, one commented block per section
assets/
  css/
    vendor/                    Tilda framework styles (unchanged, minified)
    page/tilda-blocks.css      Page-level Tilda styles + @font-face aliases used by Tilda
    page/fonts.css             Font families used by the custom HTML blocks
    sections/NN-<name>.css     Styles for each section, in page order
    features/audio-control.css Floating music button
    features/envelope.css      No scrolling / other sections hidden while the envelope is closed
  js/
    core/
      tilda-bootstrap.js       t_onReady / t_onFuncLoad + Zero Block initial scaling (sync, in <head>)
      first-visit-fade.js      Desktop fade-in on first visit (sync, in <head>)
      envelope-lock.js         Locks the page behind the envelope from first paint (sync, in <head>)
      tilda-page-utils.js      isiOS detection, t_throttle
    config/sections.js         Tilda record ID for every section (window.PAGE_SECTIONS)
    blocks/t702-rsvp-popup.js  RSVP popup open/close/escape/scroll-lock
    sections/init-sections.js  Initialises every Tilda block (Zero Blocks, slider, popup, checkboxes)
    features/
      background-music.js      Starts the song when the envelope is opened; play/pause button
      envelope-cover.js        Full-screen envelope cover; locks scrolling until opened
      hero-video.js            Autoplay + touch retry for the villa video
      date-reveal.js           Scratch-to-reveal date card
      confetti.js              Confetti animation used by the date reveal
      button-shine-effect.js   Shine sweep on the RSVP button
    analytics/tilda-stats.js   Tilda page-view stats (disabled, see below)
    vendor/                    Tilda framework + hammer.js (unchanged, minified)
  fonts/  images/  media/audio/  media/video/
../_original/                  Untouched download, kept for comparison (safe to delete)
```

### Sections

| # | Section | Tilda record | Notes |
|---|---------|--------------|-------|
| 01 | envelope-intro | rec2442650973 | "Click to open" seal, all screen sizes (scaled to cover on desktop) |
| 02 | background-music | rec2442650983 | Hidden `<audio>` + floating button |
| 03 | hero-video | rec2442650993 | Villa video, couple's names |
| 04 | date-reveal | rec2442651003 | Scratch card (day / month / year) |
| 05 | welcome-message | rec2442651013 | |
| 06 | schedule | rec2442651033 | |
| 07 | venue | rec2442651083 | |
| 08 | dress-code | rec2442651093 | |
| 09 | dress-code-gallery | rec2442651103 | Image slider (T1148) |
| 10 | dress-code-colours | rec2442651113 | |
| 11 | rsvp-call-to-action | rec2442651143 | Button links to `#popup:myform` |
| 12 | rsvp-popup | rec2442651153 | Form popup (T702) |
| 13 | closing | rec2442651163 | |

### Why the Tilda framework files are still minified

`assets/js/vendor/tilda/*` and `assets/css/vendor/*` are Tilda's own runtime libraries (~700 KB).
They are third-party framework code, not part of this site, so they stay as shipped.
All **site-specific** code (inline scripts, the page bundle `tilda-blocks-page152497353.min.js`
and the inline `<style>` blocks) has been rewritten or extracted into the readable files above.
Function names that Tilda calls as globals (`t_onReady`, `t_onFuncLoad`, `t702_*`, `t_throttle`,
`t396_initialScale`...) are kept as-is on purpose.

## Issues found and fixed

**Introduced by the download/export:**

1. **Broken SVG attribute.** saveweb2zip mangled a JSON attribute on the schedule's timeline vector
   (`data-guides="{" vertical":[]...}"=""`), producing invalid HTML. Restored to valid markup.
2. **JavaScript inside a CSS file.** `css/custom.css` contained a `<script>`-style JS snippet
   (save an `email` field to localStorage). Browsers ignore it as invalid CSS, so it never ran, and
   the form has no email field anyway. Removed.
3. **Images were blurry placeholders.** saveweb2zip saved only Tilda's lazy-load placeholders
   (tiny ~20px or heavily compressed images). The real images were only reachable through
   `data-original` URLs on `static.tildacdn.net`. The 27 full-size images are now in
   `assets/images/` (same file names) and `data-original` points at them, so the page is sharp offline.
4. **RSVP checkboxes depended on the CDN.** "Will you come?" needs `tilda-variant-select`, which
   wasn't in the download and was fetched from Tilda at runtime. It's now in `assets/js/vendor/tilda/`.
   The site no longer makes any requests to Tilda or Google (fonts are local too).
5. **Duplicate/stale head tags.** Removed a captured copy of the first-visit fade `<style>`
   (the script injects it) and `<noscript>` stylesheet links to the CDN.

**Bugs in the original page code:**

6. **"You're invited!" rendered in Comic Sans.** The CSS asks for `'Imperial Script'`, but the
   font file was only registered under Tilda's alias `NewFonts`, so the browser fell back to
   generic `cursive`. Added `assets/css/page/fonts.css`, which registers the font under its real name.
7. **Scratch progress wiped while scrolling on mobile.** Every `resize` event reset the scratch
   canvases. Mobile browsers fire `resize` when the address bar shows or hides. Now it only
   repaints when the tile's size actually changes.
8. **`ReferenceError: ga is not defined`.** `t702_sendPopupEventToStatistics` used `if (ga)`,
   which throws when Google Analytics isn't loaded. It now uses a `typeof` check.
9. **Unhandled promise rejections** from `audio.play()` / `video.play()` when the browser blocks
   playback are now caught. The music button now gets its icon from the audio's real
   play/pause events, so it stays correct.
10. **Accessibility:** the music toggle was a `<div>` that only responded to mouse clicks. It's now a
    `<button>` with an `aria-label`, so it works with the keyboard. Its styles moved from inline to CSS.
11. Scratch card: guarded `getImageData` against a 0-size canvas (it throws), and added
    `willReadFrequently` to avoid the Chrome performance warning.
12. **No "Click to open" on laptops/desktops.** The envelope and the music section were set to
    show only on screens up to 980px wide, so on a computer there was nothing to click, the music
    never started and the play/pause button never appeared. Both now show on every screen size.
13. **The invitation showed underneath the closed envelope.** The envelope was just the first
    ~850px of the page, so guests could scroll past it, and on tall screens the next sections
    peeked out below. Now `core/envelope-lock.js` (in `<head>`) and `css/features/envelope.css`
    hide the scrollbar and the other sections from the very first paint, before anything has loaded.
    `envelope-cover.js` scales the pinned envelope to cover any screen with the seal centred, and
    unlocks the page when the seal is clicked.
    Once the opening animation ends, it removes the envelope so its leftover invisible parts
    can't block clicks.

## Editing CSS or JS

Every stylesheet and script link in `index.html` ends in `?v=2`. After changing any CSS or JS file,
bump the number everywhere (e.g. replace `?v=2"` with `?v=3"`) so browsers download the new
files instead of reusing old cached copies.

## Things to know before publishing

- **RSVP submissions** go to Tilda's form service using the original project's form key
  (`data-tilda-formskey` on `#allrecords`), so responses would land in *that* Tilda account,
  or fail outside it. To collect RSVPs yourself, point the form at your own backend
  (Formspree, Google Forms, a serverless function, etc.).
- **Analytics** (`assets/js/analytics/tilda-stats.js`) is disabled by default because it would
  report visits to the original Tilda project. Set `ENABLED = true` only if that's intended.
- `og:image` is a relative path. Social previews need an absolute URL, so change it to the full
  URL once the site has a domain.
