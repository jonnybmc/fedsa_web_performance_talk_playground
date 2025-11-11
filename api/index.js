import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = new Hono().basePath('/api');

// Load products data
let products;
try {
  // Vercel deploys everything to the root, so we can access public/data directly
  const productsPath = join(process.cwd(), 'public', 'data', 'products.json');
  products = JSON.parse(readFileSync(productsPath, 'utf-8'));
} catch (error) {
  console.error('Failed to load products:', error);
  products = [];
}

// Artificial delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all products
app.get('/products', async (c) => {
  await delay(150);
  return c.json(products);
});

// Get single product by ID
app.get('/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const product = products.find(p => p.id === id);

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  await delay(400);
  console.log(`🐌 Slow API call for product ${id} (400ms delay) - This is why hover feels frozen!`);

  return c.json(product);
});

export default handle(app);
