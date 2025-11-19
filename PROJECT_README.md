# TechMart - E-Commerce Platform

**A modern, affordable tech retailer serving the African market**

---

## Overview

TechMart is an e-commerce platform focused on bringing quality, affordable technology products to everyday consumers across Africa. Built with performance and accessibility in mind, the platform delivers a premium shopping experience optimized for varying network conditions and device capabilities common in emerging markets.

**Tech Stack:**
- Frontend: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- Backend: Hono (lightweight Node.js framework)
- Deployment: Vercel (serverless)
- Performance Monitoring: Web Vitals library

**Target Market:** Middle-to-mass market consumers in Africa seeking reliable technology at accessible prices.

---

## Recent Performance Improvements

We've completed a major performance optimization initiative focused on Core Web Vitals. Below is a summary of issues identified and resolved.

### ✅ Problem #1: Hero Images - "The 8MB Mistake"

**Issue:** Single 8MB JPEG hero image causing 4.2s LCP on mobile connections.

**Root Causes:**
- Massive unoptimized image (8MB JPEG)
- Image loaded from CSS (late discovery)
- No responsive sizing or modern formats
- Low priority in browser resource loading

**Fixes Implemented:**
1. **Moved to HTML** - Hero images now in `<picture>` elements for early discovery
2. **Responsive images** - 4 breakpoints (800w, 1200w, 1920w, 2560w) serving only needed size
3. **Modern formats** - Progressive enhancement: AVIF → WebP → JPEG fallback
4. **Resource prioritization** - Added `fetchpriority="high"` and preload hints
5. **Preconnect** - Early connection to image CDN (images.unsplash.com)

**Results:**
- LCP: **4.2s → 1.30s** (68% improvement)
- Image size: **8MB → 180KB** (96% reduction on mobile)
- Discovery time: **~600ms → ~100ms** (5x faster)

---

### ✅ Problem #2: Marketing Banner - "The Tag Manager Surprise"

**Issue:** Dynamically injected promotional banner causing 0.28 CLS, pushing all content down 120px.

**Root Causes:**
- Banner injected via Tag Manager at 2-second mark
- `position: static` with `margin-bottom` - reserves layout space
- Pushes products, footer, and all below-fold content down
- Compounding CLS across entire page

**Fixes Implemented:**
1. **Position: fixed** - Removed from document flow entirely
2. **Bottom positioning** - Slides up from bottom instead of inline injection
3. **No layout space** - Zero CLS impact from late-loading content

**Results:**
- Total CLS: **0.36 → 0.08** (78% improvement)
- Banner CLS contribution: **0.28 → 0.00** (100% eliminated)
- Bounce rate: **+12% → baseline** (UX restored)

**Business Impact:** Prevented estimated -R87k/week revenue loss from bounce rate increase.

---

### ✅ Problem #3: Animated Orbs - "The Netflix Effect"

**Issue:** Animated gradient orbs with heavy blur causing 0.27 CLS and FPS drops to 20-30fps.

**Root Causes:**
1. **Percentage-based positioning** - Recalculated when hero container resized during load
2. **Percentage-based transforms** - Recalculated when element dimensions changed
3. **Non-compositor properties** - `left` property animated (CPU-bound, causes reflow)
4. **Heavy blur effects** - 4 orbs with 70-90px blur (expensive GPU operations)
5. **No containment** - Layout recalculations affected entire page tree

**Fixes Implemented:**
1. **Position: fixed** - Viewport-relative (stable) instead of parent-relative
2. **Viewport units** - `vh`/`vw` for sizing (no recalculation during load)
3. **Pixel-based transforms** - Absolute values in keyframes (no dependencies)
4. **Transform-based animation** - `translateX()` instead of `left` (GPU-accelerated)
5. **Layout containment** - `contain: layout style` on hero container (isolated calculations)
6. **Progressive enhancement** - Disabled on mobile/low-end devices via Hardware Concurrency API

**Results:**
- CLS (Desktop): **0.27 → 0.00** (100% eliminated)
- CLS (Mobile): **0.27 → 0.00** (animations disabled)
- FPS (Desktop): **20-30fps → 60fps** (2-3x improvement)
- Layout recalc scope: **1000+ nodes → 20 nodes** (50x reduction)

---

### ✅ Problem #4: Product Grid Mobile CLS

**Issue:** Product grid collapsed when loading message cleared, causing 0.05 CLS on mobile.

**Root Causes:**
- `productGrid.innerHTML = ''` cleared "Loading products..." placeholder
- Grid height collapsed from ~24px to 0px
- Footer shifted up, causing everything above to shift
- Only visible on mobile due to 6x CPU slowdown (longer gap between clear + render)

**Fixes Implemented:**
1. **Min-height reservation** - `min-height: 1400px` on `.product-grid` prevents collapse
2. **Reserved space** - Maintains layout stability during loading state transition

**Results:**
- Mobile CLS: **0.05 → 0.00** (100% eliminated)
- Footer shift: **Eliminated**

