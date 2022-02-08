import { Router } from 'express';
import { LeaveRequestPolicyDTO } from 'src/dto';
import { SharedController } from '../controllers/sharedController';
import { LeaveRequestPolicyRepository } from '../repositories/leaveRequestPolicyRepository';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let leaveRequestPolicyContr = new SharedController<
  LeaveRequestPolicyDTO,
  LeaveRequestPolicyRepository
>(LeaveRequestPolicyRepository);
router
  .route('/')
  .get(leaveRequestPolicyContr.index.bind(leaveRequestPolicyContr))
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    leaveRequestPolicyContr.create.bind(leaveRequestPolicyContr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    leaveRequestPolicyContr.get.bind(leaveRequestPolicyContr)
  )
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    leaveRequestPolicyContr.update.bind(leaveRequestPolicyContr)
  )
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    leaveRequestPolicyContr.delete.bind(leaveRequestPolicyContr)
  );

export default router;
