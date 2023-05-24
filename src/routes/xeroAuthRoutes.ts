import { Router } from 'express';
import { XeroAuthController } from '../controllers/xeroAuthController';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new XeroAuthController();

router.route('/auth').get(contr.auth.bind(contr));
router.route('/create-invoice').get([isLoggedIn],contr.createInvoice.bind(contr));
router.route('/callback').get(contr.callback.bind(contr));

export default router;