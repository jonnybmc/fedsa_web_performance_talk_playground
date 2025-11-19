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

// Product catalog
const products = [
  {
    id: 1,
    name: "Wireless Earbuds",
    price: "R 299",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&q=85",
    alt: "Affordable wireless earbuds",
    inWishlist: false
  },
  {
    id: 2,
    name: "Fitness Band",
    price: "R 399",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=1200&q=85",
    alt: "Basic fitness tracking band",
    inWishlist: false
  },
  {
    id: 3,
    name: "Wireless Mouse",
    price: "R 149",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&q=85",
    alt: "Wireless computer mouse",
    inWishlist: true
  },
  {
    id: 4,
    name: "Phone Holder Stand",
    price: "R 89",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=85",
    alt: "Adjustable phone stand",
    inWishlist: false
  },
  {
    id: 5,
    name: "Portable Speaker",
    price: "R 249",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&q=85",
    alt: "Compact bluetooth speaker",
    inWishlist: false
  },
  {
    id: 6,
    name: "USB Cable Pack (3pc)",
    price: "R 129",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=1200&q=85",
    alt: "USB charging cables set",
    inWishlist: false
  }
];

// Helper: Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API endpoint - Returns product catalog
app.get('/api/products', async (c) => {
  await delay(150);
  return c.json(products);
});

// Single product endpoint
app.get('/api/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const product = products.find(p => p.id === id);

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  await delay(400);

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

console.log('\n');
console.log('TechMart - Quality Tech, Affordable Prices');
console.log('   http://localhost:' + port);
console.log('\n' + '='.repeat(70));
console.log('Server running on HTTP/1.1');
console.log('Performance monitoring active');
console.log('='.repeat(70));
console.log('\n');
