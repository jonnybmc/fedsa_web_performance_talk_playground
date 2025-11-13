# 🚀 Stop Guessing, Start Measuring: A Primer on Debugging Web Performance

**A 20-minute live debugging demo for frontend engineering conferences**

Repository for the talk "Stop Guessing, Start Measuring: A Primer on Debugging Web Performance" - featuring the story of "TechMart", an affordable African tech retailer whose R3.5M redesign became a performance disaster.

---

## 📖 The Story: "TechMart" - The R3.5M Redesign Disaster

### Timeline

**Q2 2024: The Vision**
- Business approved massive redesign budget
- Design Director: *"We need to look like Apple. Think BoConcept. Premium, sophisticated."*

**July 2024: Design Delivers**
- Gorgeous mockups with 5K hero images
- Animated depth effects inspired by Netflix
- Micro-interactions everywhere
- Everyone loves it

**September 2024: Engineering Ships It**
- Weekends, late nights, heroic effort
- QA passes on MacBook Pros with 100Mbps office WiFi
- Everyone celebrates 🎉

**October 1, 2024: Launch Day**
- Internal Slack: *"This looks AMAZING!"*
- CEO: *"Best site we've ever had."*
- Marketing: *"Already getting client compliments!"*

**Week 2: Reality Hits**
- **CSAT dropped from 87% → 62%** (25 point drop!)
- Twitter: *"Old site was faster, new one is gorgeous but laggy 😭"*
- Analytics: Bounce rate up 34%, mobile users leaving in 5 seconds
- Customer service flooded with "site too slow" complaints

### The War Room

**PM:** *"We passed QA. How is this happening?"*

**Design:** *"Our mockups tested great. Design isn't the problem."*

**Dev:** *"Works fine on my machine..."*

**QA:** *"We tested Chrome, Safari, Firefox - all passed."*

**Enter: The Performance Consultant**

*"Stop guessing. Let's measure what real users are experiencing."*

**Lighthouse Score: 28/100** ❌

---

## 🎯 The 4 Critical Problems (All Core Web Vitals Issues)

This demo codebase contains **4 intentionally broken performance problems** that will be fixed live during the presentation. Each problem includes:
- ❌ The broken code (currently active)
- 📖 Backstory explaining how it happened
- ✅ Commented fix ready for live demonstration
- 📊 Metrics showing before/after impact

---

## Problem 1: The 8MB Hero Image ⚡ LCP: ~8 seconds

### The Backstory

**Design Review Meeting, July 2024 (2 months before launch)**

**Design Director** (presenting mockups on 5K iMac):
*"This hero section needs to feel PREMIUM. Think Apple. Think BoConcept. I want maximum quality lifestyle photography. 5K resolution minimum. We're targeting affluent buyers - they'll appreciate the quality."*

**Developer** (Frontend):
*"Okay, so I'll use Unsplash with w=5120 (5K width) and q=100 (max quality). Looks STUNNING on my MacBook Pro! Shipping it."*

**QA** (testing on office WiFi, 100Mbps fiber):
*"Hero looks gorgeous! Approved for launch. ✅"*

**[October 1, 2024: Launch Day]**

Internal Slack #general:
- CEO: *"WOW! This looks incredible. Best site we've ever launched!"*
- Design Director: *"Thank you! We really nailed the premium aesthetic."*
- Marketing: *"Already getting compliments from clients! 🎉"*

**[Week 2 post-launch...]**

User (Twitter, Cape Town, 14Mbps):
*"Why does @TechMart homepage take 30 seconds to load? Just seeing blank white screen..."*

User (Lagos, mobile 4G):
*"Gorgeous site but takes FOREVER to load. Old site was way faster."*

User (Nairobi, 3G):
*"Can't even load the page. Tried 3 times. Giving up."*

### The Technical Problem

**Where to Find:** `public/css/hero.css:10-16`

**The Broken Code:**
```css
.hero {
  /* ❌ TWO 5K resolution images at max quality */
  background-image:
    url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=5120&q=100'),
    url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=5120&q=100');
  background-attachment: fixed;  /* ❌ Expensive repaints on scroll */
  background-blend-mode: overlay; /* ❌ Additional GPU compositing */
}
```

**Additional Performance Issues:**
- Grid pattern overlay (lines 37-49) - Another visual layer
- Parallax effect with `background-attachment: fixed`

### Core Web Vitals Impact

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **LCP** | ~8 seconds | <2.5s | ❌ 3.2× worse |
| **Hero Image Size** | 8.2MB × 2 = **16.4MB+** | <500KB | ❌ 32× worse |

### Real User Impact (African Context)

| Connection | Load Time | User Experience | Regional Note |
|------------|-----------|----------------|---------------|
| **Office WiFi (100Mbps)** | 0.64s | Looks fine ✅ | QA tested here (urban SA/Kenya/Nigeria) |
| **Urban 4G (19-25Mbps)** | 3.4s | Noticeable delay | Cape Town, Lagos, Nairobi avg |
| **Suburban 4G (52% of traffic)** | 4.3s | Frustrating | Pretoria, Mombasa, Accra |
| **3G/Edge (28% of traffic)** | 12.8s | Unusable ❌ | Rural Africa, secondary cities |

### Business Impact

- Google research: **53% of users abandon if load >3s**
- Our 8s LCP → **76% mobile bounce rate**
- Every 1s delay = **7% conversion loss**
- 8s - 2.5s = 5.5s × 7% = **38.5% revenue loss**

### How to Debug

1. Open Chrome DevTools → Network tab
2. Reload page, see 16MB+ image transfer
3. Use Throttling (Slow 4G) to simulate real conditions
4. Check Performance → Lighthouse → LCP metric
5. Identify hero images as LCP elements

### The Fix

**Location:** `public/css/hero.css` (document fix strategy)