---

## Current Performance Metrics

**Core Web Vitals (as of latest audit):**
- ✅ **LCP:** 1.30s (Good - Target: <2.5s)
- ✅ **CLS:** 0.05 (Good - Target: <0.1)
- ✅ **INP:** <50ms (Good - Target: <200ms)

**Other Metrics:**
- **FCP:** ~800ms
- **FPS:** 60fps (stable on desktop)
- **Page Weight:** ~2MB (with all images)

---

## Known Technical Debt

While we've made significant improvements, the following issues remain as technical debt for future optimization:

### 🔴 High Priority

**1. Google Fonts - Render Blocking & FOUT**
- **Issue:** Fonts loaded from googleapis.com/gstatic.com (2 HTTP requests)
- **Impact:** LCP (-300-600ms), CLS (-0.05-0.1), FCP (-150-300ms)
- **Recommended Fix:** Self-host fonts with `font-display: swap`

**2. Playfair Display Ghost Font**
- **Issue:** Hero subtitle references 'Playfair Display' but font never loaded
- **Impact:** Browser waits 3s for font, causes FOIT
- **Recommended Fix:** Remove reference or load the font

**3. Critical CSS Not Inlined**
- **Issue:** `hero.css` blocks rendering during download
- **Impact:** FCP (-300-800ms), LCP (-200-500ms)
- **Recommended Fix:** Inline critical above-the-fold CSS

**4. GSAP Library - 88KB Third-Party Dependency**
- **Issue:** Heavy animation library for 3 simple animations
- **Impact:** FCP (-200-400ms), TBT (-200ms)
- **Recommended Fix:** Replace with CSS animations or Web Animations API

**5. No Resource Hints for Unsplash CDN**
- **Issue:** Missing `preconnect` for images.unsplash.com
- **Impact:** LCP (-100-300ms) from DNS/TLS delay
- **Recommended Fix:** Add preconnect hint in `<head>`

---

### 🟠 Medium Priority

**6. Google Analytics - Main Thread Blocking**
- **Issue:** ~45KB script executes during page load
- **Impact:** FCP (-100-300ms), INP (blocks interactions)
- **Recommended Fix:** Delay load until after page interactive

**7. Web Vitals Library from CDN**
- **Issue:** Loaded from unpkg.com (~25KB)
- **Impact:** FCP (-50-150ms)
- **Recommended Fix:** Self-host library

**8. Product Images - No Responsive Sizing**
- **Issue:** All images load at w=1200 regardless of viewport
- **Impact:** 600KB-1.2MB wasted on mobile
- **Recommended Fix:** Implement responsive `<picture>` elements with AVIF/WebP

**9. Artificial API Delays**
- **Issue:** Intentional 150ms/400ms delays for demo purposes
- **Impact:** TTFB, INP
- **Recommended Fix:** Remove `await delay()` calls

**10. No Cache Headers**
- **Issue:** Static assets re-downloaded on every visit
- **Impact:** Repeat visit FCP (-200-500ms)
- **Recommended Fix:** Add `Cache-Control` headers in `vercel.json`

**11. No API Compression**
- **Issue:** JSON responses not gzipped
- **Impact:** TTFB (-10-30ms)
- **Recommended Fix:** Add Hono compression middleware

**12. Product Renderer - Synchronous DOM Operations**
- **Issue:** Layout thrashing from `offsetHeight` reads + individual appends
- **Impact:** INP (-50-150ms)
- **Recommended Fix:** Use DocumentFragment batching

**13. Hover Handler - Unoptimized**
- **Issue:** API fetch + `querySelectorAll` on every hover
- **Impact:** INP (-560ms)
- **Recommended Fix:** Include wishlist status in initial response, render immediately

**14. Animated Orbs - Still Heavy**
- **Issue:** 4 orbs with 70-90px blur (expensive GPU operations)
- **Impact:** FPS drops on mid-tier devices
- **Recommended Fix:** Reduce to 2 orbs with 30-40px blur

---

### 🟡 Low Priority

**15. Missing `decoding="async"` on Images**
- **Impact:** FCP (-10-30ms), prevents image decode blocking
- **Fix:** Add attribute to all `<img>` tags

**16. No Preload for First Product Image**
- **Impact:** LCP (-100-300ms if product is LCP)
- **Fix:** Use `loading="eager"` for above-fold products

**17. Footer Lazy-Loading**
- **Impact:** FCP (-20-50ms)
- **Fix:** Load footer.css with Intersection Observer

**18. No Preconnect for GSAP CDN**
- **Impact:** TBT (-50-150ms)
- **Fix:** Add preconnect for cdnjs.cloudflare.com

**19. No Build Process**
- **Impact:** FCP (-100-300ms), 20KB savings
- **Fix:** Implement Vite for minification/tree-shaking

**20. No Service Worker**
- **Impact:** Repeat visit FCP (-500-1500ms)
- **Fix:** Implement Workbox for offline support

