import { Router } from 'express';
import { TimesheetController } from '../controllers/timesheetController';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';
import { can } from './../middlewares/can';

const router = Router();
let contr = new TimesheetController();

router
  .route('/users')
  .get(
    [isLoggedIn, can(Action.READ, Resource.TIMESHEETS)],
    contr.getTimesheetProjectUsers.bind(contr)
  );

router
  .route('/milestones')
  .get([isLoggedIn], contr.getTimesheetUserMilestones.bind(contr));

router
  .route('/milestoneEntries/:id')
  .patch([isLoggedIn], contr.updateTimesheetMilestoneEntryNote.bind(contr));

router
  .route('/milestone/:startDate&:endDate&:milestoneId')
  .get(
    [isLoggedIn, can(Action.READ, Resource.TIMESHEETS)],
    contr.getTimesheetByMilestone.bind(contr)
  );

router
  .route('/:startDate&:endDate&:userId')
  .get(
    [isLoggedIn, can(Action.READ, Resource.TIMESHEETS)],
    contr.getTimesheet.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.TIMESHEETS)],
    contr.addTimesheetEntry.bind(contr)
  );

router
  .route('/:startDate&:endDate&:userId/milestoneEntriesSubmit/')
  .post(
    [isLoggedIn, can(Action.ADD, Resource.TIMESHEETS)],
    contr.submitTimesheetMilestoneEntry.bind(contr)
  );

router
  .route('/:startDate&:endDate&:userId/milestoneEntriesApprove/')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.approveTimesheetMilestoneEntry.bind(contr)
  );

router
  .route('/:startDate&:endDate&:userId/milestoneEntriesReject/')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.rejectTimesheetMilestoneEntry.bind(contr)
  );

router
  .route('/:startDate&:endDate&:userId/milestoneEntriesDelete/')
  .post([isLoggedIn], contr.deleteTimesheetMilestoneEntry.bind(contr));

router
  .route('/entries/:id')
  .put([isLoggedIn], contr.editTimesheetEntry.bind(contr));

router
  .route('/entries/:id')
  .delete([isLoggedIn], contr.deleteTimesheetEntry.bind(contr));

router
  .route('/print/:milestoneEntryId')
  .get(
    [isLoggedIn, can(Action.READ, Resource.TIMESHEETS)],
    contr.getTimesheetPDF.bind(contr)
  );

export default router;