**Strategy:**
```css
.hero {
  /* ✅ FIX: Single image, reasonable resolution, WebP format */
  background-image: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=75&fm=webp');
  background-attachment: scroll; /* Remove expensive parallax */
  /* Remove background-blend-mode or use less expensive blend */
}
```

**Result:**
- 16MB+ → 180KB (88× smaller!)
- LCP: 8s → 1.2s ✅
- Parallax removed = smoother scroll

---

## Problem 2: Marketing Tag Manager Clearance Banner ⚡ CLS: +0.28

### The Backstory

**Week 3 post-redesign (October 2024)**

**Context:** Site already has performance issues (CSAT dropped 87% → 62%, mobile bounce 76%). Marketing wants to move clearance inventory before Black Friday (3 weeks away).

**Marketing Manager** (Slack DM to Marketing Ops):
*"We need to deploy clearance sale banner ASAP. Use Tag Manager so we don't have to wait for engineering sprint. 'Up to 40% off select tech. Limited stock before Black Friday.'"*

**Marketing Ops:**
*"On it. We can deploy via Tag Manager today without engineering review."*

**[2 hours later: Banner deployed]**

**[Week 4 post-launch: Analytics review]**

**Marketing Manager:**
*"Banner CTR is 8%! Great engagement!"*

**Performance Consultant:**
*"But bounce rate increased from 76% to 78%. You gained 8% clicks but lost 12% to bounce. Net effect: -4% users. The banner loads 2 seconds late and causes a 120px layout shift. CLS went from 0.08 to 0.36."*

### The Technical Problem

**Where to Find:** `public/js/tagManager.js:58-120`

**The Broken Code:**
```javascript
// Simulates Google Tag Manager loading after page
setTimeout(() => {
  injectClearanceBanner();
}, 2000);

function injectClearanceBanner() {
  const banner = document.createElement('div');
  banner.className = 'marketing-promo-banner';
  banner.innerHTML = `
    <div class="promo-content">
      <!-- 120px tall banner -->
    </div>
  `;

  // ❌ NO HEIGHT RESERVATION → Injects 120px element → Shifts page down
  const productsSection = document.querySelector('.products');
  productsSection.insertBefore(banner, productsSection.firstChild);
  // CLS Impact: +0.28 (site CLS: 0.08 → 0.36)
}
```

### Core Web Vitals Impact

| Metric | Before Banner | After Banner | Change |
|--------|---------------|--------------|--------|
| **CLS** | 0.08 | 0.36 | ❌ +0.28 (4.5× worse!) |
| **Mobile Bounce** | 76% | 78% | ❌ +2% |
| **Desktop Bounce** | 32% | 34% | ❌ +2% |

### Real User Impact

**What Happens:**
1. User loads page → starts scrolling/reading
2. 2 seconds later: Banner loads
3. Content shifts down 120px unexpectedly
4. User was aiming for "Buy Now" → clicks wrong product or empty space
5. Frustration → cart abandonment

### Business Impact

- **Banner CTR:** 8% click-through (looks successful!)
- **Bounce rate increase:** +12% (actual cost)
- **Net impact:** **-4% users** (lost more than gained)
- **Revenue impact:** **-R87k/week** in first week after banner
- **Time pressure:** 3 weeks until Black Friday (urgent fix needed)

**Organizational Lesson:** Tag Manager bypassed engineering review, Marketing needs performance guardrails

### How to Debug

1. Load page → wait 2 seconds → clearance banner appears
2. Watch: Products section jumps down ~120px
3. DevTools → Performance → Record → Wait for banner injection
4. Layout Shifts panel → See purple shift region (120px)
5. CLS metric: Shows +0.28 from banner injection alone

### The Fix

**Location:** `public/js/tagManager.js:122-161` (commented)

**Strategy - Reserve Space Before Injection:**

**Option A - HTML Skeleton** (add to `index.html` before products section):
```html
<div class="promo-banner-skeleton" aria-hidden="true">
  <div style="height: 120px; background: rgba(251, 191, 36, 0.05); margin-bottom: 3rem;"></div>
</div>
```

Then modify tagManager.js:
```javascript
const skeleton = document.querySelector('.promo-banner-skeleton');
if (skeleton) {
  skeleton.replaceWith(banner); // No shift!
}
```

**Option B - CSS Reserved Space** (add to `products.css`):
```css
.products::before {
  content: '';
  display: block;
  height: 120px;
  margin-bottom: 3rem;
}
```

**Result:**
- CLS: 0.36 → 0.08 ✅ (removes +0.28 from banner)
- Mobile bounce: 78% → 76% (back to baseline)
- Desktop bounce: 34% → 32% (back to baseline)

---

## Problem 3: The "Netflix Effect" Animated Orbs ⚡ CLS: 0.26, FPS: 20-30

### The Backstory

**Sprint Planning Meeting, Product Backlog Grooming**

**PM** (excited):
*"I saw this gorgeous animated effect on Netflix's homepage. It feels SO premium and immersive. Can we do something like that?"*

**Design Lead** (lighting up):
*"YES! Absolutely! I've been wanting to add more depth. Let's do animated gradient orbs with blur effects. Four layers for depth - just like Apple does!"*

**Senior Dev:**
*"That might be expensive to animate..."*

**PM:**
*"It's just CSS blur, right? How hard can it be?"*

**Design Lead:**
*"Look, I'll design it over the weekend. Trust me, it'll elevate the entire brand. This is what modern premium sites do."*

**[Weekend passes...]**

**Developer** (Monday, tired):
*"Okay, created 4 huge orbs with 70-90px blur each. Looks STUNNING on my M1 Max! Shipping it."*

**[3 weeks later, after launch...]**

**Performance Consultant** (looking at DevTools):
*"This is causing 0.26 CLS and dropping FPS to 20-30 on real devices. See these purple layout shift bars? All from the orbs. See the frame drops? Heavy blur + continuous transforms."*

