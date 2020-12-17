import { Router } from "express";
import { TimeOffTypeDTO } from "src/dto";
import { SharedController } from "../controllers/sharedController";
import { TimeOffTypeRepository } from "../repositories/timeOffTypeRepository";

const router = Router();
let timeOffContr = new SharedController<TimeOffTypeDTO, TimeOffTypeRepository>(TimeOffTypeRepository);
router.route("/")
.get(timeOffContr.index.bind(timeOffContr))
.post(timeOffContr.create.bind(timeOffContr));

router.route("/:id")
.get(timeOffContr.get.bind(timeOffContr))
.put(timeOffContr.update.bind(timeOffContr))
.delete(timeOffContr.delete.bind(timeOffContr));

export default router;