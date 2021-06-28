import { Router } from 'express';
import { StandardLevelDTO } from 'src/dto';
import { SharedController } from '../controllers/sharedController';
import { StandardLevelRepository } from '../repositories/standardLevelRepository';
import { can } from './../middlewares/can';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';

const router = Router();
let contr = new SharedController<StandardLevelDTO, StandardLevelRepository>(
  StandardLevelRepository
);
router
  .route('/')
  .get(contr.index.bind(contr))
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.create.bind(contr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.delete.bind(contr)
  );

export default router;
