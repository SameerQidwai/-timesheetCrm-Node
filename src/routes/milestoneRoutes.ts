import { Router } from 'express';
import { MilestoneController } from '../controllers/milestoneController';
import { isLoggedIn } from '../middlewares/loggedIn';

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
