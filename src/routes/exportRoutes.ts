import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ExportController } from '../controllers/exportController';

const router = Router();
const contr = new ExportController();

router.route('/').post([], contr.export.bind(contr));

export default router;
