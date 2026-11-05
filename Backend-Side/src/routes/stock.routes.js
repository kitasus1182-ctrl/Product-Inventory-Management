import {Router} from 'express'; 
import { changeStock, getMovements} from '../controllers/stock.controller.js';
import { validateStock } from '../middleware/validate.js';

const stockRouter = Router();

stockRouter.post('/products/:id/stock', validateStock, changeStock);
stockRouter.get('/movements', getMovements);

export default stockRouter;