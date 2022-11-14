import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';
import { ProjectScheduleController } from '../controllers/projectScheduleController';

const router = Router();
const contr = new ProjectScheduleController();

router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.SCHEDULES)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.SCHEDULES)],
    contr.create.bind(contr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.SCHEDULES)],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.SCHEDULES)],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.DELETE, Resource.SCHEDULES)],
    contr.delete.bind(contr)
  );

export default router;
