import { Router } from 'express';
import { GlobalVariableController } from '../controllers/globalVariableController';

const router = Router();
const contr = new GlobalVariableController();

router.route('/').get(contr.index.bind(contr)).post(contr.create.bind(contr));

router.route('/:globalVariableName').get(contr.getOne.bind(contr));

router.route('/create').post(contr.addGlobalValue.bind(contr));

router.route('/updateValue/:id').put(contr.updateGlobalValue.bind(contr));

router
  .route('/create-update')
  .post(contr.addOrUpdateGlobalVariable.bind(contr));

router
  .route('/calculator-variable')
  .get(contr.getCostCalculatorVariable.bind(contr));

router
  .route('/values/:id')
  .put(contr.update.bind(contr))
  .delete(contr.delete.bind(contr));
export default router;
