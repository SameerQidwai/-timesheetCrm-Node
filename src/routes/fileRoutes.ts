import { Router } from 'express';
import { FileController } from '../controllers/fileController';
import multer from 'multer';

const upload = multer({ dest: `./public/uploads` });
const router = Router();
const contr = new FileController();
router.route('/').post(upload.array('files'), contr.create.bind(contr));

export default router;
