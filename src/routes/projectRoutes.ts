import { Router } from 'express';
import { ProjectController } from './../controllers/projectController';
import { ProjectRepository } from './../repositories/projectRepository';
import { ProjectResourceController } from './../controllers/projectResourceController';
import { PurchaseOrderController } from './../controllers/purchaseOrderController';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';
import { can } from './../middlewares/can';

const router = Router();
let contr = new ProjectController(ProjectRepository);
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
  .route('/:id/milestones')
  .get(
    [isLoggedIn, can(Action.READ, Resource.PROJECTS, 'id')],
    contr.projectMilestones.bind(contr)
  );
router
  .route('/:projectId/resources')
  .get(resourceContr.index.bind(resourceContr))
  .post(resourceContr.create.bind(resourceContr));

router
  .route('/:projectId/resources/:id')
  .get(resourceContr.get.bind(resourceContr))
  .put(resourceContr.update.bind(resourceContr))
  .delete(resourceContr.delete.bind(resourceContr));

router
  .route('/:projectId/purchaseOrders')
  .get(orderContr.index.bind(orderContr))
  .post(orderContr.create.bind(orderContr));

router
  .route('/:projectId/purchaseOrders/:id')
  .put(orderContr.update.bind(orderContr))
  .get(orderContr.get.bind(orderContr))
  .delete(orderContr.delete.bind(orderContr));
export default router;
