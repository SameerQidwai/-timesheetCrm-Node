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
  .route('/submitMany')
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.submitMany.bind(contr)
  );
router
  .route('/approveMany')
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.approveMany.bind(contr)
  );
router
  .route('/rejectMany')
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.rejectMany.bind(contr)
  );

router
  .route('/unapproveMany')
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.unapprove.bind(contr)
  );

router
  .route('/:id/isBillable')
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.updateBillable.bind(contr)
  );

router
  .route('/:id/approve')
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.approve.bind(contr)
  );

router
  .route('/:id/reject')
  .post(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.reject.bind(contr)
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
