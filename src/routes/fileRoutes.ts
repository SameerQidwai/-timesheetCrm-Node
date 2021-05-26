import { Router } from 'express';
import { FileController } from '../controllers/fileController';
import multer from 'multer';

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${Date.now()}${Math.floor(100000 + Math.random() * 900000)}.${
        file.originalname.split('.')[file.originalname.split('.').length - 1]
      }`
    );
  },
});
const upload = multer({ storage: storage });
const router = Router();
const contr = new FileController();
router.route('/:name').get(contr.show.bind(contr));
router.route('/').post(upload.array('files'), contr.create.bind(contr));

export default router;
