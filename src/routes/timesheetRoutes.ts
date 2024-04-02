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
  .get(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.getTimesheetUserMilestones.bind(contr)
  );

router
  .route('/milestoneEntriesUpdate')
  .patch([isLoggedIn], contr.updateTimesheetMilestoneEntryNote.bind(contr));

router
  .route('/approvals')
  .get(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.getTimesheetByMilestoneOrUser.bind(contr)
  );

router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.TIMESHEETS)],
    contr.getTimesheet.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.TIMESHEETS)],
    contr.addTimesheetEntry.bind(contr)
  );

router
  .route('/bulkEntry/:startDate&:endDate&:userId')
  .post(
    [isLoggedIn, can(Action.ADD, Resource.TIMESHEETS)],
    contr.bulkAddTimesheetEntry.bind(contr)
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
  .route('/:startDate&:endDate&:userId/milestoneEntriesUnapprove/')
  .post(
    [isLoggedIn, can(Action.UNAPPROVAL, Resource.TIMESHEETS)],
    contr.unapproveTimesheetMilestoneEntry.bind(contr)
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
  .route('/print/milestoneEntries')
  .post(
    [isLoggedIn, can(Action.READ, Resource.TIMESHEETS)],
    contr.getTimesheetPDF.bind(contr)
  );

export default router;
