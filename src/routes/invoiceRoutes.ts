import { Router } from 'express';
import { invoiceController } from '../controllers/invoiceController';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new invoiceController();

// router
//   .route('/')
//   .get(
//     [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
//     contr.integrationAuthLogin.bind(contr)
//   );
// router
//   .route('/:id')
//   .get(
//     [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
//     contr.integrationTools.bind(contr)
//   );
router
  .route('/data/:mileId&:startDate&:endDate')
  .get(
    // [isLoggedIn],
    contr.invoiceData.bind(contr)
  );

export default router;