**PM:**
*"But... but it looks amazing!"*

**Performance Consultant:**
*"On your M1 Max, yes. On a mid-tier Android across Africa with 60% battery? Frozen. Your users in Lagos, Nairobi, Accra, Casablanca - they're all experiencing this."*

### The Technical Problem

**Where to Find:** `public/js/animations.js:96-291`

**The Broken Code:**
```javascript
function initPremiumDepthShader() {
  // ❌ CREATES 4 MASSIVE ANIMATED ELEMENTS:

  // Orb 1: 1000px × 1000px, blur(80px)
  const orb1 = document.createElement('div');
  orb1.style.cssText = `
    position: absolute;      /* ← CLS: percentage positioning causes shifts */
    width: 1000px;           /* ← EXPENSIVE: Huge element */
    filter: blur(80px);      /* ← EXPENSIVE: Heavy GPU load */
    animation: sweepOrb1 12s ease-in-out infinite;
  `;

  // Orb 2: 900px × 900px, blur(70px)
  // Orb 3: 800px × 800px, blur(90px)

  // Light Beam: WORST OFFENDER
  const lightBeam = document.createElement('div');
  lightBeam.style.cssText = `
    width: 500px;
    height: 250%;            /* ← WORST: Percentage height causes constant recalc */
    top: -75%;               /* ← WORST: Percentage positioning */
    filter: blur(50px);
    animation: sweepBeam 8s ease-in-out infinite;
  `;

  // Append all 4 orbs
  heroSection.appendChild(orb1);
  heroSection.appendChild(orb2);
  heroSection.appendChild(orb3);
  heroSection.appendChild(lightBeam);  // ← This one is the CLS killer
}
```

### Core Web Vitals Impact

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **CLS** | 0.26 | <0.1 | ❌ 2.6× worse |
| **FPS** | 20-30 | 60 | ❌ 2-3× worse |

### Real User Impact by Device

| Device Type | FPS | User Experience | % of Users |
|-------------|-----|----------------|-----------|
| **M1 Max** (Dev machine) | 60 FPS | Butter smooth ✅ | 3% |
| **Mid-range** devices | 40 FPS | Noticeable stutter | 12% |
| **Budget** devices | 20 FPS | Feels broken ❌ | 60% |

### Business Impact

- Google research: **84% of users find 30 FPS "sluggish"**
- Janky animations = lower trust = abandoned purchases
- **The Irony:** Premium animations designed to **increase trust** are **destroying it**
- Battery drain on mobile devices

### How to Debug

1. DevTools → Performance → Record with CPU throttling (4x)
2. Scroll page, observe frame drops (20-30 FPS, target is 60)
3. DevTools → Rendering → Paint flashing (see constant repaints)
4. Performance → Layout Shifts → Identify `div.premium-light-beam`
5. Check Main Thread waterfall - see long Filter/Paint tasks

### The Fix

**Location:** `public/js/animations.js:293-364` (commented)

**Strategy - The Compromise:**
```javascript
function initPremiumDepthShader() {
  // ✅ COMPROMISE: Keep premium feel but optimize

  // Orb 1: 600px (was 1000px), blur 35px (was 80px)
  const orb1 = document.createElement('div');
  orb1.style.cssText = `
    position: fixed;              /* ← FIX: Prevents CLS */
    width: 600px;                 /* ← FIX: Smaller */
    filter: blur(35px);           /* ← FIX: Lighter blur */
    contain: layout style paint;  /* ← FIX: Isolate layout impact */
  `;

  // Orb 2: 500px (was 900px), blur 30px (was 70px)

  // ← REMOVED: Light beam (worst offender)
  // ← REMOVED: Orb 3 (blue accent)
  // RESULT: 2 orbs instead of 4, still premium, but performant
}
```

**Result:**
- CLS: 0.26 → 0.04 ✅ (85% reduction)
- FPS: 20-30 → 60 ✅ (2-3× improvement)
- Still maintains premium aesthetic

---

## Problem 4: Hover Effect Disaster ⚡ INP: 620ms

### The Backstory

**3 days before launch, Friday afternoon**

**PM** (on Slack):
*"Hey @dev-team, quick request before we ship Monday. When users hover over a product, can we dim the others? Creates nice visual focus. Should be easy, right?"*

**Developer** (tired, rushing):
*"Sure, I'll add it before EOD."*

**[30 minutes of coding...]**

**Developer:**
*"Done! Added mouseenter listener, fetches product details, dims other products. Tested on my machine, works great!"*

**[Ships to production Monday...]**

**[Week 2 post-launch, Twitter explodes...]**

User:
*"Why does @TechMart feel so laggy? Hovering over products is painful."*

**Performance Consultant** (DevTools Performance Panel):
*"Every hover triggers: Unthrottled API fetch (network spam), querySelectorAll('.product-card') - queries entire DOM, DOM manipulation forcing layout recalculation. Result: INP 620ms. Target is <200ms. Users feel frozen interface."*

### The Technical Problem

**Where to Find:**
- `public/js/animations.js:409-492` (hover handler)
- `public/js/productRenderer.js:21-162` (expensive rendering)

