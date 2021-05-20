import { Router } from 'express';
import { CommentController } from '../controllers/commentController';

const router = Router();
const contr = new CommentController();
router.route('/').post(contr.create.bind(contr));
router.route('/:type/:id').get(contr.show.bind(contr));

export default router;
