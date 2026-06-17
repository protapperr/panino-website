'use strict';

/* ════════════════════════════════════════════════════════
   PANINO – main.js
   Reihenfolge:
   1. Lucide Icons initialisieren
   2. Navigation (Scroll-State + Mobile-Toggle)
   3. Speisekarten-Tabs
   4. GSAP ScrollTrigger Animationen
   5. Stats-Counter
   ════════════════════════════════════════════════════════ */


/* ── 1. Lucide Icons ────────────────────────────────── */
lucide.createIcons();


/* ── 2. Navigation ──────────────────────────────────── */
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 80) {
    nav.classList.add('scrolled');
  } else if (y < 10) {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  document.body.classList.toggle('no-scroll', isOpen);
});

navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menü öffnen');
    document.body.classList.remove('no-scroll');
  });
});

document.addEventListener('click', e => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !navToggle.contains(e.target)
  ) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
});


/* ── 3. Speisekarten-Tabs ───────────────────────────── */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });

    tabPanels.forEach(p => {
      p.classList.remove('active');
      p.hidden = true;
    });

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const panel = document.getElementById(`tab-${target}`);
    if (panel) {
      panel.hidden = false;
      panel.classList.add('active');
    }
  });

  btn.addEventListener('keydown', e => {
    const tabList = [...tabBtns];
    const index   = tabList.indexOf(btn);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      tabList[(index + 1) % tabList.length].focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      tabList[(index - 1 + tabList.length) % tabList.length].focus();
    }
  });
});



/* ── 4. Wochenkarte – Google Sheets ────────────────── */
/*
   Erwartetes Spaltenformat der Google-Tabelle (ab Zeile 2, Zeile 1 = Kopfzeile):
   A: Kategorie   (z. B. „Vorspeise", „Hauptgang", „Dessert")
   B: Gericht     (Name des Gerichts)
   C: Beschreibung
   D: Preis       (z. B. „14,90 €")
*/
(function () {
  const SHEET_ID = '1BbP48qLsILFS7KFqnUrhRyM8nxuayeES3UmGP-PzzQs';
  const URL      = const url = "https://docs.google.com/spreadsheets/d/1BbP48qLsILFS7KFqnUrhRyM8nxuayeES3UmGP-PzzQs/gviz/tq?tqx=out:csv"; + SHEET_ID +
                   '/gviz/tq?tqx=out:json';
  const el       = document.getElementById('wochenkarte-content');

  function cell(row, idx) {
    const c = row.c && row.c[idx];
    return c ? (c.f != null ? c.f : String(c.v != null ? c.v : '')) : '';
  }

  function escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showLoader() {
    el.innerHTML =
      '<div class="wk-loader">' +
        '<div class="wk-spinner"></div>' +
        '<span>Wochenkarte wird geladen …</span>' +
      '</div>';
  }

  function showError() {
    el.innerHTML =
      '<div class="wk-error">' +
        '<div class="wk-error-ornament">✦</div>' +
        '<h3>Wochenkarte derzeit nicht verfügbar</h3>' +
        '<p>Bitte schauen Sie später vorbei oder fragen Sie unser Team direkt.<br>' +
           'Telefonisch erreichbar unter ' +
           '<a href="tel:+4908122229595">08122 / 229 595</a>.</p>' +
      '</div>';
  }

  function render(rows) {
    /* Zeilen filtern: leere Zeilen überspringen */
    const data = rows.filter(function (row) {
      return row.c && row.c.some(function (c) { return c && c.v != null && c.v !== ''; });
    });

    if (data.length === 0) { showError(); return; }

    /* Gerichte nach Kategorie (Spalte A) gruppieren */
    const groups = {};
    const order  = [];
    data.forEach(function (row) {
      const cat = escape(cell(row, 0)) || 'Gerichte';
      if (!groups[cat]) { groups[cat] = []; order.push(cat); }
      groups[cat].push({
        name:  escape(cell(row, 1)),
        desc:  escape(cell(row, 2)),
        price: escape(cell(row, 3)),
      });
    });

    /* HTML aufbauen */
    let html = '';
    order.forEach(function (cat) {
      html += '<div class="menu-subsection">' +
                '<span class="menu-subsection-title">' + cat + '</span>' +
              '</div>' +
              '<div class="vini-grid">';
      groups[cat].forEach(function (item) {
        html +=
          '<article class="vino-card">' +
            '<div class="vino-top">' +
              '<div><h3>' + item.name + '</h3></div>' +
              (item.price
                ? '<div class="vino-prices"><span><strong>' + item.price + '</strong></span></div>'
                : '') +
            '</div>' +
            (item.desc ? '<p class="vino-desc">' + item.desc + '</p>' : '') +
          '</article>';
      });
      html += '</div>';
    });

    const today = new Date().toLocaleDateString('de-DE',
      { day: '2-digit', month: '2-digit', year: 'numeric' });
    html += '<p class="wk-updated">Stand: ' + today + '</p>';
    el.innerHTML = html;
  }

  /* Laden starten */
  showLoader();
  fetch(URL)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function (text) {
      /* gviz-Response-Wrapper entfernen: /*O_o*\/\ngoogle.visualization.Query.setResponse({...}); */
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);\s*$/);
      if (!match) throw new Error('Unbekanntes Antwortformat');
      const parsed = JSON.parse(match[1]);
      if (!parsed.table || !parsed.table.rows) throw new Error('Keine Tabelle');
      render(parsed.table.rows);
    })
    .catch(function () {
      showError();
    });
}());


