# Valensa — Beauty & Skincare Storefront

A responsive front-end for **Valensa**, a fictional beauty and skincare brand. It has a home page with an animated hero, a live "Today's Radiance Deals" slider powered by a mock API, and a full shop page with search, category filters and a persistent shopping bag.

Built with vanilla JavaScript, Tailwind CSS v4 and Vite. No framework required.

---

## Features

**Home page (`index.html`)**
- Sticky header with a rotating announcement bar and a mobile menu
- Interactive 3D hero with mouse-driven tilt, parallax layers and sparkles
- "Shop by category" grid
- **Today's Radiance Deals**: products loaded from a mock REST API, shown as a draggable slider (3 cards per view on desktop) with a countdown timer to midnight
- "Why Valensa" section with scroll-reveal animations and animated counters
- Footer with newsletter form validation

**Shop page (`shop.html`)**
- 30 products in a responsive grid (2 / 3 / 4 / 5 columns depending on screen width)
- Live search by name or category, plus category filter chips
- Add to bag, with `+` / `−` quantity controls directly on each card
- Dropdown shopping bag under the header icon: page dims, the cart icon glows, and the panel opens with item list, quantity controls, savings, subtotal and a free-shipping progress bar
- **Cart is saved in `localStorage`**, so it survives page refreshes and is shared between the home page and the shop page

**General**
- Fully responsive, mobile first
- Accessible details: ARIA labels, keyboard support (`Esc` closes the bag), focus management, reduced-motion support
- Consistent palette: ivory/cream, lilac/purple and gold accents

---

## Tech Stack

| Tool | Purpose |
| --- | --- |
| [Vite](https://vite.dev/) | Dev server and build tool |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility styling (via `@tailwindcss/vite`) |
| [Swiper](https://swiperjs.com/) | Deals slider (loaded from CDN) |
| [json-server](https://github.com/typicode/json-server) | Mock REST API for the deals section |
| Vanilla JS (ES modules) | All interactivity |

Fonts: **Cormorant Garamond** (headings) and **Jost** (body) from Google Fonts.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer
- npm

### Installation

```bash
git clone <your-repository-url>
cd finall-frontend
npm install
```

### Run the project

The deals section reads from a mock API, so you need **two terminals**:

```bash
# Terminal 1: mock API on http://localhost:3000
npm run server

# Terminal 2: dev server on http://localhost:5173
npm run dev
```

Then open:
- Home page: <http://localhost:5173/index.html>
- Shop page: <http://localhost:5173/shop.html>

> If the API is not running, the deals section shows a friendly error message with a **Try again** button. The shop page works without the API.

### Other scripts

```bash
npm run build     # production build
npm run preview   # preview the production build
```

---

## Project Structure

```
finall-frontend/
├── index.html          # Home page
├── shop.html           # Shop page (products + cart)
├── db.json             # Mock API data (deals products)
├── package.json
├── vite.config.js
├── public/
│   ├── pic/            # Site images (logo, hero, categories)
│   └── pro/            # Product images: 1.png ... 30.png
└── src/
    ├── style.css       # Tailwind import, theme colors and component styles
    ├── main.js         # Home page: header, hero, deals, footer
    ├── shop.js         # Shop page: header, products, search, cart
    └── products.js     # The 30 shop products
```

---

## How It Works

### Mock API (deals)
`json-server` serves `db.json` at `http://localhost:3000/products`. Only products with a `discount` greater than `0` appear in the deals slider.

```json
{
  "id": 1,
  "name": "Velvet Cloud Cleanser",
  "category": "Cleansers",
  "description": "A creamy, low-foam cleanser that lifts impurities without stripping the skin.",
  "price": 34,
  "discount": 20,
  "image": "/pro/1.png"
}
```

### Product images
Images live in `public/pro/`. In `src/products.js`, each product automatically uses `/pro/<id>.png` unless it has its own `image` value. If an image fails to load, a placeholder is shown instead of an empty box.

### Shopping bag
The cart is stored in `localStorage` under the key `valensa-cart` as a list of `{ id, qty }` items. Both pages read from and write to the same key, and the header badge is synced on load.

---

## Customization

- **Colors:** edit the `@theme` block at the top of `src/style.css` (`lilac-*`, `gold-400`, `cream-100`).
- **Products:** add or edit entries in `src/products.js` and drop a matching image into `public/pro/`.
- **Free-shipping threshold:** change `FREE_SHIPPING` in `src/shop.js`.
- **Deals timer:** the countdown targets local midnight and resets daily (see the countdown section of `src/main.js`).

---

## Roadmap

- [ ] Checkout page
- [ ] Product detail pages
- [ ] Footer on the shop page
- [ ] Wishlist and account pages
- [ ] Real backend and user accounts for the cart

---

## Notes

This is a front-end practice project. Brand, products and prices are fictional, and the checkout is not connected to any payment service.
