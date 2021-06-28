import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { GlobalSettingController } from '../controllers/globalSettingController';

const router = Router();
const contr = new GlobalSettingController();

router.route('/').get(contr.index.bind(contr)).post(contr.create.bind(contr));
export default router;
