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
    // ❌ PROBLEM: No reserved space in DOM
    // Banner is created dynamically without pre-allocating space
    // When it injects, pushes all content down by its height (120px)

    const banner = document.createElement('div');
    banner.className = 'marketing-promo-banner';
    banner.setAttribute('role', 'banner');
    banner.setAttribute('aria-label', 'Clearance sale promotion');

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

    // ❌ Insert at top of products section (pushes everything down 120px!)
    // This is the moment that causes CLS
    const productsSection = document.querySelector('.products');
    if (productsSection) {
      productsSection.insertBefore(banner, productsSection.firstChild);

      console.log('📢 Marketing Clearance Banner Injected (Tag Manager simulation)');
      console.log('⚠️  CLS Impact: +0.28 (no reserved space!)');
      console.log('⚠️  Total Site CLS: 0.08 → 0.36 (made worse!)');
      console.log('📊 Banner CTR: 8% | Bounce increase: +12% | Net: -4% users');
      console.log('💰 Revenue impact: -R87k/week | 3 weeks until Black Friday');
    }

    // Close button handler
    const closeButton = banner.querySelector('.promo-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        banner.remove();
        console.log('✅ Banner closed by user');
      });
    }

    // CTA button handler (for demo purposes)
    const ctaButton = banner.querySelector('.promo-cta');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        console.log('🛒 User clicked "Shop Clearance" (8% CTR)');
        console.log('⚠️  But 12% bounced due to layout shift = net negative');
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
