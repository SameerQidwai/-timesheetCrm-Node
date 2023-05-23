import { Router } from 'express';
import { XeroAuthController } from '../controllers/xeroAuthController';

const router = Router();
let contr = new XeroAuthController();

router.route('/auth').get(contr.auth.bind(contr));
router.route('/callback').get(contr.callback.bind(contr));

export default router;