import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI;

// MongoDB connect (singleton pattern যাতে বারবার connect না হয়)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
connectDB();

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  longDescription: String,
  price: Number,
  image: String,
  features: [String],
});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// Routes
app.get("/", (req, res) => {
  res.send("✅ API is running successfully!");
});

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    await connectDB();
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET single product
app.get("/api/products/:id", async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST new product
app.post("/api/products", async (req, res) => {
  try {
    await connectDB();
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

// PUT update product
app.put("/api/products/:id", async (req, res) => {
  try {
    await connectDB();
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Export serverless handler
export default serverless(app);
