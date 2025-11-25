export async function renderProducts() {
  try {
    const response = await fetch("/api/products");
    const products = await response.json();

    const productGrid = document.querySelector(".product-grid");
    productGrid.innerHTML = "";

    products.forEach((product, index) => {
      const card = createProductCard(product, index);
      productGrid.appendChild(card);
      const height = card.offsetHeight;
    });
  } catch (error) {
    const productGrid = document.querySelector(".product-grid");
    productGrid.innerHTML = `
      <p style="color: #ef4444; text-align: center; grid-column: 1/-1;">
        Failed to load products. Please ensure the server is running on port 3000.
      </p>
    `;
  }
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <div class="product-image-container">
      <img
        src="${product.image}"
        alt="${product.alt}"
        class="product-image"
        width="800"
        height="1000"
        loading="lazy"
        fetchpriority="low"
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

  const addToCartBtn = card.querySelector(".product-cta");

  function postAnalyticsEvent(eventName, data) {
    setTimeout(() => {
      const start = Date.now();
      while (Date.now() - start < 1000) {
        // ... churning heavy encryption math ...
      }

      const payload = JSON.stringify({
        event: eventName,
        ...data,
        timestamp: Date.now(),
      });
      fetch("/api/analytics", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch((err) => console.warn("Analytics failed:", err));
    }, 0);
  }

  addToCartBtn.addEventListener("click", (e) => {
    e.preventDefault();

    addToCartBtn.textContent = "Added ✓";
    addToCartBtn.disabled = true;

    postAnalyticsEvent("add_to_cart", { id: product.id });

    setTimeout(() => {
      addToCartBtn.textContent = "Add to Cart";
      addToCartBtn.disabled = false;
    }, 2500);
  });

  return card;
}
