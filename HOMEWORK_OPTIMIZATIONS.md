# Performance Optimization Homework

**Your task:** We've fixed the major issues, but there's still plenty of optimization work to practice! Below are **25 additional performance improvements** you can implement.

Each optimization lists:
- What the issue is
- Where to find it in the code
- Which Core Web Vital metric it impacts
- Difficulty level
- Expected performance gain

---

## 🔴 CRITICAL PRIORITY (Highest Impact)

### 1. Google Fonts - Blocking Render + Font Loading Strategy

**Metric Impact:** LCP (-300-600ms), CLS (-0.05-0.1), FCP (-150-300ms)
**Difficulty:** Medium
**Location:** `public/index.html` lines 16-24

**The Problem:**
- Google Fonts CSS (~4KB) must download before rendering
- Font files (~100KB combined) cause FOUT (Flash of Unstyled Text)
- 2 HTTP requests to different domains (googleapis.com + gstatic.com)

**Your Task:**
Self-host the fonts for better performance:
1. Download Work Sans WOFF2 files from google-webfonts-helper.herokuapp.com
2. Add `@font-face` declarations with `font-display: swap`
3. Preload critical font weights only
4. Remove Google Fonts `<link>` tags

---

### 2. Playfair Display Ghost Font - Never Loaded But Referenced

**Metric Impact:** LCP (-0 to -3000ms), CLS (-0.02-0.05)
**Difficulty:** Easy
**Location:** `public/css/hero.css` line 97

**The Problem:**
```css
.hero-subtitle {
  font-family: 'Playfair Display', serif;  /* ❌ Font never loaded! */
}
```
- Browser tries to find 'Playfair Display' for 3 seconds
- Falls back to serif after timeout
- Causes invisible text (FOIT) during wait

**Your Task:**
Either remove the reference or actually load the font:
```css
/* Option 1: Use system serif stack */
font-family: Georgia, 'Times New Roman', serif;

/* Option 2: Load Playfair Display in HTML */
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
```

---

### 3. Critical CSS Not Inlined - Render Blocking

**Metric Impact:** FCP (-300-800ms), LCP (-200-500ms)
**Difficulty:** Medium
**Location:** `public/index.html` line 170

**The Problem:**
- `hero.css` blocks rendering while it downloads
- On slow connections, users see blank screen

**Your Task:**
1. Inline critical above-the-fold CSS in `<style>` tag
2. Load remaining CSS asynchronously
3. Use Critical CSS extraction tool (optional)

---

### 4. GSAP Library - 88KB Blocking Third-Party Script

**Metric Impact:** FCP (-200-400ms), TBT (-200ms)
**Difficulty:** Medium
**Location:** `public/index.html` line 9

**The Problem:**
- 88KB JavaScript library for simple opacity/transform animations
- Loads from cdnjs.cloudflare.com (DNS + TLS overhead)

**Your Task:**
Replace GSAP with vanilla CSS animations or Web Animations API:

**CSS Approach:**
```css
.hero-title {
  animation: fadeInUp 1s ease 0.3s both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Web Animations API:**
```javascript
document.querySelector('.hero-title').animate([
  { opacity: 0, transform: 'translateY(50px)' },
  { opacity: 1, transform: 'translateY(0)' }
], { duration: 1000, delay: 300, fill: 'both' });
```

---

### 5. No Resource Hints for Unsplash Images

**Metric Impact:** LCP (-100-300ms)
**Difficulty:** Easy
**Location:** `public/index.html` (missing in `<head>`)

**The Problem:**
- Hero images load from images.unsplash.com
- No `preconnect` = DNS lookup + TCP + TLS before download

**Your Task:**
Add before your preload links:
```html
<link rel="dns-prefetch" href="https://images.unsplash.com">
<link rel="preconnect" href="https://images.unsplash.com">
```

---

## 🟠 HIGH PRIORITY (Medium-High Impact)

### 6. Google Analytics - Blocking Third-Party Script

**Metric Impact:** FCP (-100-300ms), TBT (-150ms), INP (better responsiveness)
**Difficulty:** Easy
**Location:** `public/index.html` lines 493-507

**The Problem:**
- ~45KB JavaScript executes on main thread during page load
- Analytics aren't critical for initial render

**Your Task:**
Delay GA until after page is interactive:
```javascript
window.addEventListener('load', () => {
  setTimeout(() => {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-7012WQ517Q';
    script.async = true;
    document.head.appendChild(script);
  }, 2000); // Delay 2s after load
});
```

---

### 7. Web Vitals Library - Loaded from CDN

**Metric Impact:** FCP (-50-150ms), TBT (-80ms)
**Difficulty:** Easy
**Location:** `public/js/webVitals.js` line 11

**The Problem:**
- Loads from unpkg.com (third-party CDN)
- ~25KB library download

**Your Task:**
Self-host the library:
```bash
npm install web-vitals
cp node_modules/web-vitals/dist/web-vitals.attribution.js public/js/vendor/
```

Update import:
```javascript
import { onCLS, onFCP, onINP, onLCP, onTTFB } from './vendor/web-vitals.attribution.js';
```

---

### 8. Product Images - No Responsive Sizes

**Metric Impact:** Page Weight (-600KB-1.2MB on mobile)
**Difficulty:** Medium
**Location:** `api/index.js` lines 7-56, `public/js/productRenderer.js`

**The Problem:**
- All product images load at w=1200 regardless of viewport
- Mobile cards are ~400px wide but download 1200px images
- No AVIF/WebP formats

**Your Task:**
1. Update API to return multiple sizes in srcset
2. Use `<picture>` element in productRenderer.js
3. Serve AVIF/WebP with JPEG fallback

---

### 9. No API Compression

**Metric Impact:** TTFB (-10-30ms), Transfer Size (-1KB)
**Difficulty:** Easy
**Location:** `api/index.js`

**The Problem:**
- JSON responses not compressed
- ~1.5KB could be ~500 bytes with gzip

**Your Task:**
Add compression middleware to Hono:
```javascript
import { compress } from 'hono/compress';

