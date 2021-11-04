import { Router } from 'express';
import { StateDTO } from '../dto';
import { SharedController } from '../controllers/sharedController';
import { StateRepository } from '../repositories/stateRepository';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new SharedController<StateDTO, StateRepository>(StateRepository);
router
  .route('/')
  .get([isLoggedIn], contr.index.bind(contr))
  .post([isLoggedIn], contr.create.bind(contr));

router
  .route('/:id')
  .get([isLoggedIn], contr.get.bind(contr))
  .put([isLoggedIn], contr.update.bind(contr))
  .delete([isLoggedIn], contr.delete.bind(contr));

export default router;
