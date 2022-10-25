import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ExpenseSheetController } from '../controllers/expenseSheetController';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';

const router = Router();
const contr = new ExpenseSheetController();

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

router
  .route('/:id/expenses')
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.addExpenses.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.removeExpenses.bind(contr)
  );

export default router;
