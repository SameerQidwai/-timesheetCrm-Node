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
router
  .route('/allocations')
  .get([isLoggedIn], contr.opportunityAllocations.bind(contr));
router
  .route('/allocations-all')
  .get([isLoggedIn], contr.employeeAllocations.bind(contr));
router
  .route('/project-revenue-analysis')
  .get([isLoggedIn], contr.projectRevnueAnalysis.bind(contr));

router
  .route('/client-revenue-analysis')
  .get([isLoggedIn], contr.clientRevnueAnalysis.bind(contr));

router.route('/timesheet-summary').get([], contr.timesheetSummary.bind(contr));

router
  .route('/leave-request-summary')
  .get([isLoggedIn], contr.leaveRequestSummary.bind(contr));

export default router;
