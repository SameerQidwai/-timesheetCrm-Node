import { Router } from 'express';
import { invoiceController } from '../controllers/invoiceController';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new invoiceController();

router
  .route('/')
  .get(
    // [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.invoices.bind(contr)
  );
// router
//   .route('/:id')
//   .get(
//     [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
//     contr.integrationTools.bind(contr)
//   );
router
  .route('/data/:projectId&:startDate&:endDate')
  .get(
    // [isLoggedIn],
    contr.invoiceData.bind(contr)
  );

router
  .route('/client-project/:orgId')
  .get(
    // [isLoggedIn],
    contr.clientProjects.bind(contr)
  );

// router
//   .route('/invoice-organization')
//   .get(
//     // [isLoggedIn],
//     contr.invoiceOrganization.bind(contr)
//   );

export default router;
