# Performance Optimisation Homework

**Context:** The codebase has been cleaned up to look like a real production e-commerce site. All teaching comments have been removed, and performance issues are now **hidden** in the code - just like you'd find in the real world.

**Your task:** We've fixed 3 major problems (hero images, marketing banner, animated orbs). Below are **25 additional optimisation opportunities** grouped by Core Web Vital metric.

---

## 📊 Issues Organized by Core Web Vital

### 🟦 LCP (Largest Contentful Paint) optimisations
**Target: < 2.5s | Measures: Loading performance of main content**

Issues affecting LCP: **#1, #2, #3, #4, #5, #8, #9, #16**

### 🟩 CLS (Cumulative Layout Shift) optimisations
**Target: < 0.1 | Measures: Visual stability during load**

Issues affecting CLS: **#1, #2, #15, #18, #22**

### 🟨 INP (Interaction to Next Paint) optimisations
**Target: < 200ms | Measures: Responsiveness to user interactions**

Issues affecting INP: **#6, #10, #11, #12, #13, #14, #15, #17, #24**

### 🟧 FCP (First Contentful Paint) optimisations
**Target: < 1.8s | Measures: Time to first visible content**

Issues affecting FCP: **#1, #3, #4, #5, #6, #7, #9, #12, #15, #17, #19, #20**

### 🟪 General Performance & Best Practices
**Affects: Page weight, repeat visits, security, maintainability**

Issues in this category: **#9, #10, #19, #20, #21, #23, #25**

---

## 🟦 LCP (Largest Contentful Paint) - 8 Issues

Your LCP is currently **1.30s** on the demo site. These optimisations can improve it further.

---

### #1. Google Fonts - Blocking Render + Font Loading Strategy

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

**Hint:** Look for the `<link rel="preload">` pattern in the HTML head.

---

### #2. Playfair Display Ghost Font - Never Loaded But Referenced

**Metric Impact:** LCP (-0 to -3000ms), CLS (-0.02-0.05)
**Difficulty:** Easy
**Location:** `public/css/hero.css` line 97

**The Problem:**
The hero subtitle references a font that's never loaded:
```css
.hero-subtitle {
  font-family: 'Playfair Display', serif;
}
```
- Browser waits up to 3 seconds trying to find the font
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

**Hint:** Search for "Playfair Display" in the codebase to find the reference.

---

### #3. Critical CSS Not Inlined - Render Blocking

**Metric Impact:** FCP (-300-800ms), LCP (-200-500ms)
**Difficulty:** Medium
**Location:** `public/index.html` line 170

**The Problem:**
- `hero.css` blocks rendering while it downloads
- On slow connections, users see blank screen
- Other CSS files are async, but hero isn't

**Your Task:**
1. Inline critical above-the-fold CSS in `<style>` tag
2. Load remaining CSS asynchronously
3. Use Critical CSS extraction tool (optional)

**Hint:** Look for `<link rel="stylesheet" href="css/hero.css">` - it's the only blocking CSS.

---

### #4. GSAP Library - 88KB Third-Party Script

**Metric Impact:** FCP (-200-400ms), LCP (-100-200ms), TBT (-200ms)
**Difficulty:** Medium
**Location:** `public/index.html` line 9

**The Problem:**
- 88KB JavaScript library for simple opacity/transform animations
- Loads from cdnjs.cloudflare.com (DNS + TLS overhead)
- Only used for 3 basic animations

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

**Hint:** Check `public/js/animations.js` to see how GSAP is currently used.

---

### #5. No Resource Hints for Unsplash Images

**Metric Impact:** LCP (-100-300ms)
**Difficulty:** Easy
**Location:** `public/index.html` (missing in `<head>`)

**The Problem:**
- Hero images load from images.unsplash.com
- No `preconnect` = DNS lookup + TCP + TLS handshake before download
- Adds 100-300ms latency to LCP element

