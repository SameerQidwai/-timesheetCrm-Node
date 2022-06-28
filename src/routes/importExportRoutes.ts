import { Router } from 'express';
import multer from 'multer';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ImportController } from '../controllers/importController';
import { ExportController } from '../controllers/exportController';

let upload = multer();

const router = Router();
const importContr = new ImportController();
const exportContr = new ExportController();

router
  .route('/import/:type')
  .post([], upload.single('file'), importContr.import.bind(importContr));

router.route('/status').get([], exportContr.status.bind(exportContr));

router.route('/export/:type').post([], exportContr.export.bind(exportContr));

router.route('/download/:name').get(exportContr.download.bind(exportContr));

export default router;
