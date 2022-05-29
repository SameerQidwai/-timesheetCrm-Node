import { Router } from 'express';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { EmployeeController } from '../controllers/employeeController';
import { LeaseController } from './../controllers/leaseController';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new EmployeeController(EmployeeRepository);
let leaseContr = new LeaseController();
router
  .route('/')
  .get([isLoggedIn], contr.index.bind(contr))
  .post([isLoggedIn], contr.create.bind(contr));

router
  .route('/:id')
  .get([isLoggedIn], contr.get.bind(contr))
  .put([isLoggedIn], contr.update.bind(contr))
  .delete([isLoggedIn], contr.delete.bind(contr));

router
  .route('/get/contact-persons')
  .get([isLoggedIn], contr.contactPersons.bind(contr));

router
  .route('/get/by-skills')
  .get([isLoggedIn], contr.getEmployeesBySkill.bind(contr));

router
  .route('/:employeeId/leases')
  .get([isLoggedIn], leaseContr.index.bind(leaseContr))
  .post([isLoggedIn], leaseContr.create.bind(leaseContr));

router
  .route('/:employeeId/leases/:id')
  .get([isLoggedIn], leaseContr.get.bind(leaseContr))
  .put([isLoggedIn], leaseContr.update.bind(leaseContr))
  .delete([isLoggedIn], leaseContr.delete.bind(leaseContr));

  router
  .route('/:employeeId/buy-cost')
  .get([isLoggedIn], contr.getEmployeeByCost.bind(contr));


export default router;