**Your Task:**
Add before your preload links:
```html
<link rel="dns-prefetch" href="https://images.unsplash.com">
<link rel="preconnect" href="https://images.unsplash.com">
```

**Hint:** Look where other preconnect/dns-prefetch hints are in the `<head>`.

---

### #8. Product Images - No Responsive Sizes

**Metric Impact:** Page Weight (-600KB-1.2MB on mobile), LCP (if visible)
**Difficulty:** Medium
**Location:** `api/index.js` lines 7-56, `public/js/productRenderer.js`

**The Problem:**
- All product images load at w=1200 regardless of viewport
- Mobile cards are ~400px wide but download 1200px images
- No AVIF/WebP formats
- 6 products = 1.2-1.8MB wasted on mobile

**Your Task:**
1. Update API to return multiple sizes in srcset
2. Use `<picture>` element in productRenderer.js
3. Serve AVIF/WebP with JPEG fallback

**Hint:** Look at how hero images use `<picture>` elements for responsive images.

---

### #9. Artificial API Delays (Demo Code)

**Metric Impact:** TTFB (-150ms), INP (-400ms)
**Difficulty:** Easy
**Location:** `api/index.js` lines 63, 76

**The Problem:**
- Intentional delays: 150ms on `/api/products`, 400ms on `/api/products/:id`
- Slows real performance for demo purposes

**Your Task:**
Remove the delay calls from both endpoints.

**Hint:** Look for `await delay()` in the API routes.

---

### #16. No Preload for First Product Image

**Metric Impact:** LCP (-100-300ms if product is LCP)
**Difficulty:** Easy
**Location:** `public/js/productRenderer.js`

**The Problem:**
- First product uses `loading="lazy"` even though it's above fold on desktop
- Delays image load until lazy-loading detection triggers

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

**Hint:** Product cards are created in a loop - use the index parameter.

---

## 🟩 CLS (Cumulative Layout Shift) - 5 Issues

Your CLS is currently **0.05** on mobile. These optimisations can get it to 0.

---

### #1. Google Fonts (see LCP section above)

**CLS Impact:** -0.05 to -0.1 from preventing FOUT

---

### #2. Playfair Display Ghost Font (see LCP section above)

**CLS Impact:** -0.02 to -0.05 from preventing font fallback shift

---

### #15. Missing `decoding="async"` on Images

**Metric Impact:** FCP (-10-30ms), INP (prevents blocking), CLS (prevents layout shift during decode)
**Difficulty:** Easy
**Location:** `public/index.html` lines 558, 575; `public/js/productRenderer.js` line 84

**The Problem:**
- Image decoding happens synchronously on main thread by default
- Can cause layout shifts when large images decode
- Blocks rendering while decoding

**Your Task:**
Add to all images:
```html
<img src="..." alt="" loading="eager" decoding="async">
```

**Hint:** Search for `<img` tags throughout the codebase.

---

### #18. Font-Display Strategy Not Explicit

**Metric Impact:** CLS (-0.02-0.05)
**Difficulty:** Easy
**Location:** `public/index.html` lines 26-30

**The Problem:**
- System font fallbacks are defined
- But no explicit font-display strategy documented
- Google Fonts URL has `display=swap` but behavior unclear

**Your Task:**
If self-hosting fonts:
```css
@font-face {
  font-family: 'Work Sans';
  font-display: swap;
  src: url('/fonts/work-sans-v18-latin-regular.woff2') format('woff2');
}
```

**Hint:** Check if fonts are self-hosted or loaded from Google Fonts.

---

### #22. Backdrop-Filter Risk on Navigation

**Metric Impact:** INP (prevents scroll jank), FPS (maintains 60fps), CLS (prevents repaints)
**Difficulty:** Easy
**Location:** `public/index.html` line 252

**The Problem:**
- `backdrop-filter: blur(8px)` is currently commented out (good!)
- Someone might uncomment it thinking it looks better
- Forces expensive GPU rendering on every scroll frame

