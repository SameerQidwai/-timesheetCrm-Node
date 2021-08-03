import { Router } from 'express';
import { isLoggedIn } from '../middlewares/loggedIn';
import { AttachmentController } from '../controllers/attachmentController';

const router = Router();
const contr = new AttachmentController();
router.route('/:id').delete(contr.delete.bind(contr));
router
  .route('/:type/:id')
  .post([isLoggedIn], contr.create.bind(contr))
  .get(contr.show.bind(contr));

export default router;
