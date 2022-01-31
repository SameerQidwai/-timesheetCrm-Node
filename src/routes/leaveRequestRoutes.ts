import { Router } from 'express';
import { LeaveRequestController } from '../controllers/leaveRequestController';
import { isLoggedIn } from '../middlewares/loggedIn';
import { Action, Resource } from '../constants/authorization';
import { can } from '../middlewares/can';

const router = Router();
let contr = new LeaveRequestController();

router
  .route('/')
  .get([isLoggedIn], contr.getLeaveRequests.bind(contr))
  .post([isLoggedIn], contr.addLeaveRequest.bind(contr));

router
  .route('/approvalLeaveRequests')
  .get([isLoggedIn], contr.getApprovalLeaveRequests.bind(contr));
router
  .route('/:id')
  .get([isLoggedIn], contr.getLeaveRequest.bind(contr))
  .patch([isLoggedIn], contr.editLeaveRequest.bind(contr));

router
  .route('/leaveRequestsApprove')
  .post([isLoggedIn], contr.approveLeaveRequests.bind(contr));

router
  .route('/leaveRequestsReject')
  .post([isLoggedIn], contr.rejectLeaveRequests.bind(contr));

export default router;
