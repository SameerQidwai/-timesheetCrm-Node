import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { isLoggedIn } from '../middlewares/loggedIn';
import { Request, Response } from 'express';

const router = Router();
const contr = new AuthController();
router.route('/login').post(contr.login.bind(contr));
// router
//   .route('/webtokencheck')
//   .get([isLoggedIn], (req: Request, res: Response) => {
//     return res.status(200).json({
//       success: false,
//       message: 'Dashboard accessed',
//     });
//   });
router.route('/password').patch([isLoggedIn], contr.updatePassword.bind(contr));
router
  .route('/settings')
  .get([isLoggedIn], contr.getSettings.bind(contr))
  .patch([isLoggedIn], contr.updateSettings.bind(contr));

export default router;
