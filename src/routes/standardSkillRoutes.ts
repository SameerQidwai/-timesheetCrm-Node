import { Router } from "express";
import { StandardSkillDTO } from "src/dto";
import { SharedController } from "../controllers/sharedController";
import { StandardSkillRepository } from "../repositories/standardSkillRepository";

const router = Router();
let timeOffContr = new SharedController<StandardSkillDTO, StandardSkillRepository>(StandardSkillRepository);
router.route("/")
.get(timeOffContr.index.bind(timeOffContr))
.post(timeOffContr.create.bind(timeOffContr));

router.route("/:id")
.get(timeOffContr.get.bind(timeOffContr))
.put(timeOffContr.update.bind(timeOffContr))
.delete(timeOffContr.delete.bind(timeOffContr));

export default router;