**The Broken Code - Part 1 (Hover Handler):**
```javascript
card.addEventListener('mouseenter', async () => {
  // ❌ PROBLEM 1: Unthrottled fetch on EVERY hover (400ms API delay)
  const response = await fetch(`http://localhost:3000/api/products/${productId}`);
  const product = await response.json();

  // ❌ PROBLEM 2: Heavy DOM queries on every hover (180ms)
  const allCards = document.querySelectorAll('.product-card');  // 3× queries!
  const prices = document.querySelectorAll('.product-price');
  const names = document.querySelectorAll('.product-name');

  // ❌ PROBLEM 3: Create wishlist icon AFTER API fetch
  // User might have already moved mouse away - never sees the feature!
  const wishlistIcon = document.createElement('div');
  wishlistIcon.className = 'wishlist-icon';
  wishlistIcon.innerHTML = `<svg>...</svg>`;
  card.appendChild(wishlistIcon);  // Appears 400ms+ later

  // ❌ PROBLEM 4: Force layout recalculation on all cards (100ms)
  allCards.forEach(otherCard => {
    otherCard.style.opacity = '0.5';
    otherCard.style.filter = 'grayscale(50%)';
  });
});
```

**The Broken Code - Part 2 (Product Renderer):**
```javascript
products.forEach((product) => {
  const card = createProductCard(product);

  // ❌ Append one-by-one (forces layout recalc × 6)
  productGrid.appendChild(card);

  // ❌ WORST: Read offsetHeight (layout thrashing)
  const height = card.offsetHeight;

  // ❌ Block main thread for 15ms per product
  performExpensiveCalculation();  // 15ms × 6 = 90ms blocked
});
```

### Core Web Vitals Impact

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **INP** | 620ms | <200ms | ❌ 3.1× worse |

**INP Breakdown - Where the 620ms Goes:**

| Component | Time | % of Total |
|-----------|------|-----------|
| API Fetch | 400ms | 64.5% |
| querySelectorAll DOM scan | 180ms | 29.0% |
| Layout thrashing | 100ms | 16.1% |
| **TOTAL** | **680ms** | (INP 620ms) |

### Real User Impact

**Perception Thresholds:**
- **<100ms:** Feels instant ✅
- **100-300ms:** Noticeable
- **>500ms:** Feels frozen ❌ ← **We're here at 620ms**

**User Experience:**
1. User hovers over product
2. **400ms:** Waiting... interface feels frozen
3. **620ms:** Finally responds, but user might have already moved mouse
4. **Wishlist heart icon:** Appears 400ms+ after hover starts - user often misses it entirely

**Feature Discoverability Problem:**
- Wishlist icon loads so late that fast-moving users never see it
- Feature exists but is invisible to 60%+ of users
- Performance isn't just speed - it's UX and business value

### Business Impact

- Sites with INP <200ms have **31% higher engagement**
- Our 620ms → users think site **crashed**
- Anti-pattern: **I/O in event handlers** blocks UI
- Every hover interaction feels broken
- Wishlist feature has low discovery (users don't see it)

### Race Condition Issue

**Additional Problem:** If user hovers briefly (<400ms) and leaves before fetch completes, the wishlist icon still gets appended to the card and stays there forever (orphaned icon).

**Fix Applied:** `isHovering` flag to prevent orphaned icons (band-aid solution - real fix is eliminating the fetch)

### How to Debug

1. DevTools → Performance → Record user interaction
2. Hover over product cards
3. Check Interactions track - see INP (Interaction to Next Paint)
4. Identify blocking tasks in Main Thread
5. Network panel shows redundant API calls (one per hover!)
6. Console shows: `🐌 Slow API call for product N (400ms delay)`

### The Fix

**Location:**
- `public/js/animations.js:494-545` (commented - frontend fix)
- `public/js/productRenderer.js:165-250` (commented - architectural fix)

**Fix Level 1: Backend API Architecture**

Current API (BAD):
```javascript
// Initial page load
GET /api/products → [{id, name, price, image}, ...]

// On EVERY hover (N additional requests!)
GET /api/products/1 → {id, name, price, image, alt, inWishlist}  // 400ms delay
GET /api/products/2 → {id, name, price, image, alt, inWishlist}  // 400ms delay
```

Fixed API (GOOD):
```javascript
// Single request, all data included
GET /api/products → [{id, name, price, image, alt, inWishlist}, ...]
// No additional requests needed!
```

**Fix Level 2: Frontend Rendering**

Current (BAD):
```javascript
// Render basic card without wishlist icon
card.innerHTML = `<img><button>Add to Cart</button>`;
// On hover: Fetch → Create icon → Append (400ms+ delay)
```

Fixed (GOOD):
```javascript
// Render complete card with wishlist icon immediately
card.innerHTML = `
  <img>
  <div class="wishlist-icon ${product.inWishlist ? 'active' : ''}">
    <svg>...</svg>
  </div>
  <button>Add to Cart</button>
`;
// Icon visible instantly on first hover!
```

**Fix Level 3: Event Handler Optimization**

Current (BAD):
```javascript
card.addEventListener('mouseenter', async () => {
  const product = await fetch(...);  // 400ms
  const icon = createElement('div');
  card.appendChild(icon);
});
```

Fixed (GOOD):
```javascript
// Icon already rendered, no fetch needed
const allCards = document.querySelectorAll('.product-card'); // Cache ONCE

card.addEventListener('mouseenter', () => {
  // ✅ FIX: Debounce + batch with rAF
  requestAnimationFrame(() => {
    allCards.forEach(c => c.style.opacity = '0.5');
  });
});
```

**Result:**
- INP: 620ms → 60ms ✅ (10× faster!)
- Wishlist icon appears instantly
- No API calls on hover
- No race conditions
- Better architecture: Backend provides all data upfront

---

## 📊 Before & After Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Lighthouse Score** | 28/100 | 85+/100 | **3× better** |
| **LCP** (Largest Contentful Paint) | 8.0s | 1.2s | **6.8s faster** |
| **CLS** (Cumulative Layout Shift) | 0.36 | 0.08 | **4.5× better** |
| **INP** (Interaction to Next Paint) | 620ms | 60ms | **10× faster** |
| **FPS** (Frames Per Second) | 20-30 | 60 | **2-3× smoother** |
| **Hero Image Size** | 16MB+ | 180KB | **88× smaller** |
| **Total Page Weight** | 17MB+ | 1.2MB | **14× smaller** |

### Real User Impact (African Context)

- **15-20Mbps connection** (Urban Africa avg): Page load 32s → 4s
- **Low-end devices** (65% of users across Africa): Usable FPS restored
- **3G/Edge networks** (40% in rural areas): Page becomes accessible
- **Bounce rate**: Projected 34% reduction
- **CSAT score**: Expected recovery from 62% → 85%

---

## 🛠️ Running the Demo Locally

### Prerequisites
- Node.js 18+ (uses ES modules)
- Modern browser with DevTools (Chrome/Edge recommended)

### Setup
```bash
# Clone repository
git clone https://github.com/jonathanbooysen/debugging-web-performance-talk
cd debugging-web-performance-talk