app.use('*', compress());
```

---

### 10. No Cache Headers for Static Assets

**Metric Impact:** Repeat visit FCP (-200-500ms), TTFB (-50-150ms)
**Difficulty:** Easy
**Location:** `vercel.json` (missing configuration)

**The Problem:**
- CSS/JS files re-downloaded on every visit
- No browser caching strategy

**Your Task:**
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]
    },
    {
      "source": "/js/(.*)",
      "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]
    }
  ]
}
```

---

## 🟡 MEDIUM PRIORITY (Optimization Opportunities)

### 11. Artificial API Delays (Demo Code)

**Metric Impact:** TTFB (-150ms), INP (-400ms)
**Difficulty:** Easy
**Location:** `api/index.js` lines 63, 76

**The Problem:**
- Intentional delays for demo: 150ms on `/products`, 400ms on `/products/:id`
- Slows real performance unnecessarily

**Your Task:**
Remove the delay calls:
```javascript
app.get('/products', async (c) => {
  // await delay(150); // REMOVE THIS
  return c.json(products);
});
```

---

### 12. Product Renderer - Synchronous DOM Operations

**Metric Impact:** INP (-50-150ms), FCP (-30-80ms)
**Difficulty:** Easy
**Location:** `public/js/productRenderer.js` lines 39-54

**The Problem:**
- Each `appendChild` forces layout recalculation
- Reading `offsetHeight` causes layout thrashing (6 forced layouts for 6 products)

**Your Task:**
Use DocumentFragment to batch operations:
```javascript
const fragment = document.createDocumentFragment();

products.forEach(product => {
  const card = createProductCard(product);
  fragment.appendChild(card); // Off-DOM, no reflow
});

productGrid.appendChild(fragment); // Single DOM append
```

---

### 13. Hover Handler - Unoptimized API Calls

**Metric Impact:** INP (-560ms)
**Difficulty:** Medium
**Location:** `public/js/animations.js` lines 434-517

**The Problem:**
- API fetch on every hover (400ms delay!)
- `querySelectorAll` on every hover
- Wishlist icon created after fetch (delayed UI)

**Your Task:**
1. Include wishlist status in initial `/api/products` response
2. Render wishlist icon immediately in `productRenderer.js`
3. Remove hover API fetch entirely
4. Cache DOM queries outside event handler

---

### 14. Animated Orbs - Heavy Blur Radius

**Metric Impact:** FPS (+30-40 fps)
**Difficulty:** Easy
**Location:** `public/js/animations.js` lines 96-316

**The Problem:**
- 4 orbs with blur(70-90px) = expensive GPU operations
- Drops FPS to 20-30 on mid-tier devices

**Your Task:**
1. Reduce from 4 orbs → 2 orbs
2. Reduce blur from 70-90px → 30-40px
3. OR pause animations when off-screen with Intersection Observer

---

### 15. Missing `decoding="async"` on Images

**Metric Impact:** FCP (-10-30ms), INP (prevents blocking)
**Difficulty:** Easy
**Location:** `public/index.html` lines 558, 575; `public/js/productRenderer.js` line 84

