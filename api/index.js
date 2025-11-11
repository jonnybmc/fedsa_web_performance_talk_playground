import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

// Products data - inlined for Vercel serverless compatibility
const products = [
  {
    id: 1,
    name: "Meridian Wireless Audio",
    price: "R12 999",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=85",
    alt: "Premium wireless headphones on marble surface",
    inWishlist: false
  },
  {
    id: 2,
    name: "Chronograph Series V",
    price: "R17 999",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=85",
    alt: "Luxury smartwatch in minimal setting",
    inWishlist: false
  },
  {
    id: 3,
    name: "Soleil Eyewear",
    price: "R8 499",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=85",
    alt: "Designer sunglasses with sophisticated styling",
    inWishlist: true
  },
  {
    id: 4,
    name: "Atelier Camera Pro",
    price: "R49 999",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=85",
    alt: "Professional camera in design studio",
    inWishlist: false
  },
  {
    id: 5,
    name: "Resonance Speaker",
    price: "R10 999",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&q=85",
    alt: "Premium speaker in modern living space",
    inWishlist: false
  },
  {
    id: 6,
    name: "Studio Notebook",
    price: "R64 999",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=85",
    alt: "Premium laptop in curated workspace",
    inWishlist: false
  }
];

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