# Install dependencies
npm install

# Start server
npm start

# Open browser
# http://localhost:3000
```

### Server Configuration

**API Delays (Simulating Real-World Latency):**
- `GET /api/products`: 150ms (acceptable for initial page load)
- `GET /api/products/:id`: 400ms (demonstrates hover problem!)

The 400ms delay simulates realistic API roundtrip including:
- Database query
- User wishlist status check
- Product metadata aggregation
- Load balancer/proxy overhead

When you hover over products, console shows:
```
🐌 Slow API call for product 1 (400ms delay) - This is why hover feels frozen!
```

---

## 🔧 Applying Fixes During Live Demo

All fixes are **commented out** in the code, ready for live demonstration.

### Fix 1: Hero Image
**File:** `public/css/hero.css:10-16`

**Find:**
```css
background-image:
  url('https://images.unsplash.com/...?w=5120&q=100'),
  url('https://images.unsplash.com/...?w=5120&q=100');
background-attachment: fixed;
```

**Replace with:**
```css
background-image: url('https://images.unsplash.com/...?w=1920&q=75&fm=webp');
background-attachment: scroll;
/* Remove second image and blend-mode */
```

### Fix 2: Marketing Banner
**File:** `public/js/tagManager.js:122-161` (uncomment)

Add skeleton div or CSS reserved space before Tag Manager injection.

### Fix 3: Animated Orbs
**File:** `public/js/animations.js:96-291`

Comment out current implementation (lines 96-291)
Uncomment fixed version (lines 293-364)

### Fix 4: Hover Effect
**File:** `public/js/animations.js:409-492`

Comment out current implementation
Uncomment fixed version (lines 500-545)

Also update `public/js/productRenderer.js` to render wishlist icon immediately (lines 165-250)

---

## 🎬 Live Demo Guide (20-Minute Talk Structure)

### Part 1: Setup & Context (3 minutes)
1. Tell the TechMart story (R3.5M redesign disaster)
2. Show the live site - looks beautiful but...
3. Run Lighthouse: **Score 28/100** ❌

### Part 2: Problem 1 - Hero Image LCP (4 minutes)
1. DevTools → Network → Show 16MB+ transfer
2. Apply Slow 4G throttling → 8s blank screen
3. Explain backstory
4. **Live Fix:** Optimize images
5. Reload: Instant hero, LCP improved!

### Part 3: Problem 2 - Marketing Banner CLS (3 minutes)
1. DevTools → Performance → Record with Layout Shifts
2. Show 120px shift when banner loads
3. Explain backstory (Tag Manager bypass)
4. **Live Fix:** Add reserved space
5. Reload: No more layout shift!

### Part 4: Problem 3 - Animated Orbs (4 minutes)
1. DevTools → Performance → CPU 4× throttling
2. Show frame drops (20-30 FPS)
3. Explain "Netflix Effect" backstory
4. **Live Fix:** Comment/uncomment code
5. Reload: Smooth 60 FPS!

### Part 5: Problem 4 - Hover Effect INP (4 minutes)
1. DevTools → Performance → Record interaction
2. Hover over products → show 620ms INP
3. Network shows repeated API calls
4. Explain backstory + architectural fix needed
5. **Live Fix:** Show multi-level solution
6. Reload: Instant hover response!

### Part 6: Final Results (2 minutes)
1. Run final Lighthouse audit
2. Show: **28 → 85+** ✅
3. Key takeaway: "Stop guessing, start measuring"
4. Q&A

---

## 🌍 African Context

This demo specifically addresses African web conditions across the continent:

### Network Reality
- **Average urban broadband**: 15-25Mbps (Cape Town, Lagos, Nairobi, Accra)
- **Average suburban 4G**: 8-15Mbps (Pretoria, Mombasa, Dakar, Kampala)
- **Rural/3G**: 2-5Mbps (40% of sub-Saharan Africa)
- **Network latency**: 150-300ms higher than US/EU
- **Data costs**: Among highest globally - users notice every MB

### Device Reality
- **Low-end Android devices**: 65% of African users
- **Device age**: Average 3-4 years old (vs 2 years in US/EU)
- **RAM constraints**: 2GB RAM common, 1GB still prevalent
- **Storage**: Often <32GB, limits browser cache

### Market Specifics
- **Currency**: Rand (R) for South African pricing
- **Regional variation**: Nigeria (₦), Kenya (KSh), Ghana (₵), Egypt (E£)
- **Economic context**: Performance = accessibility = market reach

### Key Regional Challenges

**Nigeria (Africa's largest economy):**
- Lagos metro: Decent 4G, but congestion issues
- Outside Lagos: Spotty 3G, frequent Edge fallback
- Data costs: ₦1000-2000/GB ($0.65-1.30)

**Kenya (Tech hub):**
- Nairobi: Good 4G coverage (M-Pesa ecosystem)
- Rural areas: 3G/Edge, solar charging common
- Safaricom dominance: Network quality varies by region

**South Africa (Most developed infrastructure):**
- Urban centers: 20-30Mbps typical
- Townships: 3G/4G mix, data costs high
- Load shedding: Affects connectivity infrastructure

**Ghana, Uganda, Tanzania, Egypt:**
- Capital cities: Improving 4G coverage
- Secondary cities: 3G primary, 4G spotty
- Rural areas: Edge/2G still common

**Key Lesson:** Your office WiFi in Sandton/Victoria Island/Westlands and MacBook Pro don't represent your users' reality across Lagos, Nairobi, Accra, Cairo, Johannesburg, Dakar, Kampala, and rural Africa.

---

## 🎓 Key Concepts Demonstrated

### Core Web Vitals
- **LCP** (Largest Contentful Paint): <2.5s is good
- **CLS** (Cumulative Layout Shift): <0.1 is good
- **INP** (Interaction to Next Paint): <200ms is good

### DevTools Workflow
1. **Network Panel**: Identify large resources, throttling
2. **Performance Panel**: Record interactions, find bottlenecks
3. **Lighthouse**: Automated audits, actionable recommendations
4. **Layout Shifts**: Visualize CLS issues
5. **Rendering Panel**: Paint flashing, layer borders

### Performance Patterns
- **Image Optimization**: Responsive images, WebP, dimensions
- **CSS Performance**: Avoid expensive filters, use `contain`
- **JavaScript Optimization**: Debouncing, RAF batching, selector caching
- **API Architecture**: Include data upfront, avoid hover fetches

---

## 🎯 Key Takeaway

> **"Your office WiFi and MacBook Pro don't represent your users' reality. Stop guessing. Start measuring."**

Use Chrome DevTools systematically:
1. **Measure** (Network, Performance, Lighthouse)
2. **Identify** (Find the bottleneck with data)
3. **Fix** (Apply targeted optimization)
4. **Validate** (Re-measure to confirm improvement)

No guessing. Only data. 📊

---

## 🚀 CI/CD Performance Monitoring

This project implements **production-grade performance monitoring** using web.dev best practices. It combines automated testing (Lighthouse CI) with real user monitoring (RUM) to catch performance regressions before deployment and track field performance.

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  LAB DATA (Synthetic Testing)                               │
│  Lighthouse CI in GitHub Actions                            │
│  ✓ Runs on every PR/commit                                  │
│  ✓ Catches regressions before deployment                    │
│  ✓ Enforces performance budgets                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FIELD DATA (Real User Monitoring)                          │
│  web-vitals library + Google Analytics 4                    │
│  ✓ Measures actual user experience                          │
│  ✓ Captures Core Web Vitals with attribution                │
│  ✓ Identifies which elements cause problems                 │
└─────────────────────────────────────────────────────────────┘
```

