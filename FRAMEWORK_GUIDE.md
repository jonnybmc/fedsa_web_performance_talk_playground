# Framework Implementation Guide

**Applying TechMart Performance Optimizations Across Modern Frameworks**

This guide shows how to implement the performance optimizations from this vanilla JavaScript project in modern frameworks, with detailed explanations of rendering strategies and Core Web Vital impacts.

---

## Table of Contents

1. [Rendering Strategies Overview](#rendering-strategies-overview)
2. [Vanilla Project Analysis](#vanilla-project-analysis)
3. [Framework Implementations](#framework-implementations)
   - [React/Next.js](#reactnextjs)
   - [Vue/Nuxt](#vuenuxt)
   - [Svelte/SvelteKit](#sveltesveltekit)
   - [Astro](#astro)
   - [Solid.js/SolidStart](#solidjssolidstart)
   - [Webflow (Low-Code Platform)](#webflow-low-code-platform)
   - [React Native (Mobile Applications)](#react-native-mobile-applications)
4. [Optimization Cross-Reference](#optimization-cross-reference)
5. [Rendering Strategy Comparison](#rendering-strategy-comparison)

---

## Rendering Strategies Overview

### CSR (Client-Side Rendering)
- **What:** JavaScript renders content in the browser after initial HTML loads
- **Pattern:** Empty HTML shell → Download JS → Execute → Fetch data → Render content
- **Best for:** Highly interactive apps, authenticated dashboards, real-time data
- **Trade-offs:** Slower initial render, SEO challenges, larger JavaScript bundles

### SSR (Server-Side Rendering)
- **What:** Server generates full HTML for each request, sends to client
- **Pattern:** Request → Server renders → Full HTML response → Hydrate with JS
- **Best for:** Dynamic content, personalization, SEO-critical pages
- **Trade-offs:** Server load, slower TTFB, full page re-renders on navigation

### SSG (Static Site Generation)
- **What:** HTML pre-rendered at build time, served as static files
- **Pattern:** Build-time generation → CDN delivery → Instant HTML → Optional hydration
- **Best for:** Content sites, marketing pages, documentation, blogs
- **Trade-offs:** Build time grows with pages, stale data until rebuild

### ISR (Incremental Static Regeneration)
- **What:** Static pages with on-demand or time-based regeneration
- **Pattern:** Serve cached static → Revalidate in background → Update cache
- **Best for:** E-commerce, news sites, frequently updated content
- **Trade-offs:** Cache complexity, potential stale content window

---

## Vanilla Project Analysis

### Current Architecture

**This TechMart project uses a hybrid approach:**

| Section | Strategy | Justification |
|---------|----------|---------------|
| **Hero Section** | Static HTML (SSG-like) | Critical LCP element, needs immediate availability |
| **Navigation** | Static HTML (SSG-like) | Essential UI chrome, no dynamic data |
| **Product Grid** | CSR | Dynamic content fetched after page load |
| **Footer** | Static HTML (SSG-like) | Static content, no updates needed |

### Rendering Pattern Flow

```
1. Server serves static HTML (hero, nav, footer) ← SSG pattern
2. Browser downloads CSS/JS bundles
3. DOMContentLoaded fires
4. JS fetches /api/products ← CSR pattern
5. Products rendered client-side
6. Images lazy-load
```

### Optimizations by Strategy

| Optimization | Strategy It Uses | Core Web Vital Impact |
|--------------|------------------|----------------------|
| **Hero responsive images** | SSG (in initial HTML) | LCP: -2.9s, FCP: -500ms |
| **Preload hero images** | SSG (resource hints in head) | LCP: -200ms |
| **Fixed positioning for banner** | CSR (dynamic injection) | CLS: -0.28 |
| **Viewport units for orbs** | SSG (CSS in initial HTML) | CLS: -0.27 |
| **Min-height product grid** | CSR (prevents collapse) | CLS: -0.05 |
| **Lazy-load product images** | CSR (after fetch/render) | LCP: neutral, Bandwidth: -1MB |

### Key Insight

**The hero optimizations are so effective because they benefit from SSG-like immediate HTML availability. The product optimizations are limited by the CSR waterfall.**

Moving products to SSR/SSG would allow them to benefit from the same preload, responsive image, and resource hint optimizations currently only available to the hero.

---

## Framework Implementations

### React/Next.js

Next.js supports all rendering strategies. Here's how to implement TechMart optimizations:

#### 1. Hero Section with Responsive Images (SSG)

**Next.js App Router (Recommended):**

```jsx
// app/page.tsx
import Image from 'next/image';

export default function HomePage() {
  return (
    <section className="hero">
      <Image
        src="/images/hero-desktop.avif"
        alt="Modern tech devices"
        fill
        priority // ← Equivalent to fetchpriority="high"
        quality={90}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ objectFit: 'cover' }}
      />
      <div className="hero-content">
        <h1>Quality Tech. Affordable Prices.</h1>
        <p>Reliable technology for everyday life across Africa</p>
        <button>Shop Now</button>
      </div>
    </section>
  );
}
```

**Benefits:**
- ✅ Automatic image optimization (AVIF/WebP/JPEG)
- ✅ Automatic `srcset` generation
- ✅ Built-in lazy loading with `priority` override
- ✅ LCP improvement: -1.5s to -2.5s

**Core Web Vital Impact:**
- **LCP:** -1.5s to -2.5s (image optimization + preload)
- **FCP:** -300ms to -500ms (smaller images load faster)
- **CLS:** 0 (explicit dimensions prevent shifts)

#### 2. Product Grid (SSG with Data Fetching)

**App Router with Server Components:**

```tsx
// app/page.tsx
import ProductCard from '@/components/ProductCard';

async function getProducts() {
  const res = await fetch('https://api.techmart.co/products', {
    next: { revalidate: 3600 } // ISR: revalidate every hour
  });
  return res.json();
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <section className="products">
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

**Client Component for Interactivity:**

```tsx
// components/ProductCard.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product.id);
    setIsAdding(false);
  };

  return (
    <div className="product-card">
      <Image
        src={product.image}
        alt={product.alt}
        width={800}
        height={1000}
        loading="lazy" // ← Below-fold images
        quality={85}
      />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={handleAddToCart} disabled={isAdding}>
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}
```

**Benefits:**
- ✅ Products in initial HTML (no fetch waterfall)
- ✅ SEO-friendly (crawlable content)
- ✅ ISR keeps data fresh without rebuilds
- ✅ LCP improvement: -500ms to -1.5s

**Core Web Vital Impact:**
- **LCP:** -500ms to -1.5s (products in initial HTML)
- **FCP:** -200ms to -400ms (no client-side rendering delay)
- **INP:** -100ms to -300ms (less JavaScript to parse)

#### 3. Fixed Positioning for Banner (CSR)

```tsx
// components/PromoBanner.tsx
'use client';

import { useEffect, useState } from 'react';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Inject after 2 seconds (simulating tag manager)
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', // ← Key: removed from document flow
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      padding: '1rem',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s ease'
    }}>
      <strong>🎉 Limited Time: 20% Off All Laptops!</strong>
      <button onClick={() => setIsVisible(false)}>×</button>
    </div>
  );
}
```

**Core Web Vital Impact:**
- **CLS:** -0.28 (no layout shift from dynamic injection)

#### 4. CSS Optimization Strategy

**App Router - CSS Modules:**

```tsx
// app/layout.tsx
import './globals.css'; // Critical CSS only
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // ← Prevent FOIT
  preload: true
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preconnect to image CDN */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

```css
/* app/globals.css - Critical CSS only */
:root {
  --color-primary: #1a1a1a;
  --color-accent: #d4a574;
}

.hero {
  min-height: 100vh;
  position: relative;
}

/* Non-critical CSS lazy-loaded via dynamic imports */
```

**Lazy-load non-critical CSS:**

```tsx
// components/Footer.tsx
'use client';

import { useEffect } from 'react';

export default function Footer() {
  useEffect(() => {
    // Lazy-load footer CSS
    import('./Footer.module.css');
  }, []);

  return <footer>{/* ... */}</footer>;
}
```

**Core Web Vital Impact:**
- **FCP:** -300ms to -800ms (reduced render-blocking CSS)
- **LCP:** -200ms to -500ms (faster initial render)

---

### Vue/Nuxt

Nuxt 3 provides excellent performance defaults with flexible rendering modes.

#### 1. Hero Section with Responsive Images (SSG)

```vue
<!-- pages/index.vue -->
<template>
  <section class="hero">
    <NuxtImg
      src="/images/hero-desktop.avif"
      alt="Modern tech devices"
      :width="1920"
      :height="1080"
      loading="eager"
      fetchpriority="high"
      sizes="sm:100vw md:50vw"
      format="avif,webp,jpg"
      quality="90"
      fit="cover"
    />
    <div class="hero-content">
      <h1>Quality Tech. Affordable Prices.</h1>
      <p>Reliable technology for everyday life across Africa</p>
      <button>Shop Now</button>
    </div>
  </section>
</template>

<script setup>
// Preconnect to CDN
useHead({
  link: [
    { rel: 'preconnect', href: 'https://images.unsplash.com' }
  ]
});
</script>
```

**nuxt.config.ts:**

```typescript
export default defineNuxtConfig({
  image: {
    domains: ['images.unsplash.com'],
    formats: ['avif', 'webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    }
  }
});
```

**Core Web Vital Impact:**
- **LCP:** -1.5s to -2.5s (optimized images + preload)
- **FCP:** -300ms to -500ms
- **CLS:** 0 (explicit dimensions)

#### 2. Product Grid with ISR

```vue
<!-- pages/index.vue -->
<template>
  <section class="products">
    <div class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>

<script setup>
// ISR: Fetch at build time, revalidate on request
const { data: products } = await useFetch('/api/products', {
  // Cache for 1 hour, serve stale while revalidating
  getCachedData: (key) => {
    return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
  }
});
</script>
```

**Server API Route with Caching:**

```typescript
// server/api/products.ts
export default defineCachedEventHandler(async (event) => {
  const products = await fetchProductsFromDB();
  return products;
}, {
  maxAge: 60 * 60, // Cache for 1 hour
  swr: true // Serve stale while revalidating
});
```

**nuxt.config.ts:**

```typescript
export default defineNuxtConfig({
  routeRules: {
    '/': {
      swr: 3600, // ISR: revalidate every hour
      prerender: true // SSG at build time
    }
  }
});
```

**Core Web Vital Impact:**
- **LCP:** -500ms to -1.5s (products in initial HTML)
- **FCP:** -200ms to -400ms
- **INP:** -100ms to -300ms

#### 3. Animation Performance

```vue
<!-- components/AnimatedOrbs.vue -->
<template>
  <div v-if="shouldShowOrbs" class="orbs-container">
    <div
      v-for="orb in orbs"
      :key="orb.id"
      class="orb"
      :style="orbStyle(orb)"
    />
  </div>
</template>

<script setup>
const shouldShowOrbs = computed(() => {
  // Progressive enhancement: disable on low-end devices
  if (process.client) {
    return navigator.hardwareConcurrency >= 4;
  }
  return false;
});

const orbs = [
  { id: 1, color: 'rgba(212, 165, 116, 0.15)', size: 600 },
  { id: 2, color: 'rgba(139, 69, 19, 0.1)', size: 500 },
];

const orbStyle = (orb) => ({
  position: 'fixed', // ← Viewport-relative (stable)
  width: `${orb.size}px`,
  height: `${orb.size}px`,
  background: orb.color,
  borderRadius: '50%',
  filter: `blur(${orb.size / 10}px)`,
  willChange: 'transform',
  animation: 'float 20s ease-in-out infinite',
  // Use pixel-based positioning
  top: '10vh',
  left: '20vw',
});
</script>

<style scoped>
.orbs-container {
  contain: layout style; /* ← Isolate layout calculations */
  pointer-events: none;
}

@keyframes float {
  0%, 100% {
    transform: translate3d(0, 0, 0); /* ← GPU-accelerated */
  }
  50% {
    transform: translate3d(-100px, -100px, 0); /* ← Pixel-based */
  }
}
</style>
```

**Core Web Vital Impact:**
- **CLS:** -0.27 (stable positioning)
- **FPS:** 20-30fps → 60fps (compositor-friendly animations)

---

### Svelte/SvelteKit

SvelteKit's compiler-based approach provides excellent performance out of the box.

#### 1. Hero Section (SSG)

```svelte
<!-- routes/+page.svelte -->
<script>
  import { enhanced } from '$app/forms';
</script>

<section class="hero">
  <picture>
    <source
      srcset="
        /images/hero-mobile.avif 800w,
        /images/hero-tablet.avif 1200w
      "
      type="image/avif"
      media="(max-width: 768px)"
    />
    <source
      srcset="
        /images/hero-desktop.avif 1920w,
        /images/hero-4k.avif 2560w
      "
      type="image/avif"
    />
    <img
      src="/images/hero-desktop.jpg"
      alt="Modern tech devices"
      width="1920"
      height="1080"
      fetchpriority="high"
      decoding="async"
      loading="eager"
    />
  </picture>

  <div class="hero-content">
    <h1>Quality Tech. Affordable Prices.</h1>
    <p>Reliable technology for everyday life across Africa</p>
    <button>Shop Now</button>
  </div>
</section>

<svelte:head>
  <!-- Preconnect to CDN -->
  <link rel="preconnect" href="https://images.unsplash.com" />

  <!-- Preload hero image -->
  <link
    rel="preload"
    as="image"
    href="/images/hero-desktop.avif"
    type="image/avif"
    fetchpriority="high"
  />
</svelte:head>

<style>
.hero {
  position: relative;
  min-height: 100vh;
  contain: layout style; /* Isolate layout calculations */
}

.hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
```

**Core Web Vital Impact:**
- **LCP:** -1.5s to -2.5s
- **FCP:** -300ms to -500ms
- **CLS:** 0

#### 2. Product Grid with Prerendering (SSG)

```svelte
<!-- routes/+page.svelte -->
<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<section class="products">
  <div class="product-grid" style="min-height: 1400px;">
    {#each data.products as product}
      <div class="product-card">
        <img
          src={product.image}
          alt={product.alt}
          width="800"
          height="1000"
          loading="lazy"
          decoding="async"
        />
        <h3>{product.name}</h3>
        <p>{product.price}</p>
        <button on:click={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    {/each}
  </div>
</section>

<style>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 6rem 4rem;
  min-height: 1400px; /* ← Prevent collapse during hydration */
}
</style>
```

**Load function (SSG):**

```typescript
// routes/+page.ts
export const prerender = true; // SSG

export async function load({ fetch }) {
  const response = await fetch('/api/products');
  const products = await response.json();

  return {
    products
  };
}
```

**Core Web Vital Impact:**
- **LCP:** -500ms to -1.5s (products in HTML)
- **FCP:** -200ms to -400ms
- **CLS:** 0 (min-height prevents collapse)

#### 3. Performance-Optimized Animations

```svelte
<!-- lib/components/AnimatedOrbs.svelte -->
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let shouldRender = false;

  onMount(() => {
    // Progressive enhancement
    if (navigator.hardwareConcurrency >= 4) {
      shouldRender = true;
    }
  });
</script>

{#if browser && shouldRender}
  <div class="orbs-container">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
  </div>
{/if}

<style>
.orbs-container {
  position: fixed; /* Viewport-relative */
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: layout style; /* Isolate calculations */
  z-index: 0;
}

.orb {
  position: fixed; /* ← Stable positioning */
  border-radius: 50%;
  will-change: transform;
  /* Use pixel-based positioning for stability */
}

.orb-1 {
  width: 600px;
  height: 600px;
  top: 10vh;
  left: 20vw;
  background: rgba(212, 165, 116, 0.15);
  filter: blur(60px);
  animation: float-1 20s ease-in-out infinite;
}

@keyframes float-1 {
  0%, 100% {
    transform: translate3d(0, 0, 0); /* GPU-accelerated */
  }
  50% {
    transform: translate3d(-100px, -100px, 0); /* Pixel values */
  }
}
</style>
```

**Core Web Vital Impact:**
- **CLS:** -0.27
- **FPS:** 60fps stable

---

### Astro

Astro's Islands architecture is perfect for content-heavy sites with selective interactivity.

#### 1. Hero Section (Zero JS by Default)

```astro
---
// pages/index.astro
import { Image } from 'astro:assets';
import heroDesktop from '../assets/hero-desktop.avif';
import heroMobile from '../assets/hero-mobile.avif';
---

<html lang="en">
  <head>
    <link rel="preconnect" href="https://images.unsplash.com" />
  </head>
  <body>
    <section class="hero">
      <Image
        src={heroDesktop}
        alt="Modern tech devices"
        width={1920}
        height={1080}
        format="avif"
        quality={90}
        loading="eager"
        fetchpriority="high"
      />
      <div class="hero-content">
        <h1>Quality Tech. Affordable Prices.</h1>
        <p>Reliable technology for everyday life across Africa</p>
        <a href="/shop" class="cta-button">Shop Now</a>
      </div>
    </section>
  </body>
</html>

<style>
.hero {
  position: relative;
  min-height: 100vh;
  contain: layout style;
}

.hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
```

**Benefits:**
- ✅ Zero JavaScript shipped for static hero
- ✅ Automatic image optimization
- ✅ Build-time responsive image generation

**Core Web Vital Impact:**
- **LCP:** -2s to -3s (zero JS overhead + optimized images)
- **FCP:** -400ms to -600ms
- **TBT:** 0ms (no JS to parse)

#### 2. Product Grid (SSG with Interactive Islands)

```astro
---
// pages/index.astro
import ProductCard from '../components/ProductCard.astro';

const products = await fetch('https://api.techmart.co/products')
  .then(res => res.json());
---

<section class="products">
  <div class="product-grid">
    {products.map(product => (
      <ProductCard product={product} client:visible />
    ))}
  </div>
</section>

<style>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 6rem 4rem;
  min-height: 1400px;
}
</style>
```

**Interactive Island Component:**

```astro
---
// components/ProductCard.astro
import { Image } from 'astro:assets';

interface Props {
  product: {
    id: string;
    name: string;
    price: string;
    image: string;
    alt: string;
  };
}

const { product } = Astro.props;
---

<div class="product-card">
  <Image
    src={product.image}
    alt={product.alt}
    width={800}
    height={1000}
    loading="lazy"
    format="avif"
  />
  <h3>{product.name}</h3>
  <p>{product.price}</p>
  <button class="add-to-cart" data-product-id={product.id}>
    Add to Cart
  </button>
</div>

<script>
  // Only this JS loads (per product card)
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', async (e) => {
      const productId = e.target.dataset.productId;
      button.textContent = 'Adding...';
      button.disabled = true;

      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });

      button.textContent = 'Added ✓';
      setTimeout(() => {
        button.textContent = 'Add to Cart';
        button.disabled = false;
      }, 2000);
    });
  });
</script>
```

**Core Web Vital Impact:**
- **LCP:** -1s to -2s (minimal JS, products in HTML)
- **FCP:** -300ms to -500ms
- **INP:** -200ms to -400ms (minimal JS)
- **TBT:** -150ms to -300ms

#### 3. Selective Hydration for Orbs

```astro
---
// components/AnimatedOrbs.astro
---

<div class="orbs-container">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
</div>

<script>
  // Only loads if component is visible
  if (navigator.hardwareConcurrency < 4) {
    // Remove orbs on low-end devices
    document.querySelector('.orbs-container')?.remove();
  }
</script>

<style>
.orbs-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: layout style;
  z-index: 0;
}

.orb {
  position: fixed;
  border-radius: 50%;
  will-change: transform;
}

.orb-1 {
  width: 600px;
  height: 600px;
  top: 10vh;
  left: 20vw;
  background: rgba(212, 165, 116, 0.15);
  filter: blur(60px);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-100px, -100px, 0); }
}
</style>
```

**Usage in page:**

```astro
---
import AnimatedOrbs from '../components/AnimatedOrbs.astro';
---

<!-- Only loads JS when component enters viewport -->
<AnimatedOrbs client:visible />
```

**Core Web Vital Impact:**
- **CLS:** -0.27
- **TBT:** -100ms (deferred JS load)

---

### Solid.js/SolidStart

Solid's fine-grained reactivity provides excellent performance with minimal overhead.

#### 1. Hero Section with Image Optimization

```tsx
// routes/index.tsx
import { Title, Meta } from '@solidjs/meta';

export default function Home() {
  return (
    <>
      <Title>TechMart - Quality Tech, Affordable Prices</Title>
      <Meta name="description" content="Reliable technology for everyday life" />
      <Meta name="preconnect" content="https://images.unsplash.com" />

      <section class="hero">
        <picture>
          <source
            srcset="/images/hero-mobile.avif 800w, /images/hero-tablet.avif 1200w"
            type="image/avif"
            media="(max-width: 768px)"
          />
          <source
            srcset="/images/hero-desktop.avif 1920w, /images/hero-4k.avif 2560w"
            type="image/avif"
          />
          <img
            src="/images/hero-desktop.jpg"
            alt="Modern tech devices"
            width="1920"
            height="1080"
            fetchpriority="high"
            decoding="async"
            loading="eager"
          />
        </picture>

        <div class="hero-content">
          <h1>Quality Tech. Affordable Prices.</h1>
          <p>Reliable technology for everyday life across Africa</p>
          <button>Shop Now</button>
        </div>
      </section>
    </>
  );
}
```

**Core Web Vital Impact:**
- **LCP:** -1.5s to -2.5s
- **FCP:** -300ms to -500ms

#### 2. Product Grid with SSR

```tsx
// routes/index.tsx
import { createResource, For, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

async function fetchProducts() {
  const res = await fetch('https://api.techmart.co/products');
  return res.json();
}

export default function Home() {
  // Runs on server, data included in HTML
  const [products] = createResource(fetchProducts);

  return (
    <section class="products">
      <div class="product-grid" style={{ 'min-height': '1400px' }}>
        <Show when={products()} fallback={<div>Loading...</div>}>
          <For each={products()}>
            {(product) => <ProductCard product={product} />}
          </For>
        </Show>
      </div>
    </section>
  );
}
```

**Product Card Component:**

```tsx
// components/ProductCard.tsx
import { createSignal } from 'solid-js';

interface ProductProps {
  product: {
    id: string;
    name: string;
    price: string;
    image: string;
    alt: string;
  };
}

export default function ProductCard(props: ProductProps) {
  const [isAdding, setIsAdding] = createSignal(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: props.product.id })
    });
    setIsAdding(false);
  };

  return (
    <div class="product-card">
      <img
        src={props.product.image}
        alt={props.product.alt}
        width="800"
        height="1000"
        loading="lazy"
        decoding="async"
      />
      <h3>{props.product.name}</h3>
      <p>{props.product.price}</p>
      <button
        onClick={handleAddToCart}
        disabled={isAdding()}
      >
        {isAdding() ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}
```

**Core Web Vital Impact:**
- **LCP:** -500ms to -1.5s (SSR, minimal reactivity overhead)
- **FCP:** -200ms to -400ms
- **INP:** -100ms to -200ms (fine-grained updates, no virtual DOM diffing)

#### 3. Optimized Animations with Signals

```tsx
// components/AnimatedOrbs.tsx
import { createSignal, onMount, Show } from 'solid-js';

export default function AnimatedOrbs() {
  const [shouldRender, setShouldRender] = createSignal(false);

  onMount(() => {
    // Progressive enhancement
    if (navigator.hardwareConcurrency >= 4) {
      setShouldRender(true);
    }
  });

  return (
    <Show when={shouldRender()}>
      <div class="orbs-container">
        <div class="orb orb-1" />
        <div class="orb orb-2" />
      </div>
    </Show>
  );
}
```

**Styles (CSS Module or Styled Components):**

```css
.orbs-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: layout style;
  z-index: 0;
}

.orb {
  position: fixed;
  border-radius: 50%;
  will-change: transform;
}

.orb-1 {
  width: 600px;
  height: 600px;
  top: 10vh;
  left: 20vw;
  background: rgba(212, 165, 116, 0.15);
  filter: blur(60px);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-100px, -100px, 0); }
}
```

**Core Web Vital Impact:**
- **CLS:** -0.27
- **INP:** -50ms to -150ms (fine-grained reactivity)

---

### Webflow (Low-Code Platform)

Webflow is a visual web design platform that generates production-ready code. While it's a low-code tool with limited control, many TechMart optimizations are still applicable.

#### Understanding Webflow's Architecture

**What Webflow Provides:**
- Static HTML/CSS generation (SSG-like)
- Hosting on global CDN
- Automatic image optimization (WebP support)
- Responsive image generation
- Built-in lazy loading

**Limitations:**
- Limited JavaScript control
- No server-side rendering
- Fixed image optimization settings
- Limited font loading control
- Cannot self-host assets easily

#### 1. Image Optimization in Webflow

**Built-in Features You Get:**

Webflow automatically:
- Generates responsive image sizes
- Converts to WebP format
- Adds lazy loading to below-fold images
- Serves images from global CDN

**What You Can Control:**

```html
<!-- Custom Code Embed in <head> -->
<link rel="preconnect" href="https://images.unsplash.com">

<!-- Preload critical hero image -->
<link rel="preload"
      as="image"
      href="https://uploads-ssl.webflow.com/your-hero-image.webp"
      fetchpriority="high">
```

**TechMart Techniques Applicable:**
- ✅ Responsive images (automatic)
- ✅ Modern formats (WebP, automatic AVIF coming)
- ⚠️ Preload hints (via custom code)
- ⚠️ Fetchpriority (via custom code embed)
- ❌ Manual AVIF generation (not yet supported)

**Core Web Vital Impact:**
- **LCP:** -1s to -2s (good CDN, automatic WebP)
- **FCP:** -300ms to -500ms
- **CLS:** 0 (automatic dimensions)

#### 2. Layout Stability Optimizations

**Fixed Positioning for Dynamic Banners:**

```html
<!-- Custom Code Embed (Before </body>) -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Inject promotional banner with fixed positioning
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  `;
  banner.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
      <strong>🎉 Limited Time: 20% Off All Laptops!</strong>
      <button onclick="this.parentElement.parentElement.style.display='none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
    </div>
  `;
  document.body.appendChild(banner);

  // Slide in after 2 seconds
  setTimeout(() => {
    banner.style.transform = 'translateY(0)';
  }, 2000);
});
</script>
```

**Core Web Vital Impact:**
- **CLS:** -0.28 (prevents layout shift from dynamic content)

#### 3. Animation Performance

**Optimized CSS Animations (via Custom Code):**

```html
<!-- Custom Code Embed in <head> -->
<style>
.hero-section {
  position: relative;
  contain: layout style; /* Isolate layout calculations */
}

.animated-orb {
  position: fixed !important; /* Override Webflow's positioning */
  will-change: transform;
  border-radius: 50%;
  pointer-events: none;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  top: 10vh;
  left: 20vw;
  background: rgba(212, 165, 116, 0.15);
  filter: blur(60px);
}

@keyframes float {
  0%, 100% {
    transform: translate3d(0, 0, 0); /* GPU-accelerated */
  }
  50% {
    transform: translate3d(-100px, -100px, 0); /* Pixel-based */
  }
}

/* Progressive enhancement: hide on low-end devices */
@media (max-width: 768px) {
  .animated-orb {
    display: none !important;
  }
}
</style>

<!-- Custom Code Embed (Before </body>) -->
<script>
// Remove orbs on low-end devices
if (navigator.hardwareConcurrency < 4) {
  document.querySelectorAll('.animated-orb').forEach(el => el.remove());
}
</script>
```

**Core Web Vital Impact:**
- **CLS:** -0.15 to -0.27
- **FPS:** +30fps

#### 4. Font Optimization

**Self-hosting Fonts via Custom Code:**

```html
<!-- Custom Code Embed in <head> -->
<style>
/* Preload self-hosted fonts */
@font-face {
  font-family: 'Inter';
  src: url('https://your-cdn.com/inter-variable.woff2') format('woff2');
  font-display: swap; /* Prevent FOIT */
  font-weight: 100 900;
}

/* Override Webflow's Google Fonts */
body, h1, h2, h3 {
  font-family: 'Inter', -apple-system, system-ui, sans-serif !important;
}
</style>

<link rel="preload"
      href="https://your-cdn.com/inter-variable.woff2"
      as="font"
      type="font/woff2"
      crossorigin>
```

**Core Web Vital Impact:**
- **LCP:** -300ms to -600ms
- **FCP:** -200ms to -400ms
- **CLS:** -0.05 (font-display: swap)

#### 5. Third-Party Script Optimization

**Defer Google Analytics:**

```html
<!-- Custom Code Embed (Before </body>) -->
<script>
// Defer analytics until page is interactive
window.addEventListener('load', function() {
  setTimeout(function() {
    // Load Google Analytics
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'YOUR-GA-ID', 'auto');
    ga('send', 'pageview');
  }, 2000); // 2 second delay
});
</script>
```

**Core Web Vital Impact:**
- **FCP:** -100ms to -300ms
- **TBT:** -200ms

#### 6. What You CANNOT Do in Webflow

These TechMart optimizations are **not possible** in Webflow:

1. ❌ **SSR/ISR** - Webflow only generates static sites
2. ❌ **Manual AVIF generation** - Limited to WebP (for now)
3. ❌ **Complete JavaScript control** - Limited to custom code embeds
4. ❌ **Self-host all assets** - Images must use Webflow CDN
5. ❌ **Inline critical CSS** - Cannot modify build output
6. ❌ **Code splitting** - No build process control
7. ❌ **Service workers** - No way to register/configure

#### 7. Webflow Workarounds & Best Practices

**For Product Grids (CSR-like behavior):**

```html
<!-- Use Webflow CMS Collections for products -->
<!-- Add min-height via custom code to prevent collapse -->

<style>
.product-grid {
  min-height: 1400px !important;
}
</style>
```

**For Interactive Elements:**

```html
<!-- Use Webflow Interactions for simple animations -->
<!-- For complex interactions, add custom JavaScript -->

<script>
// Optimize click handlers
document.querySelectorAll('.product-cta').forEach((button, index) => {
  button.addEventListener('click', async function(e) {
    e.preventDefault();

    // Don't query all buttons unnecessarily!
    this.textContent = 'Adding...';
    this.disabled = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    this.textContent = 'Added ✓';
    setTimeout(() => {
      this.textContent = 'Add to Cart';
      this.disabled = false;
    }, 2000);
  });
});
</script>
```

**Core Web Vital Impact:**
- **INP:** -10ms to -30ms (optimized event handlers)

#### Summary: Webflow Performance Potential

**What Works Well:**
- ✅ Image optimization (automatic WebP, responsive images)
- ✅ CDN delivery (fast initial load)
- ✅ Layout stability (CSS via custom code)
- ✅ Animation performance (CSS animations via custom code)
- ✅ Font optimization (self-hosting via custom code)
- ✅ Third-party script deferral (custom code)

**Limitations:**
- ⚠️ No SSR/ISR (static only)
- ⚠️ Limited build process control
- ⚠️ Cannot self-host all assets
- ⚠️ No AVIF support yet
- ⚠️ Limited JavaScript control

**Achievable Core Web Vitals:**
- **LCP:** 1.5s - 2.5s (good but not excellent)
- **CLS:** 0.02 - 0.08 (with custom code optimizations)
- **INP:** 100ms - 300ms (limited by custom code constraints)
- **FCP:** 0.8s - 1.5s

**Recommendation:** Webflow is excellent for marketing sites and landing pages where design flexibility matters more than absolute performance. For e-commerce or highly interactive apps, consider frameworks with more control.

---

### React Native (Mobile Applications)

React Native builds native mobile apps using React. While Core Web Vitals don't directly apply, many performance concepts translate to mobile equivalents.

#### Understanding Mobile Performance Metrics

**Web vs Mobile Metric Translation:**

| Web Metric (CWV) | Mobile Equivalent | What It Measures |
|------------------|-------------------|------------------|
| **LCP (Largest Contentful Paint)** | Time to Interactive (TTI) | When main content is visible and interactive |
| **CLS (Cumulative Layout Shift)** | Layout Stability | Visual stability during rendering |
| **INP (Interaction to Next Paint)** | Touch Response Time | Time from tap to visual feedback |
| **FCP (First Contentful Paint)** | Initial Render Time | When first content appears |
| **TTFB (Time to First Byte)** | API Response Time | Network request latency |

#### 1. Image Optimization (Equivalent to Hero Images)

**TechMart Web Approach:**
- Responsive images with `<picture>`
- Modern formats (AVIF/WebP)
- Preload critical images
- Lazy-load below-fold

**React Native Implementation:**

```tsx
import FastImage from 'react-native-fast-image';

// Hero component with optimized image loading
export function HeroSection() {
  return (
    <View style={styles.hero}>
      <FastImage
        style={styles.heroImage}
        source={{
          uri: 'https://images.unsplash.com/hero-desktop.jpg',
          priority: FastImage.priority.high, // ← Equivalent to fetchpriority="high"
          cache: FastImage.cacheControl.immutable,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.heroContent}>
        <Text style={styles.heading}>Quality Tech. Affordable Prices.</Text>
        <Text style={styles.subheading}>
          Reliable technology for everyday life across Africa
        </Text>
        <TouchableOpacity style={styles.cta}>
          <Text style={styles.ctaText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

**Key Library:** [`react-native-fast-image`](https://github.com/DylanVann/react-native-fast-image)

**Benefits:**
- ✅ Image caching (like browser cache)
- ✅ Priority hints (high/normal/low)
- ✅ Preloading support
- ✅ Native performance (faster than RN's Image component)

**Performance Impact:**
- **TTI:** -500ms to -1.5s (faster image loading)
- **Initial Render:** -300ms to -500ms

#### 2. Layout Stability (Equivalent to CLS Prevention)

**TechMart Web Approach:**
- Fixed positioning for overlays
- Min-height for dynamic content
- Avoid percentage-based positioning

**React Native Implementation:**

```tsx
import { View, Text, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Fixed positioning for promotional banner
export function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 2000);
  }, []);

  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute', // ← Equivalent to position: fixed
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10, // Android shadow
      zIndex: 1000,
    }}>
      <Text style={{ fontWeight: 'bold' }}>
        🎉 Limited Time: 20% Off All Laptops!
      </Text>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text style={{ fontSize: 24 }}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

// Reserve space for product grid (min-height equivalent)
export function ProductGrid({ products }) {
  return (
    <View style={{ minHeight: 1400 }}> {/* ← Prevents collapse */}
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        // Optimize rendering
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
      />
    </View>
  );
}
```

**Performance Impact:**
- **Layout Stability:** 100% improvement (no shifts from dynamic content)
- **Scroll Performance:** +10-20 FPS (optimized FlatList)

#### 3. Animation Performance (Equivalent to Orb Animations)

**TechMart Web Approach:**
- GPU-accelerated transforms
- Compositor properties only
- Progressive enhancement

**React Native Implementation:**

```tsx
import { Animated, Platform } from 'react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

// Using Reanimated 2 (runs on UI thread, not JS thread)
export function AnimatedOrbs() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Progressive enhancement: disable on low-end devices
  const shouldRender = Platform.OS === 'ios' || Platform.Version >= 28;

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-100, { duration: 10000 }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(-100, { duration: 10000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value }, // ← GPU-accelerated
      { translateY: translateY.value },
    ],
  }));

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.orb, animatedStyle]}>
      {/* Orb content */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    // Note: React Native doesn't support CSS blur on all platforms
    // Use react-native-blur or react-native-svg for blur effects
  },
});
```

**Key Library:** [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/)

**Why Reanimated over Animated API:**
- ✅ Runs on UI thread (not blocked by JS thread)
- ✅ 60fps guaranteed (equivalent to GPU-accelerated CSS)
- ✅ Better performance on low-end devices
- ✅ Worklet-based (truly native animations)

**Performance Impact:**
- **FPS:** 30fps → 60fps (UI thread animations)
- **Touch Response:** -50ms to -100ms (no JS thread blocking)

#### 4. Interaction Performance (Equivalent to INP)

**TechMart Web Approach:**
- Remove unnecessary DOM queries
- Optimize event handlers
- Avoid forced layouts

**React Native Implementation:**

```tsx
import { TouchableOpacity, ActivityIndicator } from 'react-native';

