import { Router } from 'express';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { EmployeeController } from '../controllers/employeeController';

const router = Router();
let contr = new EmployeeController(EmployeeRepository);
router.route('/').get(contr.getAllUsers.bind(contr));

export default router;
