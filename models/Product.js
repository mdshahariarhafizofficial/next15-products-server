const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  longDescription: String,
  price: { type: Number, required: true },
  image: String,
  features: [String],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
