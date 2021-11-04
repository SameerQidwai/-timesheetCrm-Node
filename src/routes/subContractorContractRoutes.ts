import { Router } from 'express';
import { SubContractorContractRepository } from './../repositories/subContractorContractRepository';
import { SharedController } from './../controllers/sharedController';
import { ContractDTO } from './../dto';
import { isLoggedIn } from '../middlewares/loggedIn';

const router = Router();
let contr = new SharedController<ContractDTO, SubContractorContractRepository>(
  SubContractorContractRepository
);
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