**21. Missing Security Headers**
- **Impact:** Security (indirect performance impact)
- **Fix:** Add CSP, X-Frame-Options in `vercel.json`

**22. Backdrop-Filter Documentation**
- **Impact:** Prevention (currently commented out)
- **Fix:** Document why it's disabled for performance

**23. Unused base.css File**
- **Impact:** Code cleanliness
- **Fix:** Delete dead code

**24. Missing ARIA Labels**
- **Impact:** Accessibility, indirect UX benefit
- **Fix:** Add proper labels to interactive elements

**25. TypeScript Diagnostics - Unused Variables**
- **Impact:** Code quality, potential bugs
- **Fix:** Remove unused reads (performance anti-patterns)

---

## Estimated Total Impact (If All Technical Debt Resolved)

**Core Web Vitals:**
- LCP: 1.30s → **0.5-0.8s** (-500ms to -1.5s)
- CLS: 0.05 → **0.00** (-0.05 to -0.15)
- INP: <50ms → **<30ms** (maintain excellence)
- FCP: ~800ms → **300-500ms** (-300ms to -500ms)

**Other Metrics:**
- Page Weight: **-700KB to -1.5MB** on mobile
- FPS: **+30-40fps** (60fps stable across devices)
- Repeat Visit: **-500ms to -1.5s** with caching
- TTFB: **-50-200ms** with compression

**Business Impact:**
Based on industry research (Google/Amazon):
- 100ms faster = +1% conversion
- 0.1 CLS improvement = -3-5% bounce rate
- Sub-2s LCP = +15-20% engagement

**Potential conversion lift from resolving all technical debt: +2-5%** 🚀

---

## Getting Started

**Prerequisites:**
- Node.js 18+ installed
- npm or yarn package manager

**Setup:**
```bash
# Clone the repository
git clone <repository-url>
cd debugging-web-performance-talk

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Access the site:**
- Open http://localhost:3000 in your browser
- Check browser console for Core Web Vitals metrics

**Available npm scripts:**
```bash
npm run dev                          # Start development server
npm run lighthouse:dev-machine       # Run Lighthouse on developer machine profile
npm run lighthouse:consumer-laptop   # Run Lighthouse on consumer laptop profile
npm run lighthouse:urban             # Run Lighthouse on African urban network profile
npm run lighthouse:suburban          # Run Lighthouse on African suburban network profile
npm run lighthouse:rural             # Run Lighthouse on African rural network profile
npm run lighthouse:all               # Run all Lighthouse profiles
```

---

## Performance Monitoring

The site uses the `web-vitals` library for real-time Core Web Vitals monitoring. Check your browser console to see:

- **LCP** (Largest Contentful Paint) - Main content load time
- **CLS** (Cumulative Layout Shift) - Visual stability
- **INP** (Interaction to Next Paint) - Responsiveness
- **FCP** (First Contentful Paint) - First visible content
- **TTFB** (Time to First Byte) - Server response time

All metrics include attribution data (element responsible, event target, etc.) for debugging.

---

## Key Learnings

### What We Learned from Performance Optimization:

1. **Percentages are dangerous** - Percentage-based positioning/transforms recalculate during parent resize
2. **Position: fixed for stability** - Viewport-relative positioning prevents recalculation during load
3. **Viewport units > percentages** - `vh`/`vw` are stable during page load
4. **Animate compositor properties** - `transform`/`opacity` are GPU-accelerated (avoid `left`/`top`)
5. **Layout containment is powerful** - `contain: layout style` isolates expensive calculations
6. **Progressive enhancement works** - Disable heavy effects on low-end devices (Hardware Concurrency API)
7. **Reserve space for dynamic content** - `min-height`, skeleton loaders, or `position: fixed`
8. **Resource hints matter** - `preconnect`, `fetchpriority`, and `preload` save 100-300ms each

### Performance vs Design Tradeoffs:

- **Orbs & animations** - Beautiful, but expensive. Worth it on desktop, disabled on mobile.
- **Custom fonts** - Elegant, but slow. Self-hosting and `font-display: swap` minimize impact.
- **Large images** - Stunning, but heavy. Responsive images and modern formats (AVIF/WebP) essential.

**Conclusion:** Performance is a feature. Every design decision has performance implications.

---

## Contributing

Performance optimization is ongoing. See [HOMEWORK_OPTIMIZATIONS.md](./HOMEWORK_OPTIMIZATIONS.md) for the full list of technical debt and optimization opportunities.

**Priority order:**
1. Week 1: Quick wins (LCP improvements)
2. Week 2: INP & interaction performance
3. Week 3: Advanced optimizations (fonts, critical CSS)
4. Week 4: Modern tooling (build process, service worker)

---

## License

MIT License - Educational/demonstration purposes

---

## Contact

For questions about this implementation or performance optimization strategies for African markets, please open an issue.

**Performance matters. Every millisecond counts.** ⚡
