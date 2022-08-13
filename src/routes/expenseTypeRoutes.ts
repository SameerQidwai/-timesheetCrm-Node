import { Router } from 'express';
import { PanelSkillRepository } from '../repositories/panelSkillRepository';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ExpenseTypeController } from '../controllers/expenseTypeController';

const router = Router();
let expenseTypeContr = new ExpenseTypeController();
router
  .route('/')
  .get([isLoggedIn], expenseTypeContr.index.bind(expenseTypeContr))
  .post([isLoggedIn], expenseTypeContr.create.bind(expenseTypeContr));

router
  .route('/:id')
  .put([isLoggedIn], expenseTypeContr.update.bind(expenseTypeContr))
  .delete([isLoggedIn], expenseTypeContr.delete.bind(expenseTypeContr));

export default router;
