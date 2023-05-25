import { Router } from 'express';
import { integrationAuthController } from '../controllers/integrationAuthController';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new integrationAuthController();

router.route('/auth').get(contr.integrationAuthLogin.bind(contr));
// router.route('/create-invoice').get([isLoggedIn],contr.createInvoice.bind(contr));
router.route('/callback').get(contr.integrationAuthCallback.bind(contr));

export default router;