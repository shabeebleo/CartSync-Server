import express from 'express'
import {admin} from "../middlewares/authMiddleware.js"
import {getProducts,createProduct,editProduct,deleteProduct} from "../controllers/productController.js"
const router = express.Router();





router.get("/products", getProducts); 
router.post("/products",admin, createProduct); 
router.put("/products/:productId",admin, editProduct); 
router.delete("/products/:productId",admin, deleteProduct);



export default router;