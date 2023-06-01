import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { FinancialYearController } from '../controllers/financialYearController';

const router = Router();
let contr = new FinancialYearController();

router
  .route('/')
  .get([isLoggedIn], contr.getAll.bind(contr))
  .post([isLoggedIn], contr.createAndSave.bind(contr));

router
  .route('/:id')
  .get([isLoggedIn], contr.findOne.bind(contr))
  .put([isLoggedIn], contr.updateOne.bind(contr))
  .delete([isLoggedIn], contr.deleteCustom.bind(contr));

router.route('/:id/closeYear').patch([isLoggedIn], contr.closeYear.bind(contr));

export default router;