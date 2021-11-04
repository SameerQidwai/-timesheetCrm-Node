import { Router } from 'express';
import { RoleController } from './../controllers/roleController';
import { RoleRepository } from './../repositories/roleRepository';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new RoleController(RoleRepository);
router
  .route('/')
  .get([isLoggedIn], contr.index.bind(contr))
  .post([isLoggedIn], contr.create.bind(contr));

router
  .route('/:id')
  .get([isLoggedIn], contr.get.bind(contr))
  .put([isLoggedIn], contr.update.bind(contr))
  .delete([isLoggedIn], contr.delete.bind(contr));

router
  .route('/:id/update-permissions')
  .put([isLoggedIn], contr.updatePermissions.bind(contr));
export default router;
