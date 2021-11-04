import { Router } from 'express';
import { GlobalSettingController } from '../controllers/globalSettingController';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new GlobalSettingController();

router
  .route('/')
  .get([isLoggedIn], contr.index.bind(contr))
  .post([isLoggedIn], contr.create.bind(contr));
export default router;
