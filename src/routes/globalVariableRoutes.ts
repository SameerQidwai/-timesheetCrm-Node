import { Router } from 'express';
import { GlobalVariableController } from '../controllers/globalVariableController';

const router = Router();
const contr = new GlobalVariableController();

router.route('/create').post(contr.addGlobalValue.bind(contr));
export default router;
