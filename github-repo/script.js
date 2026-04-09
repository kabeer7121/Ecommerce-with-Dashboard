// ============================================================
// ShopEase - Main JavaScript File
// University Project - Pakistani Clothing E-Commerce
// ============================================================

// ============================================================
// PRODUCTS DATA
// All clothing products with Pakistani Rupee prices
// Images are taken from public clothing product URLs
// ============================================================
const defaultProducts = [
  {
    id: 1,
    name: "Men's Classic Kameez Shalwar",
    category: "mens",
    price: 2799,
    originalPrice: 3499,
    rating: 4.7,
    reviews: 164,
    badge: "sale",
    image: "https://www.shopmanto.com/cdn/shop/files/91_b9b7b7b6-8681-4320-96cc-340905f9b293.jpg?w=400&h=500&fit==crop",
    description: "Premium cotton kameez shalwar with clean tailoring for daily and Friday wear. Soft, breathable, and easy to maintain."
  },
  {
    id: 2,
    name: "Men's Waistcoat",
    category: "mens",
    price: 2399,
    originalPrice: 2999,
    rating: 4.6,
    reviews: 119,
    badge: "new",
    image: "https://www.carriercompany.co.uk/cdn/shop/products/men_swoolwaistcoat-ginger-fullfront_814a0328-f771-44b6-b418-383db5847e14.jpg?w=400&h=500&fit=crop",
    description: "Traditional textured sadri designed to pair with kameez shalwar for weddings, dawats, and formal evenings."
  },
  {
    id: 3,
    name: "Women's Embroidered Kurta",
    category: "womens",
    price: 3399,
    originalPrice: 4299,
    rating: 4.8,
    reviews: 236,
    badge: "sale",
    image: "https://thesverve.com/cdn/shop/files/Chandrima608WITHOUTFACE.png?w=400&h=500&fit=crop",
    description: "Elegant embroidered kurta with refined neckline work, made for festive gatherings and semi-formal events."
  },
  {
    id: 4,
    name: "Women's Lawn Suit (3 Piece)",
    category: "womens",
    price: 4899,
    originalPrice: 6199,
    rating: 4.7,
    reviews: 281,
    badge: "sale",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXaSo-TOL3lGPHFyWNO12Rp33RhSVwH7fuHA&s?w=400&h=500&fit=crop",
    description: "Lightweight 3-piece lawn suit with printed dupatta and matching trouser, ideal for summer comfort."
  },
  {
    id: 5,
    name: "Baby Boy Shirt",
    category: "kids",
    price: 1899,
    originalPrice: 2399,
    rating: 4.5,
    reviews: 92,
    badge: "new",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop",
    description: "Baby Boy Shirt with neat stitching and comfortable fabric for everyday use."
  },
  {
    id: 6,
    name: "Girls Frilly Frock",
    category: "kids",
    price: 1499,
    originalPrice: 1999,
    rating: 4.6,
    reviews: 108,
    badge: "new",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop",
    description: "Soft and airy frock with frill detailing, designed for birthdays, family events, and comfortable day wear."
  },
  {
    id: 7,
    name: "Winter Shawl",
    category: "accessories",
    price: 1999,
    originalPrice: 2499,
    rating: 4.7,
    reviews: 203,
    badge: "sale",
    image: "https://img.drz.lazcdn.com/static/pk/p/5df09aacf3c69f13b86ee09e91b0baac.jpg_720x720q80.jpg?w=400&h=500&fit=crop",
    description: "Warm pashmina-blend shawl with elegant print, perfect for winter layering and evening outings."
  },
  {
    id: 8,
    name: "Leather Handbag",
    category: "accessories",
    price: 2599,
    originalPrice: 3299,
    rating: 4.5,
    reviews: 141,
    badge: "new",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=500&fit=crop",
    description: "Structured handbag with premium finish, roomy interior, and adjustable strap for daily use."
  }
];

const API_BASE = 'backend/api';
let backendEnabled = false;
let ordersCache = [];
let reviewsCache = [];

function canUseBackend() {
  return window.location.protocol.startsWith('http');
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return res.json();
}

function normalizeBackendProduct(p) {
  let highlights = [];
  if (Array.isArray(p.highlights)) highlights = p.highlights;
  else if (typeof p.highlights_json === 'string') {
    try { highlights = JSON.parse(p.highlights_json) || []; } catch (error) {}
  }
  return {
    id: Number(p.id),
    name: p.name,
    category: p.category,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice ?? p.original_price ?? 0),
    rating: Number(p.rating ?? 5),
    reviews: Number(p.reviews ?? p.reviews_count ?? 0),
    badge: p.badge || 'new',
    image: p.image || '',
    images: Array.isArray(p.images) ? p.images : [p.image].filter(Boolean),
    description: p.description || '',
    stock: Number(p.stock ?? 0),
    sku: p.sku || '',
    highlights: Array.isArray(highlights) ? highlights.filter(Boolean).map(String) : []
  };
}

async function initBackendData() {
  if (!canUseBackend()) return;
  try {
    const productPayload = await apiGet('products/list.php');
    if (productPayload?.ok && Array.isArray(productPayload.products)) {
      products = productPayload.products.map(normalizeBackendProduct);
      backendEnabled = true;
    }
  } catch (error) {
    backendEnabled = false;
    return;
  }

  try {
    const reviewsPayload = await apiGet('reviews/list.php');
    if (reviewsPayload?.ok && Array.isArray(reviewsPayload.reviews)) {
      reviewsCache = reviewsPayload.reviews;
      saveReviews(reviewsCache);
    }
  } catch (error) {}

  const isAdminPage = !!document.getElementById('adminApp');
  if (isAdminPage) {
    try {
      const [ordersPayload, adminReviewsPayload] = await Promise.all([
        apiGet('orders/list.php'),
        apiGet('reviews/list.php?status=')
      ]);
      if (ordersPayload?.ok && Array.isArray(ordersPayload.orders)) {
        ordersCache = ordersPayload.orders;
        saveOrders(ordersCache);
      }
      if (adminReviewsPayload?.ok && Array.isArray(adminReviewsPayload.reviews)) {
        reviewsCache = adminReviewsPayload.reviews;
        saveReviews(reviewsCache);
      }
    } catch (error) {}
  }
}

function getProducts() {
  // Product catalog is managed from backend or defaults only.
  return [];
}

function saveProducts(nextProducts) {
  // Do not persist products in localStorage.
  return false;
}

function ensureProductsSeeded() {
  const defaultHighlights = [
    'Premium quality material with comfortable all-day feel.',
    'Designed for style, durability, and easy maintenance.',
    'Suitable for casual wear, events, and everyday use.',
    'Nationwide delivery with cash on delivery option.'
  ];
  const current = getProducts();
  if (!Array.isArray(current) || current.length === 0) {
    const seeded = defaultProducts.map((p, idx) => ({
      ...p,
      images: [p.image],
      stock: 25,
      sku: `SE-${String(idx + 1).padStart(4, '0')}`,
      highlights: [...defaultHighlights]
    }));
    saveProducts(seeded);
    return seeded;
  }

  let changed = false;
  const normalized = current.map((p, idx) => {
    const nextImages = Array.isArray(p.images) && p.images.length ? p.images : [p.image].filter(Boolean);
    const nextImage = p.image || (Array.isArray(p.images) ? p.images[0] : '');
    const nextStock = Number.isFinite(Number(p.stock)) ? Number(p.stock) : 25;
    const nextSku = p.sku || `SE-${String(p.id || idx + 1).padStart(4, '0')}`;
    const nextHighlights = Array.isArray(p.highlights) && p.highlights.length
      ? p.highlights.filter(Boolean).map(String)
      : [...defaultHighlights];
    if (
      p.images !== nextImages ||
      p.image !== nextImage ||
      p.stock !== nextStock ||
      p.sku !== nextSku ||
      p.highlights !== nextHighlights
    ) {
      changed = true;
    }
    return {
      ...p,
      images: nextImages,
      image: nextImage,
      stock: nextStock,
      sku: nextSku,
      highlights: nextHighlights
    };
  });
  if (changed) saveProducts(normalized);
  return normalized;
}

function getDefaultProductHighlights() {
  return [
    'Premium quality material with comfortable all-day feel.',
    'Designed for style, durability, and easy maintenance.',
    'Suitable for casual wear, events, and everyday use.',
    'Nationwide delivery with cash on delivery option.'
  ];
}

function getProductHighlights(product) {
  if (Array.isArray(product?.highlights) && product.highlights.length) {
    return product.highlights.filter(Boolean).map(String);
  }
  return getDefaultProductHighlights();
}

let products = ensureProductsSeeded();

function getOrders() {
  if (backendEnabled && Array.isArray(ordersCache)) return ordersCache;
  try {
    return JSON.parse(localStorage.getItem('shopease_orders')) || [];
  } catch (error) {
    return [];
  }
}

function saveOrders(orders) {
  ordersCache = Array.isArray(orders) ? orders : [];
  try {
    localStorage.setItem('shopease_orders', JSON.stringify(orders));
    return true;
  } catch (error) {
    return false;
  }
}

function getReviews() {
  if (backendEnabled && Array.isArray(reviewsCache)) return reviewsCache;
  try {
    return JSON.parse(localStorage.getItem('shopease_reviews')) || [];
  } catch (error) {
    return [];
  }
}

function saveReviews(reviews) {
  reviewsCache = Array.isArray(reviews) ? reviews : [];
  try {
    localStorage.setItem('shopease_reviews', JSON.stringify(reviews));
    return true;
  } catch (error) {
    return false;
  }
}

const ADMIN_AUTH_KEY = 'shopease_admin_auth';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const CMS_KEY = 'shopease_cms';
const THEME_PRESETS = {
  classic: { primary: '#2c2c2c', accent: '#c8a96e', bg: '#faf9f7', text: '#2c2c2c' },
  ocean: { primary: '#143a52', accent: '#2fa4c7', bg: '#f4fbff', text: '#1d2f3a' },
  forest: { primary: '#1f3c2e', accent: '#5da271', bg: '#f5faf6', text: '#213328' },
  berry: { primary: '#3f1d3a', accent: '#c35d9f', bg: '#fff7fb', text: '#321a30' },
  slate: { primary: '#26323f', accent: '#d6a74f', bg: '#f6f7f9', text: '#1f2933' }
};

const CURRENCY_PRESETS = [
  { country: 'Pakistan', code: 'PKR', symbol: 'Rs.' },
  { country: 'United States', code: 'USD', symbol: '$' },
  { country: 'Canada', code: 'CAD', symbol: 'C$' },
  { country: 'United Kingdom', code: 'GBP', symbol: '£' },
  { country: 'European Union', code: 'EUR', symbol: '€' },
  { country: 'United Arab Emirates', code: 'AED', symbol: 'AED' },
  { country: 'Saudi Arabia', code: 'SAR', symbol: 'SAR' },
  { country: 'Qatar', code: 'QAR', symbol: 'QAR' },
  { country: 'Kuwait', code: 'KWD', symbol: 'KWD' },
  { country: 'Bahrain', code: 'BHD', symbol: 'BHD' },
  { country: 'Oman', code: 'OMR', symbol: 'OMR' },
  { country: 'India', code: 'INR', symbol: '₹' },
  { country: 'Bangladesh', code: 'BDT', symbol: '৳' },
  { country: 'Sri Lanka', code: 'LKR', symbol: 'LKR' },
  { country: 'Nepal', code: 'NPR', symbol: 'NPR' },
  { country: 'Afghanistan', code: 'AFN', symbol: 'AFN' },
  { country: 'China', code: 'CNY', symbol: '¥' },
  { country: 'Japan', code: 'JPY', symbol: '¥' },
  { country: 'South Korea', code: 'KRW', symbol: '₩' },
  { country: 'Singapore', code: 'SGD', symbol: 'S$' },
  { country: 'Malaysia', code: 'MYR', symbol: 'RM' },
  { country: 'Thailand', code: 'THB', symbol: '฿' },
  { country: 'Indonesia', code: 'IDR', symbol: 'Rp' },
  { country: 'Philippines', code: 'PHP', symbol: '₱' },
  { country: 'Vietnam', code: 'VND', symbol: '₫' },
  { country: 'Australia', code: 'AUD', symbol: 'A$' },
  { country: 'New Zealand', code: 'NZD', symbol: 'NZ$' },
  { country: 'South Africa', code: 'ZAR', symbol: 'R' },
  { country: 'Egypt', code: 'EGP', symbol: 'E£' },
  { country: 'Turkey', code: 'TRY', symbol: '₺' },
  { country: 'Switzerland', code: 'CHF', symbol: 'CHF' },
  { country: 'Sweden', code: 'SEK', symbol: 'kr' },
  { country: 'Norway', code: 'NOK', symbol: 'kr' },
  { country: 'Denmark', code: 'DKK', symbol: 'kr' },
  { country: 'Poland', code: 'PLN', symbol: 'zł' },
  { country: 'Czech Republic', code: 'CZK', symbol: 'Kč' },
  { country: 'Hungary', code: 'HUF', symbol: 'Ft' },
  { country: 'Romania', code: 'RON', symbol: 'lei' },
  { country: 'Russia', code: 'RUB', symbol: '₽' },
  { country: 'Ukraine', code: 'UAH', symbol: '₴' },
  { country: 'Brazil', code: 'BRL', symbol: 'R$' },
  { country: 'Mexico', code: 'MXN', symbol: 'MX$' },
  { country: 'Argentina', code: 'ARS', symbol: 'AR$' },
  { country: 'Chile', code: 'CLP', symbol: 'CLP$' },
  { country: 'Colombia', code: 'COP', symbol: 'COP$' },
  { country: 'Peru', code: 'PEN', symbol: 'S/' },
  { country: 'Nigeria', code: 'NGN', symbol: '₦' },
  { country: 'Kenya', code: 'KES', symbol: 'KSh' },
  { country: 'Ghana', code: 'GHS', symbol: 'GH₵' },
  { country: 'Morocco', code: 'MAD', symbol: 'MAD' }
];

