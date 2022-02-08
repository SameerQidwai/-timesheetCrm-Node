import { Router } from 'express';
import { LeaveRequestTypeDTO } from '../dto';
import { SharedController } from '../controllers/sharedController';
import { LeaveRequestTypeRepository } from '../repositories/leaveRequestTypeRepository';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';
import { isLoggedIn } from '../middlewares/loggedIn';
import { LeaveRequestTypeController } from '../controllers/leaveRequestTypeController';

const router = Router();
let sharedContr = new SharedController<
  LeaveRequestTypeDTO,
  LeaveRequestTypeRepository
>(LeaveRequestTypeRepository);

let leaveRequestTypeContr = new LeaveRequestTypeController(
  LeaveRequestTypeRepository
);

router
  .route('/')
  .get(sharedContr.index.bind(sharedContr))
  .post([isLoggedIn], sharedContr.create.bind(sharedContr));

router
  .route('/getOwn')
  .get(
    [isLoggedIn],
    leaveRequestTypeContr.getByPolicy.bind(leaveRequestTypeContr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    sharedContr.get.bind(sharedContr)
  )
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    sharedContr.update.bind(sharedContr)
  )
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    sharedContr.delete.bind(sharedContr)
  );

export default router;
