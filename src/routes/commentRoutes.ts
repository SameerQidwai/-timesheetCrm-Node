import { Router } from 'express';
import { CommentController } from '../controllers/commentController';

const router = Router();
const contr = new CommentController();
router.route('/:id').delete(contr.delete.bind(contr));
router
  .route('/:type/:id')
  .get(contr.show.bind(contr))
  .post(contr.create.bind(contr));

export default router;
