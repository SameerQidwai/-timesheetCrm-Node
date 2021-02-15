import { Router } from "express";
import { OpportunityRepository } from "./../repositories/opportunityRepository";
import { OpportunityController } from "./../controllers/opportunityController";

const router = Router();
let contr = new OpportunityController(OpportunityRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;