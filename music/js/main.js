/* Shared site behaviour — runs on every page (loaded by all HTML files). */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* Normalise an existing category label to one of the canonical categories. */
  function normCat(raw) {
    raw = (raw || '').toUpperCase();
    if (/RESIDENC/.test(raw)) return 'RESIDENCY';
    if (/WORKSHOP/.test(raw)) return 'WORKSHOP';
    if (/INSTALLATION/.test(raw)) return 'INSTALLATION';
    if (/RADIO/.test(raw)) return 'RADIO';
    if (/DJ/.test(raw)) return 'DJ SET';
    if (/IMPROV/.test(raw)) return 'IMPROVISED';
    if (/COMPOS/.test(raw)) return 'COMPOSED';
    if (/PARTICIP/.test(raw)) return 'PARTICIPATIVE';
    if (/PERFORMANCE|LIVE/.test(raw)) return 'LIVE';
    return raw;
  }

  /* Guess a category from a performance title (for entries with no tag). */
  function deriveCat(t) {
    t = (t || '').toLowerCase();
    if (/workshop/.test(t)) return 'WORKSHOP';
    if (/residenc/.test(t)) return 'RESIDENCY';
    if (/installation/.test(t)) return 'INSTALLATION';
    if (/radio|cashmere|faderadio|transmission|alhara|60sec/.test(t)) return 'RADIO';
    if (/dj set|dj |\bmix\b/.test(t)) return 'DJ SET';
    if (/improvis|recordat/.test(t)) return 'IMPROVISED';
    if (/composition|composed|recording|sound work|sound design|collage|documentary|octophonic/.test(t)) return 'COMPOSED';
    if (/distant performers|primates|jasmines|orchestrat/.test(t)) return 'PARTICIPATIVE';
    return 'LIVE';
  }

  /* Glue the last two words of an element's text with a non-breaking space so a
     single word never wraps onto its own line. Works in every browser (mobile
     Safari ignores CSS text-wrap: balance). Edits the last text node only, so
     nested markup and click handlers are preserved. */
  function bindLastWord(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var last = null, n;
    while ((n = walker.nextNode())) { if (n.nodeValue.trim()) last = n; }
    if (!last) return;
    var v = last.nodeValue.replace(/\s+$/, '');
    last.nodeValue = v.replace(/ (\S+)$/, String.fromCharCode(160) + '$1');
  }

  ready(function () {
    /* --- WORK PAGES: if there's no real text or media, show only the
           background image (drop the empty content card + dark scrim). --- */
    var page = document.getElementById('page');
    if (page) {
      var info = document.getElementById('info');
      var text = info ? info.textContent.replace(/\s+/g, '') : '';
      var media = page.querySelector(
        '#sound iframe, #sound embed, #sound object, #sound a,' +
        '#video iframe, #video embed, #page img'
      );
      if (!text && !media) {
        document.body.classList.add('bare');
      }

      /* Bandcamp "large" players: keep them compact and comfortably inside the
         card, keeping correct proportions (artwork is square, so
         height = width + controls bar). */
      page.querySelectorAll('#sound iframe[src*="bandcamp"]').forEach(function (f) {
        var st = f.getAttribute('style') || '';
        var wm = st.match(/width:\s*(\d+)px/);
        var hm = st.match(/height:\s*(\d+)px/);
        if (!wm || !hm) return;                 // skip the slim 100%-width track player
        var w = +wm[1], h = +hm[1], bar = h - w;
        var cs = getComputedStyle(page);
        var avail = page.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        var target = Math.min(avail, 300);      // small, with room to spare in the box
        f.style.width = target + 'px';
        f.style.height = (target + bar) + 'px';
        f.style.maxWidth = '100%';
      });

      /* Prevent a lone last word from wrapping onto its own line in the title.
         Works in every browser (unlike CSS text-wrap: balance, which mobile
         Safari ignores): glue the last two words with a non-breaking space. */
      page.querySelectorAll('#info h1, #info h2').forEach(bindLastWord);
    }

    /* --- HOME PAGE: (the hero is intentionally still — no canvas element
           ships in the markup; this block is inert unless one returns) --- */
    var wave = document.querySelector('.hero__wave');
    if (wave && wave.getContext) {
      var wctx = wave.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = 0, H = 0;
      var lx = -1, ly = -1;                  /* listener; -1 = at rest (center) */
      var tcEl = document.querySelector('.hero__tc');
      var INSET = 22;

      var speakers = function () {
        return [
          { n: 'fl', x: INSET,     y: INSET },
          { n: 'fr', x: W - INSET, y: INSET },
          { n: 'rl', x: INSET,     y: H - INSET },
          { n: 'rr', x: W - INSET, y: H - INSET }
        ];
      };

      var draw = function () {
        wctx.clearRect(0, 0, W, H);
        var px = lx >= 0 ? lx : W / 2;
        var py = ly >= 0 ? ly : H / 2;
        var dmax = Math.sqrt(W * W + H * H);
        var sp = speakers();
        var levels = [];

        for (var i = 0; i < sp.length; i++) {
          var s = sp[i];
          var d = Math.sqrt((px - s.x) * (px - s.x) + (py - s.y) * (py - s.y));
          var t = 1 - d / dmax;                       /* 0 far … 1 on top */
          levels.push(-18 * (1 - t));

          /* connection line — brighter when the listener is close */
          wctx.beginPath();
          wctx.moveTo(px, py);
          wctx.lineTo(s.x, s.y);
          wctx.strokeStyle = 'rgba(255, 176, 0, ' + (0.08 + 0.42 * t * t) + ')';
          wctx.lineWidth = 1;
          wctx.stroke();

          /* speaker */
          wctx.fillStyle = 'rgba(255, 176, 0, ' + (0.45 + 0.5 * t * t) + ')';
          wctx.fillRect(s.x - 3, s.y - 3, 6, 6);

          /* label, tucked toward the room */
          wctx.font = '9px "Space Mono", monospace';
          wctx.fillStyle = 'rgba(157, 148, 131, 0.8)';
          wctx.textAlign = s.x < W / 2 ? 'left' : 'right';
          wctx.textBaseline = s.y < H / 2 ? 'top' : 'bottom';
          wctx.fillText(s.n.toUpperCase(), s.x + (s.x < W / 2 ? 8 : -8), s.y + (s.y < H / 2 ? 6 : -6));
        }

        /* the listener */
        wctx.beginPath();
        wctx.arc(px, py, 2.5, 0, Math.PI * 2);
        wctx.fillStyle = 'rgba(236, 229, 216, 0.95)';
        wctx.fill();
        wctx.beginPath();
        wctx.arc(px, py, 7, 0, Math.PI * 2);
        wctx.strokeStyle = 'rgba(236, 229, 216, 0.35)';
        wctx.lineWidth = 1;
        wctx.stroke();

        if (tcEl) {
          tcEl.textContent = sp.map(function (s, i) {
            return s.n + ' ' + (levels[i] <= -0.05 ? '−' : '') + Math.abs(levels[i]).toFixed(1);
          }).join(' · ') + ' db';
        }
      };

      var sizeWave = function () {
        W = wave.clientWidth;
        H = wave.clientHeight;
        wave.width = W * dpr;
        wave.height = H * dpr;
        wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      };
      sizeWave();
      window.addEventListener('resize', sizeWave);

      var hero = document.querySelector('.hero');
      if (hero) {
        hero.addEventListener('pointermove', function (e) {
          var r = wave.getBoundingClientRect();
          lx = Math.max(0, Math.min(W, e.clientX - r.left));
          ly = Math.max(0, Math.min(H, e.clientY - r.top));
          draw();
        }, { passive: true });
        hero.addEventListener('pointerleave', function () {
          lx = -1; ly = -1;
          draw();
        });
      }
    }

    /* --- HOME PAGE: tag every project, make rows clickable, build filters. --- */
    var works = document.getElementById('performances');
    if (!works) return;

    var lis = Array.prototype.slice.call(works.querySelectorAll('li'));
    var counts = {};
    var total = lis.length;

    lis.forEach(function (li, idx) {
      var existing = li.querySelector('.custom-word');
      var raw = existing ? existing.textContent.trim() : '';
      var title = li.textContent.replace(/\s+/g, ' ').trim();
      var cat = raw ? normCat(raw) : deriveCat(title);

      li.setAttribute('data-cat', cat);
      counts[cat] = (counts[cat] || 0) + 1;

      /* every row gets a visible hover tag matching its category */
      if (existing) {
        existing.textContent = cat;
      } else {
        var span = document.createElement('span');
        span.className = 'custom-word';
        span.textContent = cat;
        li.insertBefore(span, li.firstChild);
      }

      /* archive number — list is newest-first, so the oldest work is 001.
         Goes inside the link when there is one so it shares the row layout. */
      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = String(total - idx).padStart(3, '0');
      var host = li.querySelector('a[href]') || li;
      host.insertBefore(num, host.firstChild);

      /* whole row is the click target for linked entries */
      var link = li.querySelector('a[href]');
      if (link && link.getAttribute('href')) {
        li.classList.add('is-link');
        li.addEventListener('click', function (e) {
          if (e.target.closest('a')) return;
          window.location.href = link.getAttribute('href');
        });
      }

      /* the num + year columns already separate the title — drop the old
         "- " prefix from the markup so rows read cleanly */
      var yr = li.querySelector('i');
      if (yr && yr.nextSibling && yr.nextSibling.nodeType === 3) {
        yr.nextSibling.nodeValue = yr.nextSibling.nodeValue.replace(/^\s*-\s*/, ' ');
      }

      /* keep the last word of the entry from wrapping alone on its own line */
      bindLastWord(li);
    });

    /* --- footer name = scroll back to top --- */
    var footName = document.querySelector('.foot-name');
    if (footName) {
      footName.style.cursor = 'pointer';
      footName.setAttribute('title', 'Back to top');
      footName.addEventListener('click', function () {
        window.scrollTo(0, 0);
      });
    }

    /* --- build the filter bar in the hero --- */
    var bar = document.querySelector('.hero__tags');
    if (!bar) return;
    bar.innerHTML = '';
    bar.classList.add('filters');

    function makeBtn(label, n, cat) {
      var b = document.createElement('button');
      b.className = 'filter';
      b.setAttribute('data-cat', cat);
      b.innerHTML = label + ' <em>' + n + '</em>';
      b.addEventListener('click', function () {
        var all = bar.querySelectorAll('.filter');
        for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
        b.classList.add('active');
        lis.forEach(function (li) {
          li.style.display = (!cat || li.getAttribute('data-cat') === cat) ? '' : 'none';
        });
      });
      return b;
    }

    var allBtn = makeBtn('ALL', lis.length, '');
    allBtn.classList.add('active');
    bar.appendChild(allBtn);

    Object.keys(counts)
      .sort(function (a, b) { return counts[b] - counts[a]; })
      .forEach(function (c) { bar.appendChild(makeBtn(c, counts[c], c)); });
  });
})();
