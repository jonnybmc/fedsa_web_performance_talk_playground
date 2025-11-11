// Main entry point - imports and initializes everything
import { initHeroAnimation, initProductHover } from './animations.js';
import { renderProducts } from './productRenderer.js';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Atelier initialized');

  // Initialize hero animations (particles, text animations)
  initHeroAnimation();

  // Render products from data file (simulates CMS/API)
  // ❌ PROBLEM 2: Product renderer forgets width/height on images → CLS
  await renderProducts();

  // Initialize hover interactions AFTER products are rendered
  // ❌ PROBLEM 3: "Netflix Effect" animated orbs → CLS + janky FPS
  // ❌ PROBLEM 4: Hover effect disaster → INP 620ms
  initProductHover();
});
