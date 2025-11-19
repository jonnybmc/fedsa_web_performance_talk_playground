export function initHeroAnimation() {
  initPremiumDepthShader();

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

function initPremiumDepthShader() {
  const isMobile = window.innerWidth <= 768;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  if (isMobile || isLowEnd) {
    return;
  }

  const heroSection = document.querySelector('.hero');

  if (!heroSection) {
    return;
  }

  // Orb 1: Golden sweep - 1000px with 80px blur
  const orb1 = document.createElement('div');
  orb1.className = 'premium-orb-1';
  orb1.style.cssText = `
    position: fixed;
    width: 1000px;
    height: 1000px;
    top: 0;
    left: 0;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, rgba(255, 220, 130, 0.4) 25%, rgba(255, 230, 160, 0.2) 50%, transparent 70%);
    border-radius: 50%;
    filter: blur(80px);
    animation: sweepOrb1 12s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: hard-light;
  `;

  // Orb 2: Peachy sweep - 900px with 70px blur
  const orb2 = document.createElement('div');
  orb2.className = 'premium-orb-2';
  orb2.style.cssText = `
    position: fixed;
    width: 900px;
    height: 900px;
    top: 0;
    left: 0;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255, 140, 120, 0.55) 0%, rgba(255, 170, 150, 0.35) 25%, rgba(255, 200, 180, 0.18) 50%, transparent 70%);
    border-radius: 50%;
    filter: blur(70px);
    animation: sweepOrb2 10s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: hard-light;
  `;

  // Orb 3: Blue accent - 800px with 90px blur
  const orb3 = document.createElement('div');
  orb3.className = 'premium-orb-3';
  orb3.style.cssText = `
    position: fixed;
    width: 800px;
    height: 800px;
    top: 0;
    left: 0;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(circle, rgba(180, 200, 255, 0.4) 0%, rgba(200, 220, 255, 0.25) 30%, transparent 65%);
    border-radius: 50%;
    filter: blur(90px);
    animation: sweepOrb3 14s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: soft-light;
  `;

  // Light Beam
  const lightBeam = document.createElement('div');
  lightBeam.className = 'premium-light-beam';
  lightBeam.style.cssText = `
    position: fixed;
    width: 500px;
    height: 175vh;
    top: -52.5vh;
    z-index: 5;
    pointer-events: none;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
    filter: blur(50px);
    animation: sweepBeam 8s ease-in-out infinite;
    will-change: transform;
    mix-blend-mode: overlay;
    transform-origin: center;
  `;

  heroSection.appendChild(orb1);
  heroSection.appendChild(orb2);
  heroSection.appendChild(orb3);
  heroSection.appendChild(lightBeam);

  // Inject CSS animations into document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes sweepOrb1 {
      0% {
        transform: translate3d(-1000px, -1000px, 0) scale(0.8);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        transform: translate3d(1000px, 500px, 0) scale(1.2);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        transform: translate3d(1200px, 1200px, 0) scale(0.8);
        opacity: 0;
      }
    }

    @keyframes sweepOrb2 {
      0% {
        transform: translate3d(1200px, 1200px, 0) scale(0.7);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        transform: translate3d(-200px, -200px, 0) scale(1.3);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        transform: translate3d(-1000px, -1000px, 0) scale(0.7);
        opacity: 0;
      }
    }

    @keyframes sweepOrb3 {
      0% {
        transform: translate3d(500px, -1000px, 0) scale(0.8);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        transform: translate3d(0px, 500px, 0) scale(1.1);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        transform: translate3d(-500px, 1200px, 0) scale(0.8);
        opacity: 0;
      }
    }

    @keyframes sweepBeam {
      0% {
        transform: translateX(-500px) rotate(25deg);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      50% {
        transform: translateX(calc(50vw - 250px)) rotate(25deg);
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        transform: translateX(calc(100vw + 500px)) rotate(25deg);
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
}

export function initProductHover() {
  document.querySelectorAll('.product-card').forEach((card, index) => {
    let isHovering = false;

    card.addEventListener('mouseenter', async () => {
      isHovering = true;

      try {
        const productId = index + 1;

        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        if (!isHovering) {
          return;
        }

        const allCards = document.querySelectorAll('.product-card');
        const prices = document.querySelectorAll('.product-price');
        const names = document.querySelectorAll('.product-name');

        // Create wishlist icon
        const wishlistIcon = document.createElement('div');
        wishlistIcon.className = 'wishlist-icon';
        wishlistIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        `;

        setTimeout(() => {
          if (isHovering) {
            wishlistIcon.classList.add('loaded');
          }
        }, 50);

        card.appendChild(wishlistIcon);

        wishlistIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          wishlistIcon.classList.toggle('active');
        });

        allCards.forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.style.opacity = '0.5';
            otherCard.style.filter = 'grayscale(50%)';
          }
        });
      } catch (error) {
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;

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
