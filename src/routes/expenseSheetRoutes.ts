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
    [isLoggedIn, can(Action.READ, Resource.EXPENSES)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.EXPENSES)],
    contr.create.bind(contr)
  );

router
  .route('/submitMany')
  .post(
    [isLoggedIn, can(Action.ADD, Resource.EXPENSES)],
    contr.submitMany.bind(contr)
  );
router
  .route('/approveMany')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.EXPENSES)],
    contr.approveMany.bind(contr)
  );
router
  .route('/rejectMany')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.EXPENSES)],
    contr.rejectMany.bind(contr)
  );

router
  .route('/unapproveMany')
  .post(
    [isLoggedIn, can(Action.UNAPPROVAL, Resource.EXPENSES)],
    contr.unapprove.bind(contr)
  );

router
  .route('/:id/isBillable')
  .put(
    [isLoggedIn, can(Action.APPROVAL, Resource.EXPENSES)],
    contr.updateBillable.bind(contr)
  );

router
  .route('/:id/approve')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.EXPENSES)],
    contr.approve.bind(contr)
  );

router
  .route('/:id/reject')
  .post(
    [isLoggedIn, can(Action.APPROVAL, Resource.EXPENSES)],
    contr.reject.bind(contr)
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
