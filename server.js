import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import cors from 'cors';
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
  origin: 'http://localhost:5173', // Adjust the origin as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Adjust as needed
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
  
}));

app.use(express.json());

// User routes
app.use('/users', userRoutes);
app.use('/admin', productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
