import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import products from '../public/data/products.json' assert { type: 'json' };

const app = new Hono().basePath('/api');

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
