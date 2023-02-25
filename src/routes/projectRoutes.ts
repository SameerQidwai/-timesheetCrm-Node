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
import { projectOpen } from '../middlewares/projectOpen';
import { ProjectShutdownPeriodController } from '../controllers/projectShutdownPeriodController';

const router = Router();
let contr = new ProjectController(ProjectRepository);
let milestoneContr = new ProjectMilestoneController();
let scheduleContr = new ProjectScheduleController();
let shutdownPeriodsContr = new ProjectShutdownPeriodController();
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
    [
      isLoggedIn,
      can(Action.UPDATE, Resource.PROJECTS, 'id'),
      projectOpen('id'),
    ],
    contr.update.bind(contr)
  )
  .delete(
    [
      isLoggedIn,
      can(Action.DELETE, Resource.PROJECTS, 'id'),
      projectOpen('id'),
    ],
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
  .post(
    [isLoggedIn, projectOpen('projectId')],
    milestoneContr.create.bind(milestoneContr)
  );

router
  .route('/:projectId/milestones/:id')
  .get([isLoggedIn], milestoneContr.get.bind(milestoneContr))
  .put(
    [isLoggedIn, projectOpen('projectId')],
    milestoneContr.update.bind(milestoneContr)
  )
  .delete(
    [isLoggedIn, projectOpen('projectId')],
    milestoneContr.delete.bind(milestoneContr)
  );

//-- SCHEDULES

router
  .route('/:projectId/schedules')
  .get([isLoggedIn], scheduleContr.index.bind(scheduleContr))
  .post(
    [isLoggedIn, projectOpen('projectId')],
    scheduleContr.create.bind(scheduleContr)
  );

router
  .route('/:projectId/schedules/:id')
  .get([isLoggedIn], scheduleContr.get.bind(scheduleContr))
  .put(
    [isLoggedIn, projectOpen('projectId')],
    scheduleContr.update.bind(scheduleContr)
  )
  .delete(
    [isLoggedIn, projectOpen('projectId')],
    scheduleContr.delete.bind(scheduleContr)
  );

//-- SHUTDOWN PERIODS

router
  .route('/:projectId/shutdownPeriods')
  .get([isLoggedIn], shutdownPeriodsContr.index.bind(shutdownPeriodsContr))
  .post(
    [isLoggedIn, projectOpen('projectId')],
    shutdownPeriodsContr.create.bind(shutdownPeriodsContr)
  );

router
  .route('/:projectId/shutdownPeriods/:id')
  .get([isLoggedIn], shutdownPeriodsContr.get.bind(shutdownPeriodsContr))
  .put(
    [isLoggedIn, projectOpen('projectId')],
    shutdownPeriodsContr.update.bind(shutdownPeriodsContr)
  )
  .delete(
    [isLoggedIn, projectOpen('projectId')],
    shutdownPeriodsContr.delete.bind(shutdownPeriodsContr)
  );

//-- MILESTONES

router
  .route('/:projectId/milestones/:milestoneId/resources')
  .get([isLoggedIn], resourceContr.index.bind(resourceContr))
  .post(
    [isLoggedIn, projectOpen('projectId')],
    resourceContr.create.bind(resourceContr)
  );

router
  .route('/:projectId/milestones/:milestoneId/resources/:id')
  .get([isLoggedIn], resourceContr.get.bind(resourceContr))
  .put(
    [isLoggedIn, projectOpen('projectId')],
    resourceContr.update.bind(resourceContr)
  )
  .delete(
    [isLoggedIn, projectOpen('projectId')],
    resourceContr.delete.bind(resourceContr)
  );

router
  .route('/:projectId/milestones/:milestoneId/expenses')
  .get([isLoggedIn], milestoneContr.expenseIndex.bind(milestoneContr))
  .post(
    [isLoggedIn, projectOpen('projectId')],
    milestoneContr.expenseCreate.bind(milestoneContr)
  );

router
  .route('/:projectId/milestones/:milestoneId/expenses/:id')
  .get([isLoggedIn], milestoneContr.expenseGet.bind(milestoneContr))
  .put(
    [isLoggedIn, projectOpen('projectId')],
    milestoneContr.expenseUpdate.bind(milestoneContr)
  )
  .delete(
    [isLoggedIn, projectOpen('projectId')],
    milestoneContr.expenseDelete.bind(milestoneContr)
  );

router
  .route('/:projectId/purchaseOrders')
  .get([isLoggedIn], orderContr.index.bind(orderContr))
  .post(
    [isLoggedIn, projectOpen('projectId')],
    orderContr.create.bind(orderContr)
  );

router
  .route('/:projectId/purchaseOrders/:id')
  .put([isLoggedIn], orderContr.update.bind(orderContr))
  .get([isLoggedIn, projectOpen('projectId')], orderContr.get.bind(orderContr))
  .delete(
    [isLoggedIn, projectOpen('projectId')],
    orderContr.delete.bind(orderContr)
  );

router
  .route('/:projectId/phase/open')
  .post([isLoggedIn], contr.markAsOpen.bind(contr));

router
  .route('/:projectId/phase/close')
  .post([isLoggedIn], contr.markAsClosed.bind(contr));

router
  .route('/:projectId/calculatedValue')
  .get([isLoggedIn], contr.getCalculatedValue.bind(contr))
  .put(
    [isLoggedIn, projectOpen('projectId')],
    contr.updateProjectValue.bind(contr)
  );

export default router;
