import { Router } from "express";
import { OpportunityRepository } from "./../repositories/opportunityRepository";
import { OpportunityController } from "./../controllers/opportunityController";
import { OpportunityResourceController } from "./../controllers/opportunityResourceController";
import { OpportunityResourceAllocationController } from "./../controllers/opportunityResourceAllocationController";

const router = Router();
let contr = new OpportunityController(OpportunityRepository);
let resourceContr = new OpportunityResourceController();
let allocationContr = new OpportunityResourceAllocationController();

router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

router.route("/:opportunityId/resources")
.get(resourceContr.index.bind(resourceContr))
.post(resourceContr.create.bind(resourceContr));

router.route("/:opportunityId/resources/:id")
.get(resourceContr.get.bind(resourceContr))
.put(resourceContr.update.bind(resourceContr))
.delete(resourceContr.delete.bind(resourceContr));

router.route("/:opportunityId/resources/:opportunityResourceId/allocations")
.post(allocationContr.create.bind(allocationContr));

router.route("/:opportunityId/resources/:opportunityResourceId/allocations/:id")
.get(allocationContr.get.bind(allocationContr))
.put(allocationContr.update.bind(allocationContr))
.delete(allocationContr.delete.bind(allocationContr));

router.route("/:opportunityId/resources/:opportunityResourceId/allocations/:id/mark-as-selected")
.patch(allocationContr.markAsSelected.bind(allocationContr))

export default router;