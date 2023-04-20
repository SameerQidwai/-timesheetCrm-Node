import { Router } from 'express';
import { SystemAdminController } from '../controllers/systemAdminController';

const router = Router();
let contr = new SystemAdminController();

router.route('/').get(contr.test.bind(contr));

export default router;