function defaultCmsSettings() {
  return {
    siteName: 'ShopEase',
    slogan: 'Fashion for Everyone',
    topBarEnabled: true,
    topBarText: 'Free Delivery on Orders Above Rs. 3,000 | Cash on Delivery Available Across Pakistan',
    phone: '0300-1234567',
    email: 'support@shopease.pk',
    officeAddress: 'Karachi, Sindh, Pakistan',
    currencySymbol: 'Rs.',
    currencyCode: 'PKR',
    footerBrandText: 'Your go-to destination for affordable, high-quality Pakistani clothing.',
    logoUrl: '',
    theme: 'classic',
    categories: [
      { slug: 'mens', label: "Men's Wear" },
      { slug: 'womens', label: "Women's Wear" },
      { slug: 'kids', label: "Kids' Wear" },
      { slug: 'accessories', label: 'Accessories' }
    ],
    pages: {
      home: { title: 'Home', url: 'index.html', inHeader: true, inFooter: true, builtIn: true },
      about: { title: 'About', url: 'about.html', inHeader: true, inFooter: true, builtIn: true },
      shop: { title: 'Shop', url: 'shop.html', inHeader: true, inFooter: true, builtIn: true },
      contact: { title: 'Contact', url: 'contact.html', inHeader: true, inFooter: true, builtIn: true }
    },
    customPages: [],
    pageContent: {}
  };
}

function buildDefaultFooterText(siteName) {
  const safeName = String(siteName || '').trim() || 'ShopEase';
  return `© 2026 ${safeName}. All rights reserved. | Designed with Kabeer Ecommerce Tool`;
}

function getCurrencyConfig() {
  const cms = getCmsSettings();
  return {
    symbol: String(cms.currencySymbol || 'Rs.').trim() || 'Rs.',
    code: String(cms.currencyCode || 'PKR').trim() || 'PKR'
  };
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  const symbol = getCurrencyConfig().symbol;
  return `${symbol} ${amount.toLocaleString()}`;
}

function getCmsSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(CMS_KEY) || '{}');
    return {
      ...defaultCmsSettings(),
      ...saved,
      pages: { ...defaultCmsSettings().pages, ...(saved.pages || {}) },
      categories: Array.isArray(saved.categories) && saved.categories.length ? saved.categories : defaultCmsSettings().categories,
      customPages: Array.isArray(saved.customPages) ? saved.customPages : [],
      pageContent: saved.pageContent || {}
    };
  } catch (error) {
    return defaultCmsSettings();
  }
}

function saveCmsSettings(settings) {
  try {
    localStorage.setItem(CMS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    return false;
  }
}

function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_AUTH_KEY) === '1';
}

function setAdminLoggedIn(value) {
  if (value) localStorage.setItem(ADMIN_AUTH_KEY, '1');
  else localStorage.removeItem(ADMIN_AUTH_KEY);
}

