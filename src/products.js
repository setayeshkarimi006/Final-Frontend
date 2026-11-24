const RAW_PRODUCTS  = [
  // Cleansers
  { id: 1,  name: 'Velvet Cloud Cleanser',      category: 'Cleansers',    description: 'Creamy low-foam cleanser that lifts impurities gently.', price: 34, discount: 20, image: '' },
  { id: 2,  name: 'Pearl Milk Cleansing Balm',  category: 'Cleansers',    description: 'Melts makeup and sunscreen into a silky milk.',          price: 38, discount: 0,  image: '' },
  { id: 3,  name: 'Calm Botanical Face Wash',   category: 'Cleansers',    description: 'Soothing daily wash with chamomile and oat.',            price: 26, discount: 10, image: '' },
  { id: 4,  name: 'Micellar Petal Water',       category: 'Cleansers',    description: 'No-rinse cleansing water that leaves skin fresh.',       price: 24, discount: 0,  image: '' },
  { id: 5,  name: 'Gentle Enzyme Polish',       category: 'Cleansers',    description: 'Fine powder exfoliant for a smooth, bright finish.',     price: 36, discount: 15, image: '' },
  // Serums
  { id: 6,  name: 'Lilac Glow Serum',           category: 'Serums',       description: 'Vitamin C and niacinamide for even-toned radiance.',     price: 62, discount: 25, image: '' },
  { id: 7,  name: 'Dew Drop Hyaluronic Mist',   category: 'Serums',       description: 'Fine mist that replenishes skin over makeup or bare.',   price: 27, discount: 22, image: '' },
  { id: 8,  name: 'Peptide Lift Concentrate',   category: 'Serums',       description: 'Firming peptides for visibly smoother contours.',        price: 74, discount: 0,  image: '' },
  { id: 9,  name: 'Bright Ritual Vitamin C',    category: 'Serums',       description: 'Stable 15% vitamin C for a luminous complexion.',        price: 58, discount: 12, image: '' },
  { id: 10, name: 'Barrier Repair Ampoule',     category: 'Serums',       description: 'Concentrated ceramides to calm and restore.',            price: 52, discount: 0,  image: '' },
  // Moisturizers
  { id: 11, name: 'Silk Barrier Cream',         category: 'Moisturizers', description: 'Rich ceramide cream that locks in hydration for 48 hours.', price: 48, discount: 15, image: '' },
  { id: 12, name: 'Cloud Gel Hydrator',         category: 'Moisturizers', description: 'Weightless water-gel for oily and combination skin.',    price: 39, discount: 0,  image: '' },
  { id: 13, name: 'Night Veil Emulsion',        category: 'Moisturizers', description: 'Overnight comfort that wakes up soft and rested.',       price: 56, discount: 18, image: '' },
  { id: 14, name: 'Ceramide Comfort Balm',      category: 'Moisturizers', description: 'Cushiony balm for dry, tight or sensitive skin.',        price: 45, discount: 0,  image: '' },
  { id: 15, name: 'Daily Bloom Lotion',         category: 'Moisturizers', description: 'Light everyday lotion with a fresh floral note.',        price: 32, discount: 8,  image: '' },
  // Sun Care
  { id: 16, name: 'Daylight Veil SPF 50',       category: 'Sun Care',     description: 'Invisible sunscreen with a soft-focus finish.',          price: 29, discount: 30, image: '' },
  { id: 17, name: 'Sheer Mineral Shield SPF 40',category: 'Sun Care',     description: 'Mineral protection with zero white cast.',               price: 33, discount: 0,  image: '' },
  { id: 18, name: 'Glow Drops SPF 30',          category: 'Sun Care',     description: 'Illuminating drops to wear alone or under makeup.',      price: 31, discount: 10, image: '' },
  { id: 19, name: 'Soft Focus Sun Fluid',       category: 'Sun Care',     description: 'Ultra-light fluid that melts in instantly.',             price: 35, discount: 0,  image: '' },
  { id: 20, name: 'After-Sun Cooling Gel',      category: 'Sun Care',     description: 'Aloe-rich gel that calms sun-kissed skin.',              price: 21, discount: 20, image: '' },
  // Masks
  { id: 21, name: 'Midnight Renewal Mask',      category: 'Masks',        description: 'Sleeping mask that wakes your skin up plump.',           price: 44, discount: 18, image: '' },
  { id: 22, name: 'Clay Clarity Mask',          category: 'Masks',        description: 'Purifying clay that refines pores without drying.',      price: 37, discount: 0,  image: '' },
  { id: 23, name: 'Hydra Jelly Mask',           category: 'Masks',        description: 'Cooling jelly texture for an instant moisture boost.',   price: 35, discount: 12, image: '' },
  { id: 24, name: 'Rose Radiance Sheet Mask',   category: 'Masks',        description: 'Single-use sheet mask infused with rose extract.',       price: 9,  discount: 0,  image: '' },
  { id: 25, name: 'Pore Refine Peel Mask',      category: 'Masks',        description: 'Gentle peel for a smooth, polished surface.',            price: 41, discount: 15, image: '' },
  // Makeup
  { id: 26, name: 'Petal Tint Lip Oil',         category: 'Makeup',       description: 'Glossy, nourishing colour with a rose-lilac sheer.',     price: 22, discount: 10, image: '' },
  { id: 27, name: 'Cashmere Skin Tint',         category: 'Makeup',       description: 'Breathable coverage with a natural luminous finish.',    price: 38, discount: 12, image: '' },
  { id: 28, name: 'Velvet Blur Powder',         category: 'Makeup',       description: 'Weightless setting powder with a soft-matte veil.',      price: 30, discount: 0,  image: '' },
  { id: 29, name: 'Lilac Haze Blush',           category: 'Makeup',       description: 'Buildable cream blush with a dewy lilac flush.',         price: 25, discount: 0,  image: '' },
  { id: 30, name: 'Silk Lash Mascara',          category: 'Makeup',       description: 'Lengthening, lifting formula that never clumps.',        price: 27, discount: 20, image: '' }
];
// عکس هر محصول: /pro/<id>.png  (مثلاً محصول ۷ ← /pro/7.png)
export const PRODUCTS = RAW_PRODUCTS.map((p) => ({
  ...p,
  image: p.image || `/pro/${p.id}.png`
}));