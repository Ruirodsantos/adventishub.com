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

  // ---------- Hero scroll parallax (Rockstar-style) ----------
  // Hero copy drifts up at ~35% of scroll speed and fades out gently,
  // creating a smooth reveal as the next section comes into view.
  const heroParallax = document.querySelector('.hero-home .hero-parallax');
  if (heroParallax && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let pTick = false;
    const updateHero = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const vh = window.innerHeight || 800;
      const p = Math.max(0, Math.min(1, y / (vh * 0.85)));
      const translate = Math.round(y * 0.35);
      const opacity = 1 - p;
      heroParallax.style.setProperty('--py', `-${translate}px`);
      heroParallax.style.setProperty('--po', opacity.toFixed(3));
      pTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!pTick) { requestAnimationFrame(updateHero); pTick = true; }
    }, { passive: true });
    updateHero();
  }
})();