**Your Task:**
Document why it's commented out:
```css
/* Solid background for performance - backdrop-filter causes scroll jank */
background: rgba(255, 255, 255, 0.98);
```

**Hint:** Search for "backdrop-filter" in the codebase.

---

## 🟨 INP (Interaction to Next Paint) - 9 Issues

Your INP is currently good, but these optimisations prevent regressions.

**Note:** Problem #5 (Analytics Blocking) demonstrates a critical INP issue - synchronous analytics in event handlers causing 350ms delays. See `PROJECT_README.md` Problem #5 and `PRESENTATION_SLIDES.md` for the full fix using `setTimeout(0)` + `sendBeacon()`.

---

### #6. Google Analytics - Blocking Third-Party Script

**Metric Impact:** FCP (-100-300ms), TBT (-150ms), INP (better responsiveness)
**Difficulty:** Easy
**Location:** `public/index.html` lines 493-507

**The Problem:**
- ~45KB JavaScript executes on main thread during page load
- Analytics aren't critical for initial render
- Blocks user interactions during execution

**Your Task:**
Delay GA until after page is interactive:
```javascript
window.addEventListener('load', () => {
  setTimeout(() => {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-7012WQ517Q';
    script.async = true;
    document.head.appendChild(script);
  }, 2000);
});
```

**Hint:** Look for `<script async src="https://www.googletagmanager.com/gtag/js">`

---

### #10. No Cache Headers for Static Assets

**Metric Impact:** Repeat visit FCP (-200-500ms), TTFB (-50-150ms)
**Difficulty:** Easy
**Location:** `vercel.json` (missing configuration)

**The Problem:**
- CSS/JS files re-downloaded on every visit
- No browser caching strategy
- Repeat visitors get no performance benefit

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

**Hint:** Create a `vercel.json` file in the project root if it doesn't exist.

---

### #11. No API Compression

**Metric Impact:** TTFB (-10-30ms), Transfer Size (-1KB)
**Difficulty:** Easy
**Location:** `api/index.js`

**The Problem:**
- JSON responses not compressed
- ~1.5KB could be ~500 bytes with gzip
- Wastes bandwidth and slows TTFB

**Your Task:**
Add compression middleware to Hono:
```javascript
import { compress } from 'hono/compress';

app.use('*', compress());
```

**Hint:** Check the Hono documentation for middleware usage.

---

### #12. Product Renderer - Synchronous DOM Operations

**Metric Impact:** INP (-50-150ms), FCP (-30-80ms)
**Difficulty:** Easy
**Location:** `public/js/productRenderer.js` lines 13-17

**The Problem:**
- Each `appendChild` forces layout recalculation
- Reading `offsetHeight` causes layout thrashing (6 forced layouts for 6 products)
- Blocks main thread during rendering

**Your Task:**
Use DocumentFragment to batch operations:
```javascript
const fragment = document.createDocumentFragment();

products.forEach(product => {
  const card = createProductCard(product);
  fragment.appendChild(card);
});

productGrid.appendChild(fragment);
```

**Hint:** Look for the `forEach` loop that appends cards one by one.

---

### #13. Hover Handler - Unoptimized API Calls

**Metric Impact:** INP (-560ms)
**Difficulty:** Medium
**Location:** `public/js/animations.js` - search for `mouseenter` event

**The Problem:**
- API fetch on every hover (400ms delay!)
- `querySelectorAll` on every hover
- Wishlist icon created after fetch (delayed UI)
- Multiple expensive DOM queries

**Your Task:**
1. Include wishlist status in initial `/api/products` response
2. Render wishlist icon immediately in `productRenderer.js`
3. Remove hover API fetch entirely
4. Cache DOM queries outside event handler

**Hint:** Look for `fetch(\`/api/products/${productId}\`)` inside a mouseenter handler.

---

### #14. Animated Orbs - Heavy Blur Radius

**Metric Impact:** FPS (+30-40 fps), INP (smoother interactions)
**Difficulty:** Easy
**Location:** `public/js/animations.js` - search for `blur(`

