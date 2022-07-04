import { Router } from 'express';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';
import { can } from './../middlewares/can';
import { ProjectMilestoneController } from '../controllers/projectMilestoneController';

const router = Router();
let contr = new ProjectMilestoneController();

router
  .route('/approvals')
  .get(
    [isLoggedIn, can(Action.READ, Resource.PROJECTS)],
    contr.approvalIndex.bind(contr)
  );

router
  .route('/:id/approve')
  .get(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.approveMilestone.bind(contr)
  );

router
  .route('/:id/upload')
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.PROJECTS)],
    contr.uploadMilestoneFile.bind(contr)
  );

router
  .route('/:id/export')
  .get(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.exportMilestone.bind(contr)
  );
export default router;
