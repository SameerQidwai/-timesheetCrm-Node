import { Router } from 'express';
import { PanelSkillRepository } from '../repositories/panelSkillRepository';
import { isLoggedIn } from '../middlewares/loggedIn';
import { ExpenseSheetController } from '../controllers/expenseSheetController';
import { ExpenseSheetRepository } from '../repositories/expenseSheetRepository';

const router = Router();
let expenseSheetController = new ExpenseSheetController(ExpenseSheetRepository);
router
  .route('/')
  .get([isLoggedIn], expenseSheetController.index.bind(expenseSheetController))
  .post(
    [isLoggedIn],
    expenseSheetController.create.bind(expenseSheetController)
  );

router
  .route('/:id')
  .put([isLoggedIn], expenseSheetController.update.bind(expenseSheetController))
  .delete(
    [isLoggedIn],
    expenseSheetController.delete.bind(expenseSheetController)
  );

export default router;
