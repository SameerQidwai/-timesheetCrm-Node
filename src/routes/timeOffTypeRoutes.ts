import { Router } from 'express';
import { TimeOffTypeDTO } from 'src/dto';
import { SharedController } from '../controllers/sharedController';
import { TimeOffTypeRepository } from '../repositories/timeOffTypeRepository';
import { can } from './../middlewares/can';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';

const router = Router();
let timeOffContr = new SharedController<TimeOffTypeDTO, TimeOffTypeRepository>(
  TimeOffTypeRepository
);
router
  .route('/')
  .get(timeOffContr.index.bind(timeOffContr))
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    timeOffContr.create.bind(timeOffContr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    timeOffContr.get.bind(timeOffContr)
  )
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    timeOffContr.update.bind(timeOffContr)
  )
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    timeOffContr.delete.bind(timeOffContr)
  );

export default router;
