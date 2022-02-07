import { Router } from 'express';
import { LeaveRequestController } from '../controllers/leaveRequestController';
import { isLoggedIn } from '../middlewares/loggedIn';
import { Action, Resource } from '../constants/authorization';
import { can } from '../middlewares/can';

const router = Router();
let contr = new LeaveRequestController();

router.route('/').get([isLoggedIn], contr.getLeaveRequestBalances.bind(contr));

export default router;
