(function() {
  setTimeout(() => {
    injectClearanceBanner();
  }, 5000);

  function injectClearanceBanner() {
    const banner = document.createElement('div');
    banner.setAttribute('role', 'banner');
    banner.setAttribute('aria-label', 'Clearance sale promotion');

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

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 100);

    const closeButton = banner.querySelector('.promo-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => {
          banner.remove();
        }, 300);
      });
    }

    const ctaButton = banner.querySelector('.promo-cta');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
      });
    }
  }
})();