### 1. Lighthouse CI (Automated Testing)

**What it does:**
- Runs Lighthouse audits automatically on every PR and commit to main
- Enforces performance budgets to prevent regressions
- Fails builds if performance drops below thresholds
- Uploads reports as GitHub Actions artifacts

**Configuration:** `.github/workflows/lighthouse-ci.yml`

```yaml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

**Performance Budgets:** `lighthouserc.json`

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["warn", {"maxNumericValue": 300}],
        "resource-summary:script:size": ["warn", {"maxNumericValue": 200000}],
        "resource-summary:image:size": ["error", {"maxNumericValue": 1000000}]
      }
    }
  }
}
```

**Running Lighthouse CI Locally:**

```bash
# Start server
npm start

# In another terminal:
npm run lhci:collect   # Run 3 audits
npm run lhci:assert    # Check against budgets
npm run lhci:upload    # Upload to temporary storage
```

**Results Location:**
- GitHub Actions: Check workflow artifacts for `.lighthouseci/` folder
- Local: `.lighthouseci/` directory contains HTML reports
- CI comments on PRs with Core Web Vitals summary

### 2. Real User Monitoring (RUM)

**What it does:**
- Captures Core Web Vitals from actual users in production
- Provides attribution data to identify problematic elements
- Sends metrics to Google Analytics 4 for analysis
- Logs detailed debugging info to console (for demo/development)

**Implementation:** `public/js/webVitals.js`

```javascript
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals/attribution';

// Captures each metric with attribution
onLCP((metric) => {
  // metric.attribution.element → Which element was LCP
  // metric.attribution.url → Which resource caused delay
  // metric.attribution.timeToFirstByte → Server response time
  sendToGoogleAnalytics(metric);
});
```

**Metrics Captured:**

| Metric | What it measures | Good threshold | Attribution includes |
|--------|------------------|----------------|---------------------|
| **LCP** | Largest paint time | <2.5s | Element, URL, TTFB, resource load time |
| **CLS** | Layout shift amount | <0.1 | Element causing biggest shift, when it happened |
| **INP** | Interaction latency | <200ms | Which element, interaction type, processing time |
| **FCP** | First paint time | <1.8s | TTFB, time from first byte to paint |
| **TTFB** | Server response time | <800ms | DNS, connection, request durations |

### 3. Google Analytics 4 Setup

**Step 1: Create GA4 Property**
1. Go to https://analytics.google.com/
2. Create new property: "TechMart Performance Monitoring"
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

**Step 2: Add Measurement ID**
Edit `public/index.html` line 375 and 380:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID-HERE"></script>
<script>
  gtag('config', 'G-YOUR-ID-HERE');
</script>
```

**Step 3: View Metrics in GA4**
- Events → All events → Filter by metric name (LCP, CLS, INP, etc.)
- Realtime → Events → See metrics as users interact
- Custom dimensions: `metric_rating`, `debug_target` provide context

**For Demo/Development:**
- If GA4 not configured, metrics log to console with full attribution
- No metrics are lost - console shows everything GA4 would receive
- Useful for demonstrating RUM during talks without GA4 setup

### 4. Viewing Performance Data

**In Development (Console):**

```javascript
// Console output includes emoji indicators:
✅ LCP: 1200ms (good)
⚠️ CLS: 0.15 (needs-improvement)
❌ INP: 420ms (poor)

