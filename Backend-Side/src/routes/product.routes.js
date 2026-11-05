import { Router } from 'express';
import { createProduct,updateProduct,deleteProduct,getCategories,getProducts } from '../controllers/product.controller.js';
import { validateProduct } from '../middleware/validate.js';

const productRouter = Router();

// Define routes for products
productRouter.post('/addproducts', createProduct);
productRouter.put('/updateproducts/:id', validateProduct, updateProduct);
productRouter.delete('/deleteproducts/:id', validateProduct, deleteProduct);
productRouter.get('/products', getProducts);
productRouter.get('/categories', getCategories);

export default productRouter;