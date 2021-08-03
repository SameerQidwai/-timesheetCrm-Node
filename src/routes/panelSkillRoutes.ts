import { Router } from "express";
import { PanelSkillDTO } from "src/dto";
import { SharedController } from "../controllers/sharedController";
import { PanelSkillRepository } from "../repositories/panelSkillRepository";

const router = Router();
let timeOffContr = new SharedController<PanelSkillDTO, PanelSkillRepository>(PanelSkillRepository);
router.route("/")
.get(timeOffContr.index.bind(timeOffContr))
.post(timeOffContr.create.bind(timeOffContr));

router.route("/:id")
.get(timeOffContr.get.bind(timeOffContr))
.put(timeOffContr.update.bind(timeOffContr))
.delete(timeOffContr.delete.bind(timeOffContr));

export default router;