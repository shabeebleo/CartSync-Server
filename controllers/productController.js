import { asyncHandler } from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

//  Get all products

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

//get single product by Id
export const getProductById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// Get user-specific cart product list
export const cartProductList = async (req, res) => {
  try {
    // Fetch user by ID and populate the cart items with product details
    const user = await User.findById(req.userId).populate("cart.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//edit user specific cart items
export const editCartItem = async (req, res) => {
  try {
    const { userId, productId, newQuantity } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the cart item with the specified productId
    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Update the quantity of the cart item
    user.cart[cartItemIndex].quantity = newQuantity;

    // Save the updated user document
    await user.save();

    res
      .status(200)
      .json({ message: "Cart item updated successfully", cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};




// Create a new product
export const createProduct = async (req, res) => {
  try {
    // Destructure product data from request body
    const { name, description,quantity, price, image, category, brand, productName } =
      req.body;

    // Create new product instance
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      image,
      category,
      brand,
      productName,
    });

    // Save the new product
    await newProduct.save();

    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    // Check if the error is a MongoDB validation error
    if (error.name === "ValidationError") {
      // Extract error messages from validation errors
      const validationErrors = Object.values(error.errors).map(
        (error) => error.message
      );
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit a product
export const editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, description, price, image, category,quantity, brand, productName } =
    req.body;


    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, quantity,image, category, brand, productName },
      { new: true }
    );

    res
      .status(200)
      .json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