function toPrettyHref(rawHref) {
  if (!rawHref) return rawHref;
  if (
    rawHref.startsWith('#') ||
    rawHref.startsWith('mailto:') ||
    rawHref.startsWith('tel:') ||
    rawHref.startsWith('javascript:')
  ) {
    return rawHref;
  }
  return rawHref
    .replace(/^index\.html(?=($|[?#]))/, '')
    .replace(/\.html(?=($|[?#]))/, '');
}

function prettifyLinks() {
  document.querySelectorAll('a[href]').forEach(anchor => {
    const href = String(anchor.getAttribute('href') || '').trim();
    if (!href || !/\.html(?=($|[?#]))/.test(href)) return;
    anchor.setAttribute('data-file-href', href);
    const prettyHref = toPrettyHref(href);
    anchor.setAttribute('href', prettyHref || '/');
  });
}

// ============================================================
// CART MANAGEMENT
// Using localStorage so cart data stays even after page refresh
// ============================================================

// Get cart from localStorage, or return empty array if nothing saved
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('shopease_cart')) || [];
  } catch (error) {
    return [];
  }
}

// Save cart array back to localStorage
function saveCart(cart) {
  try {
    localStorage.setItem('shopease_cart', JSON.stringify(cart));
    return true;
  } catch (error) {
    return false;
  }
}

// Count total number of items in cart
function getCartCount() {
  const cart = getCart();
  // reduce() adds up all quantities
  return cart.reduce((total, item) => total + item.qty, 0);
}

// Update the cart count badge in the header
function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = count;
}

// Add a product to the cart
function addToCart(productId) {
  const cart = getCart();
  const product = products.find(p => p.id === productId);

  if (!product) return; // Safety check

  // Check if product already in cart
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    // If already in cart, just increase quantity by 1
    existing.qty += 1;
  } else {
    // If new product, add it with quantity 1
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      qty: 1
    });
  }

  saveCart(cart);        // Save updated cart
  updateCartBadge();     // Update the badge number
  showToast('Item added to cart! 🛍️'); // Show popup notification
}

function getProductImages(product) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (images.length) return images;
  if (product.image) return [product.image];
  return ['https://via.placeholder.com/700x900?text=No+Image'];
}

function buildReviewStats(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  const totalRatings = list.length;
  if (!totalRatings) {
    return {
      totalRatings: 0,
      avg: 0,
      breakdownPct: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  const sum = list.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const avg = Math.max(0, Math.min(5, sum / totalRatings));
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  list.forEach(r => {
    const star = Math.max(1, Math.min(5, Math.round(Number(r.rating || 0))));
    counts[star] += 1;
  });
  const breakdownPct = {
    5: Math.round((counts[5] / totalRatings) * 100),
    4: Math.round((counts[4] / totalRatings) * 100),
    3: Math.round((counts[3] / totalRatings) * 100),
    2: Math.round((counts[2] / totalRatings) * 100),
    1: Math.round((counts[1] / totalRatings) * 100)
  };
  return { totalRatings, avg, breakdownPct };
}

// ============================================================
// PRODUCT CARD HTML GENERATOR
// Creates the HTML for each product card
// ============================================================
function createProductCard(product) {
  const image = getProductImages(product)[0];
  // Generate star icons based on rating
  const stars = generateStars(product.rating);

  // Calculate discount percentage
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  // Badge HTML (sale or new)
  let badgeHTML = '';
  if (product.badge === 'sale') {
    badgeHTML = `<span class="sale-badge">-${discount}%</span>`;
  } else if (product.badge === 'new') {
    badgeHTML = `<span class="new-badge">NEW</span>`;
  }

  // Return the full card HTML as a string
  return `
    <div class="product-card" data-category="${product.category}">
      ${badgeHTML}
      <a href="product.html?id=${product.id}" class="product-link">
        <img src="${image}" alt="${product.name}" class="product-img" loading="lazy" />
      </a>
      <div class="product-info">
        <div class="product-cat">${getCategoryLabel(product.category)}</div>
        <h3 class="product-name">
          <a href="product.html?id=${product.id}" class="product-name-link">${product.name}</a>
        </h3>
        <div class="product-rating">
          <div class="stars">${stars}</div>
          <span class="rating-count">(${product.reviews})</span>
        </div>
        <div class="product-price">
          <span class="price-now">${formatCurrency(product.price)}</span>
          <span class="price-was">${formatCurrency(product.originalPrice)}</span>
        </div>
        <a href="product.html?id=${product.id}" class="btn-view-product">
          <i class="fas fa-eye"></i> View Details
        </a>
        <button class="btn-cart" onclick="addToCart(${product.id})">
          <i class="fas fa-shopping-cart"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// PRODUCT PAGE — LOAD SINGLE PRODUCT DETAILS
// ============================================================
function loadProductPage() {
  const detailEl = document.getElementById('productDetailContent');
  if (!detailEl) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get('id'));
  const product = products.find(p => p.id === productId);

  if (!product) {
    detailEl.innerHTML = `
      <div class="product-not-found">
        <i class="fas fa-box-open"></i>
        <h2>Product not found</h2>
        <p>This product does not exist or may have been removed.</p>
        <a href="shop.html" class="btn-primary">
          <i class="fas fa-arrow-left"></i> Back to Shop
        </a>
      </div>
    `;
    return;
  }

  const images = getProductImages(product);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const storedApprovedReviews = getReviews()
    .filter(r => Number(r.productId) === Number(product.id) && String(r.status).toLowerCase() === 'approved')
    .map(r => ({
      id: r.id,
      name: r.name,
      title: r.title || 'Customer review',
      text: r.text,
      rating: Number(r.rating || 5),
      date: r.date,
      verified: false,
      imageUrl: r.imageUrl || ''
    }));
  const reviewStats = buildReviewStats(storedApprovedReviews);
  const stars = generateStars(reviewStats.avg || 0);
  const totalReviewCount = reviewStats.totalRatings;
  const imageReviews = storedApprovedReviews.filter(r => r.imageUrl);
  const imageReviewIndexById = new Map(imageReviews.map((r, idx) => [String(r.id), idx]));
  const aboutItems = getProductHighlights(product);
  const badgeHTML = product.badge === 'sale'
    ? `<span class="sale-badge">-${discount}%</span>`
    : product.badge === 'new'
      ? `<span class="new-badge">NEW</span>`
      : '';

  detailEl.innerHTML = `
    <div class="amazon-product-layout">
      <div class="amazon-gallery-col">
        <div class="amazon-thumbs-col product-detail-thumb-row">
          ${images.map((img, idx) => `
            <button class="product-detail-thumb ${idx === 0 ? 'active' : ''}" data-thumb-src="${img}" type="button">
              <img src="${img}" alt="${product.name} thumbnail ${idx + 1}" />
            </button>
          `).join('')}
        </div>
        <div class="amazon-main-image-wrap product-detail-image-wrap">
          ${badgeHTML}
          <button class="product-image-nav prev" type="button" id="productImagePrev" aria-label="Previous image">
            <i class="fas fa-chevron-left"></i>
          </button>
          <img src="${images[0]}" alt="${product.name}" class="product-detail-image" id="productMainImage" />
          <button class="product-image-nav next" type="button" id="productImageNext" aria-label="Next image">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div class="product-zoom-panel" id="productZoomPanel" aria-hidden="true"></div>
        </div>
      </div>

      <div class="amazon-info-col">
        <div class="product-cat">${getCategoryLabel(product.category)}</div>
        <h2 class="amazon-product-title">${product.name}</h2>
        <div class="product-rating product-detail-rating">
          <div class="stars">${stars}</div>
          <button type="button" class="amazon-review-jump rating-count" id="scrollReviewsTrigger">${totalReviewCount ? reviewStats.avg.toFixed(1) : 'No ratings yet'} (${totalReviewCount} ratings)</button>
        </div>
        <div class="amazon-divider"></div>
        <div class="product-price product-detail-price">
          <span class="price-now">${formatCurrency(product.price)}</span>
          <span class="price-was">${formatCurrency(product.originalPrice)}</span>
          <span class="product-discount">Save ${discount}%</span>
        </div>
        <p class="product-detail-description">${product.description}</p>
        <div class="amazon-feature-list product-detail-highlights">
          <div><i class="fas fa-check-circle"></i> Cash on Delivery available</div>
          <div><i class="fas fa-check-circle"></i> 7-day exchange policy</div>
          <div><i class="fas fa-check-circle"></i> Secure checkout and trusted shipping</div>
        </div>
      </div>

      <aside class="amazon-buybox">
        <div class="amazon-buy-price">${formatCurrency(product.price)}</div>
        <div class="amazon-buy-delivery">FREE delivery across Pakistan on eligible orders.</div>
        <div class="amazon-buy-stock ${Number(product.stock || 25) > 0 ? 'in' : 'out'}">
          ${Number(product.stock || 25) > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
        <div class="amazon-qty-wrap">
          <label>Qty:</label>
          <div class="amazon-qty-controls">
            <button type="button" id="buyQtyMinus" aria-label="Decrease quantity">-</button>
            <span id="buyQtyValue">1</span>
            <button type="button" id="buyQtyPlus" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="amazon-btn amazon-btn-cart" id="buyAddToCartBtn" ${Number(product.stock || 25) <= 0 ? 'disabled' : ''}>
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
        <button class="amazon-btn amazon-btn-buy" id="buyNowBtn" ${Number(product.stock || 25) <= 0 ? 'disabled' : ''}>
          <i class="fas fa-bolt"></i> Buy Now
        </button>
        <a href="shop.html?cat=${product.category}" class="btn-outline-dark" style="margin-top:10px;">
          <i class="fas fa-arrow-left"></i> Continue Shopping
        </a>
      </aside>
    </div>
    <section class="amazon-below-sections">
      <div class="amazon-below-card">
        <h3>About this item</h3>
        <ul>
          ${aboutItems.map(item => `<li>${String(item).replace(/</g, '&lt;')}</li>`).join('')}
        </ul>
      </div>
      <div class="amazon-below-card">
        <h3>Product description</h3>
        <p>${product.description}</p>
      </div>
      <div class="amazon-below-card">
        <h3>Product details</h3>
        <div class="amazon-spec-grid">
          <div><strong>Category</strong><span>${getCategoryLabel(product.category)}</span></div>
          <div><strong>SKU</strong><span>${product.sku || '-'}</span></div>
          <div><strong>Stock</strong><span>${Number(product.stock || 0)}</span></div>
          <div><strong>Rating</strong><span>${product.rating} / 5</span></div>
          <div><strong>Reviews</strong><span>${product.reviews}</span></div>
          <div><strong>Delivery</strong><span>All Pakistan</span></div>
        </div>
      </div>
    </section>
    <section class="amazon-reviews-section" id="productReviewsSection">
      <div class="amazon-reviews-layout">
        <aside class="amazon-review-summary">
          <h3>Customer reviews</h3>
          <div class="amazon-review-score">
            <span class="stars">${generateStars(reviewStats.avg)}</span>
            <strong>${totalReviewCount ? reviewStats.avg.toFixed(1) : '0.0'} out of 5</strong>
          </div>
          <p>${totalReviewCount.toLocaleString()} real customer ratings</p>
          ${[5,4,3,2,1].map(star => `
            <div class="amazon-rating-row">
              <span>${star} star</span>
              <div class="amazon-rating-bar"><span style="width:${reviewStats.breakdownPct[star]}%"></span></div>
              <strong>${reviewStats.breakdownPct[star]}%</strong>
            </div>
          `).join('')}
          <button class="btn-outline-dark" type="button" id="openWriteReviewBtn">Write a review</button>
        </aside>
        <div class="amazon-review-main">
          <h3>Reviews with images</h3>
          <div class="amazon-review-image-strip">
            ${imageReviews.length
              ? imageReviews.map((review, idx) => `
                  <button type="button" class="amazon-review-image-thumb" data-review-image-idx="${idx}" aria-label="Open image review by ${review.name}">
                    <img src="${review.imageUrl}" alt="Review image by ${review.name}" />
                  </button>
                `).join('')
              : '<p class="admin-subtext">No reviews with images yet.</p>'}
          </div>
          <h3 style="margin-top:18px;">Top reviews</h3>
          ${storedApprovedReviews.length ? storedApprovedReviews.map(card => `
            <article class="amazon-review-card">
              <div class="amazon-review-user">
                <div class="amazon-review-avatar">${card.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                <div>
                  <strong>${card.name}</strong>
                  <div class="amazon-subtext">${card.date}</div>
                </div>
              </div>
              <div class="amazon-review-title">
                <span class="stars">${generateStars(card.rating)}</span>
                <h4>${card.title}</h4>
              </div>
              ${card.verified ? '<div class="amazon-verified">Verified Purchase</div>' : ''}
              <p>${card.text}</p>
              ${card.imageUrl ? `<button type="button" class="amazon-review-photo-link" data-review-image-idx="${imageReviewIndexById.get(String(card.id))}"><img class="amazon-review-photo" src="${card.imageUrl}" alt="Review image from ${card.name}" /></button>` : ''}
            </article>
          `).join('') : '<p class="admin-subtext">No reviews yet for this product.</p>'}
          <div class="amazon-add-review-box collapsed" id="addReviewBox">
            <h3>Add your review</h3>
            <form id="addReviewForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="reviewerName">Your Name</label>
                  <input id="reviewerName" type="text" required />
                </div>
                <div class="form-group">
                  <label>Rating</label>
                  <div class="review-stars-input" id="reviewStarsInput" role="radiogroup" aria-label="Select review rating">
                    <button type="button" class="review-star-btn active" data-star-value="1" aria-label="1 star"><i class="fas fa-star"></i></button>
                    <button type="button" class="review-star-btn active" data-star-value="2" aria-label="2 stars"><i class="fas fa-star"></i></button>
                    <button type="button" class="review-star-btn active" data-star-value="3" aria-label="3 stars"><i class="fas fa-star"></i></button>
                    <button type="button" class="review-star-btn active" data-star-value="4" aria-label="4 stars"><i class="fas fa-star"></i></button>
                    <button type="button" class="review-star-btn active" data-star-value="5" aria-label="5 stars"><i class="fas fa-star"></i></button>
                  </div>
                  <div class="review-stars-meta" id="reviewStarsMeta">Excellent - 5 stars</div>
                  <input id="reviewerRating" type="hidden" value="5" />
                </div>
              </div>
              <div class="form-group">
                <label for="reviewerText">Review</label>
                <textarea id="reviewerText" rows="4" required></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="reviewerImageUrl">Review Image URL (optional)</label>
                  <input id="reviewerImageUrl" type="url" placeholder="https://example.com/review-photo.jpg" />
                </div>
                <div class="form-group">
                  <label for="reviewerImageFile">Or Upload Image (optional)</label>
                  <input id="reviewerImageFile" type="file" accept="image/*" />
                </div>
              </div>
              <button type="submit" class="btn-admin btn-admin-primary">Submit Review</button>
            </form>
          </div>
          <div class="review-image-viewer" id="reviewImageViewer" aria-hidden="true">
            <div class="review-image-viewer-dialog">
              <button type="button" class="review-image-close" id="reviewImageCloseBtn" aria-label="Close image viewer">
                <i class="fas fa-xmark"></i>
              </button>
              <button type="button" class="review-image-nav prev" id="reviewImagePrevBtn" aria-label="Previous review image">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button type="button" class="review-image-nav next" id="reviewImageNextBtn" aria-label="Next review image">
                <i class="fas fa-chevron-right"></i>
              </button>
              <div class="review-image-viewer-grid">
                <div class="review-image-main">
                  <img id="reviewViewerImage" src="" alt="Review image" />
                </div>
                <aside class="review-image-side">
                  <h4 id="reviewViewerTitle">Customer review</h4>
                  <div class="stars" id="reviewViewerStars"></div>
                  <div class="admin-subtext" id="reviewViewerMeta"></div>
                  <p id="reviewViewerText"></p>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const thumbButtons = Array.from(detailEl.querySelectorAll('.product-detail-thumb'));
  const mainImg = detailEl.querySelector('#productMainImage');
  const zoomPanel = detailEl.querySelector('#productZoomPanel');
  const imageWrap = detailEl.querySelector('.amazon-main-image-wrap');
  const prevBtn = detailEl.querySelector('#productImagePrev');
  const nextBtn = detailEl.querySelector('#productImageNext');
  let activeIndex = 0;

  function updateZoomImage() {
    if (!zoomPanel || !mainImg) return;
    zoomPanel.style.backgroundImage = `url("${mainImg.src}")`;
  }

  function setActiveImage(index) {
    if (!mainImg || !images.length) return;
    const nextIndex = (index + images.length) % images.length;
    activeIndex = nextIndex;
    mainImg.src = images[nextIndex];
    thumbButtons.forEach((b, i) => b.classList.toggle('active', i === nextIndex));
    updateZoomImage();
  }

  thumbButtons.forEach((btn, idx) => {
    btn.addEventListener('click', function() {
      setActiveImage(idx);
    });
  });

  prevBtn?.addEventListener('click', function() {
    setActiveImage(activeIndex - 1);
  });
  nextBtn?.addEventListener('click', function() {
    setActiveImage(activeIndex + 1);
  });

  if (images.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  }

  if (mainImg && zoomPanel && imageWrap) {
    updateZoomImage();

    imageWrap.addEventListener('mouseenter', function() {
      zoomPanel.classList.add('show');
    });

    imageWrap.addEventListener('mousemove', function(event) {
      const rect = mainImg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const px = Math.min(100, Math.max(0, x));
      const py = Math.min(100, Math.max(0, y));
      zoomPanel.style.backgroundPosition = `${px}% ${py}%`;
      zoomPanel.classList.add('show');
    });

    imageWrap.addEventListener('mouseleave', function() {
      zoomPanel.classList.remove('show');
    });
  }

  const buyQtyValueEl = detailEl.querySelector('#buyQtyValue');
  const buyQtyMinusEl = detailEl.querySelector('#buyQtyMinus');
  const buyQtyPlusEl = detailEl.querySelector('#buyQtyPlus');
  const addBtn = detailEl.querySelector('#buyAddToCartBtn');
  const buyNowBtn = detailEl.querySelector('#buyNowBtn');
  let selectedQty = 1;
  function renderQty() {
    if (buyQtyValueEl) buyQtyValueEl.textContent = String(selectedQty);
  }
  buyQtyMinusEl?.addEventListener('click', function() {
    selectedQty = Math.max(1, selectedQty - 1);
    renderQty();
  });
  buyQtyPlusEl?.addEventListener('click', function() {
    selectedQty = Math.min(10, selectedQty + 1);
    renderQty();
  });
  function addSelectedQtyToCart() {
    for (let i = 0; i < selectedQty; i++) addToCart(product.id);
  }
  addBtn?.addEventListener('click', function() {
    addSelectedQtyToCart();
  });
  buyNowBtn?.addEventListener('click', function() {
    addSelectedQtyToCart();
    window.location.href = 'cart.html';
  });

  const reviewsSection = detailEl.querySelector('#productReviewsSection');
  const jumpBtn = detailEl.querySelector('#scrollReviewsTrigger');
  const openWriteBtn = detailEl.querySelector('#openWriteReviewBtn');
  const addReviewBox = detailEl.querySelector('#addReviewBox');
  const addReviewForm = detailEl.querySelector('#addReviewForm');
  const reviewStarsInput = detailEl.querySelector('#reviewStarsInput');
  const reviewStarButtons = Array.from(detailEl.querySelectorAll('.review-star-btn'));
  const reviewStarsMeta = detailEl.querySelector('#reviewStarsMeta');
  const reviewImageViewer = detailEl.querySelector('#reviewImageViewer');
  const reviewViewerImage = detailEl.querySelector('#reviewViewerImage');
  const reviewViewerTitle = detailEl.querySelector('#reviewViewerTitle');
  const reviewViewerStars = detailEl.querySelector('#reviewViewerStars');
  const reviewViewerMeta = detailEl.querySelector('#reviewViewerMeta');
  const reviewViewerText = detailEl.querySelector('#reviewViewerText');
  const reviewImageCloseBtn = detailEl.querySelector('#reviewImageCloseBtn');
  const reviewImagePrevBtn = detailEl.querySelector('#reviewImagePrevBtn');
  const reviewImageNextBtn = detailEl.querySelector('#reviewImageNextBtn');
  const imageThumbButtons = detailEl.querySelectorAll('[data-review-image-idx]');
  let activeImageReviewIndex = 0;

  jumpBtn?.addEventListener('click', function() {
    reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  openWriteBtn?.addEventListener('click', function() {
    addReviewBox?.classList.remove('collapsed');
    addReviewBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      detailEl.querySelector('#reviewerName')?.focus();
    }, 220);
  });

  function setReviewStars(value) {
    const safeValue = Math.max(1, Math.min(5, Number(value || 5)));
    const ratingInput = detailEl.querySelector('#reviewerRating');
    if (ratingInput) ratingInput.value = String(safeValue);
    const labels = {
      1: 'Very Poor - 1 star',
      2: 'Poor - 2 stars',
      3: 'Average - 3 stars',
      4: 'Good - 4 stars',
      5: 'Excellent - 5 stars'
    };
    reviewStarButtons.forEach(btn => {
      const starValue = Number(btn.getAttribute('data-star-value') || 0);
      btn.classList.toggle('active', starValue <= safeValue);
    });
    if (reviewStarsMeta) reviewStarsMeta.textContent = labels[safeValue];
  }

  reviewStarsInput?.addEventListener('click', function(event) {
    const btn = event.target.closest('[data-star-value]');
    if (!btn) return;
    setReviewStars(btn.getAttribute('data-star-value'));
  });

  reviewStarButtons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      const hoverValue = Number(btn.getAttribute('data-star-value') || 5);
      const labels = {
        1: 'Very Poor - 1 star',
        2: 'Poor - 2 stars',
        3: 'Average - 3 stars',
        4: 'Good - 4 stars',
        5: 'Excellent - 5 stars'
      };
      reviewStarButtons.forEach(s => {
        const sVal = Number(s.getAttribute('data-star-value') || 0);
        s.classList.toggle('hovered', sVal <= hoverValue);
      });
      if (reviewStarsMeta) reviewStarsMeta.textContent = labels[hoverValue];
    });
  });

  reviewStarsInput?.addEventListener('mouseleave', function() {
    reviewStarButtons.forEach(s => s.classList.remove('hovered'));
    setReviewStars(detailEl.querySelector('#reviewerRating')?.value || 5);
  });

  function renderReviewViewerByIndex(index) {
    if (!imageReviews.length) return;
    activeImageReviewIndex = (Number(index) + imageReviews.length) % imageReviews.length;
    const review = imageReviews[activeImageReviewIndex];
    if (!review || !reviewImageViewer || !reviewViewerImage) return;
    reviewViewerImage.src = review.imageUrl;
    reviewViewerTitle.textContent = review.title || 'Customer review';
    if (reviewViewerStars) reviewViewerStars.innerHTML = generateStars(Number(review.rating || 0));
    if (reviewViewerMeta) reviewViewerMeta.textContent = `${review.name} • ${review.date || '-'}`;
    if (reviewViewerText) reviewViewerText.textContent = review.text || '';
    if (reviewImagePrevBtn) reviewImagePrevBtn.style.display = imageReviews.length > 1 ? 'inline-flex' : 'none';
    if (reviewImageNextBtn) reviewImageNextBtn.style.display = imageReviews.length > 1 ? 'inline-flex' : 'none';
  }

  function openReviewImageViewer(imageIndex) {
    renderReviewViewerByIndex(imageIndex);
    reviewImageViewer.classList.add('show');
    reviewImageViewer.setAttribute('aria-hidden', 'false');
  }

  function closeReviewImageViewer() {
    if (!reviewImageViewer) return;
    reviewImageViewer.classList.remove('show');
    reviewImageViewer.setAttribute('aria-hidden', 'true');
  }

  imageThumbButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      openReviewImageViewer(btn.getAttribute('data-review-image-idx'));
    });
  });
  reviewImagePrevBtn?.addEventListener('click', function() {
    renderReviewViewerByIndex(activeImageReviewIndex - 1);
  });
  reviewImageNextBtn?.addEventListener('click', function() {
    renderReviewViewerByIndex(activeImageReviewIndex + 1);
  });
  reviewImageCloseBtn?.addEventListener('click', closeReviewImageViewer);
  reviewImageViewer?.addEventListener('click', function(event) {
    if (event.target === reviewImageViewer) closeReviewImageViewer();
  });
  document.addEventListener('keydown', function(event) {
    if (!reviewImageViewer || !reviewImageViewer.classList.contains('show')) return;
    if (event.key === 'ArrowLeft') renderReviewViewerByIndex(activeImageReviewIndex - 1);
    if (event.key === 'ArrowRight') renderReviewViewerByIndex(activeImageReviewIndex + 1);
    if (event.key === 'Escape') closeReviewImageViewer();
  });

  addReviewForm?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = String(detailEl.querySelector('#reviewerName')?.value || '').trim();
    const rating = Number(detailEl.querySelector('#reviewerRating')?.value || 5);
    const text = String(detailEl.querySelector('#reviewerText')?.value || '').trim();
    const imageUrlInput = String(detailEl.querySelector('#reviewerImageUrl')?.value || '').trim();
    const imageFileInput = detailEl.querySelector('#reviewerImageFile');
    if (!name || !text) {
      alert('Please fill your name and review.');
      return;
    }
    let imageUrl = imageUrlInput;
    const selectedFile = imageFileInput?.files?.[0];
    if (!imageUrl && selectedFile) {
      if (selectedFile.size > 1.2 * 1024 * 1024) {
        alert('Review image should be under 1.2MB.');
        return;
      }
      imageUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function() {
          resolve(typeof reader.result === 'string' ? reader.result : '');
        };
        reader.onerror = function() {
          resolve('');
        };
        reader.readAsDataURL(selectedFile);
      });
    }
    const reviewPayload = {
      id: `RV-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      name,
      rating,
      text,
      imageUrl,
      title: 'Customer review',
      date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'pending'
    };
    if (backendEnabled) {
      try {
        await apiPost('reviews/save.php', {
          productId: reviewPayload.productId,
          productName: reviewPayload.productName,
          name: reviewPayload.name,
          rating: reviewPayload.rating,
          title: reviewPayload.title,
          text: reviewPayload.text,
          imageUrl: reviewPayload.imageUrl
        });
      } catch (error) {
        alert('Could not submit review right now. Please try again.');
        return;
      }
    } else {
      const reviews = getReviews();
      reviews.unshift(reviewPayload);
      saveReviews(reviews);
    }
    addReviewForm.reset();
    setReviewStars(5);
    showToast('Thanks for giving feedback.');
  });
}

// Helper function: returns human-readable category name
function getCategoryLabel(cat) {
  const cms = getCmsSettings();
  const found = (cms.categories || []).find(c => c.slug === cat);
  if (found) return found.label;
  const labels = {
    mens: "Men's Wear",
    womens: "Women's Wear",
    kids: "Kids' Wear",
    accessories: "Accessories"
  };
  if (labels[cat]) return labels[cat];
  return String(cat || '').replace(/(^\w|-\w)/g, m => m.replace('-', ' ').toUpperCase());
}

// Helper function: generates star icons from a number rating
function generateStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<i class="fas fa-star"></i>';           // Full star
    } else if (i - rating < 1 && i - rating > 0) {
      html += '<i class="fas fa-star-half-alt"></i>'; // Half star
    } else {
      html += '<i class="far fa-star"></i>';           // Empty star
    }
  }
  return html;
}

function getAvailableCategories() {
  const cms = getCmsSettings();
  const managedOrdered = (cms.categories || []).map(c => c.slug).filter(Boolean);
  const fromProducts = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const managedSet = new Set(managedOrdered);
  const extras = fromProducts.filter(cat => !managedSet.has(cat)).sort();
  return [...managedOrdered, ...extras];
}

function renderFilterButtons(activeCat = 'all') {
  const filterInner = document.querySelector('.filter-inner');
  if (!filterInner) return;

  const searchWrap = filterInner.querySelector('.shop-search');
  const oldButtons = filterInner.querySelectorAll('.filter-btn');
  oldButtons.forEach(btn => btn.remove());

  const allBtn = document.createElement('button');
  allBtn.className = `filter-btn${activeCat === 'all' ? ' active' : ''}`;
  allBtn.dataset.cat = 'all';
  allBtn.textContent = 'All';
  allBtn.onclick = function() { filterCategory('all', this); };
  filterInner.insertBefore(allBtn, searchWrap);

  getAvailableCategories().forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-btn${activeCat === cat ? ' active' : ''}`;
    btn.dataset.cat = cat;
    btn.textContent = getCategoryLabel(cat);
    btn.onclick = function() { filterCategory(cat, this); };
    filterInner.insertBefore(btn, searchWrap);
  });
}

