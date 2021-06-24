import { Router } from 'express';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { EmployeeController } from '../controllers/employeeController';

const router = Router();
let contr = new EmployeeController(EmployeeRepository);
router
  .route('/contact-persons')
  .get(contr.helperGetAlContactPersons.bind(contr));

export default router;
