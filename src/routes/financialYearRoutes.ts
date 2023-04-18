import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { FinancialYearController } from '../controllers/financialYearController';

const router = Router();
let contr = new FinancialYearController();

router
  .route('/')
  .get(contr.getAll.bind(contr))
  .post(contr.createAndSave.bind(contr));

router.route('/:id/closeYear').patch(contr.closeYear.bind(contr));

export default router;
