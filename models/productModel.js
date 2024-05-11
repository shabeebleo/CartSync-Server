// Importing necessary packages
import mongoose from 'mongoose';

// Defining the product schema
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0 // Default quantity set to 0
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
});

// Creating the product model
const Product = mongoose.model('Product', productSchema);

// Exporting the product model
export default Product;