// ============================================================
// SHOP PAGE — LOAD AND FILTER PRODUCTS
// ============================================================
function loadProducts(filterCat = 'all', searchQuery = '') {
  const grid = document.getElementById('productsGrid');
  if (!grid) return; // Only runs on pages with a products grid

  // Filter products based on category and search text
  let filtered = products.filter(p => {
    const matchCat = filterCat === 'all' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    // Show "no products" message if nothing found
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No products found</h3>
        <p>Try a different search or category.</p>
      </div>
    `;
    return;
  }

  // Build all cards and inject into the grid
  grid.innerHTML = filtered.map(p => createProductCard(p)).join('');
}

// Filter by category when user clicks a filter button
function filterCategory(cat, btn) {
  // Remove 'active' from all buttons, add to clicked one
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadProducts(cat); // Reload products with new filter
}

// Search as user types in search box
function searchProducts() {
  const query = document.getElementById('searchInput').value;
  const activeBtn = document.querySelector('.filter-btn.active');
  const cat = activeBtn ? activeBtn.dataset.cat : 'all';
  loadProducts(cat, query);
}

// ============================================================
// CART PAGE — DISPLAY CART ITEMS
// ============================================================
function loadCartPage() {
  const cart = getCart();
  const cartItemsCol = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartLayout = document.getElementById('cartLayout');

  if (!cartItemsCol) return;

  if (cart.length === 0) {
    // Show empty cart message, hide cart layout
    cartLayout.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }

  // Build HTML for each cart item
  cartItemsCol.innerHTML = cart.map(item => `
    <div class="cart-item" id="item-${item.id}">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-details">
        <div class="item-cat">${getCategoryLabel(item.category)}</div>
        <h4>${item.name}</h4>
        <div class="item-price">${formatCurrency(item.price)}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num" id="qty-${item.id}">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove item">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

  updateCartSummary(); // Update price totals
}

// Change quantity of a cart item (+1 or -1)
function changeQty(id, change) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);

  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    // If quantity goes to 0, remove item from cart
    removeItem(id);
    return;
  }

  saveCart(cart);
  document.getElementById(`qty-${id}`).textContent = item.qty; // Update display
  updateCartBadge();
  updateCartSummary();
}

// Remove an item from cart completely
function removeItem(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id); // Remove item with matching id
  saveCart(cart);
  updateCartBadge();
  loadCartPage(); // Reload cart display
}

// Calculate and display price totals in cart summary
function updateCartSummary() {
  const cart = getCart();

  // subtotal = sum of (price × quantity) for all items
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal === 0 ? 0 : (subtotal > 3000 ? 0 : 200);
  const total = subtotal + shipping;

  // Update the displayed values
  const subtotalEl = document.getElementById('subtotal');
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  const shippingEl = document.getElementById('shipping');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatCurrency(shipping);
  const grandTotalEl = document.getElementById('grandTotal');
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(total);

  // Also update order page totals if they exist
  if (document.getElementById('orderSubtotal')) {
    document.getElementById('orderSubtotal').textContent = formatCurrency(subtotal);
    const orderShippingEl = document.getElementById('orderShipping');
    if (orderShippingEl) orderShippingEl.textContent = shipping === 0 ? 'Free' : formatCurrency(shipping);
    document.getElementById('orderTotal').textContent = formatCurrency(total);
  }
}

