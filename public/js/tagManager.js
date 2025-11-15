// ==============================================================================
// tagManager.js - Simulates Marketing's Tag Manager deployment
// ==============================================================================
// ❌ PROBLEM 2: Late-Loading Clearance Banner (CLS: 0.28)
// ==============================================================================
//
// THE BACKSTORY:
// Week 3 Post-Redesign (October 2024), 3 weeks before Black Friday
//
// Context: Site already has performance issues (CSAT dropped 87% → 62%)
//
// Marketing Director: "We need to move clearance inventory before Black Friday.
//                      Can we get a promo banner live this week?"
//
// Product Manager: "Dev team is firefighting redesign performance issues.
//                   Can Marketing do this independently?"
//
// Marketing: "We have Tag Manager access. We'll deploy clearance banner ourselves.
//             Should help boost Q3 sales numbers."
//
// Engineering: "Okay, but please don't make performance worse..."
//
// [2 days later, Marketing deploys...]
//
// Marketing: "Deployed! 'Clearance: Up to 40% off select tech'. Live now!"
//
// [Next morning - Analytics Review...]
//
// Analytics: CLS was 0.08 → now 0.36 (banner added 0.28!)
//           Mobile bounce: 76% → 78% (WORSE after banner!)
//           Desktop bounce: 32% → 34% (WORSE)
//
// [Emergency Meeting...]
//
// Engineering: "Who deployed something? CLS jumped massively."
//
// Marketing: "We added clearance banner. It's getting clicks though!"
//
// Performance Consultant: "The banner shifts page 120px down when it loads.
//                         You're losing MORE users than you're converting.
//                         Banner CTR: 8%, but bounce increased 12%.
//                         Net impact: -4% users = -R87k/week.
//
//                         We need to fix THIS plus the other 3 problems
//                         before Black Friday, or it'll be a disaster."
//
// CEO: "So our attempt to boost sales before Black Friday is backfiring?"
//
// Performance Consultant: "Yes. And we have 3 weeks to fix everything
//                         before the biggest sales day of the year."
//
// THE LESSON:
// Tag Manager bypasses review → performance regressions → worse outcomes
// Need: Performance monitoring for ALL deployments, not just engineering
// Need: Marketing team performance training before Black Friday
// ==============================================================================

// Simulate Tag Manager loading after page (like real GTM)
(function() {
  // ❌ PROBLEM: Loads 2 seconds after page load (async)
  // Real Tag Manager loads asynchronously to avoid blocking page render
  // But this means content can shift when banner injects
  setTimeout(() => {
    injectClearanceBanner();
  }, 5000);

  function injectClearanceBanner() {
    // ✅ FIXED: Banner uses fixed positioning (removed from layout flow)
    // No space reserved needed - banner doesn't affect layout at all
    // Slides up from bottom - no CLS!

    const banner = document.createElement('div');
    banner.setAttribute('role', 'banner');
    banner.setAttribute('aria-label', 'Clearance sale promotion');

    // ✅ FIX: All styles inline (GTM can't access external CSS)
    // Mobile-responsive: Adjust padding for smaller screens
    const isMobile = window.innerWidth <= 768;
    const padding = isMobile ? '1rem' : '1.5rem 2rem';

    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      padding: ${padding};
      padding-bottom: calc(${isMobile ? '1rem' : '1.5rem'} + env(safe-area-inset-bottom));
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
      border-radius: ${isMobile ? '12px 12px 0 0' : '8px 8px 0 0'};
      transform: translateY(100%);
      transition: transform 0.3s ease;
    `;

    banner.innerHTML = `
      <div class="promo-content">
        <span class="promo-icon" aria-hidden="true">🔥</span>
        <div class="promo-text">
          <strong>Clearance Sale!</strong>
          <span>Up to 40% off select tech. Limited stock before Black Friday.</span>
        </div>
        <button class="promo-cta">Shop Clearance</button>
        <button class="promo-close" aria-label="Close promotion banner">×</button>
      </div>
    `;

    // ✅ FIX: Append to body (not products section)
    // Fixed positioning means it doesn't matter where in DOM it is
    document.body.appendChild(banner);

    // ✅ FIX: Slide up animation (no layout shift!)
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 100);

    console.log('📢 Marketing Clearance Banner Activated (Tag Manager simulation)');
    console.log('✅ CLS Impact: 0.00 (fixed positioning - no layout shift!)');
    console.log('✅ Total Site CLS: 0.08 (banner no longer contributes)');
    console.log('📊 Products stay visible, bounce rate normalized');
    console.log('💰 Revenue recovered: +R87k/week');

    // Close button handler with slide-down animation
    const closeButton = banner.querySelector('.promo-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => {
          banner.remove();
          console.log('✅ Banner closed by user');
        }, 300); // Wait for animation to complete
      });
    }

    // CTA button handler (for demo purposes)
    const ctaButton = banner.querySelector('.promo-cta');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        console.log('🛒 User clicked "Shop Clearance"');
        console.log('✅ Zero CLS = better engagement!');
      });
    }
  }
})();

// ✅ FIXED VERSION (for live demo - keep commented):
//
// (function() {
//   // ✅ FIX APPROACH 1: Pre-render banner with opacity: 0
//   // Reserve space immediately, show when ready
//
//   const banner = document.createElement('div');
//   banner.className = 'marketing-promo-banner';
//   banner.style.opacity = '0';
//   banner.style.pointerEvents = 'none';
//
//   banner.innerHTML = `...`; // Same content
//
//   // Insert immediately (reserves space)
//   const productsSection = document.querySelector('.products');
//   if (productsSection) {
//     productsSection.insertBefore(banner, productsSection.firstChild);
//   }
//
//   // Show after 2s (no layout shift!)
//   setTimeout(() => {
//     banner.style.opacity = '1';
//     banner.style.pointerEvents = 'auto';
//   }, 2000);
// })();
//
// ✅ FIX APPROACH 2: CSS skeleton in HTML (better)
// Add to index.html BEFORE Tag Manager script:
// <div class="promo-banner-skeleton" aria-hidden="true">
//   <div style="height: 120px; background: rgba(251, 191, 36, 0.05); margin-bottom: 2rem;"></div>
// </div>
//
// Then modify injection to replace skeleton:
// const skeleton = document.querySelector('.promo-banner-skeleton');
// if (skeleton) {
//   skeleton.replaceWith(banner); // No shift!
// }
//
// Result: CLS 0.36 → 0.08 (removed 0.28 from banner) ✅
