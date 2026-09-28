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

// Phone menu: toggle, close on link, Escape or outside tap
(function() {
  var btn = document.getElementById('navMenuBtn');
  var menu = document.getElementById('navMenu');
  var nav = document.querySelector('.nav');
  if (!btn || !menu) return;
  function setOpen(open) {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('menu-open', open);
  }
  btn.addEventListener('click', function() {
    var open = menu.hidden;
    setOpen(open);
    if (open) menu.querySelector('a').focus();
  });
  menu.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() { setOpen(false); });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', function(e) {
    if (!menu.hidden && !nav.contains(e.target)) setOpen(false);
  });
  // Leaving phone width with the menu open would strand it open.
  window.matchMedia('(min-width: 641px)').addEventListener('change', function(e) {
    if (e.matches) setOpen(false);
  });
})();

if (document.getElementById('menuCopyEmail')) {
  wireCopyButton('menuCopyEmail', 'menuCopyEmailText');
}
