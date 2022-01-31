import { Router } from 'express';
import { StandardSkillDTO } from 'src/dto';
import { SharedController } from '../controllers/sharedController';
import { StandardSkillRepository } from '../repositories/standardSkillRepository';
import { can } from './../middlewares/can';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';

const router = Router();
let standardSkillContr = new SharedController<
  StandardSkillDTO,
  StandardSkillRepository
>(StandardSkillRepository);
router
  .route('/')
  .get(standardSkillContr.index.bind(standardSkillContr))
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    standardSkillContr.create.bind(standardSkillContr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    standardSkillContr.get.bind(standardSkillContr)
  )
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    standardSkillContr.update.bind(standardSkillContr)
  )
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    standardSkillContr.delete.bind(standardSkillContr)
  );

export default router;
