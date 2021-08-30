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
  .route('/projectEntries/:id')
  .patch(contr.updateTimesheetProjectEntryNote.bind(contr));

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
  .route('/:startDate&:endDate&:userId/projectEntries/:id/submit')
  .post(
    [isLoggedIn, can(Action.ADD, Resource.TIMESHEETS)],
    contr.submitTimesheetProjectEntry.bind(contr)
  );

router
  .route('/:startDate&:endDate&:userId/projectEntries/:id/approve')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.approveTimesheetProjectEntry.bind(contr)
  );

router
  .route('/:startDate&:endDate&:userId/projectEntries/:id/reject')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.TIMESHEETS)],
    contr.rejectTimesheetProjectEntry.bind(contr)
  );

router.route('/entries/:id').put(contr.editTimesheetEntry.bind(contr));

router.route('/entries/:id').delete(contr.deleteTimesheetEntry.bind(contr));

router
  .route('/print/:projectEntryId')
  .get(
    [isLoggedIn, can(Action.READ, Resource.TIMESHEETS)],
    contr.getTimesheetPDF.bind(contr)
  );

export default router;
