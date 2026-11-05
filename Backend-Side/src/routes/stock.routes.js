import {Router} from 'express'; 
import { changeStock, getMovements} from '../controllers/stock.controller.js';
import { validateStock } from '../middleware/validate.js';

const stockRouter = Router();

stockRouter.post('/checkstock/:id', validateStock, changeStock);
stockRouter.get('/movements', getMovements);

export default stockRouter;