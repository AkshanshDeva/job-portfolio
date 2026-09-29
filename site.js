// Shared by every page: email copy, phone menu, and the homepage's work tiles and testimonials.

// Clipboard: the async API first, the older execCommand path if the browser refuses it.
var EMAIL = 'akshanshdeva@gmail.com';

function legacyCopy(text) {
  return new Promise(function(resolve, reject) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = document.execCommand('copy');
    document.body.removeChild(ta);
    ok ? resolve() : reject();
  });
}

function writeClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(function() { return legacyCopy(text); });
  }
  return legacyCopy(text);
}

// Phone menu: a bottom sheet. Opens from the nav button; closes on a link,
// Escape, a scrim tap or a downward swipe.
(function() {
  var btn = document.getElementById('navMenuBtn');
  var menu = document.getElementById('navMenu');
  var scrim = document.getElementById('navScrim');
  if (!btn || !menu || !scrim) return;
  var isOpen = false;

  function setOpen(open) {
    isOpen = open;
    menu.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    // Stop the page scrolling behind the sheet.
    document.documentElement.style.overflow = open ? 'hidden' : '';
    menu.style.transform = '';
  }

  btn.addEventListener('click', function() {
    setOpen(!isOpen);
    if (isOpen) menu.querySelector('a').focus({ preventScroll: true });
  });
  scrim.addEventListener('click', function() { setOpen(false); });
  menu.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() { setOpen(false); });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) { setOpen(false); btn.focus(); }
  });

  // Drag down to dismiss: the sheet follows the finger, and closes past 80px.
  var startY = null;
  menu.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
    menu.classList.add('is-dragging');
  }, { passive: true });
  menu.addEventListener('touchmove', function(e) {
    if (startY === null) return;
    var dy = Math.max(0, e.touches[0].clientY - startY);
    menu.style.transform = 'translateY(' + dy + 'px)';
  }, { passive: true });
  menu.addEventListener('touchend', function(e) {
    if (startY === null) return;
    var dy = e.changedTouches[0].clientY - startY;
    startY = null;
    menu.classList.remove('is-dragging');
    if (dy > 80) setOpen(false); else menu.style.transform = '';
  });

  // Leaving phone width with the sheet open would strand it open.
  window.matchMedia('(min-width: 641px)').addEventListener('change', function(e) {
    if (e.matches && isOpen) setOpen(false);
  });
})();

(function() {
  document.querySelectorAll('[data-copy-email]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      writeClipboard(EMAIL).then(function() {
        btn.classList.add('is-copied');
        clearTimeout(btn._reset);
        btn._reset = setTimeout(function() { btn.classList.remove('is-copied'); }, 2000);
      });
    });
  });
})();

// Testimonials: the portrait strips (desktop) and the segmented switch (phones) both pick the person.
(function() {
  var section = document.getElementById('testimonials');
  if (!section) return;
  var controls = section.querySelectorAll('.s-strip, .s-seg button');
  function show(key) {
    controls.forEach(function(c) {
      var on = c.dataset.for === key;
      c.setAttribute('aria-pressed', String(on));
      if (c.classList.contains('s-strip')) c.classList.toggle('on', on);
    });
    section.querySelectorAll('.s-spot-item').forEach(function(item) {
      var on = item.id === 'quote-' + key;
      item.classList.toggle('on', on);
      if (on) item.removeAttribute('aria-hidden'); else item.setAttribute('aria-hidden', 'true');
    });
  }
  controls.forEach(function(c) { c.addEventListener('click', function() { show(c.dataset.for); }); });
})();

// Work tiles: one glass outline for the result tab and the caption strip together.
(function() {
  var glasses = document.querySelectorAll('.s-glass');
  if (!glasses.length) return;
  var R = 18, F = 12; // outer corner radius, inner (concave) corner radius
  var NS = 'http://www.w3.org/2000/svg';

  function outline(g) {
    var tab = g.querySelector('.s-metric');
    var W = g.offsetWidth, H = g.offsetHeight, th = tab.offsetHeight;
    var tw = Math.min(tab.offsetWidth, W);
    var d;
    if (tw > W - (R + F + 2)) {
      // The tab spans the whole strip: the shape is just a rounded rectangle.
      d = 'M0 ' + R + 'A' + R + ' ' + R + ' 0 0 1 ' + R + ' 0H' + (W - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + W + ' ' + R;
    } else {
      d = 'M0 ' + R + 'A' + R + ' ' + R + ' 0 0 1 ' + R + ' 0' +
          'H' + (tw - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + tw + ' ' + R +
          'V' + (th - F) + 'A' + F + ' ' + F + ' 0 0 0 ' + (tw + F) + ' ' + th +
          'H' + (W - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + W + ' ' + (th + R);
    }
    d += 'V' + (H - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + (W - R) + ' ' + H +
         'H' + R + 'A' + R + ' ' + R + ' 0 0 1 0 ' + (H - R) + 'Z';
    g.style.setProperty('--glass-path', 'path("' + d + '")');
    var svgMask = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><path d="' + d + '"/></svg>';
    g.style.setProperty('--glass-mask', 'url("data:image/svg+xml,' + encodeURIComponent(svgMask) + '")');
    var svg = g.querySelector('.s-glass-edge');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 's-glass-edge');
      svg.setAttribute('aria-hidden', 'true');
      svg.appendChild(document.createElementNS(NS, 'path'));
      g.appendChild(svg);
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.firstChild.setAttribute('d', d);
  }

  glasses.forEach(outline);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function(entries) { entries.forEach(function(e) { outline(e.target); }); });
    glasses.forEach(function(g) { ro.observe(g); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function() { glasses.forEach(outline); });
})();