**The Problem:**
- 4 orbs with blur(70-90px) = expensive GPU operations
- Drops FPS to 20-30 on mid-tier devices
- Makes page feel sluggish

**Your Task:**
1. Reduce from 4 orbs → 2 orbs
2. Reduce blur from 70-90px → 30-40px
3. OR pause animations when off-screen with Intersection Observer

**Hint:** Look for `filter: blur(` in the orb creation code.

---

### #15. Missing `decoding="async"` (see CLS section above)

**INP Impact:** Prevents image decode from blocking interactions

---

### #17. Footer Could Be Lazy-Loaded

**Metric Impact:** FCP (-20-50ms), Initial Payload (-2KB)
**Difficulty:** Easy
**Location:** `public/index.html` line 172

**The Problem:**
- Footer CSS loads during page load
- Footer is far below fold, might never be seen
- Wastes bandwidth on initial load

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

**Hint:** Look for async CSS loading pattern with `<link rel="preload">`.

---

### #24. Missing ARIA Labels (Accessibility)

**Metric Impact:** Indirect (better UX = fewer errors = better engagement)
**Difficulty:** Easy
**Location:** Various interactive elements

**The Problem:**
- Some buttons/controls lack proper ARIA labels
- Not directly performance-related, but better UX reduces user errors
- Fewer errors = better engagement metrics

**Your Task:**
```html
<button class="hero-cta" aria-label="Shop now and browse our products">SHOP NOW</button>

<div class="wishlist-icon" role="button" aria-label="Add to wishlist" tabindex="0">
  <svg aria-hidden="true">...</svg>
</div>
```

**Hint:** Look for interactive elements without accessible labels.

---

## 🟧 FCP (First Contentful Paint) - 12 Issues

Your FCP impacts how quickly users see ANYTHING on the page.

---

### #1. Google Fonts (see LCP section)
**FCP Impact:** -150-300ms

### #3. Critical CSS Not Inlined (see LCP section)
**FCP Impact:** -300-800ms

### #4. GSAP Library (see LCP section)
**FCP Impact:** -200-400ms

### #5. No Resource Hints for Unsplash (see LCP section)
**FCP Impact:** Indirect - helps LCP which helps FCP

### #6. Google Analytics (see INP section)
**FCP Impact:** -100-300ms

---

### #7. Web Vitals Library - Loaded from CDN

**Metric Impact:** FCP (-50-150ms), TBT (-80ms)
**Difficulty:** Easy
**Location:** `public/js/webVitals.js` line 11

**The Problem:**
- Loads from unpkg.com (third-party CDN)
- ~25KB library download
- No preconnect for unpkg.com domain

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

**Hint:** Look for `import` from `https://unpkg.com`.

---

### #9. Artificial API Delays (see LCP section)
**FCP Impact:** Delays content rendering

### #12. Product Renderer - Synchronous DOM (see INP section)
**FCP Impact:** -30-80ms

### #15. Missing decoding="async" (see CLS section)
**FCP Impact:** -10-30ms

### #17. Footer Lazy-Load (see INP section)
**FCP Impact:** -20-50ms

---

### #19. No Build Process - Manual optimisation

**Metric Impact:** FCP (-100-300ms), Payload (-20KB)
**Difficulty:** Medium
**Location:** Project structure

**The Problem:**
- CSS/JS files are unminified
- No tree-shaking or dead code elimination
- ~20KB savings possible (20% of total CSS/JS)

**Your Task:**
Set up Vite for build optimisation:
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

**Hint:** Check file sizes of CSS/JS files - they have comments and whitespace.

---

### #20. No Service Worker for Offline/Caching

**Metric Impact:** Repeat visit FCP (-500-1500ms), Offline support
**Difficulty:** Medium
**Location:** Not implemented

**The Problem:**
- No offline fallback
- Static assets re-downloaded on every visit
- No intelligent caching strategy

