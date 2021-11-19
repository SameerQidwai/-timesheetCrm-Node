import { Router } from 'express';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { OpportunityController } from './../controllers/opportunityController';
import { MilestoneController } from './../controllers/milestoneController';
import { OpportunityResourceController } from './../controllers/opportunityResourceController';
import { OpportunityResourceAllocationController } from './../controllers/opportunityResourceAllocationController';
import { can } from './../middlewares/can';
import { Action, Resource } from './../constants/authorization';
import { isLoggedIn } from './../middlewares/loggedIn';

const router = Router();
let contr = new OpportunityController(OpportunityRepository);
let milestoneContr = new MilestoneController();
let resourceContr = new OpportunityResourceController();
let allocationContr = new OpportunityResourceAllocationController();

router
  .route('/')
  .get(
    [isLoggedIn, can(Action.READ, Resource.OPPORTUNITIES)],
    contr.index.bind(contr)
  )
  .post(
    [isLoggedIn, can(Action.ADD, Resource.OPPORTUNITIES)],
    contr.create.bind(contr)
  );

router
  .route('/:id')
  .get(
    [isLoggedIn, can(Action.READ, Resource.OPPORTUNITIES, 'id')],
    contr.get.bind(contr)
  )
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.OPPORTUNITIES, 'id')],
    contr.update.bind(contr)
  )
  .delete(
    [isLoggedIn, can(Action.DELETE, Resource.OPPORTUNITIES, 'id')],
    contr.delete.bind(contr)
  );

router
  .route('/:id/win')
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.OPPORTUNITIES, 'id')],
    contr.markAsWin.bind(contr)
  );
router
  .route('/:id/lost')
  .put(
    [isLoggedIn, can(Action.UPDATE, Resource.OPPORTUNITIES, 'id')],
    contr.markAsLost.bind(contr)
  );

router
  .route('/:opportunityId/milestones')
  .get([isLoggedIn], milestoneContr.index.bind(milestoneContr))
  .post([isLoggedIn], milestoneContr.create.bind(milestoneContr));

router
  .route('/:opportunityId/milestones/:id')
  .get([isLoggedIn], milestoneContr.get.bind(milestoneContr))
  .put([isLoggedIn], milestoneContr.update.bind(milestoneContr));

router
  .route('/:opportunityId/milestones/:milestoneId/resources')
  .get([isLoggedIn], resourceContr.index.bind(resourceContr))
  .post([isLoggedIn], resourceContr.create.bind(resourceContr));

router
  .route('/:opportunityId/milestones/:milestoneId/resources/:id')
  .get([isLoggedIn], resourceContr.get.bind(resourceContr))
  .put([isLoggedIn], resourceContr.update.bind(resourceContr))
  .delete([isLoggedIn], resourceContr.delete.bind(resourceContr));

router
  .route(
    '/:opportunityId/milestones/:milestoneId/resources/:opportunityResourceId/allocations'
  )
  .post([isLoggedIn], allocationContr.create.bind(allocationContr));

router
  .route(
    '/:opportunityId/milestones/:milestoneId/resources/:opportunityResourceId/allocations/:id'
  )
  .get([isLoggedIn], allocationContr.get.bind(allocationContr))
  .put([isLoggedIn], allocationContr.update.bind(allocationContr))
  .delete([isLoggedIn], allocationContr.delete.bind(allocationContr));

router
  .route(
    '/:opportunityId/resources/milestones/:milestoneId/:opportunityResourceId/allocations/:id/mark-as-selected'
  )
  .patch([isLoggedIn], allocationContr.markAsSelected.bind(allocationContr));

export default router;