// ============================================================
// ORDER / CHECKOUT PAGE
// ============================================================
function loadOrderPage() {
  const cart = getCart();
  const listEl = document.getElementById('orderItemsList');

  if (!listEl) return;

  if (cart.length === 0) {
    // Redirect to cart if cart is empty
    window.location.href = 'cart.html';
    return;
  }

  // Build mini item list in order summary sidebar
  listEl.innerHTML = cart.map(item => `
    <div class="mini-item">
      <img src="${item.image}" alt="${item.name}" />
      <div style="flex:1">
        <div class="mini-item-name">${item.name}</div>
        <div class="mini-item-qty">Qty: ${item.qty}</div>
        <div class="mini-item-price">${formatCurrency(item.price * item.qty)}</div>
      </div>
    </div>
  `).join('');

  updateCartSummary(); // Show correct totals
}

// Called when user clicks "Confirm Order" button
async function placeOrder() {
  // Get form values
  const name    = document.getElementById('custName').value.trim();
  const phone   = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const city    = document.getElementById('custCity').value.trim();

  // Simple validation: check required fields are not empty
  if (!name || !phone || !address || !city) {
    alert('Please fill in all required fields marked with *');
    return;
  }

  // Validate phone: must be at least 10 digits
  if (phone.replace(/\D/g, '').length < 10) {
    alert('Please enter a valid phone number.');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Calculate grand total
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 3000 ? 0 : 200;
  const total = subtotal + shipping;

  // Build order object to save
  const order = {
    id: 'SE-' + Date.now().toString().slice(-6),
    customer: {
      name, phone,
      email: document.getElementById('custEmail').value,
      address, city,
      province: document.getElementById('custProvince').value,
      notes: document.getElementById('custNotes').value
    },
    items: cart,
    subtotal,
    shipping,
    total,
    paymentMethod: 'Cash on Delivery',
    date: new Date().toLocaleString('en-PK'),
    status: 'Pending'
  };

  if (backendEnabled) {
    try {
      const saved = await apiPost('orders/save.php', order);
      if (saved?.ok && saved.orderId) order.id = saved.orderId;
    } catch (error) {
      alert('Could not place order right now. Please try again.');
      return;
    }
  } else {
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
  }

  // Also save last order for success page
  localStorage.setItem('shopease_last_order', JSON.stringify(order));

  // Clear the cart after placing order
  localStorage.removeItem('shopease_cart');
  updateCartBadge();

  // Go to the success page
  window.location.href = 'success.html';
}

// ============================================================
// SUCCESS PAGE — Show order details + countdown redirect
// ============================================================
function loadSuccessPage() {
  const order = JSON.parse(localStorage.getItem('shopease_last_order'));

  if (!order) {
    // If no order found, go home
    window.location.href = 'index.html';
    return;
  }

  // Display order info on success page
  document.getElementById('successOrderId').textContent = '#' + order.id;
  document.getElementById('successName').textContent = order.customer.name;
  document.getElementById('successTotal').textContent = formatCurrency(order.total);
  document.getElementById('successPhone').textContent = order.customer.phone;
  document.getElementById('successCity').textContent = order.customer.city;

  // Build items list on success page
  const itemsList = document.getElementById('successItems');
  if (itemsList) {
    itemsList.innerHTML = order.items.map(item => `
      <div class="mini-item">
        <img src="${item.image}" alt="${item.name}" />
        <div style="flex:1">
          <div class="mini-item-name">${item.name}</div>
          <div class="mini-item-qty">Qty: ${item.qty}</div>
          <div class="mini-item-price">${formatCurrency(item.price * item.qty)}</div>
        </div>
      </div>
    `).join('');
  }

  // Countdown: count from 5 to 0, then redirect to home
  let seconds = 5;
  const countdownEl = document.getElementById('countdown');

  const timer = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(timer); // Stop the timer
      window.location.href = 'index.html'; // Go to home page
    }
  }, 1000); // Runs every 1 second
}

// ============================================================
// CONTACT PAGE — Handle form submission
// ============================================================
function sendMessage() {
  const name    = document.getElementById('msgName').value.trim();
  const email   = document.getElementById('msgEmail').value.trim();
  const subject = document.getElementById('msgSubject').value.trim();
  const message = document.getElementById('msgText').value.trim();

  if (!name || !email || !message) {
    alert('Please fill in your name, email, and message.');
    return;
  }

  // Show success message (in real website, this would send to a server)
  document.getElementById('contactSuccess').style.display = 'block';

  // Clear the form fields
  document.getElementById('msgName').value = '';
  document.getElementById('msgEmail').value = '';
  document.getElementById('msgSubject').value = '';
  document.getElementById('msgText').value = '';

  // Hide success message after 5 seconds
  setTimeout(() => {
    document.getElementById('contactSuccess').style.display = 'none';
  }, 5000);
}

