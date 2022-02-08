import { Router } from 'express';
import { PanelSkillDTO } from 'src/dto';
import { SharedController } from '../controllers/sharedController';
import { PanelSkillRepository } from '../repositories/panelSkillRepository';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let panelSkillContr = new SharedController<PanelSkillDTO, PanelSkillRepository>(
  PanelSkillRepository
);
router
  .route('/')
  .get([isLoggedIn], panelSkillContr.index.bind(panelSkillContr))
  .post([isLoggedIn], panelSkillContr.create.bind(panelSkillContr));

router
  .route('/:id')
  .get([isLoggedIn], panelSkillContr.get.bind(panelSkillContr))
  .put([isLoggedIn], panelSkillContr.update.bind(panelSkillContr))
  .delete([isLoggedIn], panelSkillContr.delete.bind(panelSkillContr));

export default router;
