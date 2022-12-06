import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ReportController } from '../controllers/reportController';

const router = Router();
const contr = new ReportController();
router.route('/bench-resources').get([], contr.benchResources.bind(contr));

export default router;
