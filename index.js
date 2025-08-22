require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let productsCollection;

async function connectDB() {
  if (!productsCollection) {
    await client.connect();
    const db = client.db('productsDB'); // database name
    productsCollection = db.collection('products'); // collection name
    console.log('✅ MongoDB connected');
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('✅ Products API Server is running');
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    await connectDB();
    const products = await productsCollection.find().toArray();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    await connectDB();
    const product = await productsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST new product
app.post('/api/products', async (req, res) => {
  try {
    await connectDB();
    const result = await productsCollection.insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  try {
    await connectDB();
    const updated = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated.value) return res.status(404).json({ error: 'Product not found' });
    res.json(updated.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await connectDB();
    const result = await productsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