// With detailed attribution:
🎯 Attribution:
  Element: IMG
  URL: /images/hero.jpg
  Time to First Byte: 120ms
  Resource Load Delay: 45ms
  Resource Load Time: 850ms
  Element Render Delay: 185ms

💡 TIP: This is the largest contentful element in viewport!
```

**In GitHub Actions:**

1. Go to Actions tab → Select workflow run
2. Download `lighthouse-results` artifact
3. Open `.lighthouseci/*.html` reports in browser
4. Review:
   - Performance score trends
   - Core Web Vitals over time
   - Failed assertions (if any)

**In Google Analytics 4:**

1. **Realtime Report:**
   - See metrics as users browse
   - Filter by page, device, location

2. **Custom Report (create this):**
   ```
   Dimensions: Event name, metric_rating, debug_target
   Metrics: Event count, Average value
   Filters: Event name = (LCP|CLS|INP|FCP|TTFB)
   ```

3. **Key Questions to Answer:**
   - Which pages have poorest LCP? (Filter by page_location)
   - Which elements cause most CLS? (Group by debug_target)
   - Do mobile users have worse INP? (Compare by device_category)
   - Has performance improved after deployment? (Trend over time)

### 5. Performance Budget Enforcement

**How it works:**
1. Developer opens PR with code changes
2. GitHub Actions triggers Lighthouse CI workflow
3. Lighthouse runs 3 audits and takes median scores
4. Results compared against budgets in `lighthouserc.json`
5. If any "error" threshold exceeded → Build fails ❌
6. If only "warn" thresholds exceeded → Build passes with warnings ⚠️
7. PR comment shows Core Web Vitals summary

**Example Workflow:**

```
PR #42: "Add product zoom feature"

Lighthouse CI Results:
✅ LCP: 2.1s (budget: <2.5s)
❌ CLS: 0.25 (budget: <0.1) ← FAILS BUILD
⚠️ TBT: 350ms (budget: <300ms) ← WARNING
✅ Script size: 185KB (budget: <200KB)

Build Status: FAILED
Reason: CLS exceeds budget (0.25 > 0.1)
```

**Adjusting Budgets:**

Edit `lighthouserc.json` to fit your performance goals:

```json
{
  "assertions": {
    // Stricter budget:
    "largest-contentful-paint": ["error", {"maxNumericValue": 2000}],

    // More lenient budget:
    "total-blocking-time": ["warn", {"maxNumericValue": 500}],

    // Disable check:
    "unused-javascript": "off"
  }
}
```

### 6. Integration in Your Workflow

**For Solo Developers:**
```bash
# Before committing:
npm run lhci:collect && npm run lhci:assert

# If pass: Commit and push
# If fail: Fix performance issues first
```

**For Teams:**
```bash
# Create feature branch
git checkout -b feature/product-zoom

# Make changes, test locally
npm start
# Check console for Web Vitals

# Push PR - CI automatically runs
git push origin feature/product-zoom

# If CI fails:
# 1. Download Lighthouse reports from Actions artifacts
# 2. Identify failing metrics
# 3. Fix and push again
```

**For Production Monitoring:**
1. Deploy with GA4 configured
2. Monitor GA4 dashboard daily/weekly
3. Set up alerts for degraded metrics:
   - LCP P75 > 3s
   - CLS P75 > 0.15
   - INP P75 > 300ms
4. Investigate using attribution data

### 7. Troubleshooting

**Lighthouse CI fails locally but not in CI:**
- Check if server is running on port 3000
- Ensure no other processes using port
- Check `startServerReadyTimeout` in `lighthouserc.json`

**Web Vitals not sending to GA4:**
- Verify Measurement ID is correct (not `G-XXXXXXXXXX`)
- Check browser console for warnings
- Ensure `gtag` is defined before webVitals.js loads
- Test in production mode (not localhost with ad blockers)

**CLS budget keeps failing:**
- Check attribution data: Which element causes shifts?
- Reserve space for async content (ads, banners)
- Add explicit dimensions to images
- Avoid inserting content above existing content

**LCP budget keeps failing:**
- Optimize images: WebP, responsive sizes, compression
- Prioritize LCP resource: `fetchpriority="high"` or preload
- Reduce TTFB: Optimize server response time
- Remove render-blocking resources above fold

### 8. Advanced Lighthouse CLI (Custom Throttling)

The Lighthouse CLI provides more granular control over network and CPU throttling than the DevTools UI. This project includes **5 custom configurations**: one simulating the "developer machine" scenario (unthrottled) and four tailored to **African network conditions** for realistic performance testing.

**Why use CLI over DevTools?**
- DevTools Lighthouse has limited throttling presets (Mobile, Desktop)
- CLI allows custom CPU multipliers (4x, 6x, 8x slowdown)
- CLI allows custom network conditions (RTT, throughput)
- CLI generates standalone HTML reports you can share with stakeholders
- CLI enables batch testing across multiple scenarios

#### Testing Configurations

This demo includes 6 custom configs: one "developer machine" baseline, one budget consumer laptop, and 4 representing real African user scenarios.

| Config | Scenario | Network | CPU | Device Example |
|--------|----------|---------|-----|----------------|
| **developer-machine.js** | ⚠️ "Works fine on my machine" | 100Mbps, 10ms RTT | No throttling | MacBook Pro M1/M2 (desktop) |
| **consumer-laptop.js** | 💻 Budget consumer laptop | 30Mbps, 60ms RTT | 4.5x slowdown | Acer Aspire, Lenovo IdeaPad ($300-500) |
| **african-urban.js** | Major cities (JHB, Lagos, Nairobi) | 15-20Mbps, 180ms RTT | 4x slowdown | Mid-tier Android (Galaxy A series) |
| **african-suburban.js** | Townships, smaller cities | 8-12Mbps, 250ms RTT | 6x slowdown | Budget Android |
| **african-rural.js** | Rural areas, remote locations | 2-5Mbps, 400ms RTT | 8x slowdown | Entry-level Android |
| **african-best-case.js** | Premium fiber connections | 100Mbps, 40ms RTT | 1x (no throttling) | High-end Android/iPhone |

**⚠️ Important:** The `developer-machine.js` config demonstrates **why the TechMart redesign failed**. It simulates testing on a MacBook Pro with fast office WiFi - the exact conditions that led to "works fine on my machine" syndrome.

**💻 The Consumer Laptop Gap:** The `consumer-laptop.js` config reveals another blind spot - most consumers don't have MacBook Pros ($2000). They have budget Windows laptops from Best Buy/Takealot ($300-500). Businesses test on premium hardware and miss the 60%+ of desktop users browsing on Acer Aspire and Lenovo IdeaPad machines.

#### Configuration Files

All configs are in `lighthouse-configs/` directory. Each config exports a Lighthouse configuration object:

```javascript
// lighthouse-configs/african-urban.js
export default {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    throttling: {
      rttMs: 180,                    // Round-trip time
      throughputKbps: 17500,         // 17.5 Mbps download
      cpuSlowdownMultiplier: 4,      // 4x CPU slowdown
      downloadThroughputKbps: 17500,
      uploadThroughputKbps: 7500,
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2.625,
    },
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
```

#### Running Lighthouse CLI

**Prerequisites:**
```bash
# Ensure server is running first
npm start

# In another terminal...
```

**Run individual configs:**
```bash
# Developer machine (unthrottled - MacBook Pro)
npm run lighthouse:dev-machine

# Consumer laptop (budget Windows laptop)
npm run lighthouse:consumer-laptop

# Urban conditions (15-20Mbps, 4x CPU)
npm run lighthouse:urban

# Suburban conditions (8-12Mbps, 6x CPU)
npm run lighthouse:suburban

# Rural conditions (2-5Mbps, 8x CPU)
npm run lighthouse:rural

# Best-case conditions (100Mbps, 1x CPU)
npm run lighthouse:best-case
```

**Run all configs at once:**
```bash
npm run lighthouse:all
```

This runs all 6 configs sequentially and generates HTML reports for each.

#### Viewing Reports

Reports are saved to `lighthouse-reports/` (gitignored):

```bash
# Open reports in browser
open lighthouse-reports/developer-machine.html
open lighthouse-reports/consumer-laptop.html
open lighthouse-reports/african-urban.html
open lighthouse-reports/african-suburban.html
open lighthouse-reports/african-rural.html
open lighthouse-reports/african-best-case.html
```

Each report includes:
- Performance score (0-100)
- Core Web Vitals (LCP, CLS, INP)
- Detailed diagnostics and opportunities
- Network request waterfall
- Screenshots of page load progression

#### Use Cases

**1. Demonstrating "Works Fine on My Machine" Problem**
```bash
# Run on developer machine (unthrottled MacBook Pro)
npm run lighthouse:dev-machine
# Score: 95/100 ✅ LCP: 1.2s

# Run on consumer laptop (budget Windows)
npm run lighthouse:consumer-laptop
# Score: ~55/100 ⚠️ LCP: 2.8s

# Run on rural African conditions (mobile)
npm run lighthouse:rural
# Score: 28/100 ❌ LCP: 8.2s
```
**The Gap:** Developer sees 95/100 and ships. Consumer laptop user sees 55/100. Mobile user sees 28/100 and bounces. This is exactly what happened to TechMart.

**Teaching moment:** Even desktop users on consumer hardware struggle! It's not just a mobile problem.

**2. Testing Performance Across Connectivity Spectrum**
```bash
npm run lighthouse:all
```
Compare scores across all 6 configs to understand how your site performs from premium hardware to budget devices to real African mobile user conditions.

**3. Validating Fixes for Specific Regions**
```bash
# Before fix
npm run lighthouse:rural
# Score: 28/100, LCP: 8.2s

# Apply fix...

# After fix
npm run lighthouse:rural
# Score: 65/100, LCP: 2.8s
```

**4. Stakeholder Reports**
Generate HTML reports to show executives/clients how site performs across the device spectrum:
- "Here's our score on developer machines (MacBook Pro): 95/100 ✅"
- "Here's our score on consumer laptops (most buyers): 55/100 ⚠️"
- "Here's our score on 4G mobile (urban): 42/100 ❌"
- "Here's our score on 3G mobile (rural): 28/100 ❌"
- "60% of desktop users have consumer laptops, not MacBook Pros"
- "We need to optimize for the devices people actually use"

**5. Setting Realistic Performance Budgets**
Use CLI results to set budgets based on your target users:
- **80% urban users** → Set budgets based on `african-urban.js` results
- **50% rural users** → Set budgets based on `african-rural.js` results
- **Never** set budgets based on `developer-machine.js` results

#### Customizing Configs

Edit any config in `lighthouse-configs/` to match your target audience:

```javascript
// Example: Test for rural users with even slower 2G connection
throttling: {
  rttMs: 600,              // Very high latency
  throughputKbps: 1500,    // 1.5 Mbps (2G speeds)
  cpuSlowdownMultiplier: 10, // Very slow device
}
```

#### CI/CD Integration (Advanced)

You can integrate these custom configs into GitHub Actions:

```yaml
# .github/workflows/lighthouse-ci.yml
- name: Run Lighthouse with custom throttling
  run: |
    npm run lighthouse:urban
    npm run lighthouse:rural
    # Upload reports as artifacts
```

This allows you to track performance across different connectivity scenarios over time.

---

## 📄 License

MIT License - Free to use for conference talks, workshops, and educational purposes.

---

## 👤 Author

**Jonathan Booysen**
- Talk: "Stop Guessing, Start Measuring: A Primer on Debugging Web Performance"
- Focus: Practical web performance debugging for frontend engineers

---

**Ready to debug?** `npm start` and open `http://localhost:3000`