// ============================================================
// ADMIN DASHBOARD — Product Management
// ============================================================
function loadAdminDashboard() {
  const adminApp = document.getElementById('adminApp');
  if (!adminApp) return;

  const form = document.getElementById('adminProductForm');
  const resetBtn = document.getElementById('resetProductForm');
  const searchInput = document.getElementById('adminSearch');
  const openNewProductBtn = document.getElementById('adminOpenNewProductBtn');
  const productEditorPanel = document.getElementById('adminProductEditorPanel');
  const productEditorBody = document.getElementById('adminProductEditorBody');
  const productEditorToggleBtn = document.getElementById('adminProductEditorToggleBtn');
  const categoryBody = document.getElementById('adminCategoryBody');
  const categoryToggleBtn = document.getElementById('adminCategoryToggleBtn');
  const tableBody = document.getElementById('adminProductsTableBody');
  const emptyEl = document.getElementById('adminEmptyState');
  const editingHint = document.getElementById('adminEditingHint');
  const galleryUpload = document.getElementById('productGalleryUpload');
  const galleryUrlInput = document.getElementById('productGalleryUrl');
  const addGalleryUrlBtn = document.getElementById('addGalleryUrlBtn');
  const galleryList = document.getElementById('adminGalleryList');
  const ordersTableBody = document.getElementById('adminOrdersTableBody');
  const orderEmptyEl = document.getElementById('adminOrdersEmptyState');
  const orderSearchInput = document.getElementById('adminOrderSearch');
  const orderStatusFilter = document.getElementById('adminOrderStatusFilter');
  const orderCountEl = document.getElementById('adminOrdersCount');
  const overviewStatusChart = document.getElementById('overviewStatusChart');
  const overviewTopProducts = document.getElementById('overviewTopProducts');
  const reviewsTableBody = document.getElementById('adminReviewsTableBody');
  const reviewsEmptyEl = document.getElementById('adminReviewsEmptyState');
  const reviewSearchInput = document.getElementById('adminReviewSearch');
  const reviewProductFilter = document.getElementById('adminReviewProductFilter');
  const reviewsCountEl = document.getElementById('adminReviewsCount');
  const orderModal = document.getElementById('orderDetailsModal');
  const orderModalContent = document.getElementById('orderDetailsContent');
  const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
  const reviewModal = document.getElementById('reviewDetailsModal');
  const reviewModalContent = document.getElementById('reviewDetailsContent');
  const closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
  const tabButtons = document.querySelectorAll('.admin-nav-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');
  const resetProductsBtn = document.getElementById('resetProductsBtn');
  const cmsSiteName = document.getElementById('cmsSiteName');
  const cmsSlogan = document.getElementById('cmsSlogan');
  const cmsTopBarEnabled = document.getElementById('cmsTopBarEnabled');
  const cmsTopBarText = document.getElementById('cmsTopBarText');
  const cmsPhone = document.getElementById('cmsPhone');
  const cmsEmail = document.getElementById('cmsEmail');
  const cmsCurrencyPreset = document.getElementById('cmsCurrencyPreset');
  const cmsOfficeAddress = document.getElementById('cmsOfficeAddress');
  const cmsFooterBrandText = document.getElementById('cmsFooterBrandText');
  const cmsLogoUpload = document.getElementById('cmsLogoUpload');
  const cmsLogoPreview = document.getElementById('cmsLogoPreview');
  const cmsCategoryLabel = document.getElementById('cmsCategoryLabel');
  const cmsCategorySlug = document.getElementById('cmsCategorySlug');
  const cmsAddCategoryBtn = document.getElementById('cmsAddCategoryBtn');
  const cmsCategoryList = document.getElementById('cmsCategoryList');
  const cmsSaveAllBtn = document.getElementById('cmsSaveAllBtn');

  if (!form || !tableBody || !ordersTableBody || !reviewsTableBody) return;

  let editingId = null;
  let orders = getOrders();
  let productImages = [];
  let cmsSettings = getCmsSettings();
  let isProductEditorOpen = false;
  let isCategoryOpen = false;

  function formatMoney(value) {
    return formatCurrency(value);
  }

  function renderCmsCategoryList() {
    if (!cmsCategoryList) return;
    cmsCategoryList.innerHTML = (cmsSettings.categories || []).map((c, idx) => `
      <div class="admin-simple-item">
        <div class="admin-simple-meta">
          <strong>${c.label}</strong>
          <span>${c.slug}</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn-admin btn-admin-light" data-cms-cat-up="${idx}" ${idx === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-up"></i>
          </button>
          <button type="button" class="btn-admin btn-admin-light" data-cms-cat-down="${idx}" ${idx === (cmsSettings.categories || []).length - 1 ? 'disabled' : ''}>
            <i class="fas fa-arrow-down"></i>
          </button>
          <button type="button" class="btn-admin btn-admin-danger" data-cms-del-cat="${idx}">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderCmsPanel() {
    if (cmsSiteName) cmsSiteName.value = cmsSettings.siteName || '';
    if (cmsSlogan) cmsSlogan.value = cmsSettings.slogan || '';
    if (cmsTopBarEnabled) cmsTopBarEnabled.checked = cmsSettings.topBarEnabled !== false;
    if (cmsTopBarText) cmsTopBarText.value = cmsSettings.topBarText || cmsSettings.slogan || '';
    if (cmsPhone) cmsPhone.value = cmsSettings.phone || '';
    if (cmsEmail) cmsEmail.value = cmsSettings.email || '';
    if (cmsCurrencyPreset) {
      cmsCurrencyPreset.innerHTML = CURRENCY_PRESETS.map(p =>
        `<option value="${p.code}|${p.symbol}">${p.country} - ${p.code} (${p.symbol})</option>`
      ).join('');
      const currentCode = cmsSettings.currencyCode || 'PKR';
      const currentSymbol = cmsSettings.currencySymbol || 'Rs.';
      const currentValue = `${currentCode}|${currentSymbol}`;
      const matched = CURRENCY_PRESETS.some(p => `${p.code}|${p.symbol}` === currentValue);
      cmsCurrencyPreset.value = matched ? currentValue : 'PKR|Rs.';
    }
    if (cmsOfficeAddress) cmsOfficeAddress.value = cmsSettings.officeAddress || '';
    if (cmsFooterBrandText) cmsFooterBrandText.value = cmsSettings.footerBrandText || '';
    if (cmsLogoPreview) cmsLogoPreview.innerHTML = cmsSettings.logoUrl ? `<img src="${cmsSettings.logoUrl}" alt="Logo" style="max-height:46px;" />` : '<span class="admin-subtext">No logo uploaded</span>';
    renderCmsCategoryList();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderGalleryList() {
    if (!galleryList) return;
    if (!productImages.length) {
      galleryList.innerHTML = '<div class="admin-subtext">No gallery images yet.</div>';
      return;
    }
    galleryList.innerHTML = productImages.map((img, idx) => `
      <div class="admin-gallery-item">
        <img src="${img}" alt="gallery ${idx + 1}" />
        <div class="admin-gallery-item-meta">
          <strong>Image ${idx + 1}</strong>
          <span>${idx === 0 ? 'Main image' : 'Gallery image'}</span>
        </div>
        <div class="admin-gallery-actions">
          <button type="button" class="btn-admin btn-admin-light" data-gallery-up="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fas fa-arrow-up"></i></button>
          <button type="button" class="btn-admin btn-admin-light" data-gallery-down="${idx}" ${idx === productImages.length - 1 ? 'disabled' : ''}><i class="fas fa-arrow-down"></i></button>
          <button type="button" class="btn-admin btn-admin-danger" data-gallery-remove="${idx}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  function activateTab(tabName) {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    tabPanels.forEach(panel => {
      panel.style.display = panel.dataset.tabPanel === tabName ? 'block' : 'none';
    });
  }

  function setOverviewStats() {
    orders = getOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const categories = new Set(products.map(p => p.category)).size;
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    const lowStockCount = products.filter(p => Number(p.stock || 0) <= 5).length;

    const statsMap = {
      kpiRevenue: formatMoney(totalRevenue),
      kpiOrders: totalOrders,
      kpiProducts: totalProducts,
      kpiPending: pendingOrders,
      kpiDelivered: deliveredOrders,
      kpiCategories: categories,
      kpiAvgOrder: formatMoney(avgOrderValue),
      kpiLowStock: lowStockCount
    };

    Object.entries(statsMap).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
    renderOverviewInsights(orders);
  }

  function renderOverviewInsights(orderList) {
    const safeOrders = Array.isArray(orderList) ? orderList : [];
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const statusCounts = statuses.map(status => ({
      status,
      count: safeOrders.filter(o => String(o.status || '').toLowerCase() === status.toLowerCase()).length
    }));
    const maxCount = Math.max(1, ...statusCounts.map(s => s.count));
    if (overviewStatusChart) {
      overviewStatusChart.innerHTML = statusCounts.map(item => `
        <div class="admin-status-row">
          <div class="admin-status-label">
            <span>${item.status}</span>
            <strong>${item.count}</strong>
          </div>
          <div class="admin-status-bar">
            <span style="width:${Math.round((item.count / maxCount) * 100)}%"></span>
          </div>
        </div>
      `).join('');
    }

    const productPerfMap = new Map();
    safeOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const key = String(item.id || item.productId || item.name || 'unknown');
        const current = productPerfMap.get(key) || {
          name: item.name || 'Unknown product',
          qty: 0,
          revenue: 0
        };
        current.qty += Number(item.qty || 0);
        current.revenue += Number(item.price || 0) * Number(item.qty || 0);
        productPerfMap.set(key, current);
      });
    });

    const topProducts = Array.from(productPerfMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    if (overviewTopProducts) {
      if (!topProducts.length) {
        overviewTopProducts.innerHTML = '<p class="admin-subtext">No order data yet to calculate product performance.</p>';
      } else {
        const maxRevenue = Math.max(1, ...topProducts.map(p => p.revenue));
        overviewTopProducts.innerHTML = topProducts.map((p, idx) => `
          <div class="admin-top-product-row">
            <div class="admin-top-product-meta">
              <strong>#${idx + 1} ${escapeHtml(p.name)}</strong>
              <span>${p.qty} sold • ${formatMoney(p.revenue)}</span>
            </div>
            <div class="admin-top-product-bar">
              <span style="width:${Math.round((p.revenue / maxRevenue) * 100)}%"></span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  function renderProductRows() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const list = products.filter(p => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        String(p.sku || '').toLowerCase().includes(q)
      );
    });

    if (!list.length) {
      tableBody.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    tableBody.innerHTML = list.map(product => `
      <tr>
        <td>${product.id}</td>
        <td>
          <div class="admin-product-cell">
            <img src="${getProductImages(product)[0]}" alt="${product.name}" />
            <div>
              <strong>${product.name}</strong>
              <span>${getCategoryLabel(product.category)} | ${product.sku || '-'}</span>
            </div>
          </div>
        </td>
        <td>${formatCurrency(product.price)}</td>
        <td>${Number(product.stock || 0)}</td>
        <td>${formatCurrency(product.originalPrice)}</td>
        <td>${product.rating}</td>
        <td class="admin-actions-cell">
          <button class="btn-admin btn-admin-light" data-edit-id="${product.id}">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn-admin btn-admin-danger" data-delete-id="${product.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderOrderRows() {
    orders = getOrders();
    const q = (orderSearchInput?.value || '').trim().toLowerCase();
    const statusFilter = orderStatusFilter?.value || 'all';
    const list = orders.filter(order => {
      if (statusFilter !== 'all' && String(order.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      return (
        String(order.id || '').toLowerCase().includes(q) ||
        String(order.customer?.name || '').toLowerCase().includes(q) ||
        String(order.customer?.phone || '').toLowerCase().includes(q) ||
        String(order.status || '').toLowerCase().includes(q)
      );
    });

    if (orderCountEl) orderCountEl.textContent = `${list.length} orders`;

    if (!list.length) {
      ordersTableBody.innerHTML = '';
      if (orderEmptyEl) orderEmptyEl.style.display = 'block';
      return;
    }

    if (orderEmptyEl) orderEmptyEl.style.display = 'none';
    ordersTableBody.innerHTML = list.map(order => `
      <tr>
        <td>#${order.id}</td>
        <td>
          <strong>${order.customer?.name || '-'}</strong>
          <div class="admin-subtext">${order.customer?.phone || '-'}</div>
        </td>
        <td>${order.items?.length || 0}</td>
        <td>${formatMoney(order.total)}</td>
        <td>${order.date || '-'}</td>
        <td>
          <span class="admin-status-chip status-${String(order.status || '').toLowerCase()}">${order.status || 'Pending'}</span>
        </td>
        <td>
          <select class="admin-order-status-select" data-order-id="${order.id}">
            ${['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status =>
              `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <button class="btn-admin btn-admin-light" data-order-view-id="${order.id}">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderReviewProductOptions() {
    if (!reviewProductFilter) return;
    const selected = reviewProductFilter.value || 'all';
    const seen = new Set();
    const options = [{ id: 'all', name: 'All Products' }];
    products.forEach(p => {
      const key = String(p.id);
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ id: key, name: p.name || `Product #${key}` });
    });
    getReviews().forEach(r => {
      const key = String(r.productId || '');
      if (!key || seen.has(key)) return;
      seen.add(key);
      options.push({ id: key, name: r.productName || `Product #${key}` });
    });
    reviewProductFilter.innerHTML = options.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join('');
    reviewProductFilter.value = options.some(opt => opt.id === selected) ? selected : 'all';
  }

  function renderReviewRows() {
    const q = (reviewSearchInput?.value || '').trim().toLowerCase();
    const selectedProductId = reviewProductFilter?.value || 'all';
    const all = getReviews();
    const list = all.filter(r => {
      const byProduct = selectedProductId === 'all' || String(r.productId) === String(selectedProductId);
      if (!byProduct) return false;
      if (!q) return true;
      return (
        String(r.productName || '').toLowerCase().includes(q) ||
        String(r.name || '').toLowerCase().includes(q) ||
        String(r.status || '').toLowerCase().includes(q)
      );
    });

    if (reviewsCountEl) reviewsCountEl.textContent = `${list.length} reviews`;
    if (!list.length) {
      reviewsTableBody.innerHTML = '';
      if (reviewsEmptyEl) reviewsEmptyEl.style.display = 'block';
      return;
    }
    if (reviewsEmptyEl) reviewsEmptyEl.style.display = 'none';

    reviewsTableBody.innerHTML = list.map(review => `
      <tr>
        <td>${review.productName || '-'}</td>
        <td>
          <strong>${review.name || '-'}</strong>
          <div class="admin-subtext">${String(review.text || '').slice(0, 70)}${String(review.text || '').length > 70 ? '...' : ''}</div>
          ${review.imageUrl ? `<div class="admin-subtext" style="margin-top:6px;"><img src="${review.imageUrl}" alt="Review image" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--border);" /></div>` : ''}
        </td>
        <td>${review.rating || '-'}</td>
        <td><span class="admin-status-chip status-${String(review.status || 'pending').toLowerCase()}">${review.status || 'pending'}</span></td>
        <td>${review.date || '-'}</td>
        <td class="admin-actions-cell">
          <button class="btn-admin btn-admin-light" data-review-view-id="${review.id}">
            <i class="fas fa-eye"></i> View
          </button>
          ${String(review.status).toLowerCase() !== 'approved' ? `
            <button class="btn-admin btn-admin-light" data-review-approve-id="${review.id}">
              <i class="fas fa-check"></i> Approve
            </button>
          ` : ''}
          ${String(review.status).toLowerCase() !== 'declined' ? `
            <button class="btn-admin btn-admin-danger" data-review-decline-id="${review.id}">
              <i class="fas fa-ban"></i> Decline
            </button>
          ` : ''}
          <button class="btn-admin btn-admin-danger" data-review-delete-id="${review.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  function resetFormState() {
    editingId = null;
    form.reset();
    form.querySelector('#productCategory').value = 'mens';
    form.querySelector('#productBadge').value = 'new';
    form.querySelector('#productStock').value = '25';
    if (galleryUpload) galleryUpload.value = '';
    if (galleryUrlInput) galleryUrlInput.value = '';
    productImages = [];
    renderGalleryList();
    if (editingHint) editingHint.textContent = 'Creating a new product';
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
  }

  function setProductEditorOpen(isOpen) {
    isProductEditorOpen = !!isOpen;
    if (productEditorPanel) productEditorPanel.classList.toggle('open', isProductEditorOpen);
    if (productEditorBody) productEditorBody.classList.toggle('open', isProductEditorOpen);
    if (productEditorToggleBtn) {
      productEditorToggleBtn.setAttribute('aria-expanded', isProductEditorOpen ? 'true' : 'false');
    }
  }

  function setCategoryOpen(isOpen) {
    isCategoryOpen = !!isOpen;
    if (categoryBody) categoryBody.classList.toggle('open', isCategoryOpen);
    if (categoryToggleBtn) {
      categoryToggleBtn.setAttribute('aria-expanded', isCategoryOpen ? 'true' : 'false');
      const panel = categoryToggleBtn.closest('.admin-panel');
      if (panel) panel.classList.toggle('open', isCategoryOpen);
    }
  }

  function openProductEditor(isNew = false) {
    if (isNew) resetFormState();
    setProductEditorOpen(true);
    const firstInput = form.querySelector('#productName');
    if (productEditorPanel) {
      productEditorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      productEditorPanel.classList.add('admin-panel-highlight');
      setTimeout(() => productEditorPanel.classList.remove('admin-panel-highlight'), 900);
    } else {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => firstInput?.focus(), 250);
  }

  function saveAndRefresh(message) {
    saveProducts(products);
    setOverviewStats();
    renderProductRows();
    renderOrderRows();
    renderReviewProductOptions();
    renderReviewRows();
    showToast(message);
    renderFilterButtons('all');
  }

  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = form.querySelector('#productName').value.trim();
    const category = form.querySelector('#productCategory').value.trim();
    const price = Number(form.querySelector('#productPrice').value);
    const originalPrice = Number(form.querySelector('#productOriginalPrice').value);
    const rating = Number(form.querySelector('#productRating').value);
    const reviews = Number(form.querySelector('#productReviews').value);
    const badge = form.querySelector('#productBadge').value;
    const image = form.querySelector('#productImage').value.trim();
    const description = form.querySelector('#productDescription').value.trim();
    const highlightsInput = String(form.querySelector('#productHighlights')?.value || '');
    const highlights = highlightsInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    const stock = Number(form.querySelector('#productStock').value);
    const skuRaw = form.querySelector('#productSku').value.trim();
    const sku = skuRaw || `SE-${Date.now().toString().slice(-6)}`;
    const allImages = productImages.length ? [...productImages] : [image].filter(Boolean);
    const primaryImage = allImages[0] || image;

    if (!name || !category || !primaryImage || !description) {
      alert('Please fill all required fields.');
      return;
    }
    if (price <= 0 || originalPrice <= 0) {
      alert('Price must be greater than 0.');
      return;
    }
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    }
    if (stock < 0) {
      alert('Stock cannot be negative.');
      return;
    }

    if (editingId) {
      const updatedProduct = {
        id: editingId,
        name,
        category,
        price,
        originalPrice,
        rating,
        reviews,
        badge,
        image: primaryImage,
        images: allImages,
        description,
        stock,
        sku,
        highlights
      };
      if (backendEnabled) {
        try {
          await apiPost('products/save.php', updatedProduct);
        } catch (error) {
          alert('Could not update product right now.');
          return;
        }
      }
      products = products.map(p => p.id === editingId ? updatedProduct : p);
      saveAndRefresh('Product updated successfully.');
    } else {
      const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const nextProduct = {
        id: nextId,
        name,
        category,
        price,
        originalPrice,
        rating,
        reviews,
        badge,
        image: primaryImage,
        images: allImages,
        description,
        stock,
        sku,
        highlights
      };
      if (backendEnabled) {
        try {
          // For backend inserts, omit id so server creates a new row.
          const { id: _omitId, ...payload } = nextProduct;
          const saved = await apiPost('products/save.php', payload);
          const savedId = Number(saved?.id);
          products.unshift(Number.isFinite(savedId) && savedId > 0 ? { ...nextProduct, id: savedId } : nextProduct);
        } catch (error) {
          alert('Could not save product right now.');
          return;
        }
      } else {
        products.unshift(nextProduct);
      }
      saveAndRefresh('Product added successfully.');
    }

    resetFormState();
  });

  resetBtn?.addEventListener('click', function() {
    resetFormState();
  });

  searchInput?.addEventListener('input', function() {
    renderProductRows();
  });

  openNewProductBtn?.addEventListener('click', function() {
    openProductEditor(true);
  });

  productEditorToggleBtn?.addEventListener('click', function() {
    setProductEditorOpen(!isProductEditorOpen);
    if (isProductEditorOpen) {
      setTimeout(() => form.querySelector('#productName')?.focus(), 240);
    }
  });

  categoryToggleBtn?.addEventListener('click', function() {
    setCategoryOpen(!isCategoryOpen);
  });

  addGalleryUrlBtn?.addEventListener('click', function() {
    const url = String(galleryUrlInput?.value || '').trim();
    if (!url) return;
    productImages.push(url);
    if (galleryUrlInput) galleryUrlInput.value = '';
    renderGalleryList();
  });

  galleryUpload?.addEventListener('change', function() {
    const files = Array.from(galleryUpload.files || []);
    files.forEach(file => {
      if (file.size > 1.2 * 1024 * 1024) {
        alert(`"${file.name}" is too large. Please use images under 1.2MB.`);
        return;
      }
      if (productImages.length >= 8) {
        alert('Maximum 8 gallery images allowed per product.');
        return;
      }
      const reader = new FileReader();
      reader.onload = function() {
        if (typeof reader.result === 'string') {
          productImages.push(reader.result);
          renderGalleryList();
        }
      };
      reader.readAsDataURL(file);
    });
  });

  galleryList?.addEventListener('click', function(event) {
    const upBtn = event.target.closest('[data-gallery-up]');
    const downBtn = event.target.closest('[data-gallery-down]');
    const removeBtn = event.target.closest('[data-gallery-remove]');
    if (upBtn) {
      const idx = Number(upBtn.getAttribute('data-gallery-up'));
      if (idx > 0) {
        [productImages[idx - 1], productImages[idx]] = [productImages[idx], productImages[idx - 1]];
        renderGalleryList();
      }
    }
    if (downBtn) {
      const idx = Number(downBtn.getAttribute('data-gallery-down'));
      if (idx < productImages.length - 1) {
        [productImages[idx + 1], productImages[idx]] = [productImages[idx], productImages[idx + 1]];
        renderGalleryList();
      }
    }
    if (removeBtn) {
      const idx = Number(removeBtn.getAttribute('data-gallery-remove'));
      productImages.splice(idx, 1);
      renderGalleryList();
    }
  });

  orderSearchInput?.addEventListener('input', function() {
    renderOrderRows();
  });

  orderStatusFilter?.addEventListener('change', function() {
    renderOrderRows();
  });

  reviewSearchInput?.addEventListener('input', function() {
    renderReviewRows();
  });

  reviewProductFilter?.addEventListener('change', function() {
    renderReviewRows();
  });

  tableBody.addEventListener('click', async function(event) {
    const editBtn = event.target.closest('[data-edit-id]');
    const deleteBtn = event.target.closest('[data-delete-id]');

    if (editBtn) {
      const id = Number(editBtn.getAttribute('data-edit-id'));
      const product = products.find(p => p.id === id);
      if (!product) return;
      editingId = id;
      form.querySelector('#productName').value = product.name;
      form.querySelector('#productCategory').value = product.category;
      form.querySelector('#productPrice').value = product.price;
      form.querySelector('#productOriginalPrice').value = product.originalPrice;
      form.querySelector('#productRating').value = product.rating;
      form.querySelector('#productReviews').value = product.reviews;
      form.querySelector('#productBadge').value = product.badge;
      form.querySelector('#productImage').value = product.image;
      form.querySelector('#productDescription').value = product.description;
      form.querySelector('#productHighlights').value = getProductHighlights(product).join('\n');
      form.querySelector('#productStock').value = product.stock ?? 25;
      form.querySelector('#productSku').value = product.sku || '';
      productImages = getProductImages(product);
      renderGalleryList();
      if (editingHint) editingHint.textContent = `Editing product #${id}`;
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
      openProductEditor(false);
    }

    if (deleteBtn) {
      const id = Number(deleteBtn.getAttribute('data-delete-id'));
      const product = products.find(p => p.id === id);
      if (!product) return;
      const ok = confirm(`Delete "${product.name}"? This cannot be undone.`);
      if (!ok) return;
      if (backendEnabled) {
        try {
          await apiPost('products/delete.php', { id });
        } catch (error) {
          alert('Could not delete product right now.');
          return;
        }
      }
      products = products.filter(p => p.id !== id);
      if (editingId === id) resetFormState();
      saveAndRefresh('Product deleted successfully.');
    }
  });

  ordersTableBody.addEventListener('change', async function(event) {
    const select = event.target.closest('.admin-order-status-select');
    if (!select) return;
    const orderId = select.getAttribute('data-order-id');
    const newStatus = select.value;
    if (backendEnabled) {
      try {
        await apiPost('orders/status.php', { id: orderId, status: newStatus });
      } catch (error) {
        alert('Could not update order status right now.');
        return;
      }
    }
    orders = getOrders().map(order => String(order.id) === String(orderId) ? { ...order, status: newStatus } : order);
    saveOrders(orders);
    renderOrderRows();
    setOverviewStats();
    showToast(`Order #${orderId} updated to ${newStatus}.`);
  });

  reviewsTableBody.addEventListener('click', async function(event) {
    const viewBtn = event.target.closest('[data-review-view-id]');
    const approveBtn = event.target.closest('[data-review-approve-id]');
    const declineBtn = event.target.closest('[data-review-decline-id]');
    const deleteBtn = event.target.closest('[data-review-delete-id]');

    if (viewBtn) {
      const reviewId = viewBtn.getAttribute('data-review-view-id');
      const review = getReviews().find(r => String(r.id) === String(reviewId));
      if (!review || !reviewModal || !reviewModalContent) return;
      reviewModalContent.innerHTML = `
        <div class="admin-order-grid">
          <div><strong>Product</strong><span>${escapeHtml(review.productName || '-')}</span></div>
          <div><strong>Reviewer</strong><span>${escapeHtml(review.name || '-')}</span></div>
          <div><strong>Rating</strong><span>${escapeHtml(String(review.rating || '-'))}</span></div>
          <div><strong>Status</strong><span>${escapeHtml(String(review.status || 'pending'))}</span></div>
          <div><strong>Date</strong><span>${escapeHtml(review.date || '-')}</span></div>
        </div>
        <h4>Review Text</h4>
        <p style="line-height:1.75; color:#333;">${escapeHtml(review.text || '-')}</p>
        ${review.imageUrl ? `<h4 style="margin-top:14px;">Review Image</h4><a href="${escapeHtml(review.imageUrl)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(review.imageUrl)}" alt="Review image" style="max-width:100%;max-height:420px;border-radius:10px;border:1px solid var(--border);" /></a>` : '<p class="admin-subtext">No image attached.</p>'}
      `;
      reviewModal.classList.add('show');
    }

    if (approveBtn) {
      const reviewId = approveBtn.getAttribute('data-review-approve-id');
      if (backendEnabled) {
        try {
          await apiPost('reviews/status.php', { id: Number(reviewId), status: 'approved' });
        } catch (error) {
          alert('Could not approve review right now.');
          return;
        }
      }
      const next = getReviews().map(r => String(r.id) === String(reviewId) ? { ...r, status: 'approved' } : r);
      saveReviews(next);
      renderReviewProductOptions();
      renderReviewRows();
      showToast('Review approved.');
    }

    if (declineBtn) {
      const reviewId = declineBtn.getAttribute('data-review-decline-id');
      if (backendEnabled) {
        try {
          await apiPost('reviews/status.php', { id: Number(reviewId), status: 'declined' });
        } catch (error) {
          alert('Could not decline review right now.');
          return;
        }
      }
      const next = getReviews().map(r => String(r.id) === String(reviewId) ? { ...r, status: 'declined' } : r);
      saveReviews(next);
      renderReviewProductOptions();
      renderReviewRows();
      showToast('Review declined.');
    }

    if (deleteBtn) {
      const reviewId = deleteBtn.getAttribute('data-review-delete-id');
      const ok = confirm('Delete this review?');
      if (!ok) return;
      if (backendEnabled) {
        try {
          await apiPost('reviews/delete.php', { id: Number(reviewId) });
        } catch (error) {
          alert('Could not delete review right now.');
          return;
        }
      }
      const next = getReviews().filter(r => String(r.id) !== String(reviewId));
      saveReviews(next);
      renderReviewProductOptions();
      renderReviewRows();
      showToast('Review deleted.');
    }
  });

  ordersTableBody.addEventListener('click', function(event) {
    const viewBtn = event.target.closest('[data-order-view-id]');
    if (!viewBtn) return;
    const orderId = viewBtn.getAttribute('data-order-view-id');
    const order = getOrders().find(o => String(o.id) === String(orderId));
    if (!order || !orderModal || !orderModalContent) return;

    orderModalContent.innerHTML = `
      <div class="admin-order-grid">
        <div><strong>Order ID</strong><span>#${escapeHtml(order.id)}</span></div>
        <div><strong>Status</strong><span>${escapeHtml(order.status)}</span></div>
        <div><strong>Date</strong><span>${escapeHtml(order.date)}</span></div>
        <div><strong>Payment</strong><span>${escapeHtml(order.paymentMethod || '-')}</span></div>
      </div>
      <h4>Customer Details</h4>
      <div class="admin-order-grid">
        <div><strong>Name</strong><span>${escapeHtml(order.customer?.name)}</span></div>
        <div><strong>Phone</strong><span>${escapeHtml(order.customer?.phone)}</span></div>
        <div><strong>Email</strong><span>${escapeHtml(order.customer?.email || '-')}</span></div>
        <div><strong>City</strong><span>${escapeHtml(order.customer?.city || '-')}</span></div>
        <div><strong>Province</strong><span>${escapeHtml(order.customer?.province || '-')}</span></div>
        <div><strong>Address</strong><span>${escapeHtml(order.customer?.address || '-')}</span></div>
        <div><strong>Notes</strong><span>${escapeHtml(order.customer?.notes || '-')}</span></div>
      </div>
      <h4>Items</h4>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${Number(item.qty || 0)}</td>
                <td>${formatMoney(item.price || 0)}</td>
                <td>${formatMoney((item.qty || 0) * (item.price || 0))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="admin-order-totals">
        <div><span>Subtotal</span><strong>${formatMoney(order.subtotal || 0)}</strong></div>
        <div><span>Shipping</span><strong>${formatMoney(order.shipping || 0)}</strong></div>
        <div><span>Grand Total</span><strong>${formatMoney(order.total || 0)}</strong></div>
      </div>
    `;
    orderModal.classList.add('show');
  });

  closeOrderModalBtn?.addEventListener('click', function() {
    orderModal?.classList.remove('show');
  });

  orderModal?.addEventListener('click', function(event) {
    if (event.target === orderModal) orderModal.classList.remove('show');
  });

  closeReviewModalBtn?.addEventListener('click', function() {
    reviewModal?.classList.remove('show');
  });

  reviewModal?.addEventListener('click', function(event) {
    if (event.target === reviewModal) reviewModal.classList.remove('show');
  });

  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      activateTab(btn.dataset.tab);
    });
  });

  resetProductsBtn?.addEventListener('click', function() {
    const ok = confirm('This will remove current saved products and restore default products. Continue?');
    if (!ok) return;
    products = ensureProductsSeeded();
    resetFormState();
    renderProductRows();
    renderReviewProductOptions();
    renderReviewRows();
    setOverviewStats();
    showToast('Product data reset successfully.');
  });

  cmsAddCategoryBtn?.addEventListener('click', function() {
    const label = String(cmsCategoryLabel?.value || '').trim();
    const slug = String(cmsCategorySlug?.value || '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!label || !slug) return;
    if (cmsSettings.categories.some(c => c.slug === slug)) {
      alert('Category slug already exists.');
      return;
    }
    cmsSettings.categories.push({ slug, label });
    if (cmsCategoryLabel) cmsCategoryLabel.value = '';
    if (cmsCategorySlug) cmsCategorySlug.value = '';
    saveCmsSettings(cmsSettings);
    renderCmsCategoryList();
    applyCmsSettings();
  });

  cmsCategoryList?.addEventListener('click', function(event) {
    const upBtn = event.target.closest('[data-cms-cat-up]');
    const downBtn = event.target.closest('[data-cms-cat-down]');
    const btn = event.target.closest('[data-cms-del-cat]');
    if (upBtn) {
      const idx = Number(upBtn.getAttribute('data-cms-cat-up'));
      if (idx > 0) {
        [cmsSettings.categories[idx - 1], cmsSettings.categories[idx]] = [cmsSettings.categories[idx], cmsSettings.categories[idx - 1]];
        saveCmsSettings(cmsSettings);
        renderCmsCategoryList();
        applyCmsSettings();
      }
      return;
    }
    if (downBtn) {
      const idx = Number(downBtn.getAttribute('data-cms-cat-down'));
      if (idx < cmsSettings.categories.length - 1) {
        [cmsSettings.categories[idx + 1], cmsSettings.categories[idx]] = [cmsSettings.categories[idx], cmsSettings.categories[idx + 1]];
        saveCmsSettings(cmsSettings);
        renderCmsCategoryList();
        applyCmsSettings();
      }
      return;
    }
    if (!btn) return;
    const idx = Number(btn.getAttribute('data-cms-del-cat'));
    cmsSettings.categories.splice(idx, 1);
    saveCmsSettings(cmsSettings);
    renderCmsCategoryList();
    applyCmsSettings();
  });

  cmsLogoUpload?.addEventListener('change', function() {
    const file = cmsLogoUpload.files?.[0];
    if (!file) return;
    if (file.size > 1.2 * 1024 * 1024) {
      alert('Logo file should be under 1.2MB.');
      cmsLogoUpload.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function() {
      if (typeof reader.result === 'string') {
        cmsSettings.logoUrl = reader.result;
        if (cmsLogoPreview) cmsLogoPreview.innerHTML = `<img src="${reader.result}" alt="Logo" style="max-height:46px;" />`;
      }
    };
    reader.readAsDataURL(file);
  });


  cmsSaveAllBtn?.addEventListener('click', function() {
    const nextSiteName = String(cmsSiteName?.value || cmsSettings.siteName).trim() || 'ShopEase';
    cmsSettings.siteName = nextSiteName;
    cmsSettings.slogan = String(cmsSlogan?.value || '').trim();
    cmsSettings.topBarEnabled = cmsTopBarEnabled ? !!cmsTopBarEnabled.checked : true;
    cmsSettings.topBarText = String(cmsTopBarText?.value || '').trim();
    cmsSettings.phone = String(cmsPhone?.value || '').trim();
    cmsSettings.email = String(cmsEmail?.value || '').trim();
    const presetValue = String(cmsCurrencyPreset?.value || 'PKR|Rs.');
    const [selectedCode, selectedSymbol] = presetValue.split('|');
    cmsSettings.currencyCode = String(selectedCode || 'PKR').trim() || 'PKR';
    cmsSettings.currencySymbol = String(selectedSymbol || 'Rs.').trim() || 'Rs.';
    cmsSettings.officeAddress = String(cmsOfficeAddress?.value || '').trim();
    cmsSettings.footerBrandText = String(cmsFooterBrandText?.value || '').trim();
    // Footer text is now always auto-generated from site name.
    delete cmsSettings.footerText;
    saveCmsSettings(cmsSettings);
    applyCmsSettings();
    showToast('Customization saved.');
  });

  setOverviewStats();
  renderProductRows();
  renderOrderRows();
  renderReviewProductOptions();
  renderReviewRows();
  renderCmsPanel();
  resetFormState();
  setProductEditorOpen(false);
  setCategoryOpen(false);
  activateTab('overview');
}

function requireAdminAuth() {
  const adminApp = document.getElementById('adminApp');
  if (!adminApp) return true;
  if (isAdminLoggedIn()) return true;
  window.location.href = 'wp-admin.html';
  return false;
}

async function setupAdminLoginPage() {
  const loginPage = document.getElementById('adminLoginPage');
  if (!loginPage) return;

  if (canUseBackend()) {
    try {
      const me = await apiGet('auth/me.php');
      if (me?.ok && me.loggedIn) {
        window.location.href = 'admin.html';
        return;
      }
    } catch (error) {}
  } else if (isAdminLoggedIn()) {
    window.location.href = 'admin.html';
    return;
  }

  const form = document.getElementById('adminLoginForm');
  const userEl = document.getElementById('adminUser');
  const passEl = document.getElementById('adminPass');
  const errorEl = document.getElementById('adminLoginError');
  if (!form || !userEl || !passEl || !errorEl) return;

  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const user = userEl.value.trim();
    const pass = passEl.value;

    if (canUseBackend()) {
      try {
        const login = await apiPost('auth/login.php', { username: user, password: pass });
        if (login?.ok) {
          setAdminLoggedIn(true);
          window.location.href = 'admin.html';
          return;
        }
      } catch (error) {}
    } else if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      setAdminLoggedIn(true);
      window.location.href = 'admin.html';
      return;
    }

    errorEl.style.display = 'block';
    errorEl.textContent = 'Invalid username or password.';
  });
}