**The Problem:**
- Image decoding happens synchronously on main thread by default
- Blocks rendering while large images decode

**Your Task:**
Add to all images:
```html
<img src="..." alt="" loading="eager" decoding="async">
```

---

### 16. No Preload for First Product Image

**Metric Impact:** LCP (-100-300ms if product is LCP)
**Difficulty:** Easy
**Location:** `public/js/productRenderer.js`

**The Problem:**
- First product uses `loading="lazy"` even though it's above fold on desktop

**Your Task:**
```javascript
function createProductCard(product, index) {
  const isAboveFold = index < 2;
  const loading = isAboveFold ? 'eager' : 'lazy';
  const fetchpriority = isAboveFold ? 'high' : 'low';

  card.innerHTML = `
    <img loading="${loading}" fetchpriority="${fetchpriority}" decoding="async">
  `;
}
```

---

### 17. Footer Could Be Lazy-Loaded

**Metric Impact:** FCP (-20-50ms), Initial Payload (-2KB)
**Difficulty:** Easy
**Location:** `public/index.html` line 172

**The Problem:**
- Footer CSS loads during page load
- Footer is far below fold, might never be seen

**Your Task:**
Use Intersection Observer to load footer.css only when user scrolls near it:
```javascript
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/footer.css';
    document.head.appendChild(link);
    observer.disconnect();
  }
}, { rootMargin: '200px' });

observer.observe(document.querySelector('.footer'));
```

---

### 18. No Preconnect for GSAP CDN

**Metric Impact:** TBT (-50-150ms)
**Difficulty:** Easy
**Location:** `public/index.html` line 9

**The Problem:**
- GSAP loads from cdnjs.cloudflare.com with no preconnect

**Your Task:**
```html
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
```

---

## 🟢 LOW PRIORITY (Nice-to-Have)

### 19. No Build Process - Manual Optimization

**Metric Impact:** FCP (-100-300ms), Payload (-20KB)
**Difficulty:** Medium
**Location:** Project structure

**The Problem:**
- CSS/JS files are unminified with comments
- No tree-shaking or dead code elimination
- ~20KB savings possible

**Your Task:**
Set up Vite for build optimization:
```bash
npm install --save-dev vite
```

Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    minify: 'terser',
  },
});
```

---

### 20. No Service Worker for Offline/Caching

**Metric Impact:** Repeat visit FCP (-500-1500ms), Offline support
**Difficulty:** Medium
**Location:** Not implemented

**The Problem:**
- No offline fallback
- Static assets re-downloaded on every visit

**Your Task:**
Implement service worker with Workbox for intelligent caching:
```javascript
// public/sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.precaching.precacheAndRoute([
  {url: '/css/hero.css', revision: '1'},
  {url: '/js/main.js', revision: '1'},
]);

workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://images.unsplash.com',
  new workbox.strategies.CacheFirst({ cacheName: 'images' })
);
```

---

### 21. Missing Security Headers

**Metric Impact:** Security (prevents malicious scripts that harm performance)
**Difficulty:** Medium
**Location:** `vercel.json` (missing)

**The Problem:**
- No Content-Security-Policy
- No protection against script injection

**Your Task:**
Add to `vercel.json`:
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {"key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;"},
      {"key": "X-Frame-Options", "value": "DENY"},
      {"key": "X-Content-Type-Options", "value": "nosniff"}
    ]
  }]
}
```

---

### 22. Font-Display Strategy Not Explicit in CSS

**Metric Impact:** CLS (-0.02-0.05)
**Difficulty:** Easy
**Location:** `public/index.html` lines 26-30

**The Problem:**
- System font fallbacks are defined
- But no explicit font-display strategy documented

**Your Task:**
If self-hosting fonts:
```css
@font-face {
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* ✅ Explicit strategy */
  src: url('/fonts/work-sans-v18-latin-regular.woff2') format('woff2');
}
```

---

### 23. Unused base.css File (Dead Code)

**Metric Impact:** Code cleanliness
**Difficulty:** Easy
**Location:** `public/css/base.css`

**The Problem:**
- File exists but is commented out in HTML
- Contains old neon/dark theme that's not used
- Technical debt

**Your Task:**
```bash
rm public/css/base.css
```

---

### 24. Backdrop-Filter Risk on Navigation

**Metric Impact:** INP (prevents scroll jank), FPS (maintains 60fps)
**Difficulty:** Easy
**Location:** `public/index.html` line 252

**The Problem:**
- `backdrop-filter: blur(8px)` is currently commented out (good!)
- Someone might uncomment it thinking it looks better
- Forces GPU rendering on every scroll frame

