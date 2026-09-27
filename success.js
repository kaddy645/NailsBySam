/* ============================================================
   Success page — "match the pairs" mini game
   ============================================================ */
(function () {
  'use strict';

  var toggle = document.getElementById('gameToggle');
  var panel = document.getElementById('gamePanel');
  var grid = document.getElementById('gameGrid');
  var statusEl = document.getElementById('gameStatus');
  var resetBtn = document.getElementById('gameReset');

  if (!toggle || !grid) return;

  var DESIGNS = [
    { id: 'blush', name: 'ballet pink with dots' },
    { id: 'lavender', name: 'lavender sparkle' },
    { id: 'nude', name: 'nude with a gold stripe' },
    { id: 'plum', name: 'plum with a heart' }
  ];

  var first = null;
  var busy = false;
  var moves = 0;
  var matched = 0;

  function shuffled() {
    var deck = DESIGNS.concat(DESIGNS).slice();
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    return deck;
  }

  function label(card, revealed) {
    var n = card.dataset.index;
    card.setAttribute('aria-label', revealed
      ? 'Card ' + n + ', ' + card.dataset.name
      : 'Card ' + n + ', face down');
  }

  function build() {
    first = null;
    busy = false;
    moves = 0;
    matched = 0;
    grid.innerHTML = '';

    shuffled().forEach(function (design, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card';
      btn.dataset.design = design.id;
      btn.dataset.name = design.name;
      btn.dataset.index = String(i + 1);
      btn.innerHTML =
        '<span class="card-inner">' +
        '<span class="card-back" aria-hidden="true">\u2661</span>' +
        '<span class="card-front face-' + design.id + '" aria-hidden="true"></span>' +
        '</span>';
      label(btn, false);
      li.appendChild(btn);
      grid.appendChild(li);
    });

    statusEl.textContent = 'Find all four matching sets.';
  }

  function flip(card) {
    if (busy || card === first || card.classList.contains('is-matched') || card.classList.contains('is-up')) return;

    card.classList.add('is-up');
    label(card, true);

    if (!first) {
      first = card;
      return;
    }

    moves++;

    if (first.dataset.design === card.dataset.design) {
      first.classList.add('is-matched');
      card.classList.add('is-matched');
      first.disabled = true;
      card.disabled = true;
      first = null;
      matched++;

      if (matched === DESIGNS.length) {
        statusEl.textContent = 'All matched in ' + moves + ' turn' + (moves === 1 ? '' : 's') + '. Nicely done!';
        resetBtn.focus();
      } else {
        statusEl.textContent = 'Matched! ' + (DESIGNS.length - matched) + ' to go.';
      }
      return;
    }

    busy = true;
    statusEl.textContent = 'Not a pair — try again.';
    var a = first;
    first = null;

    window.setTimeout(function () {
      [a, card].forEach(function (c) {
        c.classList.remove('is-up');
        label(c, false);
      });
      busy = false;
    }, 850);
  }

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (card && grid.contains(card)) flip(card);
  });

  toggle.addEventListener('click', function () {
    var open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      build();
      grid.querySelector('.card').focus();
    }
  });

  resetBtn.addEventListener('click', function () {
    build();
    grid.querySelector('.card').focus();
  });
})();
