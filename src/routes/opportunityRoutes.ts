import { Router } from "express";
import { OpportunityRepository } from "./../repositories/opportunityRepository";
import { OpportunityController } from "./../controllers/opportunityController";
import { OpportunityResourceController } from "./../controllers/opportunityResourceController";

const router = Router();
let contr = new OpportunityController(OpportunityRepository);
let resourceContr = new OpportunityResourceController();
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

export default router;