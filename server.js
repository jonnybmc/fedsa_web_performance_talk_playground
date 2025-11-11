import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

const app = new Hono();

// Enable CORS for local development
app.use('/*', cors());

// Serve static files
app.use('/css/*', serveStatic({ root: './public' }));
app.use('/js/*', serveStatic({ root: './public' }));
app.use('/data/*', serveStatic({ root: './public' }));
app.use('/index.html', serveStatic({ root: './public' }));
app.use('/', serveStatic({ root: './public' }));

// ==============================================================================
// BACKSTORY: "Atelier" - The R3.5M Redesign Disaster
// ==============================================================================
// Q2 2024: Business approved massive redesign
// Design Director: "We need to look like Apple. Premium, sophisticated."
//
// July 2024: Design delivers gorgeous mockups
// - 5K hero images
// - Animated depth effects
// - Micro-interactions everywhere
//
// September 2024: Engineering ships it
// - Weekends, late nights
// - QA passes on MacBook Pros
// - Everyone celebrates 🎉
//
// October 1, 2024: Launch Day
// Internal Slack: "This looks AMAZING!"
// CEO: "Best site we've ever had."
//
// Week 2: Reality hits
// - CSAT: 87% → 62% (dropped 25 points)
// - Twitter: "Old site was faster, new one is gorgeous but laggy 😭"
// - Analytics: Bounce rate up 34%, mobile users leaving in 5 seconds
//
// The War Room:
// PM: "We passed QA. How is this happening?"
// Design: "Our mockups tested great. Design isn't the problem."
// Dev: "Works fine on my machine..."
// QA: "We tested Chrome, Safari, Firefox - all passed."
//
// Enter: The Performance Consultant
// "Stop guessing. Let's measure what real users are experiencing."
// Lighthouse Score: 28/100
//
// The Investigation: 4 Critical Problems Found
// ==============================================================================

// Product catalog - Premium South African tech retailer
const products = [
  {
    id: 1,
    name: "Meridian Wireless Audio",
    price: "R12 999",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=85",
    alt: "Premium wireless headphones on marble surface"
  },
  {
    id: 2,
    name: "Chronograph Series V",
    price: "R17 999",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=85",
    alt: "Luxury smartwatch in minimal setting"
  },
  {
    id: 3,
    name: "Soleil Eyewear",
    price: "R8 499",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=85",
    alt: "Designer sunglasses with sophisticated styling"
  },
  {
    id: 4,
    name: "Atelier Camera Pro",
    price: "R49 999",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=85",
    alt: "Professional camera in design studio"
  },
  {
    id: 5,
    name: "Resonance Speaker",
    price: "R10 999",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&q=85",
    alt: "Premium speaker in modern living space"
  },
  {
    id: 6,
    name: "Studio Notebook",
    price: "R64 999",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=85",
    alt: "Premium laptop in curated workspace"
  }
];

// Helper: Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API endpoint - Returns product catalog
// ✅ Fast initial load (acceptable)
app.get('/api/products', async (c) => {
  // Simulate 150ms network latency (acceptable for initial page load)
  await delay(150);
  return c.json(products);
});

// Single product endpoint (PROBLEM #4 demonstrator)
// ❌ Slow hover-triggered fetch (unacceptable for interactions!)
app.get('/api/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const product = products.find(p => p.id === id);

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  // ❌ Simulate realistic API latency + backend processing
  // Real-world: 200-500ms is common for API calls that:
  // - Hit database
  // - Check user's wishlist status
  // - Aggregate product metadata
  // - Go through load balancers/proxies
  await delay(400); // 400ms simulates real API roundtrip

  console.log(`🐌 Slow API call for product ${id} (400ms delay) - This is why hover feels frozen!`);

  return c.json(product);
});

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    problems: {
      heroImageOptimization: 'unoptimized',
      imageDimensions: 'missing',
      animatedOrbs: 'enabled',
      hoverEffect: 'expensive'
    }
  });
});

const port = 3000;

serve({
  fetch: app.fetch,
  port
});

// ==============================================================================
// Server Status Output - The Performance Audit
// ==============================================================================

console.log('\n');
console.log('🚀 Atelier - Premium Technology');
console.log('   http://localhost:' + port);
console.log('\n' + '='.repeat(70));
console.log('📖 BACKSTORY: The R3.5M Redesign Disaster');
console.log('='.repeat(70));
console.log('Q2 2024: Business approved redesign');
console.log('         Design Director: "Think Apple. Think BoConcept."');
console.log('\n');
console.log('October 2024: Launched with celebration 🎉');
console.log('              ...then CSAT dropped from 87% → 62%');
console.log('\n');
console.log('War Room: PM, Design, Dev, QA all pointing fingers');
console.log('          Nobody was measuring. Everyone was guessing.');
console.log('\n');
console.log('Enter: Performance Consultant');
console.log('       "Let\'s measure what real users experience."');
console.log('='.repeat(70));
console.log('\n');
console.log('📊 CURRENT STATUS: 4 Critical Problems Active');
console.log('🎯 Lighthouse Score: ~28/100 (Target: 85+)');
console.log('\n');
console.log('💡 THE 4 PROBLEMS:');
console.log('\n');
console.log('   ❌ Problem #1: The 8MB Hero Image (LCP: ~8 seconds)');
console.log('      Design Director: "5K resolution minimum, maximum quality"');
console.log('      Developer: "Okay, w=5120&q=100... ship it."');
console.log('      Result: 8.2MB image, users stare at blank screen');
console.log('\n');
console.log('   ❌ Problem #2: Marketing Tag Manager Banner (CLS: +0.28)');
console.log('      Marketing: "Deploy clearance promo via Tag Manager for Q3 sales"');
console.log('      Engineering: "We\'re firefighting redesign issues already..."');
console.log('      Result: Banner loads 2s late → 120px shift → CLS 0.08 → 0.36 (worse!)');
console.log('      Impact: Banner CTR 8%, but bounce +12% = net -4% users = -R87k/week');
console.log('\n');
console.log('   ❌ Problem #3: The "Netflix Effect" (CLS: 0.26, FPS: 20-30)');
console.log('      PM: "I saw this on Netflix. Can we do that?"');
console.log('      Design: "YES! Four animated gradient orbs!"');
console.log('      Developer: "Looks amazing on my M1 Max!"');
console.log('      Result: Constant CLS, janky animations, battery drain');
console.log('\n');
console.log('   ❌ Problem #4: Hover Effect Disaster (INP: 620ms)');
console.log('      PM: "Quick feature - dim others on hover. 3 days to launch."');
console.log('      Developer: "Sure, fetch + querySelectorAll... done."');
console.log('      Result: Every hover feels frozen, interface unusable');
console.log('\n');
console.log('='.repeat(70));
console.log('🛠️  Ready for systematic debugging');
console.log('📚 Open Chrome DevTools and let\'s fix this with data, not guesses.');
console.log('');
console.log('⚠️  HTTP VERSION: This demo runs on HTTP/1.1 (not HTTP/2 or HTTP/3)');
console.log('   Why? More representative of legacy infrastructure at most companies.');
console.log('   HTTP/1.1 limitations (6 connections/domain) make problems MORE visible.');
console.log('   Real production (Cloudflare/Vercel) would use HTTP/2+ with multiplexing.');
console.log('='.repeat(70));
console.log('\n');
