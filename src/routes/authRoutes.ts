import { Router } from 'express';
import { Action, Resource } from '../constants/authorization';
import { can } from '../middlewares/can';
import { AuthController } from '../controllers/authController';
import { isLoggedIn } from '../middlewares/loggedIn';
import { canCustom } from '../middlewares/canCustom';

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
router
  .route('/auth/password')
  .patch([isLoggedIn], contr.updatePassword.bind(contr));

router
  .route('/auth/settings')
  .get([isLoggedIn], contr.getSettings.bind(contr))
  .patch([isLoggedIn], contr.updateSettings.bind(contr));

router
  .route('/auth/address')
  .patch([isLoggedIn], contr.updateAddress.bind(contr));

router
  .route('/auth/training')
  .get([isLoggedIn], contr.getTraining.bind(contr))
  .patch([isLoggedIn], contr.updateTraining.bind(contr));

router.route('/auth/users').get([isLoggedIn], contr.getUserUsers.bind(contr));

router
  .route('/auth/projects')
  .get([isLoggedIn, canCustom(Action.READ)], contr.getUserProjects.bind(contr));

router.route('/auth/addSkill').post([isLoggedIn], contr.addSkill.bind(contr));

export default router;
