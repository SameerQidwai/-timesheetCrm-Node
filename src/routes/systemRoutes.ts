import { Router } from 'express';
import { SystemAdminController } from '../controllers/systemAdminController';

const router = Router();
let contr = new SystemAdminController();

router.route('/seedColumns').get(contr.addColumns.bind(contr));

export default router;
