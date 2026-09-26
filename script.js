/* ============================================================
   Nails by Sam — interactions
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- sticky header shadow ---------- */
  var header = $('#siteHeader');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile navigation ---------- */
  var navToggle = $('#navToggle');
  var nav = $('#primaryNav');

  var closeNav = function () {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- active nav link while scrolling ---------- */
  var navLinks = $$('.nav-link');
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealables.forEach(function (el) { revealer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- graceful placeholder until real photos exist ---------- */
  // Swapping in a blank SVG hides the broken-image icon and alt text so the
  // CSS gradient in .is-missing is all that shows.
  var BLANK_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  var markMissing = function (img) {
    if (img.dataset.missing) return;
    img.dataset.missing = '1';
    img.classList.add('is-missing');
    img.src = BLANK_SRC;
  };

  $$('img').forEach(function (img) {
    img.addEventListener('error', function () { markMissing(img); });
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  /* ---------- gallery filters ---------- */
  var chips = $$('.chip');
  var galItems = $$('.gal-item');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });

      var filter = chip.dataset.filter;
      galItems.forEach(function (item) {
        item.classList.toggle('is-hidden', filter !== 'all' && item.dataset.cat !== filter);
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lightbox = $('#lightbox');
  var lbImage = $('#lbImage');
  var lbCaption = $('#lbCaption');
  var lastFocused = null;
  var currentIndex = 0;

  var visibleButtons = function () {
    return $$('.gal-item:not(.is-hidden) .gal-btn');
  };

  var showAt = function (index) {
    var buttons = visibleButtons();
    if (!buttons.length) return;
    currentIndex = (index + buttons.length) % buttons.length;
    var btn = buttons[currentIndex];
    var thumb = $('img', btn);
    lbImage.classList.toggle('is-missing', !!thumb.dataset.missing);
    lbImage.src = thumb.dataset.missing ? BLANK_SRC : btn.dataset.full;
    lbImage.alt = thumb.alt;
    lbCaption.textContent = btn.dataset.caption || '';
  };

  var openLightbox = function (btn) {
    lastFocused = btn;
    showAt(visibleButtons().indexOf(btn));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  };

  var closeLightbox = function () {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  $$('.gal-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });

  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', function () { showAt(currentIndex - 1); });
  $('#lbNext').addEventListener('click', function () { showAt(currentIndex + 1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showAt(currentIndex - 1);
    if (e.key === 'ArrowRight') showAt(currentIndex + 1);
  });

  /* ============================================================
     DESIGN STUDIO
     ============================================================ */
  var nailGroup = $('#nailGroup');
  var readout = $('#studioReadout');

  var state = { shape: 'almond', color: '#f2c7d2', finish: 'plain' };

  var SHAPE_LABELS = { almond: 'Almond', square: 'Square', coffin: 'Coffin', round: 'Round' };
  var FINISH_LABELS = { plain: 'glossy', dots: 'polka dot', sparkle: 'sparkle', stripes: 'gold striped' };
  var COLOR_LABELS = {
    '#f2c7d2': 'ballet pink',
    '#e8a0b8': 'bubblegum',
    '#c9b6e4': 'lavender',
    '#f6e7d8': 'nude',
    '#a7cfd6': 'mint blue',
    '#8a4f72': 'plum'
  };

  // Five nails laid out like a relaxed hand.
  var FINGERS = [
    { x: 26, y: 112, w: 30, h: 56, rot: -16 },
    { x: 74, y: 82, w: 34, h: 64, rot: -8 },
    { x: 128, y: 66, w: 36, h: 70, rot: 0 },
    { x: 184, y: 80, w: 34, h: 66, rot: 8 },
    { x: 238, y: 128, w: 38, h: 62, rot: 24 }
  ];

  function nailPath(f, shape) {
    var x = f.x, y = f.y, w = f.w, h = f.h;
    var r = w / 2;
    var bottom = y + h;
    var cuticle = 'Q ' + (x + r) + ' ' + (bottom + 8) + ' ' + x + ' ' + bottom + ' Z';

    if (shape === 'square') {
      return 'M ' + x + ' ' + bottom +
        ' L ' + x + ' ' + (y + 7) +
        ' Q ' + x + ' ' + y + ' ' + (x + 7) + ' ' + y +
        ' L ' + (x + w - 7) + ' ' + y +
        ' Q ' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + 7) +
        ' L ' + (x + w) + ' ' + bottom + ' ' + cuticle;
    }
    if (shape === 'round') {
      return 'M ' + x + ' ' + bottom +
        ' L ' + x + ' ' + (y + r) +
        ' Q ' + x + ' ' + y + ' ' + (x + r) + ' ' + y +
        ' Q ' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) +
        ' L ' + (x + w) + ' ' + bottom + ' ' + cuticle;
    }
    if (shape === 'coffin') {
      return 'M ' + x + ' ' + bottom +
        ' L ' + (x + w * 0.12) + ' ' + (y + h * 0.22) +
        ' L ' + (x + w * 0.3) + ' ' + y +
        ' L ' + (x + w * 0.7) + ' ' + y +
        ' L ' + (x + w * 0.88) + ' ' + (y + h * 0.22) +
        ' L ' + (x + w) + ' ' + bottom + ' ' + cuticle;
    }
    // almond
    return 'M ' + x + ' ' + bottom +
      ' L ' + (x + w * 0.06) + ' ' + (y + h * 0.42) +
      ' Q ' + (x + r) + ' ' + (y - h * 0.06) + ' ' + (x + w * 0.94) + ' ' + (y + h * 0.42) +
      ' L ' + (x + w) + ' ' + bottom + ' ' + cuticle;
  }

  function render() {
    var markup = FINGERS.map(function (f, i) {
      var clipId = 'clip' + i;
      var d = nailPath(f, state.shape);
      var cx = f.x + f.w / 2;
      var cy = f.y + f.h / 2;

      var overlay = '';
      if (state.finish === 'dots') {
        overlay =
          '<rect x="' + f.x + '" y="' + f.y + '" width="' + f.w + '" height="' + (f.h * 0.42).toFixed(1) + '" fill="#ffffff" clip-path="url(#' + clipId + ')"/>' +
          '<rect x="' + f.x + '" y="' + f.y + '" width="' + f.w + '" height="' + (f.h * 0.42).toFixed(1) + '" fill="url(#dots)" clip-path="url(#' + clipId + ')"/>';
      } else if (state.finish === 'sparkle') {
        overlay = '<rect x="' + f.x + '" y="' + f.y + '" width="' + f.w + '" height="' + f.h + '" fill="url(#sparkle)" clip-path="url(#' + clipId + ')"/>';
      } else if (state.finish === 'stripes') {
        overlay = '<rect x="' + f.x + '" y="' + (f.y + f.h * 0.45).toFixed(1) + '" width="' + f.w + '" height="7" fill="url(#stripes)" clip-path="url(#' + clipId + ')"/>';
      }

      return '<g transform="rotate(' + f.rot + ' ' + cx + ' ' + cy + ')">' +
        '<clipPath id="' + clipId + '"><path d="' + d + '"/></clipPath>' +
        '<path d="' + d + '" fill="' + state.color + '" stroke="rgba(59,43,51,.18)" stroke-width="1"/>' +
        overlay +
        '<path d="' + d + '" fill="url(#shine)"/>' +
        '</g>';
    }).join('');

    nailGroup.innerHTML = markup;
    readout.textContent = SHAPE_LABELS[state.shape] + ' nails in ' +
      (COLOR_LABELS[state.color] || state.color) + ', ' + FINISH_LABELS[state.finish] + ' finish.';
  }

  $$('.opt-row').forEach(function (row) {
    var group = row.dataset.group;
    row.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || !row.contains(btn)) return;

      var value = btn.dataset.value;
      if (group === 'color' && !/^#[0-9a-f]{6}$/i.test(value)) return;

      Array.prototype.forEach.call(row.children, function (child) {
        var active = child === btn;
        child.classList.toggle('is-active', active);
        child.setAttribute('aria-pressed', String(active));
      });
      state[group] = value;
      render();
    });
  });

  $('#studioSurprise').addEventListener('click', function () {
    var pick = function (row) {
      var options = $$('button', row);
      return options[Math.floor(Math.random() * options.length)];
    };
    $$('.opt-row').forEach(function (row) {
      var chosen = pick(row);
      Array.prototype.forEach.call(row.children, function (child) {
        var active = child === chosen;
        child.classList.toggle('is-active', active);
        child.setAttribute('aria-pressed', String(active));
      });
      state[row.dataset.group] = chosen.dataset.value;
    });
    render();
  });

  $('#studioSend').addEventListener('click', function () {
    var idea = $('#idea');
    idea.value = SHAPE_LABELS[state.shape].toLowerCase() + ' nails in ' +
      (COLOR_LABELS[state.color] || state.color) + ' with a ' + FINISH_LABELS[state.finish] + ' finish';
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(function () { $('#name').focus(); }, 500);
  });

  render();

  /* ============================================================
     CONTACT FORM
     Posts to Netlify Forms when hosted there; falls back to a
     mailto handoff on static hosts like GitHub Pages.
     ============================================================ */
  var form = $('#requestForm');
  var status = $('#formStatus');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.reportValidity()) return;

    var data = new FormData(form);
    if (data.get('company')) return; // honeypot tripped

    status.className = 'form-status';
    status.textContent = 'Sending…';

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Form endpoint unavailable');
        status.className = 'form-status is-ok';
        status.textContent = 'Thank you! Your request is on its way. Sam will reply soon.';
        form.reset();
      })
      .catch(function () {
        var subject = 'Design request from ' + (data.get('name') || 'a new client');
        var body = 'Name: ' + data.get('name') + '\n' +
          'Email: ' + data.get('email') + '\n' +
          'Design idea: ' + (data.get('idea') || '—') + '\n\n' +
          (data.get('message') || '');
        status.className = 'form-status is-ok';
        status.textContent = 'Opening your email app so you can send this request.';
        window.location.href = 'mailto:hello@nailsbysam.example?subject=' +
          encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      });
  });
})();
