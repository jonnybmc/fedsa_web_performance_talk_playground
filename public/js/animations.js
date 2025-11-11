// ==============================================================================
// animations.js - Hero animations + Product interactions
// ==============================================================================
// PROBLEM 3: The "Netflix Effect" (CLS: 0.26, FPS: 20-30)
// PROBLEM 4: Hover Effect Disaster (INP: 620ms)
// ==============================================================================

export function initHeroAnimation() {
  // ❌ PROBLEM 3: The "Netflix Effect" - initPremiumDepthShader()
  // This is where the R3.5M redesign went wrong...
  initPremiumDepthShader();

  // ✅ These GSAP animations are fine - simple opacity/transform changes
  gsap.to('.hero-title', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.3,
    ease: 'power3.out'
  });

  gsap.to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.6,
    ease: 'power3.out'
  });

  gsap.to('.hero-cta', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.9,
    ease: 'power3.out'
  });

  gsap.to('.product-card', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  });
}

// ==============================================================================
// ❌ PROBLEM 3: The "Netflix Effect" Animated Orbs
// ==============================================================================
//
// THE BACKSTORY:
// Sprint Planning Meeting, Product backlog grooming
//
// PM (excited): "I saw this gorgeous animated effect on Netflix's homepage.
//                It feels SO premium and immersive. Can we do something like that?"
//
// Design Lead (lighting up): "YES! Absolutely! I've been wanting to add more depth.
//                             Let's do animated gradient orbs with blur effects.
//                             Four layers for depth - just like Apple does!"
//
// Senior Dev: "That might be expensive to animate..."
//
// PM: "It's just CSS blur, right? How hard can it be?"
//
// Design Lead: "Look, I'll design it over the weekend. Trust me, it'll elevate
//               the entire brand. This is what modern premium sites do."
//
// [Weekend passes...]
//
// Developer (Monday, tired): "Okay, created 4 huge orbs with 70-90px blur each.
//                             Looks STUNNING on my M1 Max! Shipping it."
//
// [3 weeks later, after launch...]
//
// Performance Consultant (looking at DevTools):
// "This is causing 0.26 CLS and dropping FPS to 20-30 on real devices.
//  See these purple layout shift bars? All from the orbs.
//  See the frame drops? Heavy blur + continuous transforms."
//
// PM: "But... but it looks amazing!"
//
// Performance Consultant: "On your M1 Max, yes. On a mid-tier Android
//                          in Johannesburg with 60% battery? Frozen."
//
// THE NEGOTIATION:
// We can keep the premium feel but need to optimize:
// - Remove the light beam (worst offender with height: 250%)
// - Reduce from 4 orbs → 2 orbs
// - Reduce blur: 80-90px → 35px (still premium, way cheaper)
// - Change from absolute + percentage → fixed positioning (prevents CLS)
// - Add containment to isolate layout impact
//
// THE FIX (commented below for live demo):
// ==============================================================================

