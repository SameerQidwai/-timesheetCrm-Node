import { Router } from 'express';
import { SubContractorController } from './../controllers/subContractorController';
import { SubContractorRepository } from './../repositories/subContractorRepository';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
// let contr = new SharedController<EmployeeDTO, EmployeeRepository>(EmployeeRepository);
let contr = new SubContractorController(SubContractorRepository);
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

export default router;
