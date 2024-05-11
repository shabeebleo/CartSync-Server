import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  addToCart,
  userList,
  deleteProductFromCart,
  editProductQuantityInCart,
  getUserCartItems,
  createOrder,
  getProducts
} from "../controllers/userController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Logout user
router.post("/logout", protect, logoutUser);

//get all products
router.get("/products", getProducts);

// Add product to user's cart buy user
router.post("/cart/add", protect, addToCart);

//update cart quantity by user
router.put("/cart/:id/:qty", protect, editProductQuantityInCart);

//update cart quantity by admin
router.put("/users/cart/:id/:qty/:userId", admin, editProductQuantityInCart);

//delete cart item by user
router.delete("/cart/:id", protect, deleteProductFromCart);

//delete cart item by admin
router.delete("/users/cart/:id/:userId", admin, deleteProductFromCart);

// Route to fetch user list for admin
router.get("/users", admin, userList);

//Route to fetch user specific cart items for admin
router.get("/users/:id", admin, getUserCartItems);

//Route to post an order
router.post("/order", protect, createOrder);

export default router;
