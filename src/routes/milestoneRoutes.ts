import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { MilestoneController } from '../controllers/milestoneController';

const router = Router();
const contr = new MilestoneController();
router
  .route('/')
  .get([isLoggedIn], contr.index.bind(contr))
  .post([isLoggedIn], contr.create.bind(contr));

router
  .route('/:id')
  .get([isLoggedIn], contr.show.bind(contr))
  .patch([isLoggedIn], contr.update.bind(contr));

export default router;
