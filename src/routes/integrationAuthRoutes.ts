import { Router } from 'express';
import { integrationAuthController } from '../controllers/integrationAuthController';
import { can } from '../middlewares/can';
import { Action, Resource } from '../constants/authorization';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new integrationAuthController();

router
  .route('/:toolName/auth')
  .get(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.integrationAuthLogin.bind(contr)
  );
router
  .route('/:toolName/auth')
  .put(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.integrationTools.bind(contr)
  );
router
  .route('/:toolName/auth')
  .delete(
    [isLoggedIn, can(Action.READ, Resource.ADMIN_OPTIONS)],
    contr.integrationLogoutTool.bind(contr)
  );

router
  .route('/:toolName/callback')
  .get(contr.integrationAuthCallback.bind(contr));

router
  .route('/:toolName/organizations')
  .get(contr.toolOrganizations.bind(contr));

router
  .route('/:toolName/tool-assets')
  .post(contr.toolAssets.bind(contr));

export default router;
