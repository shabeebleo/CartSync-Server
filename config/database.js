import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const uri = process.env.MONGODB_URI;


const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connectDB;
