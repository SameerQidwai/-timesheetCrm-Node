import { Router } from 'express';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { EmployeeController } from '../controllers/employeeController';
import { HelperController } from '../controllers/helperController';

const router = Router();
let contr = new HelperController();
router
  .route('/contact-persons')
  .get(contr.helperGetAlContactPersons.bind(contr));

router.route('/levels-by-skill').get(contr.helperGetLevelsBySkill.bind(contr));

router.route('/roles').get(contr.helperGetAllRoles.bind(contr));
router.route('/work').get(contr.helperGetAllWork.bind(contr));
router.route('/projects').get(contr.helperGetProjectsByUserId.bind(contr));

export default router;
