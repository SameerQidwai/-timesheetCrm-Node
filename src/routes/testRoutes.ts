import { Router } from 'express';
import { TestController } from '../controllers/testController';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new TestController();

// router.route('/testmail').get(contr.testMailFunction.bind(contr));
export default router;
