/* ================= HEADER ================= */
import { PRODUCTS } from './products.js';

/* ---------- Shared cart (same storage as shop.js) ---------- */
const CART_KEY = 'valensa-cart';
const readCart = () => {
  try {
    const c = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(c) ? c.filter((i) => i && i.qty > 0) : [];
  } catch (e) { return []; }
};
const writeCart = (c) => {
  try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) { /* ignore */ }
};
const syncBadge = () => {
  const b = document.getElementById('hdr-cart-count');
  if (b) b.textContent = String(readCart().reduce((s, i) => s + i.qty, 0));
};
syncBadge();                                  // عدد درست موقع باز شدن صفحه
window.addEventListener('storage', syncBadge); // اگه سبد توی تب دیگه عوض شد
(() => {
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('hdr-is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Announcement ticker
  const msgs = document.querySelectorAll('#hdr-ticker .hdr-msg');
  let msgIndex = 0;
  if (msgs.length > 1) {
    setInterval(() => {
      msgs[msgIndex].classList.remove('hdr-msg-active');
      msgIndex = (msgIndex + 1) % msgs.length;
      msgs[msgIndex].classList.add('hdr-msg-active');
    }, 3800);
  }

  // Mobile menu
  const menuBtn = document.getElementById('hdr-menu-btn');
  const panel = document.getElementById('hdr-mobile-panel');
  menuBtn.addEventListener('click', () => {
    const open = panel.classList.toggle('hdr-panel-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      panel.classList.remove('hdr-panel-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ================= HERO 3D ================= */
(() => {
  const section = document.getElementById('hero-section');
  const stage = document.getElementById('hero-stage');
  const tilt = document.getElementById('hero-tilt');
  const mainImg = document.getElementById('hero-img');
  const sheen = document.getElementById('hero-img-sheen');
  const sparksBack = document.getElementById('hero-sparks-back');
  const sparksFront = document.getElementById('hero-sparks-front');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Sparkles: x/y in % of the stage, s = size px, d = parallax depth, k = color, t = delay, dur = twinkle duration
  const starSVG = '<svg viewBox="0 0 24 24" class="hero-spark-star" aria-hidden="true"><path fill="currentColor" d="M12 0c.8 7.5 4.5 11.2 12 12-7.5.8-11.2 4.5-12 12-.8-7.5-4.5-11.2-12-12C7.5 11.2 11.2 7.5 12 0Z"/></svg>';
  const sparks = [
    { x: 6,  y: 14, s: 26, d: 1.1, k: 'gold',  t: 0.0, dur: 3.4 },
    { x: 86, y: 10, s: 18, d: 0.8, k: 'lilac', t: 0.8, dur: 3.0 },
    { x: 93, y: 38, s: 30, d: 1.3, k: 'gold',  t: 1.4, dur: 3.8 },
    { x: 3,  y: 46, s: 16, d: 0.6, k: 'lilac', t: 0.4, dur: 2.8 },
    { x: 11, y: 72, s: 22, d: 1.2, k: 'gold',  t: 1.9, dur: 3.5 },
    { x: 90, y: 72, s: 20, d: 0.7, k: 'cream', t: 0.6, dur: 3.1 },
    { x: 22, y: 5,  s: 12, d: 0.5, k: 'cream', t: 2.2, dur: 2.9 },
    { x: 74, y: 88, s: 14, d: 0.9, k: 'lilac', t: 1.1, dur: 3.3 },
    { x: 50, y: 1,  s: 16, d: 0.4, k: 'gold',  t: 0.3, dur: 3.6 },
    { x: 30, y: 92, s: 12, d: 0.5, k: 'gold',  t: 1.7, dur: 3.0 },
    { x: 78, y: 22, s: 6,  d: 0.3, k: 'gold',  t: 0.9, dur: 2.6, dot: true },
    { x: 14, y: 32, s: 5,  d: 0.4, k: 'lilac', t: 1.3, dur: 2.7, dot: true },
    { x: 84, y: 54, s: 6,  d: 1.0, k: 'gold',  t: 2.0, dur: 3.2, dot: true },
    { x: 20, y: 84, s: 5,  d: 0.8, k: 'lilac', t: 0.2, dur: 2.9, dot: true }
  ];

  sparks.forEach((p) => {
    const wrap = document.createElement('span');
    wrap.className = 'hero-spark-wrap';
    wrap.dataset.depth = p.d;
    wrap.style.cssText = `left:${p.x}%;top:${p.y}%;width:${p.s}px;height:${p.s}px;`;

    const inner = document.createElement('span');
    inner.className = `hero-spark hero-spark-${p.k}` + (p.dot ? ' hero-spark-dot' : '');
    inner.style.animationDelay = `${p.t}s`;
    inner.style.animationDuration = `${p.dur}s`;
    if (!p.dot) inner.innerHTML = starSVG;

    wrap.appendChild(inner);
    (p.d >= 1 ? sparksFront : sparksBack).appendChild(wrap);
  });

  // --- Parallax layers (everything with data-depth inside the stage)
  const layers = [...stage.querySelectorAll('[data-depth]')].map((el) => ({
    el, depth: parseFloat(el.dataset.depth)
  }));

  // --- Pointer tracking (whole hero section reacts, not only the image)
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let pointerActive = false, rafId = null;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  section.addEventListener('pointermove', (e) => {
    const r = section.getBoundingClientRect();
    targetX = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    targetY = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    pointerActive = true;
  });
  ['pointerleave', 'pointercancel', 'pointerup'].forEach((evt) =>
    section.addEventListener(evt, () => { pointerActive = false; })
  );

  const frame = (time) => {
    // When the pointer is away, the figure drifts gently on its own
    const goalX = pointerActive ? targetX : Math.sin(time * 0.0007) * 0.35;
    const goalY = pointerActive ? targetY : Math.cos(time * 0.0006) * 0.22;

    currentX += (goalX - currentX) * 0.07;
    currentY += (goalY - currentY) * 0.07;

    tilt.style.transform = `rotateY(${currentX * 16}deg) rotateX(${-currentY * 11}deg)`;

    layers.forEach(({ el, depth }) => {
      el.style.transform = `translate3d(${currentX * depth * 30}px, ${currentY * depth * 20}px, 0)`;
    });

    mainImg.style.filter =
      `drop-shadow(${-currentX * 16}px ${22 - currentY * 8}px 28px rgba(79,47,115,.28))`;

    const maskPos = `${50 - currentX * 45}% 0`;
    sheen.style.webkitMaskPosition = maskPos;
    sheen.style.maskPosition = maskPos;

    rafId = requestAnimationFrame(frame);
  };

  // Run only while the hero is on screen
  if (!reduceMotion) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !rafId) rafId = requestAnimationFrame(frame);
      if (!entry.isIntersecting && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }, { threshold: 0.05 }).observe(section);
  }
})();





///under hero
/* ================= DEALS ================= */
(() => {
  const API_URL = 'http://localhost:3000/products';
  const wrapper = document.getElementById('deal-wrapper');
  const stateEl = document.getElementById('deal-state');
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  let swiper = null;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // اگه توی db.json عکس خالی بود، از عکس هم‌دسته استفاده می‌شه
  const FALLBACK_IMG = {
    'Cleansers':    '/pic/Lavender Foam Cleanser Elegance.png',
    'Serums':       '/pic/Lavender Serum Dropper Glow.png',
    'Moisturizers': '/pic/Lavender Glow Cream Ritual.png',
    'Sun Care':     '/pic/Lavender Dew Cosmetic Tube.png',
    'Masks':        '/pic/Lavender Glow Spa Skincare Portrait.png',
    'Makeup':       '/pic/Lavender Frost Luxury Cosmetic Bottle.png'
  };
  // encodeURI برای اسم فایل‌هایی که فاصله دارن
  const imgSrc = (p) => encodeURI(p.image || FALLBACK_IMG[p.category] || '');

  const initSwiper = () => {
    if (swiper) swiper.destroy(true, true);
    swiper = new Swiper('#deal-swiper', {
      slidesPerView: 1.25,
      slidesPerGroup: 1,
      spaceBetween: 14,
      speed: 600,
      grabCursor: true,
      observer: true,
      observeParents: true,
      breakpoints: {
        480:  { slidesPerView: 1.7, spaceBetween: 16 },
        640:  { slidesPerView: 2,   slidesPerGroup: 2, spaceBetween: 18 },
        1024: { slidesPerView: 3,   slidesPerGroup: 3, spaceBetween: 20 }  // دقیقاً ۳ کارت
      }
    });
  };

  const showSkeleton = () => {
    stateEl.classList.add('hidden');
    wrapper.innerHTML = Array.from({ length: 4 }, () =>
      '<div class="swiper-slide"><div class="deal-skel"></div></div>').join('');
    initSwiper();
  };

  const cardHTML = (p) => {
    const price = Number(p.price) || 0;
    const off = Number(p.discount) || 0;
    const finalPrice = price * (1 - off / 100);
    const src = imgSrc(p);
    return `
      <div class="swiper-slide">
        <article class="deal-card">
          <div class="deal-img-wrap ${src ? '' : 'no-img'}">
            ${src ? `<img class="deal-img" src="${esc(src)}" alt="${esc(p.name)}" draggable="false" />` : ''}
            ${off ? `<span class="deal-badge">-${off}%</span>` : ''}
          </div>
          <div class="deal-body">
            <p class="text-[10px] uppercase tracking-[0.22em] text-lilac-500">${esc(p.category)}</p>
            <h3 class="mt-1 truncate font-display text-xl text-lilac-900">${esc(p.name)}</h3>
            <p class="mt-1 line-clamp-2 text-[13px] font-light leading-snug text-lilac-800/75">${esc(p.description)}</p>
            <div class="mt-3 flex items-center justify-between gap-3">
              <div class="flex items-baseline gap-2">
                <span class="text-lg font-medium text-lilac-800">${money.format(finalPrice)}</span>
                ${off ? `<span class="text-[13px] text-lilac-800/45 line-through">${money.format(price)}</span>` : ''}
              </div>
<button class="deal-add" type="button" data-name="${esc(p.name)}" aria-label="Add ${esc(p.name)} to cart">+</button>       
     </div>
          </div>
        </article>
      </div>`;
  };

  const showError = () => {
    if (swiper) { swiper.destroy(true, true); swiper = null; }
    wrapper.innerHTML = '';
    stateEl.classList.remove('hidden');
    stateEl.innerHTML = `
      <p>We couldn't load today's deals.</p>
      <button id="deal-retry" class="deal-retry" type="button">Try again</button>`;
  };

  const loadDeals = async () => {
    showSkeleton();
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(res.status);
      const items = (await res.json()).filter((p) => Number(p.discount) > 0);
      if (!items.length) throw new Error('empty');
      wrapper.innerHTML = items.map(cardHTML).join('');
      initSwiper();
    } catch (err) {
      console.error('Deals failed:', err);
      showError();
    }
  };

  // اگه عکسی لود نشد: placeholder نشون بده و آدرسش رو توی کنسول بنویس
  wrapper.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
      console.warn('Image not found:', e.target.src);
      e.target.closest('.deal-img-wrap')?.classList.add('no-img');
      e.target.remove();
    }
  }, true);

   // Retry + add-to-cart
  document.getElementById('deal-box').addEventListener('click', (e) => {
    if (e.target.closest('#deal-retry')) { loadDeals(); return; }

    const btn = e.target.closest('.deal-add');
    if (!btn) return;

    const product = PRODUCTS.find((p) => p.name === btn.dataset.name);
    if (!product) return;

    const cart = readCart();
    const item = cart.find((i) => i.id === product.id);
    if (item) item.qty = Math.min(item.qty + 1, 99);
    else cart.push({ id: product.id, qty: 1 });
    writeCart(cart);
    syncBadge();
  });
  // Countdown to local midnight
  const tH = document.getElementById('deal-timer-h');
  const tM = document.getElementById('deal-timer-m');
  const tS = document.getElementById('deal-timer-s');
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const now = new Date();
    const end = new Date(now); end.setHours(24, 0, 0, 0);
    const left = Math.max(0, Math.floor((end - now) / 1000));
    tH.textContent = pad(Math.floor(left / 3600));
    tM.textContent = pad(Math.floor((left % 3600) / 60));
    tS.textContent = pad(left % 60);
  };
  tick();
  setInterval(tick, 1000);

  loadDeals();
})();
///conclu
/* ================= WHY VALENSA + FOOTER ================= */
(() => {
  // Scroll reveal
  const revealEls = document.querySelectorAll('.why-reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('why-in');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => revealObs.observe(el));

  // Count-up numbers
  const counters = document.querySelectorAll('[data-why-count]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const runCount = (el) => {
    const target = Number(el.dataset.whyCount);
    if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { runCount(entry.target); countObs.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => countObs.observe(el));

  // Newsletter form (front-end validation only)
  const form = document.getElementById('ftr-form');
  const emailInput = document.getElementById('ftr-email');
  const msg = document.getElementById('ftr-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    msg.textContent = ok ? 'Thank you! Welcome to the Valensa circle.' : 'Please enter a valid email address.';
    if (ok) form.reset();
  });

  // Current year
  document.getElementById('ftr-year').textContent = new Date().getFullYear();
})();
