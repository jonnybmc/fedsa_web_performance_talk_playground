import { initHeroAnimation, initProductHover } from './animations.js';
import { renderProducts } from './productRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
  initHeroAnimation();

  await renderProducts();

  initProductHover();
});
