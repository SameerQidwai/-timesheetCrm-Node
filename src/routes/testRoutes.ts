import { Router } from 'express';
import { TestController } from '../controllers/testController';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new TestController();

// router.route('/').get(contr.test.bind(contr));
export default router;
