/* Tisha B'Av 5786 — countdown to tzeis.
   All instants are fixed UTC so the page is correct from any device clock.

   The page keeps the fast: it opens on Eicha with no colour and no image,
   and is given things back as the real milestones pass. */

(function () {
  'use strict';

  // Eastern Daylight Time = UTC-4.
  var FAST_START = Date.UTC(2026, 6, 23,  0, 26); // Wed Jul 22, 8:26 PM  — shkia
  var SUNRISE    = Date.UTC(2026, 6, 23,  9, 26); // Thu Jul 23, 5:26 AM
  var CHATZOS    = Date.UTC(2026, 6, 23, 16, 56); // Thu Jul 23, 12:56 PM
  var SHKIA      = Date.UTC(2026, 6, 24,  0, 25); // Thu Jul 23, 8:25 PM
  var FAST_END   = Date.UTC(2026, 6, 24,  1, 32); // Thu Jul 23, 9:32 PM — tzeis

  var $ = function (id) { return document.getElementById(id); };
  var body = document.body;

  // ?p=0.85 pins the clock to a point in the fast, for checking how it looks.
  var forced = null;
  var qp = /[?&]p=([0-9.]+)/.exec(window.location.search);
  if (qp) forced = Math.max(0, Math.min(1, parseFloat(qp[1])));

  // ── what the page says at each point in the day ──────────
  var STAGES = [
    { at: FAST_START, text: 'The night of Eicha.' },
    { at: SUNRISE,    text: 'Morning. Kinnos.' },
    { at: CHATZOS,    text: 'Chatzos has passed.' },
    { at: SHKIA,      text: 'The sun is down. Not yet.' },
    { at: FAST_END,   text: 'It is over.' }
  ];

  var VERSES = [
    {
      he: 'אֵיכָה יָשְׁבָה בָדָד הָעִיר רַבָּתִי עָם',
      en: 'How does she sit alone, the city once full of people.',
      src: 'Eichah 1:1'
    },
    {
      he: 'הֲשִׁיבֵנוּ ה\' אֵלֶיךָ וְנָשׁוּבָה, חַדֵּשׁ יָמֵינוּ כְּקֶדֶם',
      en: 'Bring us back to You, and we will return. Renew our days as of old.',
      src: 'Eichah 5:21'
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
      he: 'בּוֹנֵה יְרוּשָׁלַיִם ה\', נִדְחֵי יִשְׂרָאֵל יְכַנֵּס',
      en: 'The Builder of Jerusalem is Hashem. He gathers in the scattered of Israel.',
      src: 'Tehillim 147:2'
    },
    {
      he: 'הָפַכְתָּ מִסְפְּדִי לְמָחוֹל לִי, פִּתַּחְתָּ שַׂקִּי וַתְּאַזְּרֵנִי שִׂמְחָה',
      en: 'You turned my mourning into dancing. You loosened my sackcloth and girded me with joy.',
      src: 'Tehillim 30:12'
    },
    {
      he: 'צוֹם הָרְבִיעִי וְצוֹם הַחֲמִישִׁי יִהְיֶה לְבֵית יְהוּדָה לְשָׂשׂוֹן וּלְשִׂמְחָה',
      en: 'The fast of the fourth month and the fast of the fifth will become, for the house of Judah, days of gladness and joy.',
      src: 'Zechariah 8:19'
    },
    {
      he: 'נַחֲמוּ נַחֲמוּ עַמִּי, יֹאמַר אֱלֹקֵיכֶם',
      en: 'Comfort, comfort My people, says your God.',
      src: 'Yeshayahu 40:1'
    }
  ];

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

  // ── verses ───────────────────────────────────────────────
  var qIndex = 0, qTimer = null;
  var verse = $('verse'), qHe = $('qHe'), qEn = $('qEn'), qSrc = $('qSrc'), qCount = $('qCount');

  function paintVerse(i) {
    qHe.textContent = VERSES[i].he;
    qEn.textContent = VERSES[i].en;
    qSrc.textContent = VERSES[i].src;
    qCount.textContent = (i + 1) + ' / ' + VERSES.length;
  }

  function showVerse(i, manual) {
    qIndex = (i + VERSES.length) % VERSES.length;
    verse.classList.add('is-swapping');
    setTimeout(function () {
      paintVerse(qIndex);
      verse.classList.remove('is-swapping');
    }, 400);
    if (manual) restartVerseTimer();
  }

  function restartVerseTimer() {
    clearInterval(qTimer);
    qTimer = setInterval(function () { showVerse(qIndex + 1, false); }, 14000);
  }

  $('qNext').addEventListener('click', function () { showVerse(qIndex + 1, true); });
  $('qPrev').addEventListener('click', function () { showVerse(qIndex - 1, true); });

  paintVerse(0);
  restartVerseTimer();

  // ── the clock ────────────────────────────────────────────
  var hh = $('hh'), mm = $('mm'), ss = $('ss');
  var lastSecond = -1, finished = false;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function ramp(v, from, to) { return clamp01((v - from) / (to - from)); }

  function etClock(now) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Toronto', hour: 'numeric', minute: '2-digit'
    }).format(now);
  }

  function paintField(now, p) {
    // Eicha holds the field until past chatzos, then lets go.
    $('fieldMourn').style.opacity = (1 - ramp(now, CHATZOS, SHKIA)).toFixed(3);

    // Colour is withheld until chatzos, then arrives slowly.
    var ember = ramp(now, CHATZOS, FAST_END);
    $('fieldEmber').style.opacity = (ember * .9).toFixed(3);
    body.classList.toggle('has-ember', now >= CHATZOS);

    // The Beis Hamikdash only at the very end.
    $('fieldPhoto').style.opacity = (Math.pow(ramp(now, SHKIA, FAST_END), 1.7) * .72).toFixed(3);

    $('lineDone').style.width = (p * 100).toFixed(2) + '%';
    $('lineNow').style.left = (p * 100).toFixed(2) + '%';
    $('pct').textContent = Math.floor(p * 100) + '%';
  }

  function currentStage(now) {
    var text = STAGES[0].text;
    for (var i = 0; i < STAGES.length; i++) {
      if (now >= STAGES[i].at) text = STAGES[i].text;
    }
    return text;
  }

  function finish() {
    if (finished) return;
    finished = true;
    $('digits').hidden = true;
    $('heroAt').hidden = true;
    $('heroLabel').textContent = 'Tzeis, 9:32 PM';
    $('doneBlock').hidden = false;
    document.title = 'The fast is over';
  }

  function tick() {
    var span = FAST_END - FAST_START;
    var now = forced === null ? Date.now() : FAST_START + span * forced;
    var remain = FAST_END - now;
    var p = clamp01((now - FAST_START) / span);

    paintField(now, p);
    $('clock').textContent = etClock(new Date(now));
    $('stage').textContent = currentStage(now);

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
    body.classList.remove('is-moving', 'is-still');
    if (state === 'on') body.classList.add('is-moving');
    if (state === 'off') body.classList.add('is-still');
    var on = state === 'on' ? true : state === 'off' ? false : !prefersStill.matches;
    motionBtn.textContent = 'Ambient motion: ' + (on ? 'on' : 'off');
    motionBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    return on;
  }

  var motionOn = applyMotion(stored);

  motionBtn.addEventListener('click', function () {
    var next = motionOn ? 'off' : 'on';
    motionOn = applyMotion(next);
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
    deferred.userChoice.then(function () { deferred = null; installBtn.hidden = true; });
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });
})();
