# Web Performance Testing: Key Takeaways & Gotchas (2025 Edition)

**Last Updated:** November 13, 2025
**Author:** Jonathan Booysen
**Talk:** "Stop Guessing, Start Measuring: A Primer on Debugging Web Performance"

---

## Table of Contents

- [Major 2024-2025 Changes](#major-2024-2025-changes)
- [Lab Testing Limitations & Gotchas](#lab-testing-limitations--gotchas)
- [Core Web Vitals & Metrics Updates](#core-web-vitals--metrics-updates)
- [Chrome DevTools Evolution](#chrome-devtools-evolution)
- [RUM/Field Data Considerations](#rumfield-data-considerations)
- [Browser & Platform Differences](#browser--platform-differences)
- [African Context-Specific Gotchas](#african-context-specific-gotchas)
- [Tool Evolution & Future Directions](#tool-evolution--future-directions)
- [General Best Practices & Warnings](#general-best-practices--warnings)
- [Quick Reference Tables](#quick-reference-tables)
- [Resources & Further Reading](#resources--further-reading)

---

## Major 2024-2025 Changes

### 🚨 Critical Timeline

| Date | Change | Impact |
|------|--------|--------|
| **March 12, 2024** | INP replaced FID as Core Web Vital | ~600,000 websites went from PASS → FAIL overnight |
| **December 2024** | PageSpeed Insights throttling: 4x → 1.2x CPU | Scores increased artificially (your 65/100 might now show 78/100) |
| **October 2025** | Lighthouse 13.0 released | Audit format changed, CPU throttling adjusted |
| **Chrome 131 (Early 2025)** | Performance Insights panel deprecated | Removed from DevTools completely |
| **H2 2025** | Standalone Lighthouse panel being sunset | All tools merging into unified Performance panel |
| **November 2025** | FID completely deprecated everywhere | No more FID data anywhere |

### Why These Changes Matter

**INP Replacement:**
- FID only measured first input delay
- INP measures ALL interactions throughout page lifetime
- More comprehensive but HARDER to pass (48% → 43% pass rate)

**PSI Throttling Change:**
- Old: 4x CPU throttling (overly pessimistic)
- New: 1.2x CPU throttling (more realistic)
- Gotcha: Can't compare pre-Dec 2024 scores to post-Dec 2024 scores
- Your optimization might not have worked - the metric just changed!

**DevTools Consolidation:**
- Simplifies workflow (one panel for everything)
- Screenshots in older tutorials/talks will look outdated
- Focus on concepts, not specific UI locations in presentations

---

## Lab Testing Limitations & Gotchas

### Throttling Methods Comparison

#### 1. Simulated Throttling (Lighthouse Default)

**How it works:**
- Loads page on FAST unthrottled connection
- Collects performance data
- Applies mathematical simulation to estimate throttled performance

**Pros:**
- ✅ Fast test execution
- ✅ Low variance (deterministic results)
- ✅ Cross-platform consistency
- ✅ Easy setup (no system changes needed)

**Cons:**
- ❌ Cannot fully replicate real network behavior
- ❌ Misses packet loss, TCP congestion, connection overhead
- ❌ Inaccurate for sites with many server connections
- ❌ Doesn't capture HTTP/3 benefits

**When to use:**
- CI/CD pipelines (fast feedback)
- Rapid iteration during development
- Trend monitoring over time
- Educational demos (like this talk!)

#### 2. DevTools/Request-Level Throttling

**How it works:**
- Applies minimum duration to each HTTP request
- Throttles at browser/tab level
- Adds artificial delays when responses received

**Pros:**
- ✅ More realistic than simulated
- ✅ Tab-specific (doesn't affect system)
- ✅ Reasonably accurate for most scenarios
- ✅ Interactive testing in DevTools

**Cons:**
- ❌ Less accurate than packet-level
- ❌ Doesn't model connection establishment properly
- ❌ Treats each request independently
- ❌ Inaccurate when backend dominates

**When to use:**
- Manual testing and debugging
- One-off performance checks
- Quick validation of fixes

**How to use:**
```bash
lighthouse --throttling-method=devtools https://example.com
```

#### 3. Packet-Level Throttling (Most Accurate)

**How it works:**
- Delays individual network packets at OS level
- Uses traffic control tools (`tc`, `pfctl`, `netem`)
- Affects ALL network traffic system-wide
- Requires sudo/administrator privileges

**Pros:**
- ✅ Most accurate simulation
- ✅ Captures TCP connection establishment, packet loss
- ✅ Shows HTTP/3 benefits
- ✅ Reflects actual user experience

**Cons:**
- ❌ Requires system-level setup (sudo access)
- ❌ Affects entire machine
- ❌ Higher variance (more realistic variability)
- ❌ Slower test execution
- ❌ Complex setup

**When to use:**
- Production validation before launches
- A/B testing performance variants
- Final sign-off on critical optimizations
- When simulation accuracy is questioned

**Setup:**
```bash
# Install tool
npm install -g @sitespeed.io/throttle

# Start throttling (e.g., African rural)
sudo throttle --rtt 400 --down 3500 --up 1500

# Run Lighthouse
lighthouse --throttling-method=provided --throttling.cpuSlowdownMultiplier=8 https://example.com

# Stop throttling
sudo throttle --stop
```

### Desktop vs Mobile Scoring Thresholds

**Critical difference:** Desktop Lighthouse uses **60% stricter** performance thresholds than mobile.

| Metric | Mobile "Good" | Desktop "Good" | Difference |
|--------|---------------|----------------|------------|
| **LCP** | <2.5s | <1.5s | 60% stricter |
| **INP** | <200ms | <100ms | 50% stricter |
| **FID** (deprecated) | <100ms | <50ms | 50% stricter |
| **CLS** | <0.1 | <0.1 | Same |

**Real-world impact:**
- Same 2.0s LCP → 90 points on mobile, 60 points on desktop
- Desktop form factor = larger viewport (1920x1080) = 9× more pixels than mobile (360x640)
- More pixels = more layout work, potentially larger images

**Gotcha:**
- Developer tests on MacBook Pro (desktop) → Gets 78/100
- Thinks "pretty good, let's ship!"
- 98% of users are on mobile → Actually experience 42/100
- **Lesson:** Always test on devices your users actually use

### Lighthouse Score Variability

**Even with identical config, scores vary:**
- ±5 points between runs is normal
- ±10 points if system under load

**Factors causing variance:**
- Background processes on your machine
- System CPU/memory load
- Network jitter
- Garbage collection timing
- V8 JavaScript engine warmup

**Best practice:**
- Run 3-5 times, take median (like PageSpeed Insights does)
- Don't celebrate single test improvements
- Track trends over time, not individual scores

### Lab vs Field Reality

**What lab testing CAN'T simulate:**
- Battery drain affecting CPU performance
- Background apps consuming resources
- Flaky WiFi with intermittent drops
- Crowded networks with congestion
- Users' actual browsing patterns
- Service Worker caching benefits
- Real device thermal throttling

**Gotcha:** Lab score 85/100 ≠ Good field experience guaranteed

**Solution:** Always validate lab improvements with RUM (Real User Monitoring) data

### Single-Page Load Bias

**Lab tests:** Cold cache, first visit, no navigation history

**Real users:**
- Navigate around site
- Use back button
- Have cached resources
- Interact multiple times

**Gotcha:** Optimizing only for initial load can hurt repeat-visit experience

**Example:**
- Aggressive cache busting → Great lab LCP (always fresh assets)
- But → Terrible returning user experience (re-downloads everything)

**Balance:** Optimize both first-visit AND repeat-visit experiences

---

## Core Web Vitals & Metrics Updates

### INP (Interaction to Next Paint) - The New Standard

**Status:** Official Core Web Vital since March 12, 2024

**What it measures:**
- Time between user interaction (click, tap, keypress) and next visual update
- ALL interactions throughout page lifetime (not just first like FID)
- Reported as P98 (98th percentile) of all interactions

**Thresholds:**
- **Good:** <200ms ✅
- **Needs Improvement:** 200-500ms ⚠️
- **Poor:** >500ms ❌

**Why it's harder than FID:**
- FID: Only first input delay (often artificially low)
- INP: Every hover, click, scroll interaction counts
- 48% of sites passed FID → Only 43% pass INP

**What changed in focus:**
- Hover interactions now matter (previously ignored)
- Scroll interactions count
- All event handlers throughout session
- Long tasks are more punishing

### INP Optimization Strategies (2024-2025 Best Practices)

#### 1. Break Down Long Tasks

**Problem:** Tasks >50ms block main thread

**Solution:**
```javascript
// ❌ BAD: Single long task
function processLargeArray(items) {
  items.forEach(item => processItem(item));
}

// ✅ GOOD: Break into chunks with scheduler.yield
async function processLargeArray(items) {
  for (const item of items) {
    await scheduler.yield(); // Let browser breathe
    processItem(item);
  }
}
```

**Impact:** Can reduce INP from 600ms → 180ms

#### 2. Use scheduler.yield API (NEW in 2024)

**Availability:** Chromium browsers (Chrome, Edge, Opera, Brave)

**Purpose:** Lets JavaScript yield control back to browser scheduler

**When to use:**
- Processing large arrays
- Heavy computations in loops
- After DOM mutations
- Long-running event handlers

**Example:**
```javascript
async function handleClick() {
  // Do critical UI update first
  showLoadingSpinner();

  // Yield to browser
  await scheduler.yield();

  // Continue with non-critical work
  await fetchData();
  await processResults();
}
```

#### 3. Prioritize Critical Work First

```javascript
// ❌ BAD: Everything at once
button.addEventListener('click', async () => {
  await fetchUserData();
  await updateAnalytics();
  await logEvent();
  await showMenu(); // User waits for everything!
});

// ✅ GOOD: Critical first, defer rest
button.addEventListener('click', async () => {
  // Critical: Show menu immediately
  showMenu();

  // Defer: Analytics can wait
  setTimeout(() => {
    updateAnalytics();
    logEvent();
  }, 0);

  // Background: Fetch data separately
  fetchUserData();
});
```

#### 4. Remove Unnecessary Code

**Problem:** Every byte of JavaScript adds processing overhead

**Audit:**
- Unused libraries
- Polyfills for modern browsers
- Duplicate code from dependencies
- Overly complex frameworks for simple tasks

**Tools:**
- Chrome DevTools Coverage panel
- webpack-bundle-analyzer
- source-map-explorer

#### 5. Optimize Event Handlers

**Common culprits:**
- Heavy DOM queries in event handlers (use event delegation)
- Unthrottled/undebounced events (scroll, resize, mousemove)
- Synchronous API calls in handlers
- Layout thrashing (read-write-read-write DOM patterns)

**Example:**
```javascript
// ❌ BAD: Query DOM on every hover
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const allCards = document.querySelectorAll('.card'); // Expensive!
    allCards.forEach(c => c.classList.add('dimmed'));
  });
});

// ✅ GOOD: Cache selectors, use event delegation
const cards = document.querySelectorAll('.card');
document.addEventListener('mouseenter', (e) => {
  if (!e.target.closest('.card')) return;

  requestAnimationFrame(() => {
    cards.forEach(c => c.classList.add('dimmed'));
  });
}, true);
```

### Long Animation Frames (LoAF) - NEW Metric (2024)

**Status:** Experimental, available in Chrome DevTools

**Purpose:** Identifies which animations/interactions cause janky INP

**What it shows:**
- Duration of animation frame
- Which tasks contributed
- Whether it was layout, rendering, or JavaScript

**Where to find:** Chrome DevTools Performance Panel → LoAF track

**Use case:** Debug WHY INP is poor
- Is it layout recalculation?
- Is it JavaScript execution?
- Is it rendering/painting?

**Example diagnosis:**
```
INP: 620ms ❌

LoAF breakdown:
- JavaScript execution: 400ms (64%)
- Layout recalculation: 180ms (29%)
- Rendering: 40ms (7%)

→ Fix: Break up JavaScript with scheduler.yield
```

### CLS (Cumulative Layout Shift) Measurement Complexity

**How it's measured (2024 update):**
- Uses "session windows" (max 5s gaps between shifts)
- Takes largest session window value
- Not a simple sum of all shifts

**Gotcha:** Same page, different CLS based on:
- How long user stays
- How much they scroll
- Whether they trigger lazy-loading

**Example:**
- User A: Views hero, leaves → CLS: 0.08 ✅
- User B: Scrolls 10 pages, triggers lazy-load shifts → CLS: 0.35 ❌
- Same page, different scores!

**Debug strategy:**
```javascript
// Log every shift
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Layout shift:', {
      value: entry.value,
      element: entry.sources[0]?.node,
      time: entry.startTime
    });
  }
}).observe({type: 'layout-shift', buffered: true});
```

### TTFB (Time to First Byte) Underestimation

**What it includes:**
- DNS lookup
- TCP connection
- SSL/TLS handshake
- Server processing time
- Network latency to server

**Gotcha:** Frontend optimizations won't help if TTFB is 2s+

**African context:**
- Long geographic distances to servers
- High TTFB common (200-500ms typical, 1000ms+ rural)
- CDN with African PoPs critical

**Solution:** Monitor TTFB separately from frontend metrics

---

## Chrome DevTools Evolution

### Tool Consolidation Timeline (2024-2025)

| Tool | Status | Timeline |
|------|--------|----------|
| **Performance Insights Panel** | ❌ Deprecated | Removed Chrome 131 (Early 2025) |
| **Standalone Lighthouse Panel** | ⚠️ Being Sunset | Removal H2 2025 |
| **Performance Panel** | ✅ Active | Unified destination for all perf tools |
| **Web Vitals Extension** | ⚠️ Integrated | Features now built into DevTools (Chrome 132+) |

**Why consolidation:**
- Simplifies workflow (one panel instead of three)
- Reduces confusion for developers
- Better integration between tools
- AI-powered insights work across all features

**Impact on your talk:**
- Screenshots will look outdated quickly
- Focus on concepts, not UI specifics
- Show latest DevTools (Chrome 132+)

### Live Metrics Feature (Chrome 132+, 2025)

**What:** Real-time Core Web Vitals displayed as you interact with page

**Shows:**
- LCP (updates as contentful paints occur)
- CLS (cumulative as shifts happen)
- INP (updates with each interaction)

**Benefits:**
- No need for separate Web Vitals extension
- See impact of interactions immediately
- Great for demos (show INP increasing live!)

**How to access:**
1. Open DevTools
2. Performance Panel
3. Click "Live Metrics" tab

**Demo opportunity:**
```
Before hover: INP 0ms
After hover: INP 420ms (shows the freeze!)
Identify culprit: Hover event → 400ms fetch
```

### AI-Powered Performance Insights (Chrome 137+, 2025)

**Status:** Opt-in feature (requires Chrome 137+)

**Capabilities:**
- Explains WHY metrics are poor
- Suggests specific code optimizations
- Can generate code patches
- Interprets flame charts

**Example interaction:**
```
You: "Why is my LCP 8 seconds?"

AI: "Your LCP is slow due to:
1. Two unoptimized 5K background images (16MB total)
2. Images not lazy-loaded
3. No fetchpriority=high on LCP element

Suggested fixes:
1. Resize images to 1920px max, use WebP
2. Add loading='eager' to LCP image
3. Add fetchpriority='high'

Expected improvement: 8s → 1.5s"
```

**Gotcha:** AI suggestions aren't always accurate

**Your role:** Teach fundamentals so audience can VALIDATE AI output

**Don't blindly trust:**
- AI might suggest over-preloading (resource contention)
- Might miss context-specific constraints
- Can hallucinate performance numbers

### Field + Lab Data Side-by-Side (2025)

**What:** Performance Panel shows both:
- **Lab data:** Your local test results
- **Field data:** Real user data from CrUX

**Benefits:**
- Compare lab vs reality immediately
- Identify gaps between testing and production
- Validate if local optimizations help real users

**Example view:**
```
Lab (Local):          Field (CrUX P75):
LCP: 1.2s ✅          LCP: 6.8s ❌
CLS: 0.08 ✅          CLS: 0.36 ❌
INP: 85ms ✅          INP: 580ms ❌

→ Insight: Lab optimizations not reaching users!
```

**Gotcha:** Field data updated every 28 days (lag)

### LCP Phase Breakdown (2024-2025)

**What:** LCP timing split into sub-parts (phases)

**Phases:**
1. **TTFB** (Time to First Byte): Server response
2. **Resource Load Delay**: Time from TTFB to resource request start
3. **Resource Load Time**: Actual download time
4. **Element Render Delay**: Time from load complete to paint

**Example:**
```
LCP: 3.2s ❌

Breakdown:
- TTFB: 0.8s (25%)
- Resource Load Delay: 0.3s (9%)
- Resource Load Time: 2.1s (66%) ← Culprit!
- Element Render Delay: 0.0s (0%)

→ Fix: Optimize image size (too large)
```

**Recommendations shown:**
- Is LCP element lazy-loaded? (Don't do this!)
- Missing fetchpriority=high? (Add it!)
- Resource not in HTML? (Preload it!)

### Layout Shift Debugging Enhancements (November 2024)

**New features:**
- Visual indicators for shifts in timeline
- Element-level attribution (which element moved)
- Shift source tracking (what caused it)
- Screenshot comparison before/after shift

**How to use:**
1. Record performance trace
2. Look for red bars in "Layout Shifts" track
3. Click shift → See element that moved
4. Inspect what loaded to cause shift

**Common culprits identified:**
- Images without width/height
- Fonts loading late (FOUT/FOIT)
- Ads inserting content
- Dynamic content without reserved space

---

## RUM/Field Data Considerations

### CrUX Data Lag (28 Days)

**Update frequency:** Every 28 days (4-week rolling window)

**Timeline:**
- Day 1: Deploy fix
- Day 14: Half the data is post-fix
- Day 28: All data is post-fix
- Day 28-56: CrUX shows improvement

**Gotcha:** Deploy fix today → Won't see CrUX improvement for 2-4 weeks

**Solution:** Use web-vitals.js + GA4 for real-time monitoring

**Don't panic:** If CrUX doesn't improve immediately after fix

### P75 vs P98 vs Median vs Average

**Core Web Vitals use P75 for most metrics:**
- LCP: P75
- CLS: P75
- FCP: P75
- TTFB: P75

**Exception - INP uses P98:**
- INP: P98 (98th percentile, not P75!)
- Why: Want to catch worst interactions, not typical

**Gotcha:** Average/median can be misleading

**Example:**
```
50% of users: LCP 1s
50% of users: LCP 10s

Median: 1s (looks good!)
P75: 10s (reality check!)

→ Half your users have terrible experience
```

**Why P75 matters:**
- Represents "typical worst-case"
- Hides best 75%, focuses on worst 25%
- Aligns with user perception (bad experiences stick)

**Why P98 for INP:**
- Need to catch rare but bad interactions
- Hovering 100 times, 2 are slow → P98 catches it
- P75 might miss slow interactions

### Sample Size & Statistical Confidence

**CrUX requirements:**
- Minimum traffic volume to appear in public dataset
- Low-traffic sites won't have CrUX data

**RUM challenges:**
```
1000 page views might have:
- 1000 LCP measurements ✅ (one per page)
- 50 INP measurements ⚠️ (only if users interact)
- 10 button click measurements ❌ (too few!)

→ Need 1000+ samples per segment before conclusions
```

**Don't panic over small samples:**
- 10 bad INP measurements ≠ crisis
- Wait for statistical significance
- Use confidence intervals

**Rule of thumb:**
- <100 samples: Ignore, too noisy
- 100-1000 samples: Directional signal
- 1000+ samples: Actionable insights

### Attribution Data Challenges

**What attribution provides:**
- Which element caused LCP
- Which element shifted for CLS
- Which interaction was slow for INP

**Limitations:**
- Sometimes reports generic "DIV" with no useful info
- Element might be removed from DOM before capture
- Shadow DOM elements harder to track
- Third-party iframe content invisible

**Best practice:**
- Use attribution as starting point
- Cross-reference with Performance Panel deep-dives
- Tag elements with data attributes for tracking
```html
<img data-lcp-candidate="hero" src="...">
```

### Post-Fix Reproducibility Issues

**Deploy a fix → Metrics improve... then regress? Why?**

**Common causes (2024-2025 specific):**

1. **CDN cache hasn't cleared globally**
   - Users still getting old assets
   - Can take hours to propagate
   - Check cache headers, force purge

2. **Service Workers serving stale code**
   - SW caches old version
   - Users need hard refresh or SW update
   - Use versioned SW registration

3. **Third-party scripts changed**
   - Google Tag Manager update (broke many sites in 2023)
   - Ad network rotated heavier creatives
   - A/B testing tool added overhead
   - Monitor third-party impact separately

4. **Seasonal traffic changes**
   - Different user segments at different times
   - Black Friday traffic ≠ January traffic
   - Segment by cohort to identify

5. **Backend performance degraded**
   - Database slowdown
   - API response times increased
   - Frontend fix worked, but backend got slower → Net zero
   - Monitor TTFB separately

6. **Browser updates changed behavior**
   - Chrome rendering engine update
   - Safari changed caching behavior
   - New browser features/restrictions

7. **Core Web Vitals measurement changed**
   - INP replaced FID (March 2024)
   - PSI throttling changed (December 2024)
   - Metric not regressed, measurement changed!

### A/B Testing Contamination

**Problem:** Running A/B tests mixes performance data

**Example:**
```
Variant A: Lighthouse 90/100
Variant B: Lighthouse 50/100

RUM shows: 70/100 (average of both)
→ Can't tell which variant is actually better!
```

**Solution:** Tag web-vitals events with experiment ID

```javascript
import {onLCP} from 'web-vitals';

onLCP((metric) => {
  const experimentId = getExperimentId(); // Your A/B testing tool

  gtag('event', 'LCP', {
    value: metric.value,
    experiment_id: experimentId,
    variant: getVariantId()
  });
});
```

**Then segment in analytics:**
- Filter by experiment_id + variant_a
- Filter by experiment_id + variant_b
- Compare performance between variants

---

## Browser & Platform Differences

### Chromium vs Safari vs Firefox

**Core Web Vitals reporting:**
- **Chromium browsers** (Chrome, Edge, Opera, Brave): ✅ Report to CrUX
- **Safari:** ❌ Doesn't report to CrUX
- **Firefox:** ❌ Doesn't report to CrUX

**Market share (Africa):**
- Chrome: ~65-75% (dominant)
- Safari: ~15-20% (higher in affluent areas)
- Firefox: ~3-5%
- Others: ~5-10%

**Gotcha:** CrUX only shows Chromium data!

**Solution:** Use web-vitals.js to capture ALL browsers

```javascript
import {onCLS, onINP, onLCP} from 'web-vitals';

// Captures Safari, Firefox too!
onLCP((metric) => sendToAnalytics(metric));
```

### Chromium Browser Variations

**Not all Chromium browsers behave identically:**

| Browser | Differences | Performance Impact |
|---------|-------------|-------------------|
| **Chrome** | Baseline implementation | Standard |
| **Edge** | Different update cadence, may lag 1-2 versions | Slight variance |
| **Opera** | Battery saver mode, custom optimizations | Can be slower |
| **Brave** | Aggressive privacy features, blocks trackers | Faster (less third-party overhead) |
| **Samsung Internet** | Mobile-specific optimizations | Different on Android |

**Real-world example:**
- Fix works in Chrome 120
- Breaks in Edge 119 (version mismatch)
- Brave blocks Google Fonts by default → Different FOUT/FOIT

**Best practice:** Test in top 3-5 browsers for your market

### Mobile Browser Complexity

**In-app browsers:**
- Facebook, Instagram, Twitter apps have embedded browsers
- Use different WebView implementations
- Performance can be 2-3× worse than Safari/Chrome

**Opera Mini (Africa-specific):**
- Extreme data saver mode
- Proxies requests through Opera servers
- JavaScript limited/disabled
- Not suitable for modern web apps

**Testing strategy:**
- Check analytics for actual browsers used
- Test in top 3: Chrome, Safari, and one in-app browser

### iOS Safari Restrictions

**Critical limitation:**
- ALL iOS browsers must use WebKit engine
- Chrome on iOS = Safari under the hood
- Edge on iOS = Safari under the hood
- Firefox on iOS = Safari under the hood

**Implications:**
- Chrome DevTools doesn't help for iOS debugging
- Must use Safari Web Inspector
- Performance characteristics different from desktop

**Debugging:**
1. Connect iPhone to Mac
2. Safari → Develop → [Your iPhone]
3. Use Web Inspector (similar to DevTools)

### Speculation Rules API (2024)

**Status:** Available in Chromium browsers, replaces old prerender APIs

**Purpose:** Preload likely next navigations for instant page loads

**Example:**
```html
<script type="speculationrules">
{
  "prerender": [
    {"urls": ["/products", "/checkout"]}
  ]
}
</script>
```

**Benefits:**
- Near-instant navigation (0-50ms perceived load time)
- Works with dynamic URLs
- Browser decides when to prerender (respects battery, network)

**Gotcha:** Not available in Safari, Firefox yet

---

## African Context-Specific Gotchas

### Network Volatility & Packet Loss

**Characteristics:**
- High jitter (latency varies 200-800ms, not constant 400ms)
- Packet loss: 5-15% common (vs <1% in developed markets)
- Congestion during peak hours
- Tower handoffs on mobile

**Impact on metrics:**
- HTTP/2 suffers (TCP head-of-line blocking on lossy networks)
- HTTP/3 helps more (UDP-based, better loss recovery)
- Single packet loss can delay entire page load

**Lab testing limitation:**
- Lighthouse simulates constant RTT (e.g., 400ms always)
- Reality: 200ms, 800ms, 400ms, 600ms, 300ms (variable!)

**Packet loss simulation:**
```bash
# Add 5% packet loss to throttling
sudo tc qdisc add dev eth0 root netem delay 400ms loss 5%
```

**HTTP/3 adoption matters:**
- Check CDN supports HTTP/3 in Africa
- Test: `curl --http3 https://yoursite.com`
- Can improve LCP by 20-30% on lossy networks

### Data Cost Sensitivity

**Context:**
- 1GB data: 5-10% of monthly income in rural areas
- Users on prepaid plans (pay per MB)
- Data exhaustion = unable to browse

**Metrics to watch:**
- **Total page weight** (not just speed!)
- **Data transferred per session**
- **Background syncs** (service workers)

**Gotcha:** Optimizing for speed only → May ignore data transfer

**Example:**
- Preload 10 fonts → Faster LCP
- But → Wastes 500KB data → User can't afford
- **Better:** Use system fonts, preload only 1 critical font

**Balance:** Speed + Data Efficiency

**Tools:**
- Chrome DevTools → Network → Check "Transferred" column
- Lighthouse → "Network Payload" audit
- web.dev/measure → Shows total page weight

### Device Heterogeneity

**Device range:**
- $50 ultra-budget Android (512MB RAM, 4 cores @ 1.2GHz)
- $1000 flagship iPhone (6GB RAM, 6 cores @ 3.2GHz)
- Feature phones (KaiOS) still exist

**Market split (Africa):**
- Ultra-budget: ~40%
- Budget: ~30%
- Mid-tier: ~20%
- High-end: ~10%

**Gotcha:** Testing on iPhone 15 Pro → Misses 90% of market

**Solution:**
- Segment RUM by device tier
- Test on real budget devices (not just emulation)
- Create device lab with $50-$200 devices

**CPU throttling mapping:**
```javascript
Device tier          → Lighthouse CPU throttling
Ultra-budget ($50)   → 8x slowdown
Budget ($100-200)    → 6x slowdown
Mid-tier ($300-500)  → 4x slowdown
High-end ($800+)     → 1x (no throttling)
```

### Power/Battery Constraints

**Context:**
- Load shedding (unreliable electricity)
- Users browse on battery power often
- Battery saver mode common

**Impact:**
- CPU throttled further in battery saver mode
- Animations reduced/disabled
- Background syncs paused

**Gotcha:** Heavy animations drain battery → User churns

**Respect user settings:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

**JavaScript detection:**
```javascript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Disable animations
}
```

---

## Tool Evolution & Future Directions

### Deprecated Features (2024-2025)

| Feature | Status | Replacement |
|---------|--------|-------------|
| **FID (First Input Delay)** | ❌ Deprecated March 2024 | INP |
| **Performance Insights Panel** | ❌ Removed Early 2025 | Unified Performance Panel |
| **Standalone Lighthouse Panel** | ⚠️ Being Sunset H2 2025 | Unified Performance Panel |
| **Old Prerender APIs** | ❌ Deprecated 2024 | Speculation Rules API |
| **TTI (Time to Interactive)** | ⚠️ Deprecated | Use TBT (Total Blocking Time) |

### Experimental Metrics (Watch These)

**Long Animation Frames (LoAF):**
- Status: Experimental, available in Chrome
- Purpose: Debug INP failures
- Likely to become more prominent in 2026

**Responsiveness Metrics (Future Evolution of INP):**
- Google explicitly says CWV will evolve
- INP may get more refined in 2026-2027
- Focus on specific interaction types

**Smoothness Metrics:**
- Measuring animation jank
- Frame drops during scrolling
- 60 FPS maintenance

**Not Core Web Vitals yet, but watch:**
- web.dev/metrics for announcements
- Chrome DevTools experiments
- Origin trials

### AI-Powered Debugging (2025+)

**Current state (Chrome 137):**
- AI assists in DevTools Performance Panel
- Suggests fixes based on flame chart
- Can generate code patches

**Future (2026+):**
- More sophisticated root cause analysis
- Automated fix application
- Natural language performance queries

**Example future interaction:**
```
You: "Why did INP regress in last deploy?"

AI: "Analyzed 10,000 user sessions. INP increased by 200ms due to:
1. New analytics script added (150ms blocking)
2. Event listener on <button id='submit'> became 50ms slower

Suggested rollback or patch:
1. Defer analytics script
2. Move listener to use event delegation

Would you like me to create a PR?"
```

**Caveat:** AI won't replace understanding fundamentals

**Your role as developer:**
- Understand "why" behind suggestions
- Validate AI recommendations
- Catch hallucinations
- Know when AI is wrong

### Knowledge Half-Life (~2 Years)

**Reality:** Web performance tools/metrics change rapidly

**Your knowledge from this talk:**
- 50% relevant in 2 years
- 25% relevant in 4 years

**How to stay current:**
- Follow web.dev/blog (Chrome team updates)
- Subscribe to Chrome DevRel newsletter
- Watch Chrome Dev Summit talks
- Read DebugBear blog (excellent technical depth)
- Follow @ChromiumDev on Twitter/X

**Red flag indicators your knowledge is outdated:**
- Screenshots don't match your DevTools
- Metrics referenced are deprecated
- Tools mentioned no longer exist

---

## General Best Practices & Warnings

### Don't Cargo Cult Optimizations

**Trap:** "Google says preload fonts, so I preloaded 10 fonts"

**Reality:** Over-preloading delays LCP (resource contention)

**Rule:** Measure before/after EVERY optimization

**Example:**
```html
<!-- ❌ BAD: Preload everything -->
<link rel="preload" as="font" href="font1.woff2">
<link rel="preload" as="font" href="font2.woff2">
<link rel="preload" as="font" href="font3.woff2">
<!-- ... 10 more fonts -->

<!-- ✅ GOOD: Preload only critical LCP font -->
<link rel="preload" as="font" href="hero-font.woff2">
```

**Before preloading:**
- LCP: 2.8s

**After preloading 10 fonts:**
- LCP: 3.4s (worse!)
- Why: Bandwidth contention delayed LCP image

**After preloading 1 font:**
- LCP: 2.1s (better!)

**Lesson:** Validate every optimization with data

### Third-Party Scripts Are Chaos

**Problem:** You optimize → Third-party adds 500KB → Net negative

**Real-world examples:**
- Google Tag Manager update broke CLS for millions (2023)
- Facebook Pixel causing 2s delays
- Chat widget JavaScript 800KB uncompressed
- Ad networks rotating heavy creatives

**Impact:**
```
Your code: 100KB, optimized
Third-party scripts: 2.5MB, unoptimized

→ Your optimization = 4% of problem
```

**Solutions:**

1. **Audit third-parties:**
```javascript
// Check what's loading
performance.getEntriesByType('resource')
  .filter(r => !r.name.includes('yoursite.com'))
  .sort((a,b) => b.transferSize - a.transferSize);
```

2. **Use facades:**
```html
<!-- Don't load YouTube player until user clicks -->
<div class="youtube-facade" data-id="...">
  <img src="thumbnail.jpg" loading="lazy">
  <button>Play Video</button>
</div>
```

3. **Lazy load non-critical third-parties:**
```javascript
// Load analytics after page interactive
window.addEventListener('load', () => {
  setTimeout(() => {
    loadAnalytics();
  }, 3000);
});
```

4. **Have SLAs with vendors:**
- Script size budget (<50KB compressed)
- Performance impact budget (<100ms TBT)
- Monitor and enforce

### Performance Budgets Need Maintenance

**Problem:** Set budget once, never revisit

**Reality:**
- Tools evolve (PSI throttling changed December 2024)
- User base changes (more rural users over time)
- Third-parties change
- Product complexity grows

**Example budget:**
```json
{
  "LCP": 2500,  // Appropriate for urban users
  "CLS": 0.1,
  "INP": 200
}
```

**6 months later:**
- User base shifted 40% → 60% rural
- Budget now unrealistic
- Team frustrated, ignores budgets

**Solution:** Segment budgets by user cohort

```json
{
  "urban-users": {
    "LCP": 2500,
    "CLS": 0.1,
    "INP": 200
  },
  "rural-users": {
    "LCP": 4000,  // More lenient
    "CLS": 0.15,
    "INP": 300
  }
}
```

**Review quarterly:**
- Are budgets still realistic?
- Has user base shifted?
- Have tools/metrics changed?

### Correlation ≠ Causation

**Trap:** Observe correlation, assume causation

**Example:**
```
Observation: CLS increased when engagement improved

Conclusion: "CLS improves engagement!" ❌ WRONG

Reality: Reverse causation
- Higher engagement → More scrolling
- More scrolling → More lazy-load shifts
- More shifts → Higher CLS
```

**Another example:**
```
Observation: Users with slow LCP have higher bounce rate

Conclusion: "Slow LCP causes bounces" ✅ Correct? Maybe...

Alternative: Reverse causation
- Users on slow connections have slow LCP
- Users on slow connections bounce more (impatient)
- But LCP isn't the cause, connection is!
```

**Solution:** Use controlled A/B tests

```
Control: Original page (LCP 3.5s)
Variant: Optimized page (LCP 1.5s)

Measure: Bounce rate, conversion, engagement

If variant improves metrics → Causation established
```

### The 80/20 Rule Applies

**80% of performance wins:**
- Optimize images (WebP, responsive sizes, lazy-loading)
- Eliminate render-blocking resources
- Fix CLS (reserve space, dimensions on images)
- Reduce third-party overhead

**20% of wins (diminishing returns):**
- Micro-optimizations (save 5ms here, 3ms there)
- Perfect Lighthouse 100/100 score
- Sub-second LCP when 1.5s is "good"

**Gotcha:** Chasing 95/100 → 100/100 may not improve UX

**Example:**
```
LCP: 1.2s → 0.8s optimization
Effort: 2 weeks engineering time
User perception: Marginal (both feel instant)

vs

LCP: 4.5s → 2.0s optimization
Effort: 1 week engineering time
User perception: Massive (slow → fast)
```

**Prioritize:** Fix the worst experiences (P75, P90) before perfecting P50

**Focus areas:**
1. Fix "poor" metrics first (red → yellow)
2. Then fix "needs improvement" (yellow → green)
3. Only then optimize "good" metrics (green → better green)

---

## Quick Reference Tables

### Core Web Vitals Thresholds (2025)

| Metric | Good | Needs Improvement | Poor | Percentile |
|--------|------|-------------------|------|------------|
| **LCP** | <2.5s | 2.5s - 4.0s | >4.0s | P75 |
| **CLS** | <0.1 | 0.1 - 0.25 | >0.25 | P75 |
| **INP** | <200ms | 200ms - 500ms | >500ms | **P98** |
| **FCP** | <1.8s | 1.8s - 3.0s | >3.0s | P75 |
| **TTFB** | <800ms | 800ms - 1800ms | >1800ms | P75 |

### Lighthouse Throttling Methods Comparison

| Method | Accuracy | Speed | Variance | Setup | Use Case |
|--------|----------|-------|----------|-------|----------|
| **Simulated** | Moderate | Fastest | Lowest | Easy | CI/CD, rapid iteration |
| **DevTools** | Good | Fast | Low-Medium | Easy | Manual testing, debugging |
| **Packet-Level** | Highest | Slower | Medium-High | Complex | Production validation, A/B tests |

### Desktop vs Mobile Scoring Thresholds

| Metric | Mobile "Good" | Desktop "Good" | Desktop Stricter By |
|--------|---------------|----------------|---------------------|
| **LCP** | <2.5s | <1.5s | 60% |
| **INP** | <200ms | <100ms | 50% |
| **CLS** | <0.1 | <0.1 | Same |

### Tool Availability Matrix (2025)

| Tool/Feature | Chrome | Edge | Safari | Firefox | Status |
|--------------|--------|------|--------|---------|--------|
| Core Web Vitals | ✅ | ✅ | ❌ | ❌ | Standard |
| Lighthouse | ✅ | ✅ | ❌ | ❌ | Standard |
| Performance Panel | ✅ | ✅ | ✅ (Web Inspector) | ✅ | Standard |
| scheduler.yield | ✅ | ✅ | ❌ | ❌ | New 2024 |
| Speculation Rules | ✅ | ✅ | ❌ | ❌ | New 2024 |
| AI-Powered Insights | ✅ (137+) | ✅ (137+) | ❌ | ❌ | New 2025 |
| Long Animation Frames | ✅ | ✅ | ❌ | ❌ | Experimental |

### African Network Conditions Reference

| Segment | % Users | Connection | Bandwidth | RTT | Packet Loss | Lighthouse CPU |
|---------|---------|------------|-----------|-----|-------------|----------------|
| **Rural** | 20% | 2G/3G | 2-5 Mbps | 400ms | 10-15% | 8x |
| **Suburban** | 28% | 3G/4G | 8-12 Mbps | 250ms | 5-10% | 6x |
| **Urban Standard** | 38% | 4G | 15-20 Mbps | 180ms | 3-5% | 4x |
| **Urban Premium** | 12% | 4G+ | 100+ Mbps | 40ms | <1% | 1x |
| **Dev/Stakeholders** | 2% | Fiber | 100+ Mbps | 10ms | <1% | 1x |

---

## Resources & Further Reading

### Official Google Resources

**Core Web Vitals:**
- [web.dev/vitals](https://web.dev/vitals) - Official introduction
- [web.dev/articles/inp](https://web.dev/articles/inp) - INP deep-dive
- [web.dev/articles/optimize-inp](https://web.dev/articles/optimize-inp) - Optimization guide

**Chrome DevTools:**
- [developer.chrome.com/docs/devtools](https://developer.chrome.com/docs/devtools) - Official docs
- [developer.chrome.com/blog/perf-tooling-2024](https://developer.chrome.com/blog/perf-tooling-2024) - 2024 updates

**Lighthouse:**
- [developer.chrome.com/docs/lighthouse](https://developer.chrome.com/docs/lighthouse) - Official docs
- [developers.google.com/speed/docs/insights](https://developers.google.com/speed/docs/insights) - PageSpeed Insights

### Community Resources

**DebugBear Blog** (Excellent technical depth):
- [debugbear.com/blog/packet-level-throttling](https://www.debugbear.com/blog/packet-level-throttling) - Throttling methods
- [debugbear.com/blog/2024-in-web-performance](https://www.debugbear.com/blog/2024-in-web-performance) - 2024 recap
- [debugbear.com/blog/fix-web-performance-devtools](https://www.debugbear.com/blog/fix-web-performance-devtools) - DevTools guide

**Web Performance Working Group:**
- [w3.org/webperf](https://www.w3.org/webperf/) - Official specs
- [github.com/w3c/web-performance](https://github.com/w3c/web-performance) - GitHub discussions

**HTTP Archive:**
- [almanac.httparchive.org/en/2024/performance](https://almanac.httparchive.org/en/2024/performance) - State of the web

### Tools

**Testing:**
- [PageSpeed Insights](https://pagespeed.web.dev/) - Lab + field data
- [WebPageTest](https://www.webpagetest.org/) - Advanced testing
- [DebugBear](https://www.debugbear.com/) - Monitoring platform

**Libraries:**
- [web-vitals](https://github.com/GoogleChrome/web-vitals) - Official RUM library
- [@sitespeed.io/throttle](https://www.npmjs.com/package/@sitespeed.io/throttle) - Packet-level throttling

**Browser Extensions:**
- Web Vitals (now built into Chrome DevTools 132+)
- Lighthouse (built into Chrome DevTools)

### Following Updates

**Twitter/X:**
- [@ChromiumDev](https://twitter.com/ChromiumDev) - Chrome team updates
- [@addyosmani](https://twitter.com/addyosmani) - Chrome Engineering Manager
- [@rick_viscomi](https://twitter.com/rick_viscomi) - CrUX team

**Newsletters:**
- Chrome DevRel Newsletter
- web.dev newsletter
- Performance.now() newsletter

**YouTube:**
- [Chrome for Developers](https://www.youtube.com/@ChromeDevs)
- Chrome Dev Summit talks (annual)

---

## Document Maintenance

**Last Updated:** November 13, 2025

**Update Schedule:**
- Quarterly: Check for deprecated features
- Annually: Major refresh of all sections
- Ad-hoc: When major tools/metrics change

**Contributing:**
- This document lives in the debugging-web-performance-talk repo
- Pull requests welcome for corrections/updates
- Open issues for questions/clarifications

**Version History:**
- v1.0 (Nov 2025): Initial comprehensive version

---

**Remember:** The web performance landscape evolves rapidly. Focus on fundamentals (minimize work, ship less code, measure everything) rather than chasing specific tools/metrics. When in doubt, measure with real user data!
