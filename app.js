/* Tisha B'Av 5786 — countdown to tzeis.
   All instants are fixed UTC so the page is correct from any device clock/zone. */

(function () {
  'use strict';

  // ── the day ──────────────────────────────────────────────
  // Eastern Daylight Time = UTC-4.
  var FAST_START = Date.UTC(2026, 6, 23,  0, 26); // Wed Jul 22, 8:26 PM  — shkia
  var CHATZOS    = Date.UTC(2026, 6, 23, 16, 56); // Thu Jul 23, 12:56 PM — halachic midday
  var SHKIA      = Date.UTC(2026, 6, 24,  0, 25); // Thu Jul 23, 8:25 PM  — sunset
  var FAST_END   = Date.UTC(2026, 6, 24,  1, 32); // Thu Jul 23, 9:32 PM  — tzeis, fast ends

  var $ = function (id) { return document.getElementById(id); };
  var body = document.body;

  // ?p=0.85 pins the clock to a point in the fast, for checking how it looks.
  var forced = null;
  var m = /[?&]p=([0-9.]+)/.exec(window.location.search);
  if (m) forced = Math.max(0, Math.min(1, parseFloat(m[1])));

  // ── verses ───────────────────────────────────────────────
  var VERSES = [
    {
      he: 'הֲשִׁיבֵנוּ ה\' אֵלֶיךָ וְנָשׁוּבָה, חַדֵּשׁ יָמֵינוּ כְּקֶדֶם',
      en: 'Bring us back to You, and we will return. Renew our days as of old.',
      src: 'Eichah 5:21'
    },
    {
      he: 'בּוֹנֵה יְרוּשָׁלַיִם ה\', נִדְחֵי יִשְׂרָאֵל יְכַנֵּס',
      en: 'The Builder of Jerusalem is Hashem. He gathers in the scattered of Israel.',
      src: 'Tehillim 147:2'
    },
    {
      he: 'כׇּל הַמִּתְאַבֵּל עַל יְרוּשָׁלַיִם זוֹכֶה וְרוֹאֶה בְּשִׂמְחָתָהּ',
      en: 'Whoever mourns for Jerusalem merits to see her joy.',
      src: 'Taanis 30b'
    },
    {
      he: 'אִם אֶשְׁכָּחֵךְ יְרוּשָׁלָיִם, תִּשְׁכַּח יְמִינִי',
      en: 'If I forget you, Jerusalem, let my right hand forget its skill.',
      src: 'Tehillim 137:5'
    },
    {
      he: 'הָפַכְתָּ מִסְפְּדִי לְמָחוֹל לִי, פִּתַּחְתָּ שַׂקִּי וַתְּאַזְּרֵנִי שִׂמְחָה',
      en: 'You turned my mourning into dancing. You loosened my sackcloth and girded me with joy.',
      src: 'Tehillim 30:12'
    },
    {
      he: 'צוֹם הָרְבִיעִי וְצוֹם הַחֲמִישִׁי יִהְיֶה לְבֵית יְהוּדָה לְשָׂשׂוֹן וּלְשִׂמְחָה וּלְמֹעֲדִים טוֹבִים',
      en: 'The fast of the fourth month and the fast of the fifth will become, for the house of Judah, days of gladness and joy and happy festivals.',
      src: 'Zechariah 8:19'
    },
    {
      he: 'קוּמִי אוֹרִי כִּי בָא אוֹרֵךְ, וּכְבוֹד ה\' עָלַיִךְ זָרָח',
      en: 'Arise, shine, for your light has come, and the glory of Hashem shines upon you.',
      src: 'Yeshayahu 60:1'
    },
    {
      he: 'נַחֲמוּ נַחֲמוּ עַמִּי, יֹאמַר אֱלֹקֵיכֶם',
      en: 'Comfort, comfort My people, says your God.',
      src: 'Yeshayahu 40:1'
    }
  ];

  // ── milestone legend ─────────────────────────────────────
  var MARKS = [
    { at: FAST_START, cap: 'Eicha',   sub: '8:26 PM' },
    { at: CHATZOS,    cap: 'Chatzos', sub: '12:56 PM' },
    { at: SHKIA,      cap: 'Shkia',   sub: '8:25 PM' },
    { at: FAST_END,   cap: 'Tzeis',   sub: '9:32 PM' }
  ];

  (function buildMarks() {
    var ol = $('marks');
    MARKS.forEach(function (m) {
      var li = document.createElement('li');
      li.innerHTML = m.cap + '<small>' + m.sub + '</small>';
      ol.appendChild(li);
    });
  })();

  // ── the times ledger ─────────────────────────────────────
  var ROWS = [
    { label: 'Shkia, the fast begins', note: 'Wednesday', at: FAST_START, time: '8:26 PM' },
    { label: 'Chatzos', note: 'Thursday, halachic midday', at: CHATZOS, time: '12:56 PM' },
    { label: 'Shkia', note: 'Thursday', at: SHKIA, time: '8:25 PM' },
    { label: 'Tzeis, the fast ends', note: 'Thursday night', at: FAST_END, time: '9:32 PM' }
  ];

  (function buildTimes() {
    var dl = $('times');
    ROWS.forEach(function (r) {
      var row = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.innerHTML = r.label + '<small>' + r.note + '</small>';
      dd.textContent = r.time;
      row.appendChild(dt);
      row.appendChild(dd);
      dl.appendChild(row);
    });
  })();

  // ── verse rotation ───────────────────────────────────────
  var qIndex = 0, qTimer = null;
  var quote = $('quote'), qHe = $('qHe'), qEn = $('qEn'), qSrc = $('qSrc'), pips = $('pips');

  VERSES.forEach(function (v, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', v.src);
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () { showVerse(i, true); });
    pips.appendChild(b);
  });

  function paintVerse(i) {
    qHe.textContent = VERSES[i].he;
    qEn.textContent = VERSES[i].en;
    qSrc.textContent = VERSES[i].src;
    var btns = pips.children;
    for (var k = 0; k < btns.length; k++) {
      btns[k].setAttribute('aria-selected', k === i ? 'true' : 'false');
    }
  }

  function showVerse(i, manual) {
    qIndex = (i + VERSES.length) % VERSES.length;
    quote.classList.add('is-swapping');
    setTimeout(function () {
      paintVerse(qIndex);
      quote.classList.remove('is-swapping');
    }, 420);
    if (manual) restartVerseTimer();
  }

  function restartVerseTimer() {
    clearInterval(qTimer);
    qTimer = setInterval(function () { showVerse(qIndex + 1, false); }, 13000);
  }

  paintVerse(0);
  restartVerseTimer();

  // ── the clock ────────────────────────────────────────────
  var hh = $('hh'), mm = $('mm'), ss = $('ss');
  var lastSecond = -1, finished = false;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function etClock(now) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Toronto',
      hour: 'numeric', minute: '2-digit'
    }).format(now);
  }

  function setSkyLayer(el, value) {
    el.style.opacity = Math.max(0, Math.min(1, value)).toFixed(3);
  }

  function ramp(p, from, to) {
    return Math.max(0, Math.min(1, (p - from) / (to - from)));
  }

  function paintAtmosphere(p) {
    // Light arrives late, the way dawn actually behaves.
    var glow = Math.pow(p, 1.7);

    // The Kotel holds the frame until past chatzos, then the Beis
    // Hamikdash comes up in its place.
    var handover = ramp(p, .5, .93);
    $('shotTemple').style.opacity = handover.toFixed(3);
    $('shotKotel').style.opacity = (1 - handover).toFixed(3);

    // Both photographs are graded from near-dark up to full light.
    var bright = (.67 + glow * .68).toFixed(3);
    var sat = (.62 + glow * .78).toFixed(3);
    var grade = 'brightness(' + bright + ') saturate(' + sat + ') contrast(1.04)';
    $('shotKotel').style.filter = grade;
    $('shotTemple').style.filter = grade;

    setSkyLayer($('gradeCool'), 1 - ramp(p, .15, 1) * .88);
    setSkyLayer($('gradeWarm'), Math.pow(p, 1.9));
  }

  function finish() {
    if (finished) return;
    finished = true;
    $('countBlock').hidden = true;
    $('doneBlock').hidden = false;
    $('countLabel').textContent = '';
    $('track').querySelector('.track__meta').innerHTML = '<span>Complete</span> · may this be the last one';
    document.title = 'The fast is over';
  }

  function tick() {
    var span = FAST_END - FAST_START;
    var now = forced === null ? Date.now() : FAST_START + span * forced;
    var remain = FAST_END - now;
    var p = Math.max(0, Math.min(1, (now - FAST_START) / span));

    paintAtmosphere(p);
    $('trackFill').style.transform = 'scaleX(' + p.toFixed(4) + ')';
    $('pct').textContent = Math.floor(p * 100) + '%';
    $('clock').textContent = etClock(new Date(now));

    // legend + ledger state
    var marks = $('marks').children;
    for (var i = 0; i < MARKS.length; i++) {
      marks[i].classList.toggle('is-past', now >= MARKS[i].at);
    }
    var rows = $('times').children;
    var nextFound = false;
    for (var k = 0; k < ROWS.length; k++) {
      var past = now >= ROWS[k].at;
      rows[k].classList.toggle('is-past', past);
      rows[k].classList.toggle('is-next', !past && !nextFound);
      if (!past) nextFound = true;
    }

    if (remain <= 0) { finish(); return; }

    var total = Math.floor(remain / 1000);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;

    hh.textContent = pad(h);
    mm.textContent = pad(m);
    if (s !== lastSecond) {
      ss.textContent = pad(s);
      lastSecond = s;
      ss.classList.add('tick');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { ss.classList.remove('tick'); });
      });
    }

    document.title = pad(h) + ':' + pad(m) + ' to tzeis';
  }

  tick();
  setInterval(tick, 1000);

  // ── motion preference ────────────────────────────────────
  var prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionBtn = $('motionBtn');
  var stored = null;
  try { stored = localStorage.getItem('tb-motion'); } catch (e) {}

  function applyMotion(state) {
    // state: 'on' | 'off' | null (follow the system)
    body.classList.remove('is-moving', 'is-still');
    if (state === 'on') body.classList.add('is-moving');
    if (state === 'off') body.classList.add('is-still');

    var effective = state === 'on' ? true : state === 'off' ? false : !prefersStill.matches;
    motionBtn.textContent = 'Ambient motion: ' + (effective ? 'on' : 'off');
    motionBtn.setAttribute('aria-pressed', effective ? 'true' : 'false');
    return effective;
  }

  var effectiveMotion = applyMotion(stored);

  motionBtn.addEventListener('click', function () {
    var next = effectiveMotion ? 'off' : 'on';
    effectiveMotion = applyMotion(next);
    try { localStorage.setItem('tb-motion', next); } catch (e) {}
  });

  // ── install ──────────────────────────────────────────────
  var deferred = null;
  var installBtn = $('installBtn');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    installBtn.hidden = false;
    $('hint').textContent = 'Install it and it opens full screen, and works with no signal.';
  });

  installBtn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function () {
      deferred = null;
      installBtn.hidden = true;
    });
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  // Keep the countdown honest after the phone sleeps.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });
})();
