import { Router } from 'express';
import { GlobalVariableController } from '../controllers/globalVariableController';

const router = Router();
const contr = new GlobalVariableController();

router.route('/').get(contr.index.bind(contr));

router.route('/create').post(contr.addGlobalValue.bind(contr));
router
  .route('/create-update')
  .post(contr.addOrUpdateGlobalVariable.bind(contr));
  
router
  .route('calculator-variable')
  .get(contr.getCostCalculatorVariable.bind(contr))
export default router;