**Your Task:**
Implement service worker with Workbox:
```javascript
// public/sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.precaching.precacheAndRoute([
  {url: '/css/hero.css', revision: '1'},
  {url: '/js/main.js', revision: '1'},
]);
```

**Hint:** Register service worker in main.js after page load.

---

## 🟪 General Performance & Best Practices - 7 Issues

These don't directly affect Core Web Vitals but improve overall performance, security, and maintainability.

---

### #9. Artificial API Delays (see LCP section)

---

### #10. No Cache Headers (see INP section)

---

### #18. No Preconnect for GSAP CDN

**Metric Impact:** TBT (-50-150ms)
**Difficulty:** Easy
**Location:** `public/index.html` line 9

**The Problem:**
- GSAP loads from cdnjs.cloudflare.com
- No preconnect = DNS + TCP + TLS delay

**Your Task:**
```html
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
```

**Hint:** Add near other preconnect hints in `<head>`.

---

### #19. No Build Process (see FCP section)

---

### #20. No Service Worker (see FCP section)

---

### #21. Missing Security Headers

**Metric Impact:** Security (prevents malicious scripts that harm performance)
**Difficulty:** Medium
**Location:** `vercel.json` (missing)

**The Problem:**
- No Content-Security-Policy
- No protection against script injection
- Malicious scripts can severely degrade performance

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

**Hint:** Test CSP policy carefully - it can break functionality if too strict.

---

### #23. Unused base.css File (Dead Code)

**Metric Impact:** Code cleanliness
**Difficulty:** Easy
**Location:** `public/css/base.css`

**The Problem:**
- File exists but isn't used
- Contains old design system
- Technical debt

**Your Task:**
```bash
rm public/css/base.css
```

**Hint:** Check if base.css is referenced anywhere in index.html.

---

### #25. TypeScript Diagnostics - Unused Variables

**Metric Impact:** Code quality
**Difficulty:** Easy
**Location:** Various files

**The Problem:**
IDE shows warnings for unused variables:
- `productRenderer.js` line 16: `height` never read
- `productRenderer.js` line 63: `allButtons` never read
- `productRenderer.js` line 84: `opacity` never read

**Your Task:**
Remove or use these variables - they're code smells indicating potential bugs.

**Hint:** These unused reads are actually performance bugs (forced layouts, unnecessary queries).

---

## 📊 QUICK REFERENCE - All Issues by Metric

| # | Issue | Primary Metric | Difficulty | Estimated Gain |
|---|-------|----------------|------------|----------------|
| 1 | Google Fonts self-host | LCP, CLS, FCP | Medium | -300-600ms LCP |
| 2 | Playfair ghost font | LCP, CLS | Easy | -0 to -3s LCP |
| 3 | Critical CSS inline | LCP, FCP | Medium | -300-800ms FCP |
| 4 | Replace GSAP | LCP, FCP | Medium | -200-400ms FCP |
| 5 | Unsplash preconnect | LCP | Easy | -100-300ms LCP |
| 6 | Delay Google Analytics | INP, FCP | Easy | -100-300ms FCP |
| 7 | Self-host Web Vitals | FCP | Easy | -50-150ms FCP |
| 8 | Responsive product images | LCP, Payload | Medium | -600KB mobile |
| 9 | Remove API delays | LCP, INP | Easy | -150-550ms |
| 10 | Cache headers | INP, FCP | Easy | -200-500ms repeat |
| 11 | API compression | INP | Easy | -1KB |
| 12 | DocumentFragment batching | INP, FCP | Easy | -50-150ms INP |
| 13 | Optimize hover handler | INP | Medium | -560ms INP |
| 14 | Reduce orb blur | INP, FPS | Easy | +30-40 FPS |
| 15 | decoding="async" | CLS, INP, FCP | Easy | -10-30ms |
| 16 | Preload first product | LCP | Easy | -100-300ms |
| 17 | Lazy-load footer | INP, FCP | Easy | -20-50ms |
| 18 | GSAP CDN preconnect | General | Easy | -50-150ms |
| 19 | Build process | FCP, Payload | Medium | -100-300ms |
| 20 | Service Worker | FCP, General | Medium | -500-1500ms repeat |
| 21 | Security headers | General | Medium | Security |
| 22 | Backdrop-filter docs | CLS, INP | Easy | Prevention |
| 23 | Delete base.css | General | Easy | Cleanliness |
| 24 | Add ARIA labels | INP | Easy | Better UX |
| 25 | Fix unused variables | General | Easy | Code quality |

