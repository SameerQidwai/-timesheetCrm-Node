import { Router } from 'express';
import { ProjectController } from './../controllers/projectController';
import { ProjectRepository } from './../repositories/projectRepository';
import { ProjectResourceController } from './../controllers/projectResourceController';
import { PurchaseOrderController } from './../controllers/purchaseOrderController';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';
import { can } from './../middlewares/can';
import { ProjectMilestoneController } from '../controllers/projectMilestoneController';
import { ProjectScheduleController } from '../controllers/projectScheduleController';

const router = Router();
let contr = new ProjectController(ProjectRepository);
let milestoneContr = new ProjectMilestoneController();
let scheduleContr = new ProjectScheduleController();
let resourceContr = new ProjectResourceController();
let orderContr = new PurchaseOrderController();

router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.PROJECTS)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.PROJECTS)],
    contr.create.bind(contr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.PROJECTS, 'id')],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.PROJECTS, 'id')],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.DELETE, Resource.PROJECTS, 'id')],
    contr.delete.bind(contr)
  );

router
  .route('/:projectId/profit-loss')
  .get([isLoggedIn], contr.profit_loss.bind(contr));

router
  .route('/:projectId/tracking')
  .get([], contr.getProjecTracking.bind(contr));

router
  .route('/:projectId/hierarchy')
  .get([isLoggedIn], contr.hierarchy.bind(contr));

//-- MILESTONES

router
  .route('/:projectId/milestones')
  .get([isLoggedIn], milestoneContr.index.bind(milestoneContr))
  .post([isLoggedIn], milestoneContr.create.bind(milestoneContr));

router
  .route('/:projectId/milestones/:id')
  .get([isLoggedIn], milestoneContr.get.bind(milestoneContr))
  .put([isLoggedIn], milestoneContr.update.bind(milestoneContr))
  .delete([isLoggedIn], milestoneContr.delete.bind(milestoneContr));

//-- SCHEDULES

router
  .route('/:projectId/schedules')
  .get([isLoggedIn], scheduleContr.index.bind(scheduleContr))
  .post([isLoggedIn], scheduleContr.create.bind(scheduleContr));

router
  .route('/:projectId/schedules/:id')
  .get([isLoggedIn], scheduleContr.get.bind(scheduleContr))
  .put([isLoggedIn], scheduleContr.update.bind(scheduleContr))
  .delete([isLoggedIn], scheduleContr.delete.bind(scheduleContr));

router
  .route('/:projectId/milestones/:milestoneId/resources')
  .get([isLoggedIn], resourceContr.index.bind(resourceContr))
  .post([isLoggedIn], resourceContr.create.bind(resourceContr));

router
  .route('/:projectId/milestones/:milestoneId/resources/:id')
  .get([isLoggedIn], resourceContr.get.bind(resourceContr))
  .put([isLoggedIn], resourceContr.update.bind(resourceContr))
  .delete([isLoggedIn], resourceContr.delete.bind(resourceContr));

router
  .route('/:projectId/milestones/:milestoneId/expenses')
  .get([isLoggedIn], milestoneContr.expenseIndex.bind(milestoneContr))
  .post([isLoggedIn], milestoneContr.expenseCreate.bind(milestoneContr));

router
  .route('/:projectId/milestones/:milestoneId/expenses/:id')
  .get([isLoggedIn], milestoneContr.expenseGet.bind(milestoneContr))
  .put([isLoggedIn], milestoneContr.expenseUpdate.bind(milestoneContr))
  .delete([isLoggedIn], milestoneContr.expenseDelete.bind(milestoneContr));

router
  .route('/:projectId/purchaseOrders')
  .get([isLoggedIn], orderContr.index.bind(orderContr))
  .post([isLoggedIn], orderContr.create.bind(orderContr));

router
  .route('/:projectId/purchaseOrders/:id')
  .put([isLoggedIn], orderContr.update.bind(orderContr))
  .get([isLoggedIn], orderContr.get.bind(orderContr))
  .delete([isLoggedIn], orderContr.delete.bind(orderContr));

router
  .route('/:projectId/phase/open')
  .post([isLoggedIn], contr.markAsOpen.bind(contr));

router
  .route('/:projectId/phase/close')
  .post([isLoggedIn], contr.markAsClosed.bind(contr));

router
  .route('/:projectId/calculatedValue')
  .get([isLoggedIn], contr.getCalculatedValue.bind(contr))
  .put([isLoggedIn], contr.updateProjectValue.bind(contr));

export default router;
