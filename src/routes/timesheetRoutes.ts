import { Router } from 'express';
import { TimesheetController } from '../controllers/timesheetController';

const router = Router();
let contr = new TimesheetController();

router
  .route('/projectEntries/:id')
  .patch(contr.updateTimesheetProjectEntryNote.bind(contr));

router
  .route('/:startDate&:endDate&:userId')
  .get(contr.getTimesheet.bind(contr))
  .post(contr.addTimesheetEntry.bind(contr));

router
  .route('/:startDate&:endDate&:userId/projectEntries/:id/submit')
  .post(contr.submitTimesheetProjectEntry.bind(contr));

router
  .route('/:startDate&:endDate&:userId/projectEntries/:id/approve')
  .post(contr.approveTimesheetProjectEntry.bind(contr));

router
  .route('/:startDate&:endDate&:userId/projectEntries/:id/reject')
  .post(contr.rejectTimesheetProjectEntry.bind(contr));

router.route('/entries/:id').put(contr.editTimesheetEntry.bind(contr));

router.route('/entries/:id').delete(contr.deleteTimesheetEntry.bind(contr));

export default router;