function setupAdminLogout() {
  const btn = document.getElementById('adminLogoutBtn');
  if (!btn) return;
  btn.addEventListener('click', async function() {
    if (canUseBackend()) {
      try { await apiPost('auth/logout.php', {}); } catch (error) {}
    }
    setAdminLoggedIn(false);
    window.location.href = 'wp-admin.html';
  });
}

function applyCmsSettings() {
  const cms = getCmsSettings();
  const theme = THEME_PRESETS[cms.theme] || THEME_PRESETS.classic;
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--text', theme.text);

  document.querySelectorAll('.logo').forEach(logo => {
    if (cms.logoUrl) {
      logo.innerHTML = `<img src="${cms.logoUrl}" alt="${cms.siteName}" style="height:34px; vertical-align:middle;" />`;
    } else {
      const safeName = String(cms.siteName || '').replace(/</g, '&lt;').trim();
      const parts = safeName.split(/\s+/).filter(Boolean);
      const firstPart = parts[0] || 'ShopEase';
      const restPart = parts.slice(1).join(' ');
      logo.innerHTML = restPart ? `${firstPart} <span>${restPart}</span>` : firstPart;
    }
  });
  document.querySelectorAll('.top-bar').forEach(el => {
    const enabled = cms.topBarEnabled !== false;
    const topText = String(cms.topBarText || cms.slogan || '').trim();
    el.style.display = enabled ? '' : 'none';
    if (enabled && topText) el.textContent = topText;
  });

  document.querySelectorAll('.footer-bottom p').forEach(el => {
    el.textContent = buildDefaultFooterText(cms.siteName);
  });

  const footerBrandText = String(cms.footerBrandText || '').trim();
  if (footerBrandText) {
    document.querySelectorAll('.footer-brand p').forEach(el => {
      el.textContent = footerBrandText;
    });
  }

  const contactPhone = String(cms.phone || '').trim();
  const contactEmail = String(cms.email || '').trim();
  const contactAddress = String(cms.officeAddress || '').trim();

  document.querySelectorAll('.footer-contact-item').forEach(item => {
    const icon = item.querySelector('i');
    const textEl = item.querySelector('span');
    const iconClass = icon?.className || '';
    if (!textEl) return;
    if (iconClass.includes('fa-phone') && contactPhone) textEl.textContent = contactPhone;
    if (iconClass.includes('fa-envelope') && contactEmail) textEl.textContent = contactEmail;
    if (iconClass.includes('fa-map-marker-alt') && contactAddress) textEl.textContent = contactAddress;
  });

  document.querySelectorAll('.info-item').forEach(item => {
    const icon = item.querySelector('.info-icon i');
    const textEl = item.querySelector('.info-text span');
    const iconClass = icon?.className || '';
    if (!textEl) return;
    if (iconClass.includes('fa-phone') && contactPhone) textEl.textContent = contactPhone;
    if (iconClass.includes('fa-envelope') && contactEmail) textEl.textContent = contactEmail;
    if (iconClass.includes('fa-map-marker-alt') && contactAddress) textEl.textContent = contactAddress;
  });

  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const builtIns = Object.values(cms.pages || {}).filter(p => p.inHeader);
    const links = builtIns.map(p => {
      const isActive = (window.location.pathname.endsWith(p.url) || (p.url === 'index.html' && (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html'))));
      return `<li><a href="${p.url}"${isActive ? ' class="active"' : ''}>${p.title}</a></li>`;
    });
    navLinks.innerHTML = links.join('');
  }

  const footerQuick = Array.from(document.querySelectorAll('.footer-col')).find(col => (col.querySelector('h4')?.textContent || '').toLowerCase().includes('quick'));
  if (footerQuick) {
    const ul = footerQuick.querySelector('ul');
    if (ul) {
      const links = Object.values(cms.pages || {}).filter(p => p.inFooter);
      ul.innerHTML = links.map(p => `<li><a href="${p.url}">${p.title}</a></li>`).join('');
    }
  }

  const footerCategories = Array.from(document.querySelectorAll('.footer-col')).find(col => (col.querySelector('h4')?.textContent || '').toLowerCase().includes('categories'));
  if (footerCategories) {
    const ul = footerCategories.querySelector('ul');
    if (ul) {
      const categories = Array.isArray(cms.categories) ? cms.categories : [];
      ul.innerHTML = categories.map(c => `<li><a href="shop.html?cat=${encodeURIComponent(c.slug)}">${String(c.label || c.slug)}</a></li>`).join('');
    }
  }
  prettifyLinks();
}

// ============================================================
// TOAST NOTIFICATION (small popup at bottom-right)
// ============================================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.querySelector('span').textContent = message;
  toast.classList.add('show');

  // Automatically hide after 2.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ============================================================
// HOME PAGE — Load featured products (first 8)
// ============================================================
function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  // Show only first 8 products on home page
  const featured = products.slice(0, 8);
  grid.innerHTML = featured.map(p => createProductCard(p)).join('');
}

// ============================================================
// RUN ON PAGE LOAD
// Different pages need different things to load
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
  applyCmsSettings();
  prettifyLinks();
  products = ensureProductsSeeded();
  await initBackendData();
  await setupAdminLoginPage();
  if (!requireAdminAuth()) return;
  setupAdminLogout();
  const header = document.querySelector('.header');
  const navMain = document.querySelector('.nav-main');
  const navLinks = document.querySelector('.nav-links');

  if (header && navMain && navLinks) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'nav-toggle';
    toggleBtn.setAttribute('type', 'button');
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    navMain.insertBefore(toggleBtn, navLinks);

    function closeMenu() {
      header.classList.remove('nav-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }

    toggleBtn.addEventListener('click', function() {
      const isOpen = header.classList.toggle('nav-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggleBtn.innerHTML = isOpen
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });

    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });

    document.addEventListener('click', function(event) {
      if (!header.classList.contains('nav-open')) return;
      if (!header.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  document.addEventListener('click', function(event) {
    const anchor = event.target.closest('a[data-file-href]');
    if (!anchor) return;
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    window.location.href = anchor.getAttribute('data-file-href') || anchor.href;
  });

  // Always update the cart badge count in header
  updateCartBadge();

  // Detect which page we are on by checking for unique elements
  if (document.getElementById('featuredGrid')) {
    // Home page
    loadFeaturedProducts();
  }

  if (document.getElementById('productsGrid')) {
    // Shop page
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const searchParam = urlParams.get('q') || '';
    const categories = getAvailableCategories();
    const initialCat = catParam && (catParam === 'all' || categories.includes(catParam))
      ? catParam
      : 'all';

    renderFilterButtons(initialCat);
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchParam) searchInput.value = searchParam;
    loadProducts(initialCat, searchParam);
  }

  if (document.getElementById('cartItems')) {
    // Cart page
    loadCartPage();
  }

  if (document.getElementById('orderItemsList')) {
    // Order/checkout page
    loadOrderPage();
  }

  if (document.getElementById('successOrderId')) {
    // Success page
    loadSuccessPage();
  }

  if (document.getElementById('productDetailContent')) {
    // Product details page
    loadProductPage();
  }

  loadAdminDashboard();

});
