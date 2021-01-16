import { Router } from "express";
import { OrganizationDTO } from "../dto";
import { SharedController } from "../controllers/sharedController";
import { OrganizationRepository } from "../repositories/organizationRepository";

const router = Router();
let contr = new SharedController<OrganizationDTO, OrganizationRepository>(OrganizationRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;