---

## 🎯 SUGGESTED LEARNING PATH

### Week 1 - Quick Wins (Easy, High Impact)
Focus on **LCP** and easy **FCP** wins:
- #2 Playfair ghost font (Easy - huge LCP impact)
- #5 Unsplash preconnect (Easy - LCP)
- #9 Remove API delays (Easy - multiple metrics)
- #15 decoding="async" (Easy - multiple metrics)
- #18 GSAP preconnect (Easy)
- #23 Delete base.css (Easy)

### Week 2 - INP & Interaction Performance
Focus on **INP** and responsiveness:
- #6 Delay Google Analytics (Easy)
- #10 Cache headers (Easy)
- #11 API compression (Easy)
- #12 DocumentFragment batching (Easy - teaches important pattern)
- #14 Reduce orb blur (Easy - visible improvement)
- #16 Preload first product (Easy)
- #17 Lazy-load footer (Easy)

### Week 3 - Advanced optimisations
Tackle **Medium difficulty**, high impact:
- #1 Self-host Google Fonts (Medium - big impact)
- #3 Inline critical CSS (Medium - teaches critical rendering path)
- #13 Optimize hover handler (Medium - complex refactor)
- #8 Responsive product images (Medium - teaches responsive images)

### Week 4 - Modern Tooling & Architecture
Build process and advanced patterns:
- #4 Replace GSAP with CSS/Web Animations (Medium - modern patterns)
- #7 Self-host Web Vitals (Easy - dependency management)
- #19 Build process with Vite (Medium - tooling)
- #20 Service Worker (Medium - offline-first)
- #21 Security headers (Medium - best practices)

---

## 💡 EXPECTED TOTAL IMPACT

If you implement **ALL 25 optimisations**, you could achieve:

### Core Web Vitals
- **LCP:** 1.30s → 0.5-0.8s (improvement: -500ms to -1.5s)
- **CLS:** 0.05 → 0.00 (improvement: -0.05 to -0.15)
- **INP:** <50ms → <30ms (improvement: maintain excellent score)
- **FCP:** ~800ms → ~300-500ms (improvement: -300ms to -500ms)

### Other Metrics
- **Page Weight:** -700KB to -1.5MB on mobile
- **FPS:** +30-40 frames per second (60fps stable)
- **Repeat Visit Load Time:** -500ms to -1.5s with caching
- **TTFB:** -50-200ms with compression and caching

### Business Impact
Based on real-world performance → conversion correlations:
- **100ms faster = +1% conversion** (Google/Amazon research)
- **0.1 CLS improvement = -3-5% bounce rate**
- **Sub-2s LCP = +15-20% engagement**

**Your potential conversion impact: +2-5% from performance alone** 🚀

---

## 🔍 Debugging Tips

Since teaching comments have been removed, here's how to find the issues:

1. **Use Chrome DevTools Performance Panel**
   - Record page load with 6x CPU slowdown
   - Look for long tasks, layout shifts, and slow metrics

2. **Use Lighthouse**
   - Run audit to get suggestions
   - Check "Opportunities" and "Diagnostics" sections

3. **Use Coverage Tool**
   - Find unused CSS/JS
   - Identify dead code

4. **Check Network Panel**
   - Find large resources
   - Check for missing compression/caching

5. **Use TypeScript Diagnostics**
   - Unused variables are performance bugs
   - Follow the hints in your IDE

Good luck debugging! 🕵️‍♂️
