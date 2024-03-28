import { Router } from 'express';
import multer from 'multer';
import { TestController } from '../controllers/testController';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new TestController();
let upload = multer();

// router.route('/test').get(contr.test.bind(contr));
// router.route('/pdf').get(contr.createDummyPDF.bind(contr));
router.route('/testmail').get(contr.testMailFunction.bind(contr));
// router
//   .route('/upload')
//   .post([], upload.single('file'), contr.uploadTimesheetFunction.bind(contr));

// router.route('/import').get(contr.importPanelSkillMappings.bind(contr));

// router
//   .route('/dummyNotification')
//   .get(contr.createDummyNotification.bind(contr));

export default router;
