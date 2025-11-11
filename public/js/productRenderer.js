/**
 * Product Renderer
 *
 * PROBLEM #4 CONTRIBUTION: This renderer has expensive DOM operations
 * that make the hover effect (in animations.js) even worse.
 *
 * Real-world scenario:
 * - Junior dev builds product renderer
 * - Creates each card synchronously (blocks main thread)
 * - Doesn't cache any selectors
 * - Forces multiple layout recalculations
 * - Combined with hover effect = INP disaster
 */

/**
 * Fetches products from API and renders them to the grid
 * ❌ BAD: Synchronous rendering blocks main thread
 * ❌ BAD: No loading state management
 * ❌ BAD: Forces layout recalc on every card
 */
export async function renderProducts() {
  try {
    console.log('📦 Fetching products from API...');

    // Fetch products from our Hono server
    const response = await fetch('/api/products');
    const products = await response.json();

    console.log(`✅ Loaded ${products.length} products`);

    // Get the grid container
    const productGrid = document.querySelector('.product-grid');

    // Clear loading message
    productGrid.innerHTML = '';

    // ❌ BAD: Render products synchronously (blocks main thread)
    // A real app would use DocumentFragment or batch with rAF
    products.forEach((product, index) => {
      // ❌ BAD: Create DOM elements synchronously
      const card = createProductCard(product, index);

      // ❌ BAD: Append immediately (forces layout recalc each time)
      productGrid.appendChild(card);

      // ❌ WORST: Force a layout recalculation by reading offsetHeight
      // This creates a read-write-read-write pattern (layout thrashing)
      const height = card.offsetHeight;

      // Add a small artificial delay to make the blocking more visible
      // (Simulates complex business logic that junior devs often add)
      performExpensiveCalculation();
    });

    console.log('✅ Products rendered to DOM');

  } catch (error) {
    console.error('❌ Failed to render products:', error);
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = `
      <p style="color: #ef4444; text-align: center; grid-column: 1/-1;">
        Failed to load products. Please ensure the server is running on port 3000.
      </p>
    `;
  }
}

/**
 * Creates a single product card element
 * ❌ BAD: Lots of string concatenation and inline styles
 * ❌ BAD: Missing width/height on images (causes CLS)
 */
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  // ❌ BAD: Using innerHTML with complex string (slow parsing)
  // ❌ CRITICAL: Missing width and height attributes on img!
  //             This causes layout shifts when images load (CLS)
  card.innerHTML = `
    <div class="product-image-container">
      <img
        src="${product.image}"
        alt="${product.alt}"
        class="product-image"
        loading="lazy"
      >
      <div class="product-overlay">
        <button class="product-quick-view">Quick View</button>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">${product.price}</p>
      <button class="product-cta">Add to Cart</button>
    </div>
  `;

  // ❌ BAD: Query the DOM we just created (inefficient)
  const addToCartBtn = card.querySelector('.product-cta');

  // Add click handler with more expensive operations
  addToCartBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // ❌ BAD: Synchronous DOM queries on every click
    const allButtons = document.querySelectorAll('.product-cta');

    // ❌ BAD: Update button text synchronously
    addToCartBtn.textContent = 'Adding...';
    addToCartBtn.disabled = true;

    // Simulate API call with artificial delay
    setTimeout(() => {
      addToCartBtn.textContent = 'Added ✓';

      // ❌ BAD: More synchronous DOM work
      setTimeout(() => {
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.disabled = false;
      }, 2000);

      console.log('🛒 Added to cart:', product.name);
    }, 500);
  });

  // ❌ BAD: Set individual styles (forces style recalc)
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';

  // ❌ BAD: Force reflow by reading computed styles
  const computedStyle = window.getComputedStyle(card);
  const opacity = computedStyle.opacity;

  // Animate in (this could be done with CSS)
  requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });

  return card;
}

/**
 * Simulates expensive synchronous calculation
 * ❌ BAD: Blocks main thread
 * Real-world example: complex price calculations, tax logic,
 * validation rules that junior devs put in the render loop
 */
function performExpensiveCalculation() {
  // Simulate ~10-20ms of blocking work per product
  const start = performance.now();
  let result = 0;

  // Do pointless math to waste CPU cycles
  while (performance.now() - start < 15) {
    result += Math.random() * Math.random();
  }

  return result;
}

/**
 * ✅ FIXED VERSION (for live demo - keep commented):
 *
 * PREREQUISITES: Backend must return complete product data including wishlist status
 * GET /api/products should return:
 * [
 *   {id: 1, name: "...", price: "...", image: "...", alt: "...", inWishlist: false},
 *   ...
 * ]
 *
 * export async function renderProducts() {
 *   try {
 *     const response = await fetch('/api/products');
 *     const products = await response.json();
 *
 *     const productGrid = document.querySelector('.product-grid');
 *     productGrid.innerHTML = '';
 *
 *     // ✅ FIX: Use DocumentFragment to batch DOM operations
 *     const fragment = document.createDocumentFragment();
 *
 *     products.forEach(product => {
 *       const card = createProductCardOptimized(product);
 *       fragment.appendChild(card);
 *     });
 *
 *     // ✅ FIX: Single DOM append (one reflow instead of N)
 *     productGrid.appendChild(fragment);
 *
 *     console.log('✅ Products rendered (optimized)');
 *
 *   } catch (error) {
 *     console.error('❌ Failed to render products:', error);
 *   }
 * }
 *
 * function createProductCardOptimized(product) {
 *   const card = document.createElement('div');
 *   card.className = 'product-card';
 *
 *   // ✅ FIX: Add width and height attributes to prevent CLS
 *   // ✅ FIX: Render wishlist icon immediately (no hover fetch needed!)
 *   card.innerHTML = `
 *     <div class="product-image-container">
 *       <img
 *         src="${product.image}"
 *         alt="${product.alt}"
 *         class="product-image"
 *         width="400"
 *         height="500"
 *         loading="lazy"
 *       >
 *       <div class="product-overlay">
 *         <button class="product-quick-view">Quick View</button>
 *       </div>
 *
 *       <!-- ✅ FIX: Wishlist icon rendered immediately! -->
 *       <div class="wishlist-icon ${product.inWishlist ? 'active' : ''}" data-product-id="${product.id}">
 *         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
 *           <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
 *         </svg>
 *       </div>
 *     </div>
 *     <div class="product-info">
 *       <h3 class="product-name">${product.name}</h3>
 *       <p class="product-price">${product.price}</p>
 *       <button class="product-cta">Add to Cart</button>
 *     </div>
 *   `;
 *
 *   // ✅ FIX: Use event delegation for wishlist clicks
 *   // (Attach to parent grid once in main.js, not to each card)
 *
 *   // ✅ FIX: Make icon immediately visible with CSS
 *   const wishlistIcon = card.querySelector('.wishlist-icon');
 *   wishlistIcon.style.opacity = '1';
 *   wishlistIcon.style.transform = 'scale(1)';
 *
 *   return card;
 * }
 *
 * // ✅ RESULT:
 * // - Wishlist icon appears INSTANTLY on hover (no 340ms fetch delay)
 * // - User discovers feature immediately
 * // - INP: 620ms → 60ms (no API call blocking interaction)
 * // - Better architecture: Backend provides all data upfront
 */
