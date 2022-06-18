import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ImportController } from '../controllers/importController';
import multer from 'multer';

let upload = multer();

const router = Router();
const contr = new ImportController();

router.route('/').post([], upload.single('file'), contr.export.bind(contr));

export default router;
