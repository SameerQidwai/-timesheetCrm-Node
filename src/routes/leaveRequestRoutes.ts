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
    contr.getLeaveRequests.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.LEAVE_REQUESTS)],
    contr.addLeaveRequest.bind(contr)
  );

router
  .route('/approvalLeaveRequests')
  .get(
    [isLoggedIn, can(Action.APPROVAL, Resource.LEAVE_REQUESTS)],
    contr.getApprovalLeaveRequests.bind(contr)
  );
router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.LEAVE_REQUESTS)],
    contr.getLeaveRequest.bind(contr)
  )
  .patch(
    [isLoggedIn, can(Action.ADD, Resource.LEAVE_REQUESTS)],
    contr.editLeaveRequest.bind(contr)
  );

router
  .route('/leaveRequestsApprove')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.LEAVE_REQUESTS)],
    contr.approveLeaveRequests.bind(contr)
  );

router
  .route('/leaveRequestsReject')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.LEAVE_REQUESTS)],
    contr.rejectLeaveRequests.bind(contr)
  );

export default router;
