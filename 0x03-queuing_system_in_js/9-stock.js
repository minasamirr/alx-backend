#!/usr/bin/yarn dev
import express from 'express';
import redis from 'redis';
import { promisify } from 'util';

const listProducts = [
  { id: 1, name: 'Suitcase 250', price: 50, stock: 4 },
  { id: 2, name: 'Suitcase 450', price: 100, stock: 10 },
  { id: 3, name: 'Suitcase 650', price: 350, stock: 2 },
  { id: 4, name: 'Suitcase 1050', price: 550, stock: 5 }
];

const getItemById = (id) => {
  return listProducts.find(product => product.id === id);
};

const app = express();
const port = 1245;

// Connect to Redis
const client = redis.createClient();
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

// Retrieve the list of products
app.get('/list_products', (req, res) => {
  const formattedProducts = listProducts.map(product => ({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock
  }));
  res.json(formattedProducts);
});

// Retrieve a single product by ID and stock
app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const item = getItemById(itemId);
  
  if (!item) {
    return res.json({ status: 'Product not found' });
  }

  const reservedStock = await getAsync(`item.${itemId}`) || 0;
  const currentQuantity = item.stock - reservedStock;
  
  res.json({
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    initialAvailableQuantity: item.stock,
    currentQuantity: currentQuantity
  });
});

// Reserve a product by ID
app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const item = getItemById(itemId);
  
  if (!item) {
    return res.json({ status: 'Product not found' });
  }

  const reservedStock = await getAsync(`item.${itemId}`) || 0;
  if (item.stock - reservedStock <= 0) {
    return res.json({
      status: 'Not enough stock available',
      itemId: itemId
    });
  }

  await setAsync(`item.${itemId}`, parseInt(reservedStock, 10) + 1);
  res.json({
    status: 'Reservation confirmed',
    itemId: itemId
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
