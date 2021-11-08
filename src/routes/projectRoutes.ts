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
  .get([isLoggedIn], resourceContr.index.bind(resourceContr))
  .post([isLoggedIn], resourceContr.create.bind(resourceContr));

router
  .route('/:projectId/resources/:id')
  .get([isLoggedIn], resourceContr.get.bind(resourceContr))
  .put([isLoggedIn], resourceContr.update.bind(resourceContr))
  .delete([isLoggedIn], resourceContr.delete.bind(resourceContr));

router
  .route('/:projectId/purchaseOrders')
  .get([isLoggedIn], orderContr.index.bind(orderContr))
  .post([isLoggedIn], orderContr.create.bind(orderContr));

router
  .route('/:projectId/purchaseOrders/:id')
  .put([isLoggedIn], orderContr.update.bind(orderContr))
  .get([isLoggedIn], orderContr.get.bind(orderContr))
  .delete([isLoggedIn], orderContr.delete.bind(orderContr));
export default router;
