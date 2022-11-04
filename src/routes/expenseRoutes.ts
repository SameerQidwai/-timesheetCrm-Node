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
    [isLoggedIn, can(Action.READ, Resource.EXPENSES)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.EXPENSES)],
    contr.create.bind(contr)
  );

router
  .route('/available')
  .get(
    [isLoggedIn, can(Action.READ, Resource.EXPENSES)],
    contr.availableIndex.bind(contr)
  );

router
  .route('/:id')
  .get([isLoggedIn, can(Action.READ, Resource.EXPENSES)], contr.get.bind(contr))
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.EXPENSES)],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.DELETE, Resource.EXPENSES)],
    contr.delete.bind(contr)
  );

export default router;
