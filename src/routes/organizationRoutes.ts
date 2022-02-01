import { Router } from 'express';
import { OrganizationDTO } from '../dto';
import { SharedController } from '../controllers/sharedController';
import { OrganizationRepository } from '../repositories/organizationRepository';
import { isLoggedIn } from '../middlewares/loggedIn';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';

const router = Router();
let contr = new SharedController<OrganizationDTO, OrganizationRepository>(
  OrganizationRepository
);
router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ORGANIZATIONS)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.ORGANIZATIONS)],
    contr.create.bind(contr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ORGANIZATIONS)],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.ADD, Resource.ORGANIZATIONS)],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.DELETE, Resource.ORGANIZATIONS)],
    contr.delete.bind(contr)
  );

export default router;
