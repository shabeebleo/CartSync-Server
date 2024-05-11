// Importing necessary packages
import mongoose from 'mongoose';

// Defining the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  address: {
    // Define address fields as needed (e.g., street, city, state, zip code)
    street: String,
    city: String,
    state: String,
    zip: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: value => /\S+@\S+\.\S+/.test(value), // Email format validation
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,   
    required: true,
    minlength: 4
  },
  cart: [{
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' // Reference to the Product model
      },
    quantity: {
      type: Number,
      required: true
    }
  }],
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Creating the user model
const User = mongoose.model('User', userSchema);

// Exporting the user model
export default User;
