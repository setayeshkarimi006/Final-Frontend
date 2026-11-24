/* =====================================================
   SHOP PAGE — header behaviour + products + cart
   ===================================================== */
import { PRODUCTS } from './products.js';

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const round2 = (n) => Math.round(n * 100) / 100;
const unitPrice = (p) => round2(p.price * (1 - (p.discount || 0) / 100));
const byId = (id) => PRODUCTS.find((p) => p.id === id);

// If a product has no image of its own, show a photo of its category
const CATEGORY_IMG = {
  'Cleansers':    '/pic/Lavender Foam Cleanser Elegance.png',
  'Serums':       '/pic/Lavender Serum Dropper Glow.png',
  'Moisturizers': '/pic/Lavender Glow Cream Ritual.png',
  'Sun Care':     '/pic/Lavender Dew Cosmetic Tube.png',
  'Masks':        '/pic/Lavender Glow Spa Skincare Portrait.png',
  'Makeup':       '/pic/Lavender Frost Luxury Cosmetic Bottle.png'
};
const imgSrc = (p) => {
  const src = p.image || CATEGORY_IMG[p.category] || '';
  return src ? encodeURI(src) : '';
};

// A broken image never leaves an empty box: show the placeholder instead
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement)) return;
  const box = img.closest('.shp-img-wrap, .crt-thumb');
  if (!box) return;
  console.warn('Image not found:', img.src);
  box.classList.add('no-img');
  img.remove();
}, true);

/* =====================================================
   HEADER
   ===================================================== */
