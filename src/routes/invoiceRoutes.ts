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
    contr.index.bind(contr)
  );
router
  .route('/')
  .post(
    // [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.create.bind(contr)
  );
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

router
  .route('/:invoiceId/')
  .get(
    // [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.get.bind(contr)
  );

router
  .route('/:invoiceId/')
  .put(
    // [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.update.bind(contr)
  );
// router
//   .route('/invoice-organization')
//   .get(
//     // [isLoggedIn],
//     contr.invoiceOrganization.bind(contr)
//   );

export default router;
