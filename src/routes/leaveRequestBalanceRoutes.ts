import { Router } from 'express';
import { LeaveRequestController } from '../controllers/leaveRequestController';
import { isLoggedIn } from '../middlewares/loggedIn';
import { Action, Resource } from '../constants/authorization';
import { can } from '../middlewares/can';

const router = Router();
let contr = new LeaveRequestController();

router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.LEAVE_REQUESTS)],
    contr.getLeaveRequestBalances.bind(contr)
  );
router
  .route('/:id')
  .patch(
    [isLoggedIn, can(Action.APPROVAL, Resource.LEAVE_REQUESTS)],
    contr.updateLeaveRequestBalancedAccured.bind(contr)
  );

export default router;
