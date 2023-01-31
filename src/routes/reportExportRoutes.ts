import { Router } from 'express';
import {} from '../middlewares/loggedIn';
import { ReportExportController } from '../controllers/reportExportController';

const router = Router();
const contr = new ReportExportController();
router.route('/bench-resources').get([], contr.benchResources.bind(contr));
router.route('/workforce-skills').get([], contr.workforceSkills.bind(contr));
router.route('/allocations').get([], contr.opportunityAllocations.bind(contr));
router.route('/allocations-all').get([], contr.employeeAllocations.bind(contr));
router
  .route('/project-revenue-analysis')
  .get([], contr.projectRevnueAnalysis.bind(contr));

router
  .route('/client-revenue-analysis')
  .get([], contr.clientRevnueAnalysis.bind(contr));

router.route('/timesheet-summary').get([], contr.timesheetSummary.bind(contr));

router
  .route('/leave-request-summary')
  .get([], contr.leaveRequestSummary.bind(contr));

router
  .route('/leave-request-summary-view')
  .get([], contr.leaveRequestSummaryView.bind(contr));

router
  .route('/work-in-hand-forecast')
  .get([], contr.WorkInHandForecast.bind(contr));

export default router;