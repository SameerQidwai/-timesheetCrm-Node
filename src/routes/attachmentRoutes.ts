import { Router } from 'express';
import { AttachmentController } from '../controllers/attachmentController';

const router = Router();
const contr = new AttachmentController();
router.route('/').post(contr.create.bind(contr));
router.route('/:type/:id').get(contr.show.bind(contr));

export default router;
