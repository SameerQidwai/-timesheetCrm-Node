import { Router } from 'express';
import { TimesheetDTO } from '../dto/index';
import { TimesheetRepository } from '../repositories/timesheetRepository';
import { TimesheetController } from '../controllers/timesheetController';

const router = Router();
let contr = new TimesheetController(TimesheetRepository);

router.route('/').get(contr.index.bind(contr));
router.route('/specific').get(contr.getTimesheet.bind(contr));

export default router;
