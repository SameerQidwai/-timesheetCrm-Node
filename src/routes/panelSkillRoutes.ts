import { Router } from 'express';
import { PanelSkillDTO } from 'src/dto';
import { SharedController } from '../controllers/sharedController';
import { PanelSkillRepository } from '../repositories/panelSkillRepository';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let timeOffContr = new SharedController<PanelSkillDTO, PanelSkillRepository>(
  PanelSkillRepository
);
router
  .route('/')
  .get([isLoggedIn], timeOffContr.index.bind(timeOffContr))
  .post([isLoggedIn], timeOffContr.create.bind(timeOffContr));

router
  .route('/:id')
  .get([isLoggedIn], timeOffContr.get.bind(timeOffContr))
  .put([isLoggedIn], timeOffContr.update.bind(timeOffContr))
  .delete([isLoggedIn], timeOffContr.delete.bind(timeOffContr));

export default router;
