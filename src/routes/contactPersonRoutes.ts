import { Router } from 'express';
import { ContactPersonDTO } from '../dto';
import { SharedController } from '../controllers/sharedController';
import { ContactPersonRepository } from '../repositories/contactPersonRepository';
import { can } from './../middlewares/can';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';

const router = Router();
let contr = new SharedController<ContactPersonDTO, ContactPersonRepository>(
  ContactPersonRepository
);
router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.CONTACT_PERSONS)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.CONTACT_PERSONS)],
    contr.create.bind(contr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.CONTACT_PERSONS)],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.CONTACT_PERSONS)],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.UPDATE, Resource.CONTACT_PERSONS)],
    contr.delete.bind(contr)
  );

export default router;
