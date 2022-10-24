import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { can } from '../middlewares/can';
import { ExpenseController } from '../controllers/expenseController';
import { Action, Resource } from '../constants/authorization';

const router = Router();
const contr = new ExpenseController();

router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.create.bind(contr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.delete.bind(contr)
  );

export default router;
