import { Router } from 'express';
import { createProduct, updateProduct, deleteProduct, getCategories, getProducts } from '../controllers/product.controller.js';
import { validateProduct } from '../middleware/validate.js';

const productRouter = Router();

productRouter.post('/', validateProduct, createProduct);
productRouter.put('/:id', validateProduct, updateProduct);
productRouter.delete('/:id', deleteProduct);
productRouter.get('/', getProducts);
productRouter.get('/categories', getCategories);

export default productRouter;