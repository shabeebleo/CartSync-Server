import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import nodemailer from 'nodemailer';
dotenv.config();

// Function to send an email
const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  console.log(userEmail, orderDetails)
  // Create a transporter using SMTP
  console.log(process.env.EMAIL,process.env.PASSKEY,"process.env.PASSKEYprocess.env.PASSKEY");
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS:true,
    tls: {
      rejectUnauthorized: false
  },
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSKEY
    }
  });

  // Define email content
  const mailOptions = {
    from: 'shabeebpv0786@gmail.com',
    to: userEmail,
    subject: 'Order Confirmation',
    html: `<p>Dear User,</p>
           <p>Your order has been successfully placed. Here are the details:</p>
           <p>Order ID: ${orderDetails._id}</p>
           <p>Total Price: ${orderDetails.totalPrice}</p>
           <p>Address: ${orderDetails.address}</p>
           <p>Thank you for shopping with us!</p>`
  };
console.log("nodemaile just before transporter");
  // Send email
  await transporter.sendMail(mailOptions);
};


//Register User
export const registerUser = async (req, res) => {
  try {
    console.log(req.body, "req.body in registerUser");
    const { username, email, password, address, isAdmin = false } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      address,
      isAdmin,
    });

    await newUser.save();

    const payload = {
      userId: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    };
    console.log("payload:", payload);
    const token = jwt.sign(payload, process.env.jwtSecret, {
      expiresIn: process.env.expiresIn,
    });

    res.cookie("token", token);
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//loginUser
export const loginUser = async (req, res) => {
  try {
    const { email, password, isAdmin = false } = req.body;
    const user = await User.findOne({ email });
console.log(user);
    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const cartItemsNumber=user.cart.length
console.log(cartItemsNumber,"cartItemsNumbercartItemsNumber");
    // Generate JWT token
    const payload = { userId: user.id, username: user.username, email: user.email, address: user.address, isAdmin,cartItemsNumber:cartItemsNumber };
    console.log("payload:",payload)
    const token = jwt.sign(payload, process.env.jwtSecret, {
      expiresIn: process.env.expiresIn,
    });

    // Respond with success message, token, and user details
    res.cookie("token", token);
    return res.status(200).json({ message: "User login successfully", user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



//logout user

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
});


//  Get all products

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

//add products into the cart
export const addToCart = async (req, res) => {
  console.log("req.user:", req.user);
  console.log("req.body:", req.body);
  const userId = req.user._id;
  try {
    const { productId, quantity } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);
    console.log("user:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product by productId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the requested quantity is available
    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available quantity" });
    }

    // Check if the product is already in the cart
    const existingProductIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex !== -1) {
      // If the product is already in the cart, update the quantity
      user.cart[existingProductIndex].quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      user.cart.push({ productId, quantity });
    }

    // Save the updated user document
    await user.save();

    return res
      .status(200)
      .json({ message: "Product added to cart successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//delete cart items
export const deleteProductFromCart = async (req, res) => {
  const productId = req.params.id;
  var userId;
  if (req.user.username === "admin") {
    userId = req.params.userId;
  } else {
    userId = req.user._id;
  }

  try {
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

    // Remove the cart item with the specified productId
    user.cart.splice(cartItemIndex, 1);

    // Save the updated user document
    await user.save();

    res.status(200).json({
      message: "Product removed from cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//edit product in the cart
export const editProductQuantityInCart = async (req, res) => {
  try {
    var userId;
    if (req.user.username === "admin") {
      userId = req.params.userId;
    } else {
      userId = req.user._id;
    }
    const { id, qty } = req.params;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the cart item with the specified productId
    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === id
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Update the quantity of the cart item

    // Find the product by productId
    const product = await Product.findById(id);
    if (qty > product.quantity) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available quantity" });
    }

    user.cart[cartItemIndex].quantity = qty;

    // Save the updated user document
    await user.save();

    res.status(200).json({
      message: "Cart item quantity updated successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get userlist
export const userList = async (req, res) => {
  console.log("user list ethiii");
  try {
    // Find users with isAdmin set to false
    const users = await User.find({ isAdmin: false });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//user specific cart items

export const getUserCartItems = async (req, res) => {
  try {
    // Access the user ID from the request
    const userId = req.params.id;

    // Find the user in the database using the user ID and populate the 'cart.productId' field with product information
    const user = await User.findById(userId).populate("cart.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract the populated cart items from the user object
    const cartItems = user.cart;

    // Return the populated cart items in the response
    res.status(200).json({ cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//create an order

// Controller function to create an order
export const createOrder = asyncHandler(async (req, res) => {
  const userId=req.user._id;
console.log("req.body:",req.body);
  const { products, totalPrice, address, paymentMethod,email } = req.body;

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Create the order
  const order = new Order({
    user: userId,
    products,
    totalPrice,
    address,
    paymentMethod,
    email
  });

  // Save the order
  await order.save();
  sendOrderConfirmationEmail(email,order)
  // Return success response
  res.status(201).json({ message: 'Order created successfully', order });
});