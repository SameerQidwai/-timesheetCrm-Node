import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ReportController } from '../controllers/reportController';

const router = Router();
const contr = new ReportController();
router
  .route('/bench-resources')
  .get([isLoggedIn], contr.benchResources.bind(contr));
router
  .route('/workforce-skills')
  .get([isLoggedIn], contr.workforceSkills.bind(contr));
router.route('/allocations').get([isLoggedIn], contr.allocations.bind(contr));
router
  .route('/allocations-all')
  .get([isLoggedIn], contr.allocationsAll.bind(contr));

export default router;