(() => {
  const header = $('site-header');
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
  const menuBtn = $('hdr-menu-btn');
  const menuPanel = $('hdr-mobile-panel');
  menuBtn.addEventListener('click', () => {
    const open = menuPanel.classList.toggle('hdr-panel-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      menuPanel.classList.remove('hdr-panel-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* =====================================================
   CART STATE (saved in localStorage)
   ===================================================== */
const CART_KEY = 'valensa-cart';
const FREE_SHIPPING = 60;
const MAX_QTY = 99;

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    .filter((i) => byId(i.id) && i.qty > 0);
} catch (e) { cart = []; }

const saveCart = () => {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
};
const qtyOf = (id) => cart.find((i) => i.id === id)?.qty || 0;
const totalQty = () => cart.reduce((s, i) => s + i.qty, 0);

const setQty = (id, qty) => {
  qty = Math.max(0, Math.min(MAX_QTY, qty));
  const item = cart.find((i) => i.id === id);
  if (!qty) cart = cart.filter((i) => i.id !== id);
  else if (item) item.qty = qty;
  else cart.push({ id, qty });
  onCartChange(id);
};

const onCartChange = (id) => {
  saveCart();
  renderCart();
  updateBadge(true);
  if (id === undefined) updateAllCards();
  else updateCard(id);
};

/* =====================================================
   PRODUCT GRID
   ===================================================== */
const grid = $('shp-grid');
const countEl = $('shp-count');
const emptyEl = $('shp-empty');
const searchInput = $('shp-search');
const clearBtn = $('shp-clear');
const chipsEl = $('shp-chips');
let activeCat = 'All';

const actionHTML = (p) => {
  const n = qtyOf(p.id);
  const name = esc(p.name);
  if (!n) {
    return `
      <button type="button" class="shp-add" data-act="add" data-id="${p.id}" aria-label="Add ${name} to bag">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add to bag
      </button>`;
  }
  return `
    <div class="qty qty-block" role="group" aria-label="Quantity of ${name}">
      <button type="button" data-act="dec" data-id="${p.id}" aria-label="Remove one ${name}">−</button>
      <span data-count aria-live="polite">${n} in bag</span>
      <button type="button" data-act="inc" data-id="${p.id}" aria-label="Add one more ${name}">+</button>
    </div>`;
};

const cardHTML = (p) => {
  const src = imgSrc(p);
  return `
    <article class="shp-card">
      <div class="shp-img-wrap${src ? '' : ' no-img'}">
        ${src ? `<img class="shp-img" src="${esc(src)}" alt="${esc(p.name)}" loading="lazy" decoding="async" />` : ''}
        ${p.discount ? `<span class="shp-badge">-${p.discount}%</span>` : ''}
      </div>
      <div class="shp-body">
        <p class="text-[10px] uppercase tracking-[0.22em] text-lilac-500">${esc(p.category)}</p>
        <h3 class="mt-1 truncate font-display text-lg text-lilac-900 sm:text-xl" title="${esc(p.name)}">${esc(p.name)}</h3>
        <p class="mt-1 line-clamp-2 min-h-[2.6em] text-[13px] font-light leading-snug text-lilac-800/75">${esc(p.description)}</p>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-lg font-medium text-lilac-800">${money.format(unitPrice(p))}</span>
          ${p.discount ? `<span class="text-[13px] text-lilac-800/45 line-through">${money.format(p.price)}</span>` : ''}
        </div>
        <div class="shp-actions" data-actions="${p.id}">${actionHTML(p)}</div>
      </div>
    </article>`;
};

const renderGrid = () => {
  const q = searchInput.value.trim().toLowerCase();
  const list = PRODUCTS.filter((p) =>
    (activeCat === 'All' || p.category === activeCat) &&
    `${p.name} ${p.category}`.toLowerCase().includes(q));

  grid.innerHTML = list.map(cardHTML).join('');
  emptyEl.hidden = list.length > 0;
  clearBtn.hidden = !searchInput.value;
  countEl.textContent = list.length ? `Showing ${list.length} of ${PRODUCTS.length} products` : '';
};

// Only the button area of a card is updated (no full re-render, focus is kept)
const updateCard = (id) => {
  const box = grid.querySelector(`[data-actions="${id}"]`);
  if (!box) return; // card is filtered out
  const n = qtyOf(id);
  const counter = box.querySelector('[data-count]');
  if (n > 0 && counter) { counter.textContent = `${n} in bag`; return; }
  const hadFocus = box.contains(document.activeElement);
  box.innerHTML = actionHTML(byId(id));
  if (hadFocus) box.querySelector('button')?.focus({ preventScroll: true });
};
const updateAllCards = () =>
  grid.querySelectorAll('[data-actions]').forEach((b) => updateCard(Number(b.dataset.actions)));

// Category chips
const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];
chipsEl.innerHTML = categories.map((c) =>
  `<button type="button" class="shp-chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

const setActiveChip = (cat) => {
  activeCat = cat;
  chipsEl.querySelectorAll('.shp-chip').forEach((c) => {
    const on = c.dataset.cat === cat;
    c.classList.toggle('shp-chip-on', on);
    c.setAttribute('aria-pressed', String(on));
  });
};

chipsEl.addEventListener('click', (e) => {
  const chip = e.target.closest('.shp-chip');
  if (!chip) return;
  setActiveChip(chip.dataset.cat);
  renderGrid();
});

// Live search (small delay so typing stays smooth)
let searchTimer;
searchInput.addEventListener('input', () => {
  clearBtn.hidden = !searchInput.value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderGrid, 120);
});
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  renderGrid();
  searchInput.focus();
});
$('shp-reset').addEventListener('click', () => {
  searchInput.value = '';
  setActiveChip('All');
  renderGrid();
});

// Card buttons: add / + / −
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const act = btn.dataset.act;
  if (act === 'add') { setQty(id, qtyOf(id) + 1); openCart(); }
  if (act === 'inc') setQty(id, qtyOf(id) + 1);
  if (act === 'dec') setQty(id, qtyOf(id) - 1);
});

/* =====================================================
   CART DROPDOWN (opens under the header icon)
   ===================================================== */
const cartBtn = $('hdr-cart-btn');
const badge = $('hdr-cart-count');
const panel = $('crt-panel');
const overlay = $('crt-overlay');
const listEl = $('crt-list');
const emptyCart = $('crt-empty');
const footerEl = $('crt-footer');
const shipEl = $('crt-ship');
let lastFocus = null;

const updateBadge = (bump = false) => {
  badge.textContent = String(totalQty());
  if (!bump) return;
  badge.classList.remove('hdr-badge-bump');
  void badge.offsetWidth; // restart the animation
  badge.classList.add('hdr-badge-bump');
};

const itemHTML = ({ id, qty }) => {
  const p = byId(id);
  const price = unitPrice(p);
  const src = imgSrc(p);
  const name = esc(p.name);
  return `
    <li class="crt-item" data-id="${p.id}">
      <div class="crt-thumb${src ? '' : ' no-img'}">
        ${src ? `<img src="${esc(src)}" alt="" class="h-full w-full object-cover" />` : ''}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="truncate font-display text-lg leading-tight text-lilac-900">${name}</h3>
            <p class="text-[12px] text-lilac-800/60">${esc(p.category)} · ${money.format(price)}</p>
          </div>
          <button type="button" class="crt-remove" data-act="del" aria-label="Remove ${name}">
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/></svg>
          </button>
        </div>
        <div class="mt-2.5 flex items-center justify-between">
          <div class="qty" role="group" aria-label="Quantity of ${name}">
            <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
            <span aria-live="polite">${qty}</span>
            <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
          </div>
          <span class="font-medium text-lilac-800">${money.format(round2(price * qty))}</span>
        </div>
      </div>
    </li>`;
};

const renderCart = () => {
  const subtotal = round2(cart.reduce((s, i) => s + unitPrice(byId(i.id)) * i.qty, 0));
  const savings = round2(cart.reduce((s, i) => {
    const p = byId(i.id);
    return s + (p.price - unitPrice(p)) * i.qty;
  }, 0));
  const isEmpty = cart.length === 0;

  $('crt-count').textContent = `(${totalQty()})`;
  $('crt-subtotal').textContent = money.format(subtotal);

  const savingsEl = $('crt-savings');
  savingsEl.textContent = `You save ${money.format(savings)}`;
  savingsEl.hidden = savings <= 0;

  listEl.innerHTML = cart.map(itemHTML).join('');
  listEl.hidden = isEmpty;
  footerEl.hidden = isEmpty;
  shipEl.hidden = isEmpty;
  emptyCart.hidden = !isEmpty;

  const left = round2(FREE_SHIPPING - subtotal);
  $('crt-ship-text').textContent = left > 0
    ? `You're ${money.format(left)} away from free shipping`
    : 'You\u2019ve unlocked free shipping';
  $('crt-ship-bar').style.width = `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%`;
};

const isOpen = () => document.body.classList.contains('crt-is-open');

function openCart() {
  lastFocus = document.activeElement;
  document.body.classList.add('crt-is-open');
  cartBtn.setAttribute('aria-expanded', 'true');
  panel.focus({ preventScroll: true });
}
function closeCart() {
  document.body.classList.remove('crt-is-open');
  cartBtn.setAttribute('aria-expanded', 'false');
  if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
}

cartBtn.addEventListener('click', () => (isOpen() ? closeCart() : openCart()));
overlay.addEventListener('click', closeCart);
$('crt-close').addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen()) closeCart();
});

// Quantity controls inside the bag
listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = Number(btn.closest('.crt-item').dataset.id);
  const act = btn.dataset.act;
  if (act === 'inc') setQty(id, qtyOf(id) + 1);
  if (act === 'dec') setQty(id, qtyOf(id) - 1);
  if (act === 'del') setQty(id, 0);
  // keep keyboard focus on the same control after the list re-renders
  const again = listEl.querySelector(`.crt-item[data-id="${id}"] [data-act="${act}"]`);
  (again || panel).focus({ preventScroll: true });
});

$('crt-clear').addEventListener('click', () => { cart = []; onCartChange(); });
// $('crt-checkout') → connect to your checkout page later

/* =====================================================
   INIT
   ===================================================== */
setActiveChip('All');
renderGrid();
renderCart();
updateBadge();