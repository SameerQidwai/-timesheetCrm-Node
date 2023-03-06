import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { BudgetReportLabelController } from '../controllers/budgetReportLabelController';

const router = Router();
const contr = new BudgetReportLabelController();
router
  .route('/')
  .post([isLoggedIn], contr.create.bind(contr))
  .get([isLoggedIn], contr.index.bind(contr));

router.route('/:title').delete([isLoggedIn], contr.delete.bind(contr));

router.route('/getReport').get([isLoggedIn], contr.getReport.bind(contr));
router.route('/updateReport').put([isLoggedIn], contr.updateReport.bind(contr));

export default router;