**Your Task:**
Document why it's commented out, and use progressive enhancement if needed:
```css
/* Use solid background instead of blur for performance */
background: rgba(255, 255, 255, 0.98);

/* OR: Progressive enhancement - blur only on capable devices */
@supports (backdrop-filter: blur(8px)) {
  @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    backdrop-filter: blur(8px);
  }
}
```

---

### 25. Missing ARIA Labels (Accessibility)

**Metric Impact:** Indirect (better UX = fewer errors = better engagement)
**Difficulty:** Easy
**Location:** Various interactive elements

**The Problem:**
- Some buttons/controls lack proper ARIA labels
- Not directly performance-related, but better UX reduces user errors

**Your Task:**
```html
<button class="hero-cta" aria-label="Shop now and browse our products">SHOP NOW</button>

<div class="wishlist-icon" role="button" aria-label="Add to wishlist" tabindex="0">
  <svg aria-hidden="true">...</svg>
</div>
```

---

## 📊 QUICK REFERENCE TABLE

| Priority | Issue | Metric | Difficulty | Gain |
|----------|-------|--------|------------|------|
| 🔴 | Google Fonts self-host | LCP, CLS, FCP | Medium | -300-600ms |
| 🔴 | Playfair ghost font | LCP, CLS | Easy | -0 to -3s |
| 🔴 | Critical CSS inline | FCP, LCP | Medium | -300-800ms |
| 🔴 | Replace GSAP | FCP, TBT | Medium | -200-400ms |
| 🔴 | Unsplash preconnect | LCP | Easy | -100-300ms |
| 🟠 | Delay Google Analytics | FCP, TBT, INP | Easy | -100-300ms |
| 🟠 | Self-host Web Vitals | FCP, TBT | Easy | -50-150ms |
| 🟠 | Responsive product images | Payload | Medium | -600KB mobile |
| 🟠 | API compression | TTFB | Easy | -1KB |
| 🟠 | Cache headers | Repeat FCP | Easy | -200-500ms |
| 🟡 | Remove API delays | TTFB, INP | Easy | -150-550ms |
| 🟡 | DocumentFragment batching | INP, FCP | Easy | -50-150ms |
| 🟡 | Optimize hover handler | INP | Medium | -560ms |
| 🟡 | Reduce orb blur | FPS | Easy | +30-40 fps |
| 🟡 | decoding="async" | FCP, INP | Easy | -10-30ms |
| 🟡 | Preload first product | LCP | Easy | -100-300ms |
| 🟡 | Lazy-load footer | FCP | Easy | -20-50ms |
| 🟡 | GSAP CDN preconnect | TBT | Easy | -50-150ms |
| 🟢 | Build process (Vite) | FCP, Payload | Medium | -100-300ms |
| 🟢 | Service Worker | Repeat FCP | Medium | -500-1500ms |
| 🟢 | Security headers | Indirect | Medium | Security |
| 🟢 | Font-display strategy | CLS | Easy | -0.02-0.05 |
| 🟢 | Delete base.css | N/A | Easy | Cleanliness |
| 🟢 | Document backdrop-filter | INP, FPS | Easy | Prevention |
| 🟢 | Add ARIA labels | Indirect | Easy | Better UX |

---

## 🎯 SUGGESTED LEARNING PATH

**Week 1 - Quick Wins (Easy fixes):**
- #2 Playfair ghost font
- #5 Unsplash preconnect
- #9 API compression
- #10 Cache headers
- #15 decoding="async"
- #18 GSAP preconnect
- #23 Delete base.css

**Week 2 - Medium Impact:**
- #6 Delay Google Analytics
- #7 Self-host Web Vitals
- #11 Remove API delays
- #12 DocumentFragment batching
- #14 Reduce orb blur
- #16 Preload first product

**Week 3 - High Impact (More complex):**
- #1 Self-host Google Fonts
- #3 Inline critical CSS
- #4 Replace GSAP with CSS/Web Animations
- #13 Optimize hover handler

**Week 4 - Advanced:**
- #8 Responsive product images
- #19 Build process
- #20 Service Worker
- #21 Security headers

---

## 💡 EXPECTED TOTAL IMPACT

If you implement **ALL 25 optimizations**, you could achieve:

- **LCP:** -1.5s to -3.5s improvement
- **CLS:** -0.10 to -0.20 improvement
- **INP:** -650ms to -900ms improvement
- **FCP:** -800ms to -2.5s improvement
- **Page Weight:** -700KB to -1.5MB reduction
- **FPS:** +30-40 frames per second

Good luck! 🚀