function initPremiumDepthShader() {
  console.log('🎨 Initializing "premium animated depth effect"...');
  console.log('💡 PM: "I saw this on Netflix. Can we do that?"');

  const heroSection = document.querySelector('.hero');

  if (!heroSection) {
    console.error('❌ Hero section not found!');
    return;
  }

  // ❌ CURRENT: The "Netflix Effect" (BROKEN - causes 0.26 CLS + 20-30 FPS)
  // Creating 4 MASSIVE orbs with heavy blur + percentage-based positioning

  // Orb 1: Golden sweep - 1000px with 80px blur
  const orb1 = document.createElement('div');
  orb1.className = 'premium-orb-1';
  orb1.style.cssText = `
    position: absolute;      /* ← BAD: With percentage positioning causes CLS */
    width: 1000px;           /* ← EXPENSIVE: Huge element */
    height: 1000px;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, rgba(255, 220, 130, 0.4) 25%, rgba(255, 230, 160, 0.2) 50%, transparent 70%);
    border-radius: 50%;
    filter: blur(80px);      /* ← EXPENSIVE: Heavy GPU load */
    animation: sweepOrb1 12s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: hard-light;
  `;

  // Orb 2: Peachy sweep - 900px with 70px blur
  const orb2 = document.createElement('div');
  orb2.className = 'premium-orb-2';
  orb2.style.cssText = `
    position: absolute;      /* ← BAD: Causes CLS */
    width: 900px;            /* ← EXPENSIVE: Huge */
    height: 900px;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255, 140, 120, 0.55) 0%, rgba(255, 170, 150, 0.35) 25%, rgba(255, 200, 180, 0.18) 50%, transparent 70%);
    border-radius: 50%;
    filter: blur(70px);      /* ← EXPENSIVE: Heavy blur */
    animation: sweepOrb2 10s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: hard-light;
  `;

  // Orb 3: Blue accent - 800px with 90px blur
  const orb3 = document.createElement('div');
  orb3.className = 'premium-orb-3';
  orb3.style.cssText = `
    position: absolute;      /* ← BAD: Causes CLS */
    width: 800px;
    height: 800px;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(circle, rgba(180, 200, 255, 0.4) 0%, rgba(200, 220, 255, 0.25) 30%, transparent 65%);
    border-radius: 50%;
    filter: blur(90px);      /* ← EXPENSIVE: Heaviest blur */
    animation: sweepOrb3 14s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: soft-light;
  `;

  // Light Beam: WORST OFFENDER - 500px wide, 250% height!
  const lightBeam = document.createElement('div');
  lightBeam.className = 'premium-light-beam';
  lightBeam.style.cssText = `
    position: absolute;
    width: 500px;
    height: 250%;            /* ← WORST: Percentage height causes constant recalc */
    top: -75%;               /* ← WORST: Percentage positioning */
    z-index: 5;
    pointer-events: none;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
    filter: blur(50px);
    animation: sweepBeam 8s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: overlay;
    transform-origin: center;
  `;

  // Append all 4 orbs to DOM
  heroSection.appendChild(orb1);
  heroSection.appendChild(orb2);
  heroSection.appendChild(orb3);
  heroSection.appendChild(lightBeam);  // ← This one is the CLS killer

  // Inject CSS animations into document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes sweepOrb1 {
      0% {
        transform: translate(-100%, -100%) scale(0.8);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        transform: translate(100%, 50%) scale(1.2);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        transform: translate(120%, 120%) scale(0.8);
        opacity: 0;
      }
    }

    @keyframes sweepOrb2 {
      0% {
        transform: translate(120%, 120%) scale(0.7);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        transform: translate(-20%, -20%) scale(1.3);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        transform: translate(-100%, -100%) scale(0.7);
        opacity: 0;
      }
    }

    @keyframes sweepOrb3 {
      0% {
        transform: translate(50%, -100%) scale(0.8);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        transform: translate(0%, 50%) scale(1.1);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        transform: translate(-50%, 120%) scale(0.8);
        opacity: 0;
      }
    }

    @keyframes sweepBeam {
      0% {
        left: -500px;
        transform: rotate(25deg);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        left: 50%;
        transform: rotate(25deg);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        left: calc(100% + 500px);
        transform: rotate(25deg);
        opacity: 0;
      }
    }

    /* Force GPU acceleration */
    .premium-orb-1,
    .premium-orb-2,
    .premium-orb-3,
    .premium-light-beam {
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
  `;
  document.head.appendChild(styleSheet);

  console.log('✨ "Premium Netflix Effect" ACTIVE');
  console.log('🎨 4 elements: 1000px + 900px + 800px orbs + 500px light beam');
  console.log('💥 Result: 0.26 CLS, 20-30 FPS on mid-tier devices');
  console.log('😭 Users: "The page is completely frozen..."');
}

// ✅ FIXED VERSION (for live demo - keep commented):
//
// function initPremiumDepthShader() {
//   const heroSection = document.querySelector('.hero');
//   if (!heroSection) return;
//
//   // THE COMPROMISE: 2 orbs instead of 4, lighter blur, fixed positioning
//
//   // Orb 1: Reduced golden orb
//   const orb1 = document.createElement('div');
//   orb1.className = 'premium-orb-1';
//   orb1.style.cssText = `
//     position: fixed;              /* ← FIX: Prevents CLS */
//     width: 600px;                 /* ← FIX: Smaller (was 1000px) */
//     height: 600px;
//     top: -100px;                  /* ← FIX: Fixed pixels (not percentage) */
//     left: -100px;
//     z-index: 5;
//     pointer-events: none;
//     background: radial-gradient(circle, rgba(255, 200, 100, 0.4) 0%, transparent 70%);
//     border-radius: 50%;
//     filter: blur(35px);           /* ← FIX: Lighter blur (was 80px) */
//     animation: orbit1 12s ease-in-out infinite;
//     will-change: transform;
//     mix-blend-mode: hard-light;
//     contain: layout style paint;  /* ← FIX: Isolate layout impact */
//   `;
//
//   // Orb 2: Reduced peachy orb
//   const orb2 = document.createElement('div');
//   orb2.className = 'premium-orb-2';
//   orb2.style.cssText = `
//     position: fixed;              /* ← FIX: Prevents CLS */
//     width: 500px;                 /* ← FIX: Smaller (was 900px) */
//     height: 500px;
//     bottom: -100px;               /* ← FIX: Fixed pixels */
//     right: -100px;
//     z-index: 5;
//     pointer-events: none;
//     background: radial-gradient(circle, rgba(255, 140, 120, 0.35) 0%, transparent 70%);
//     border-radius: 50%;
//     filter: blur(30px);           /* ← FIX: Lighter blur (was 70px) */
//     animation: orbit2 10s ease-in-out infinite;
//     will-change: transform;
//     mix-blend-mode: hard-light;
//     contain: layout style paint;  /* ← FIX: Isolate layout impact */
//   `;
//
//   // ← REMOVED: Light beam (worst offender)
//   // ← REMOVED: Orb 3 (blue accent)
//   // RESULT: Keep premium feel, but performant
//
//   heroSection.appendChild(orb1);
//   heroSection.appendChild(orb2);
//
//   // Simpler animations (use same keyframes, just fewer orbs)
//   const styleSheet = document.createElement('style');
//   styleSheet.textContent = `
//     @keyframes orbit1 {
//       0%, 100% { transform: translate(0, 0) scale(1); }
//       50% { transform: translate(10%, 10%) scale(1.1); }
//     }
//     @keyframes orbit2 {
//       0%, 100% { transform: translate(0, 0) scale(1); }
//       50% { transform: translate(-10%, -10%) scale(1.1); }
//     }
//   `;
//   document.head.appendChild(styleSheet);
//
//   console.log('✨ Optimized orbs: 2 instead of 4, lighter blur, fixed positioning');
//   console.log('📊 Result: CLS 0.26 → 0.04, FPS 20-30 → 60');
// }

// ==============================================================================
// ❌ PROBLEM 4: The Hover Effect Disaster
// ==============================================================================
//
// THE BACKSTORY:
// 3 days before launch, Friday afternoon
//
// PM (on Slack): "Hey @dev-team, quick request before we ship Monday.
//                 When users hover over a product, can we dim the others?
//                 Creates nice visual focus. Should be easy, right?"
//
// Developer (tired, rushing): "Sure, I'll add it before EOD."
//
// [30 minutes of coding...]
//
// Developer: "Done! Added mouseenter listener, fetches product details,
//             dims other products. Tested on my machine, works great!"
//
// [Ships to production Monday...]
//
// [Week 2 post-launch, Twitter explodes...]
//
// User: "Why does @Atelier feel so laggy? Hovering over products is painful."
//
// Performance Consultant (DevTools Performance Panel):
// "Every hover triggers:
//  - Unthrottled API fetch (network spam)
//  - querySelectorAll('.product-card') - queries entire DOM
//  - DOM manipulation forcing layout recalculation
//  Result: INP 620ms. Target is <200ms. Users feel frozen interface."
//
// THE PROBLEMS:
// 1. No debouncing - fetch fires on EVERY mouseenter
// 2. No selector caching - querySelectorAll on every hover
// 3. No batching - each style change forces recalculation
// 4. Complex DOM creation on every hover
//
// THE FIX (commented below):
// - Cache selectors ONCE
// - Debounce the hover event
// - Batch DOM operations with requestAnimationFrame
// ==============================================================================

export function initProductHover() {
  // ❌ CURRENT: Expensive hover handler (INP: 620ms)
  document.querySelectorAll('.product-card').forEach((card, index) => {
    // Track hover state to prevent race conditions
    let isHovering = false;

    card.addEventListener('mouseenter', async () => {
      isHovering = true;

      try {
        const productId = index + 1;

        // ❌ BAD: Unthrottled fetch on EVERY hover
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        const product = await response.json();

        // ❌ RACE CONDITION FIX: Check if still hovering after fetch completes
        // If user left during the 400ms fetch, don't create the icon
        if (!isHovering) {
          console.log('⚠️ Race condition avoided: User left before fetch completed');
          return;
        }

        // ❌ BAD: Heavy DOM queries on every hover
        const allCards = document.querySelectorAll('.product-card');
        const prices = document.querySelectorAll('.product-price');
        const names = document.querySelectorAll('.product-name');

        // ❌ BAD: Create wishlist icon AFTER API fetch (user might miss it!)
        // Real-world impact: User hovers briefly, icon appears 340ms+ later, user already moved on
        const wishlistIcon = document.createElement('div');
        wishlistIcon.className = 'wishlist-icon';
        wishlistIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        `;

        // ❌ PROBLEM: Icon appears with delay - user might not see it
        setTimeout(() => {
          // Check again before adding class (user might have left during setTimeout)
          if (isHovering) {
            wishlistIcon.classList.add('loaded');
          }
        }, 50); // Small delay to show the fade-in animation

        card.appendChild(wishlistIcon);

        // Add click handler for wishlist
        wishlistIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          wishlistIcon.classList.toggle('active');
          console.log('💝 Wishlist toggled:', product.name);
        });

        // ❌ BAD: Dim others (forces layout recalculation)
        allCards.forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.style.opacity = '0.5';
            otherCard.style.filter = 'grayscale(50%)';
          }
        });

        console.log('💫 Hover fetch:', product.name, '(no debounce!)');
      } catch (error) {
        console.error('Failed to load product details:', error);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;

      // ❌ BAD: More DOM queries on cleanup
      const wishlistIcon = card.querySelector('.wishlist-icon');
      if (wishlistIcon) wishlistIcon.remove();

      const allCards = document.querySelectorAll('.product-card');
      allCards.forEach(otherCard => {
        otherCard.style.opacity = '1';
        otherCard.style.filter = 'none';
      });
    });
  });
}

// ✅ FIXED VERSION (for live demo - keep commented):
//
// NOTE: The broken version above has a race condition fix (isHovering flag)
// to prevent orphaned icons. However, this is a BAND-AID! The real problem
// is fetching data on hover. The proper fix eliminates the fetch entirely.
//
// ARCHITECTURAL NOTE:
// The REAL fix requires changes at multiple levels:
//
// 1. API ARCHITECTURE FIX (Backend):
//    - Include wishlist status in initial /api/products response
//    - Single request loads ALL product data upfront
//    - No per-product API calls needed
//
//    Current (BAD):
//    GET /api/products → [{id, name, price, image}, ...]
//    GET /api/products/1 → {id, name, price, image, alt, inWishlist}  ← Extra call per hover!
//
//    Fixed (GOOD):
//    GET /api/products → [{id, name, price, image, alt, inWishlist}, ...]
//    ↑ One request, all data included, no hover fetches needed
//
// 2. FRONTEND FIX (productRenderer.js):
//    - Render wishlist icon immediately with product card
//    - Use data already available from initial fetch
//    - No hover-triggered API calls
//
// export function initProductHover() {
//   // ✅ FIX: Cache selectors ONCE (not on every hover)
//   const allCards = document.querySelectorAll('.product-card');
//   let hoverTimeout;
//
//   allCards.forEach((card, index) => {
//     // ✅ FIX: Wishlist icon already rendered by productRenderer.js
//     //         No need to fetch or create on hover - it's already there!
//
//     card.addEventListener('mouseenter', () => {
//       // ✅ FIX: Debounce to prevent spam
//       clearTimeout(hoverTimeout);
//       hoverTimeout = setTimeout(() => {
//         // ✅ FIX: Batch DOM operations with rAF
//         requestAnimationFrame(() => {
//           // Dim others (batch style changes)
//           allCards.forEach(otherCard => {
//             if (otherCard !== card) {
//               otherCard.style.opacity = '0.5';
//             }
//           });
//         });
//       }, 100);  // ← Debounce 100ms
//     });
//
//     card.addEventListener('mouseleave', () => {
//       clearTimeout(hoverTimeout);
//
//       // ✅ FIX: Batch cleanup
//       requestAnimationFrame(() => {
//         allCards.forEach(otherCard => {
//           otherCard.style.opacity = '1';
//         });
//       });
//     });
//   });
//
//   console.log('✨ Optimized hover: No API calls, instant wishlist icon, debounced, batched DOM ops');
//   console.log('📊 Result: INP 620ms → 60ms');
// }
//
// ✅ ADDITIONAL FIX in productRenderer.js (see productRenderer.js:165-224):
//    - Render wishlist icon immediately during initial product render
//    - Use wishlist status from /api/products response (backend fix required)
//    - Icon appears instantly on first hover, no fetch delay
//    - Result: Feature discoverable immediately, not after 340ms+ delay