export function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = useCallback(async () => {
    // Optimized: No unnecessary queries, direct state update
    setIsAdding(true);

    try {
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });

      setIsAdding(false);

      // Show success feedback
      setTimeout(() => setIsAdding(false), 2000);
    } catch (error) {
      setIsAdding(false);
    }
  }, [product.id]); // ← Memoize to prevent re-creation

  return (
    <View style={styles.card}>
      <FastImage
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price}</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddToCart}
        disabled={isAdding}
        activeOpacity={0.7} // ← Immediate visual feedback
      >
        {isAdding ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Add to Cart</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

**Performance Impact:**
- **Touch Response:** -10ms to -30ms (optimized handlers)
- **INP Equivalent:** 50ms → 20ms (immediate feedback)

#### 5. Bundle Size Optimization (Equivalent to Code Splitting)

**TechMart Web Approach:**
- Code splitting
- Lazy loading
- Tree shaking

**React Native Implementation:**

```typescript
// Use React.lazy for screens (requires React Native 0.70+)
import { lazy, Suspense } from 'react';

const ProductScreen = lazy(() => import('./screens/ProductScreen'));
const CartScreen = lazy(() => import('./screens/CartScreen'));

// Navigation setup
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Products"
          component={(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <ProductScreen {...props} />
            </Suspense>
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Lazy-load heavy libraries
const Analytics = {
  track: async (event: string) => {
    const { default: RNAnalytics } = await import('react-native-analytics');
    RNAnalytics.track(event);
  },
};
```

**Tools:**
- [React Native Bundle Analyzer](https://github.com/IjzerenHein/react-native-bundle-visualizer)
- [Hermes Engine](https://reactnative.dev/docs/hermes) (bytecode compilation)

**Performance Impact:**
- **App Start Time:** -500ms to -1.5s (smaller initial bundle)
- **Memory Usage:** -20% to -40% (lazy-loaded modules)

#### 6. Network Optimization (Equivalent to API Performance)

**TechMart Web Approach:**
- Remove artificial delays
- Add compression
- Cache responses

**React Native Implementation:**

```typescript
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// Setup axios with caching
const api = setupCache(axios.create({
  baseURL: 'https://api.techmart.co',
  timeout: 10000,
}), {
  ttl: 1000 * 60 * 5, // 5 minute cache
});

// Optimized product fetching
export async function fetchProducts() {
  try {
    const response = await api.get('/products', {
      cache: {
        interpretHeader: true, // Respect Cache-Control headers
        methods: ['get'],
      },
    });
    return response.data;
  } catch (error) {
    // Graceful degradation
    return [];
  }
}

// Prefetch data when user is likely to need it
export function usePrefetch() {
  const navigation = useNavigation();

  useEffect(() => {
    // Prefetch products when hovering over "Products" tab
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts(); // Warms up cache
    });

    return unsubscribe;
  }, [navigation]);
}
```

**Performance Impact:**
- **API Response:** -150ms to -400ms (caching)
- **Perceived Performance:** 2-3x faster (prefetching)

#### 7. What Translates from TechMart to React Native

| TechMart Optimization | React Native Equivalent | Library/Approach |
|----------------------|------------------------|------------------|
| **Responsive images** | FastImage with caching | `react-native-fast-image` |
| **AVIF/WebP formats** | Native image optimization | Built-in (iOS/Android handle formats) |
| **Preload images** | FastImage.preload() | `react-native-fast-image` |
| **Fixed positioning** | position: 'absolute' | React Native StyleSheet |
| **GPU animations** | Reanimated 2 (UI thread) | `react-native-reanimated` |
| **Layout containment** | FlatList optimization | Built-in (removeClippedSubviews) |
| **Progressive enhancement** | Platform.OS checks | Built-in React Native |
| **Code splitting** | React.lazy + Suspense | React Native 0.70+ |
| **Font optimization** | Custom font loading | `react-native-vector-icons`, expo-font |
| **Defer analytics** | Lazy import | Dynamic imports |

#### 8. What DOESN'T Translate

These TechMart optimizations are **not applicable** to React Native:

1. ❌ **Core Web Vitals** - Mobile uses different metrics (TTI, FPS, Memory)
2. ❌ **Browser caching** - Use AsyncStorage, MMKV, or SQLite
3. ❌ **Service workers** - No concept in native apps
4. ❌ **CDN delivery** - Apps bundle assets at compile time
5. ❌ **SEO optimization** - Not relevant for native apps
6. ❌ **Lighthouse scores** - Use Android Profiler, Xcode Instruments instead

#### Summary: React Native Performance Potential

**What Works Well:**
- ✅ Image optimization (FastImage, native caching)
- ✅ Layout stability (absolute positioning, minHeight)
- ✅ Animation performance (Reanimated 2, UI thread)
- ✅ Interaction optimization (memoization, useCallback)
- ✅ Bundle optimization (lazy loading, Hermes)
- ✅ Network optimization (caching, prefetching)

**Key Differences from Web:**
- ⚠️ Different metrics (no CWV, use mobile-specific)
- ⚠️ Native profiling tools (not Lighthouse)
- ⚠️ Platform-specific optimizations (iOS vs Android)
- ⚠️ Memory constraints (mobile devices more limited)

**Achievable Performance Metrics:**
- **TTI (Time to Interactive):** 1.5s - 2.5s
- **FPS:** 60fps (120fps on iOS ProMotion devices)
- **Touch Response:** <50ms
- **Memory Usage:** <200MB for typical e-commerce app
- **Bundle Size:** 5-15MB (optimized)

**Recommendation:** React Native performance principles align closely with web performance - prioritize critical content, optimize images, use native animations, and minimize JavaScript work on the main thread.

---

## Optimization Cross-Reference

This table maps each optimization from the TechMart project to its Core Web Vital impact and framework implementation approach.

| # | Optimization | Primary CWV | Impact | CSR | SSR | SSG | ISR | Webflow | React Native | Notes |
|---|-------------|-------------|--------|-----|-----|-----|-----|---------|--------------|-------|
| 1 | **Responsive Hero Images** | LCP | -1.5s to -2.5s | ⚠️ Limited | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Automatic | ✅ FastImage | Webflow auto-generates, RN use react-native-fast-image |
| 2 | **Modern Image Formats (AVIF/WebP)** | LCP, FCP | -500ms to -1s | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ⚠️ WebP only | ✅ Native | Webflow no AVIF yet; iOS/Android handle formats automatically |
| 3 | **Fetchpriority="high" on LCP** | LCP | -200ms to -400ms | ⚠️ If in HTML | ✅ Excellent | ✅ Excellent | ✅ Excellent | ⚠️ Custom code | ✅ priority.high | Via Webflow embed; FastImage.priority in RN |
| 4 | **Preconnect to Image CDN** | LCP, FCP | -100ms to -300ms | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Custom code | N/A | Add via Webflow <head> embed; not applicable to RN |
| 5 | **Preload Hero Image** | LCP | -150ms to -300ms | ⚠️ If known | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Custom code | ✅ preload() | Via Webflow embed; FastImage.preload() in RN |
| 6 | **Position: Fixed for Banner** | CLS | -0.28 | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Custom code | ✅ absolute | CSS via Webflow embed; position: 'absolute' in RN |
| 7 | **Viewport Units for Animations** | CLS | -0.27 | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ⚠️ Dimensions | CSS in Webflow; use Dimensions.get() in RN |
| 8 | **Fixed Positioning for Orbs** | CLS | -0.15 to -0.20 | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Custom CSS | ✅ absolute | Override via !important in Webflow; absolute in RN |
| 9 | **Transform Instead of Left/Top** | CLS, FPS | -0.10, +30fps | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Reanimated | CSS in Webflow; Reanimated 2 in RN for 60fps |
| 10 | **Layout Containment** | CLS, FPS | -0.05, +10fps | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Custom CSS | ✅ FlatList opts | contain: layout style via Webflow; removeClippedSubviews in RN |
| 11 | **Progressive Enhancement (Orbs)** | CLS, FPS | Device-dependent | ✅ Works | ✅ Works | ⚠️ Build-time | ✅ Works | ✅ Custom JS | ✅ Platform | navigator.hardwareConcurrency via Webflow; Platform.OS in RN |
| 12 | **Min-height for Product Grid** | CLS | -0.05 | ✅ Essential | ⚠️ May not need | ⚠️ May not need | ⚠️ May not need | ✅ Custom CSS | ✅ minHeight | !important override in Webflow; minHeight style in RN |
| 13 | **Lazy-load Below-fold Images** | LCP, Bandwidth | Neutral LCP, -1MB | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Automatic | ✅ FastImage | Webflow does automatically; FastImage in RN |
| 14 | **Self-host Google Fonts** | LCP, FCP, CLS | -300ms to -600ms | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ⚠️ Custom code | ✅ expo-font | Override via @font-face in Webflow; expo-font or manual in RN |
| 15 | **Font-display: Swap** | LCP, CLS | -150ms, -0.05 | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ⚠️ Custom code | N/A | Add via @font-face in Webflow; not applicable to RN |
| 16 | **Inline Critical CSS** | FCP, LCP | -300ms to -800ms | ✅ Works | ✅ Excellent | ✅ Excellent | ✅ Excellent | ❌ No control | N/A | Cannot modify Webflow build; not applicable to RN |
| 17 | **Lazy-load Non-critical CSS** | FCP | -100ms to -200ms | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ❌ No control | N/A | Cannot control Webflow CSS loading; not applicable to RN |
| 18 | **Replace GSAP with CSS Animations** | FCP, TBT | -200ms to -400ms | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Reanimated | Use Webflow Interactions or CSS; Reanimated 2 in RN |
| 19 | **Defer Google Analytics** | FCP, INP, TBT | -100ms to -300ms | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Custom code | ✅ Lazy import | setTimeout wrapper via Webflow; dynamic import in RN |
| 20 | **Self-host Web Vitals Library** | FCP | -50ms to -150ms | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ❌ CDN only | N/A | Cannot self-host in Webflow; not applicable to RN |
| 21 | **Responsive Product Images** | LCP, Bandwidth | -500ms, -600KB | ⚠️ Limited | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Automatic | ✅ FastImage | Webflow CMS auto-generates; FastImage handles in RN |
| 22 | **Remove Artificial API Delays** | TTFB, INP | -150ms to -400ms | ✅ Works | ✅ Works | N/A | ✅ Works | ✅ Works | ✅ Works | Backend optimization, framework-agnostic |
| 23 | **Add Cache Headers** | Repeat FCP | -200ms to -500ms | ✅ Works | ✅ Works | ✅ Works | ✅ Works | ✅ Automatic | ⚠️ Custom | Webflow CDN handles; AsyncStorage/MMKV in RN |
| 24 | **API Compression (gzip/brotli)** | TTFB | -10ms to -30ms | ✅ Works | ✅ Works | N/A | ✅ Works | ✅ Works | ✅ Works | Server middleware, framework-agnostic |
| 25 | **DocumentFragment Batching** | INP | -50ms to -150ms | ✅ Essential | ⚠️ Framework handles | ⚠️ Framework handles | ⚠️ Framework handles | ⚠️ Custom JS | ⚠️ useCallback | Manual in Webflow custom code; frameworks batch automatically |

### Legend:
- ✅ **Works/Excellent**: Technique works well with this strategy
- ⚠️ **Limited/May not need**: Works but less effective or unnecessary
- **N/A**: Not applicable to this rendering strategy

---

## Rendering Strategy Comparison

### When to Use Each Strategy

#### CSR (Client-Side Rendering)

**Best for:**
- Highly interactive applications (dashboards, admin panels)
- Real-time data applications (chat, trading platforms)
- Authenticated user experiences (after login)
- Apps where SEO is not critical

**Optimization Ceiling:**
- **LCP:** 2.5s - 4s (network dependent)
- **CLS:** 0.05 - 0.15 (harder to control)
- **INP:** 200ms - 500ms (JavaScript-heavy)
- **FCP:** 1.5s - 3s (bundle size dependent)

**Key Challenges:**
- Large JavaScript bundles block rendering
- Fetch waterfall (HTML → JS → API → Render)
- SEO requires additional solutions (prerendering)
- Higher Time to Interactive (TTI)

**Optimization Priorities:**
1. Code splitting and lazy loading
2. Minimize bundle size
3. Reserve layout space (min-height, skeleton loaders)
4. Aggressive caching
5. Critical CSS inlining

**TechMart Example:**
- Products fetched after page load
- Hero optimizations work well (static HTML)
- Product optimizations limited by fetch delay

---

#### SSR (Server-Side Rendering)

**Best for:**
- E-commerce product pages
- News and content sites
- Personalized experiences
- SEO-critical pages with dynamic content

**Optimization Ceiling:**
- **LCP:** 1.5s - 2.5s
- **CLS:** 0.02 - 0.08
- **INP:** 100ms - 300ms
- **FCP:** 0.8s - 1.5s

**Key Challenges:**
- Server load and scaling costs
- Slower TTFB (server rendering time)
- Full page re-renders on navigation (without SPA routing)
- Hydration mismatch potential

**Optimization Priorities:**
1. Reduce server rendering time
2. Stream HTML (React 18, Suspense)
3. Optimize database queries
4. Edge rendering (Vercel, Cloudflare)
5. Aggressive caching (Redis, CDN)

**TechMart Improvements with SSR:**
- Products in initial HTML (no fetch delay)
- LCP improves by 500ms - 1.5s
- Product images eligible for preload/priority
- SEO-friendly out of the box

---

#### SSG (Static Site Generation)

**Best for:**
- Marketing sites and landing pages
- Documentation sites
- Blogs and content sites
- E-commerce category/listing pages (with infrequent updates)

**Optimization Ceiling:**
- **LCP:** 0.8s - 1.5s
- **CLS:** 0.00 - 0.05
- **INP:** 50ms - 200ms
- **FCP:** 0.5s - 1.0s

**Key Challenges:**
- Build time scales with page count
- Stale content until rebuild
- Dynamic data requires client-side fetch
- Large sites may have slow builds

**Optimization Priorities:**
1. Image optimization at build time
2. Critical CSS extraction
3. Aggressive CDN caching
4. Minimal JavaScript
5. Preload critical resources

**TechMart Improvements with SSG:**
- Sub-1s LCP achievable
- Zero CLS (stable layout)
- Products pre-rendered at build time
- Instant page loads from CDN

---

#### ISR (Incremental Static Regeneration)

**Best for:**
- E-commerce (product pages, listings)
- News sites with frequent updates
- User-generated content
- Any site needing SSG speed with SSR freshness

**Optimization Ceiling:**
- **LCP:** 0.8s - 2.0s (depends on cache hit)
- **CLS:** 0.00 - 0.05
- **INP:** 50ms - 200ms
- **FCP:** 0.5s - 1.2s

**Key Challenges:**
- Cache invalidation complexity
- Potential for serving stale content
- Backend infrastructure required
- Not all platforms support ISR

**Optimization Priorities:**
1. Optimal revalidation intervals
2. On-demand revalidation
3. Cache warming strategies
4. Fallback handling
5. Stale-while-revalidate patterns

**TechMart Improvements with ISR:**
- SSG-level performance for cached pages
- Fresh data without full rebuilds
- Revalidate products hourly
- Best of SSG + SSR

---

## Framework Decision Matrix

| Framework | Best Rendering Strategy | Why Choose It | Performance Strengths | Limitations |
|-----------|------------------------|---------------|----------------------|-------------|
| **Next.js** | ISR, SSG, SSR (flexible) | React ecosystem, great DX, Vercel integration | Image optimization, automatic code splitting, edge runtime | Learning curve, opinionated structure |
| **Nuxt** | SSR, ISR, SSG (flexible) | Vue ecosystem, intuitive routing, great modules | Automatic imports, Nitro server, excellent caching | Smaller ecosystem than React |
| **SvelteKit** | SSR, SSG | Compiler-based, minimal runtime, excellent DX | Smallest bundle sizes, fast hydration, great defaults | Smaller ecosystem, less third-party libraries |
| **Astro** | SSG, Partial Hydration | Content-first sites, zero JS by default | Islands architecture, multi-framework support, fastest builds | Not ideal for highly interactive apps |
| **SolidStart** | SSR, SSG | Fine-grained reactivity, React-like DX | No virtual DOM, minimal overhead, fast updates | Newer framework, smaller community |
| **Webflow** | SSG (static only) | Visual design priority, no-code/low-code, fast iteration | Automatic image optimization, CDN hosting, WebP support | No SSR/ISR, limited JavaScript control, no AVIF yet |
| **React Native** | Native Mobile (N/A) | Native iOS/Android apps, React knowledge transfer | Native performance, 60fps animations, platform-specific optimizations | Different metrics (no CWV), platform-specific bugs, larger bundle sizes |

---

## Key Takeaways

### Universal Performance Principles (Framework-Agnostic)

1. **Image Optimization**
   - Use modern formats (AVIF → WebP → JPEG)
   - Implement responsive images
   - Prioritize LCP images
   - Lazy-load below-fold images

2. **CSS Strategy**
   - Inline critical CSS
   - Lazy-load non-critical CSS
   - Use `font-display: swap`
   - Self-host fonts when possible

3. **Layout Stability**
   - Reserve space for dynamic content
   - Use `position: fixed` for overlays
   - Avoid percentage-based positioning during load
   - Test on mobile with throttling

4. **Animation Performance**
   - Animate `transform` and `opacity` only
   - Use `will-change` sparingly
   - Implement `contain: layout style`
   - Progressive enhancement for low-end devices

5. **JavaScript Optimization**
   - Code split and lazy load
   - Defer third-party scripts
   - Minimize main thread work
   - Use DocumentFragment for DOM operations

### Framework-Specific Advantages

**Choose frameworks that help you:**
- **Next.js/Nuxt:** Automatic image optimization, flexible rendering, great ecosystem
- **SvelteKit:** Minimal JavaScript, fast builds, excellent DX
- **Astro:** Zero JavaScript by default, perfect for content sites
- **SolidStart:** Fine-grained reactivity, React-like with better performance

### The TechMart Journey

This vanilla project demonstrates that **performance principles are universal**, but **architecture determines the ceiling**:

- **Current (CSR + Static Shell):** LCP 1.3s, CLS 0.05
- **With SSR:** LCP 0.8s - 1.0s, CLS 0.02
- **With SSG:** LCP 0.5s - 0.8s, CLS 0.00

The optimizations you've learned (responsive images, fixed positioning, layout containment, etc.) **apply to all frameworks**. The rendering strategy you choose determines **how effective** those optimizations can be.

---

## Additional Resources

### Performance Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated performance testing
- [WebPageTest](https://www.webpagetest.org/) - Real-world performance testing
- [DebugBear](https://www.debugbear.com/) - Continuous performance monitoring

### Framework Documentation
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Nuxt Performance](https://nuxt.com/docs/guide/concepts/rendering)
- [SvelteKit Performance](https://kit.svelte.dev/docs/performance)
- [Astro Performance](https://docs.astro.build/en/concepts/why-astro/)
- [SolidStart Docs](https://start.solidjs.com/getting-started/what-is-solidstart)

### Core Web Vitals
- [web.dev Web Vitals](https://web.dev/vitals/)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report)

---

**Remember:** The best framework is the one that helps your team ship fast, performant experiences. These techniques work everywhere—choose the tool that fits your use case.
