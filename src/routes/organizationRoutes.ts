import { Router } from 'express';
import { OrganizationDTO } from '../dto';
import { SharedController } from '../controllers/sharedController';
import { OrganizationRepository } from '../repositories/organizationRepository';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new SharedController<OrganizationDTO, OrganizationRepository>(
  OrganizationRepository
);
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
