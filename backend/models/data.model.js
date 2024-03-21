const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  body_html: String,
  vendor: String,
  product_type: String,
  created_at: Date,
  updated_at: Date,
  published_at: Date,
  handle: String,
  variants: [mongoose.Schema.Types.Mixed],
  images: [mongoose.Schema.Types.Mixed],
});

const Product = mongoose.model('Product', productSchema);

module.exports = { Product };
