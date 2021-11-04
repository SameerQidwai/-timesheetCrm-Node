import { Router } from 'express';
import { SharedController } from './../controllers/sharedController';
import { EmploymentContractDTO } from './../dto';
import { EmploymentContractRepository } from './../repositories/employmentContractRepository';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new SharedController<
  EmploymentContractDTO,
  EmploymentContractRepository
>(EmploymentContractRepository);
router
  .route('/')
  .get([isLoggedIn], contr.index.bind(contr))
  .post([isLoggedIn], contr.create.bind(contr));

router
  .route('/:id')
  .get([isLoggedIn], contr.get.bind(contr))
  .put([isLoggedIn], contr.update.bind(contr))
  .delete([isLoggedIn], contr.delete.bind(contr));

export default router;
