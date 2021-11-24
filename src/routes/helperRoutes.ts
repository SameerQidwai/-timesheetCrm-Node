import { NextFunction, Request, Response, Router } from 'express';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { EmployeeController } from '../controllers/employeeController';
import { HelperController } from '../controllers/helperController';

import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new HelperController();
router
  .route('/contact-persons')
  .get([isLoggedIn], contr.helperGetAlContactPersons.bind(contr));

router
  .route('/levels-by-skill')
  .get([isLoggedIn], contr.helperGetLevelsBySkill.bind(contr));

router.route('/roles').get([isLoggedIn], contr.helperGetAllRoles.bind(contr));
router.route('/work').get([isLoggedIn], contr.helperGetAllWork.bind(contr));
router
  .route('/projects')
  .get([isLoggedIn], contr.helperGetProjectsByUserId.bind(contr));
router
  .route('/milestones')
  .get([isLoggedIn], contr.helperGetMilestonesByUserId.bind(contr));
router
  .route('/refresh-token')
  .get([isLoggedIn], (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Request hit successful',
      });
    } catch (e) {
      next(e);
    }
  });

export default router;
