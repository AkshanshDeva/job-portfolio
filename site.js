// Shared by every page: email copy helpers and the phone menu.

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

function wireCopyButton(btnId, labelId) {
  var btn = document.getElementById(btnId);
  var label = document.getElementById(labelId);
  var original = label.textContent;
  btn.addEventListener('click', function() {
    writeClipboard(EMAIL).then(function() {
      label.textContent = 'Copied';
      btn.classList.add('is-copied');
      clearTimeout(btn._resetTimer);
      btn._resetTimer = setTimeout(function() {
        label.textContent = original;
        btn.classList.remove('is-copied');
      }, 2000);
    });
  });
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

// Copy buttons that exist on more than one page. The homepage wires its own
// hero, nav and footer buttons inline.
if (document.getElementById('menuCopyEmail')) {
  wireCopyButton('menuCopyEmail', 'menuCopyEmailText');
}
if (document.getElementById('pageNavCopyEmail')) {
  wireCopyButton('pageNavCopyEmail', 'pageNavCopyEmailText');
}
