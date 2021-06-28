import { Router } from 'express';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { OpportunityController } from './../controllers/opportunityController';
import { OpportunityResourceController } from './../controllers/opportunityResourceController';
import { OpportunityResourceAllocationController } from './../controllers/opportunityResourceAllocationController';
import { can } from './../middlewares/can';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';

const router = Router();
let contr = new OpportunityController(OpportunityRepository);
let resourceContr = new OpportunityResourceController();
let allocationContr = new OpportunityResourceAllocationController();

router.route('/')
  .get([isLoggedIn, can(Action.READ, Resource.OPPORTUNITIES)], contr.index.bind(contr))
  .post([isLoggedIn, can(Action.ADD, Resource.OPPORTUNITIES)], contr.create.bind(contr));

router
  .route('/:id')
  .get([isLoggedIn, can(Action.READ, Resource.OPPORTUNITIES, "id")], contr.get.bind(contr))
  .put([isLoggedIn, can(Action.UPDATE, Resource.OPPORTUNITIES, "id")], contr.update.bind(contr))
  .delete([isLoggedIn, can(Action.DELETE, Resource.OPPORTUNITIES, "id")], contr.delete.bind(contr));

router.route('/:id/win').put([isLoggedIn, can(Action.UPDATE, Resource.OPPORTUNITIES, "id")], contr.markAsWin.bind(contr));
router.route('/:id/lost').put([isLoggedIn, can(Action.UPDATE, Resource.OPPORTUNITIES, "id")], contr.markAsLost.bind(contr));

router
  .route('/:opportunityId/resources')
  .get(resourceContr.index.bind(resourceContr))
  .post(resourceContr.create.bind(resourceContr));

router
  .route('/:opportunityId/resources/:id')
  .get(resourceContr.get.bind(resourceContr))
  .put(resourceContr.update.bind(resourceContr))
  .delete(resourceContr.delete.bind(resourceContr));

router
  .route('/:opportunityId/resources/:opportunityResourceId/allocations')
  .post(allocationContr.create.bind(allocationContr));

router
  .route('/:opportunityId/resources/:opportunityResourceId/allocations/:id')
  .get(allocationContr.get.bind(allocationContr))
  .put(allocationContr.update.bind(allocationContr))
  .delete(allocationContr.delete.bind(allocationContr));

router
  .route(
    '/:opportunityId/resources/:opportunityResourceId/allocations/:id/mark-as-selected'
  )
  .patch(allocationContr.markAsSelected.bind(allocationContr));

export default router;
