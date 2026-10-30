/* Adventis — shared scripts */
(function(){
  'use strict';

  // ---------- Drawer / mobile menu ----------
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  if (burger && drawer) {
    const close = () => {
      drawer.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    };
    const toggle = () => {
      const open = drawer.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
    };
    burger.addEventListener('click', toggle);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // ---------- Accordion ----------
  document.querySelectorAll('.accordion').forEach(acc => {
    const items = acc.querySelectorAll('.acc-item');
    items.forEach(item => {
      const head  = item.querySelector('.acc-head');
      const panel = item.querySelector('.acc-panel');
      if (!head || !panel) return;
      head.setAttribute('aria-expanded', 'false');
      head.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => {
          i.classList.remove('open');
          const p = i.querySelector('.acc-panel');
          const h = i.querySelector('.acc-head');
          if (p) p.style.height = '0px';
          if (h) h.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          panel.style.height = panel.scrollHeight + 'px';
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
    window.addEventListener('resize', () => {
      items.forEach(i => {
        if (i.classList.contains('open')) {
          const p = i.querySelector('.acc-panel');
          if (p) p.style.height = p.scrollHeight + 'px';
        }
      });
    });
  });

  // ---------- Reveal on scroll ----------
  const toReveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && toReveal.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    toReveal.forEach(el => io.observe(el));
  } else {
    toReveal.forEach(el => el.classList.add('in'));
  }

  // ---------- KPI counters ----------
  const kpiWraps = document.querySelectorAll('[data-kpis]');
  if ('IntersectionObserver' in window && kpiWraps.length) {
    const kpiIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.num[data-count]').forEach(el => {
          const target = parseFloat(el.dataset.count) || 0;
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const dur = 1600;
          const t0 = performance.now();
          const tick = t => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = Math.round(target * eased);
            el.textContent = prefix + v + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = prefix + target + suffix;
          };
          requestAnimationFrame(tick);
        });
        kpiIO.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    kpiWraps.forEach(w => kpiIO.observe(w));
  }

  // ---------- Header shadow on scroll ----------
  const header = document.querySelector('header.site');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Footer year ----------
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---------- Scroll progress bar ----------
  const progressBar = document.querySelector('.scroll-progress span');
  if (progressBar) {
    let ticking = false;
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      const pct = Math.max(0, Math.min(100, (scrolled / max) * 100));
      progressBar.style.width = pct + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Hero curtain (homepage) ----------
  // Hero stays pinned while the page slides over it; the copy drifts up,
  // shrinks, blurs and darkens as the next section covers it.
  const heroParallax = document.querySelector('.hero-home .hero-parallax');
  const heroSec = document.querySelector('.hero-home');
  if (heroParallax && !reduceMotion) {
    let pTick = false;
    const updateHero = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const vh = window.innerHeight || 800;
      const p = Math.max(0, Math.min(1, y / (vh * 0.9)));
      heroParallax.style.setProperty('--py', `-${Math.round(y * 0.25)}px`);
      heroParallax.style.setProperty('--po', (1 - p * 0.9).toFixed(3));
      heroParallax.style.setProperty('--ps', (1 - p * 0.14).toFixed(3));
      heroParallax.style.setProperty('--pb', (p * 6).toFixed(2) + 'px');
      if (heroSec) heroSec.style.setProperty('--pd', (p * 0.6).toFixed(3));
      pTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!pTick) { requestAnimationFrame(updateHero); pTick = true; }
    }, { passive: true });
    updateHero();
  }

  // ---------- Scroll velocity (shared) ----------
  let lastY = window.scrollY, velocity = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    velocity = Math.max(-60, Math.min(60, y - lastY));
    lastY = y;
  }, { passive: true });

  // ---------- Client marquees ----------
  // Endless rows; scrolling the page speeds them up (and the direction follows).
  const marquees = Array.from(document.querySelectorAll('[data-marquee]'));
  if (marquees.length) {
    const rows = marquees.map(m => {
      const set = m.querySelector('.marquee-set');
      const inner = document.createElement('div');
      inner.className = 'marquee-inner';
      m.insertBefore(inner, set);
      inner.appendChild(set);
      const fill = () => {
        const w = set.getBoundingClientRect().width || 1;
        while (inner.children.length < 2 || inner.getBoundingClientRect().width < window.innerWidth + w) {
          const c = set.cloneNode(true); c.setAttribute('aria-hidden', 'true'); inner.appendChild(c);
          if (inner.children.length > 12) break;
        }
        return w;
      };
      return { m, inner, set, w: fill(), x: 0, speed: parseFloat(m.dataset.speed) || 40, fill };
    });
    const refill = () => rows.forEach(r => { r.w = r.fill(); });
    window.addEventListener('resize', refill);
    window.addEventListener('load', refill);
    if (!reduceMotion) {
      let visible = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); }).observe(marquees[0].closest('section') || marquees[0]);
      }
      let boost = 0, t0 = performance.now();
      const loop = t => {
        const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
        boost += (Math.abs(velocity) * 0.12 - boost) * 0.08;
        velocity *= 0.9;
        if (visible) rows.forEach(r => {
          r.x -= r.speed * (1 + boost) * dt;
          if (r.x <= -r.w) r.x += r.w;
          if (r.x > 0) r.x -= r.w;
          r.inner.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0)`;
        });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  // ---------- Talent showcase: pinned horizontal scroll (desktop) ----------
  const talent = document.querySelector('.talent');
  if (talent) {
    const pin = talent.querySelector('.talent-pin');
    const track = talent.querySelector('.talent-track');
    const ghost = talent.querySelector('.talent-ghost');
    const cards = Array.from(talent.querySelectorAll('.t-card'));
    const mq = window.matchMedia('(min-width: 900px) and (min-height: 560px)');
    let dist = 0, active = false, tTick = false;

    const cardFx = () => {
      const vw = window.innerWidth;
      cards.forEach(c => {
        const r = c.getBoundingClientRect();
        const off = Math.max(-1, Math.min(1, ((r.left + r.width / 2) - vw / 2) / (vw / 2)));
        c.style.setProperty('--ry', (off * -12).toFixed(2) + 'deg');
        c.style.setProperty('--sc', (1 - Math.abs(off) * 0.08).toFixed(3));
        c.style.setProperty('--ix', (off * -24).toFixed(1) + 'px');
      });
    };
    const update = () => {
      tTick = false;
      if (active) {
        const top = pin.getBoundingClientRect().top;
        const p = dist > 0 ? Math.max(0, Math.min(1, -top / dist)) : 0;
        track.style.setProperty('--tx', (-p * dist).toFixed(1) + 'px');
        if (ghost) ghost.style.setProperty('--gx', (-p * 600).toFixed(1) + 'px');
      }
      cardFx();
    };
    const setup = () => {
      active = mq.matches && !reduceMotion;
      talent.classList.toggle('is-pinned', active);
      if (active) {
        track.style.setProperty('--tx', '0px');
        dist = Math.max(0, track.scrollWidth - window.innerWidth);
        pin.style.height = (window.innerHeight + dist) + 'px';
      } else {
        pin.style.height = '';
        track.style.removeProperty('--tx');
      }
      update();
    };
    if (!reduceMotion) {
      window.addEventListener('scroll', () => { if (!tTick) { requestAnimationFrame(update); tTick = true; } }, { passive: true });
      track.addEventListener('scroll', () => { if (!tTick) { requestAnimationFrame(update); tTick = true; } }, { passive: true });
    }
    window.addEventListener('resize', setup);
    window.addEventListener('load', setup);
    setup();
  }

  // ---------- Partner tiles: cursor spotlight ----------
  document.querySelectorAll('.partner').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ---------- About-preview decoration parallax ----------
  const aboutSec = document.querySelector('.section.tight.about-preview');
  if (aboutSec && !reduceMotion) {
    let aTick = false;
    const updateAbout = () => {
      const rect = aboutSec.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const p = 1 - Math.max(0, Math.min(1, (rect.top + rect.height) / (vh + rect.height)));
      const ty = (p - 0.5) * 60;
      aboutSec.style.setProperty('--about-ty', ty.toFixed(1) + 'px');
      aTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!aTick) { requestAnimationFrame(updateAbout); aTick = true; }
    }, { passive: true });
    updateAbout();
  }
})();