/* ── 5. GSAP ScrollTrigger Animationen ─────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero: Einblenden beim Seitenload ── */
  const heroTl = gsap.timeline({ delay: 0.15 });

  heroTl
    .to('.hero-eyebrow', {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      clearProps: 'transform'
    })
    .to('.hero-title-line', {
      opacity: 1,
      y: 0,
      stagger: 0.18,
      duration: 1.05,
      ease: 'power3.out',
      clearProps: 'transform'
    }, '-=0.45')
    .to('.hero-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      clearProps: 'transform'
    }, '-=0.55')
    .to('.hero-actions', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform'
    }, '-=0.5')
    .to('.hero-scroll-indicator', {
      opacity: 1,
      duration: 0.65,
      ease: 'power2.out'
    }, '-=0.3');

  /* ── Generische fade-up Elemente ── */
  document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true
      },
      opacity: 0,
      y: 44,
      duration: 0.9,
      ease: 'power3.out'
    });
  });

  /* ── La Storia: Bild von links, Text von rechts ── */
  gsap.from('.storia-image-wrap[data-gsap="from-left"]', {
    scrollTrigger: {
      trigger: '.storia',
      start: 'top 76%',
      once: true
    },
    opacity: 0,
    x: -65,
    duration: 1.05,
    ease: 'power3.out'
  });

  gsap.from('.storia-text[data-gsap="from-right"]', {
    scrollTrigger: {
      trigger: '.storia',
      start: 'top 76%',
      once: true
    },
    opacity: 0,
    x: 65,
    duration: 1.05,
    ease: 'power3.out'
  });

  /* ── Bento-Zellen: gestaffelt einblenden ── */
  gsap.from('[data-gsap="bento"]', {
    scrollTrigger: {
      trigger: '.bento-grid',
      start: 'top 80%',
      once: true
    },
    opacity: 0,
    scale: 0.94,
    stagger: 0.13,
    duration: 0.85,
    ease: 'power2.out'
  });

  /* ── Prenotazione: Info links, Widget rechts ── */
  gsap.from('.preno-info[data-gsap="from-left"]', {
    scrollTrigger: {
      trigger: '.prenotazione',
      start: 'top 76%',
      once: true
    },
    opacity: 0,
    x: -55,
    duration: 1.0,
    ease: 'power3.out'
  });

  gsap.from('.preno-widget-frame[data-gsap="from-right"]', {
    scrollTrigger: {
      trigger: '.prenotazione',
      start: 'top 76%',
      once: true
    },
    opacity: 0,
    x: 55,
    duration: 1.0,
    ease: 'power3.out'
  });

  /* ── Dove Siamo: Info von rechts ── */
  gsap.from('.dove-info[data-gsap="from-right"]', {
    scrollTrigger: {
      trigger: '.dove-siamo',
      start: 'top 82%',
      once: true
    },
    opacity: 0,
    x: 55,
    duration: 1.0,
    ease: 'power3.out'
  });

  /* ── Subtile Hero-Parallax beim Scrollen ── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 22,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

} else {
  /* Ohne GSAP: alle opacity-0-Elemente sofort sichtbar */
  [
    '.hero-eyebrow',
    '.hero-title-line',
    '.hero-subtitle',
    '.hero-actions',
    '.hero-scroll-indicator'
  ].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.opacity = '1';
    });
  });
}


/* ── 6. Stats Counter ───────────────────────────────── */
const statNums = document.querySelectorAll('.stat-num[data-count]');

statNums.forEach(el => {
  const target = parseInt(el.dataset.count, 10);

  function startCounter() {
    if (prefersReducedMotion || typeof gsap === 'undefined') {
      el.textContent = target;
      return;
    }

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.9,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = Math.round(obj.val);
      },
      onComplete() {
        el.textContent = target;
      }
    });
  }

  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        startCounter();
        io.disconnect();
      }
    }, { threshold: 0.5 });

    io.observe(el);
  } else {
    el.textContent = target;
  }
});
