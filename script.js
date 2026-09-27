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

  var revealAll = function () {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  };

  if ('IntersectionObserver' in window) {
    var revealed = 0;
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealed++;
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealables.forEach(function (el) { revealer.observe(el); });

    // Backgrounded or throttled tabs may never run the callback. Never leave
    // the page blank because of an animation.
    window.setTimeout(function () {
      if (revealed === 0) revealAll();
    }, 2500);
  } else {
    revealAll();
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

  /* ---------- set CTAs show the choice as a badge on the form ---------- */
  var tierField = $('#tier');
  var chosenSet = $('#chosenSet');
  var chosenName = $('#chosenName');
  var chosenClear = $('#chosenClear');

  if (tierField && chosenSet) {
    var setChoice = function (name) {
      tierField.value = name || '';
      chosenName.textContent = name || '';
      chosenSet.hidden = !name;
      if (name) {
        chosenSet.classList.remove('is-new');
        void chosenSet.offsetWidth; // restart the highlight animation
        chosenSet.classList.add('is-new');
      }

      $$('.press-card').forEach(function (card) {
        var link = $('a[data-tier]', card);
        var picked = !!name && link && link.dataset.tier === name;
        var badge = $('.press-selected', card);
        card.classList.toggle('is-selected', picked);
        if (badge) badge.hidden = !picked;
        if (link) {
          if (picked) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      });
    };

    $$('a[data-tier]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setChoice(btn.dataset.tier);
        window.setTimeout(function () { $('#name').focus({ preventScroll: true }); }, 600);
      });
    });

    chosenClear.addEventListener('click', function () {
      setChoice('');
      $('#idea').focus();
    });
  }

  /* ---------- live character counter ---------- */
  var message = $('#message');
  var messageCount = $('#messageCount');

  if (message && messageCount) {
    var limit = message.maxLength;
    var updateCount = function () {
      var used = message.value.length;
      messageCount.textContent = used + ' / ' + limit;
      messageCount.classList.toggle('is-near', used >= limit - 50);
    };
    message.addEventListener('input', updateCount);
    // reset fires before the value clears
    message.form.addEventListener('reset', function () {
      window.setTimeout(updateCount, 0);
    });
    updateCount();
  }

  /* ============================================================
     CONTACT FORM
     Sends to Netlify over fetch, then forwards to the page named
     in the form's action. Without JS the browser does the same
     thing natively.
     ============================================================ */
  var form = $('#requestForm');
  var status = $('#formStatus');
  var submitBtn = $('#submitBtn');
  var submitting = false;

  // Netlify accepts submissions on any path; action is the redirect target.
  var ENDPOINT = '/';
  var successUrl = form.getAttribute('action');

  var setStatus = function (text, state) {
    status.className = 'form-status' + (state ? ' is-' + state : '');
    status.textContent = text;
  };

  var onSuccess = function () {
    form.reset();
    if (successUrl) {
      window.location.assign(successUrl);
      return;
    }
    setStatus('Thank you! Your request is on its way. Sam will reply soon.', 'ok');
  };

  // Leaves the fields filled so nothing typed is lost.
  var fail = function (message) {
    setStatus(message, 'error');
    submitting = false;
    submitBtn.disabled = false;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;

    var data = new FormData(form);

    // Bots fill the hidden field. Mimic success rather than reveal the trap.
    if (data.get('company')) {
      onSuccess();
      return;
    }

    submitting = true;
    submitBtn.disabled = true;
    setStatus('Sending…');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    })
      .then(function (res) {
        if (res.ok) {
          onSuccess();
          return;
        }
        // 404 = Netlify has not detected the form yet. 405/501 = the host does
        // not accept POST at all, which is the case on any plain static server.
        var unsupported = res.status === 405 || res.status === 501;
        fail(unsupported
          ? 'This form only works on the live site — the preview server cannot receive submissions.'
          : 'Sorry — that did not send. Please try again in a moment.');
      })
      .catch(function () {
        fail('Sorry — that did not send. Please check your connection and try again.');
      });
  });
})();
