import { Router } from "express";
import { TimeOffTypeRepository } from "./../repositories/timeOffTypeRepository";
import { TimeOffTypeController } from "./../controllers/timeOffTypeController";

const router = Router();
let timeOffContr = new TimeOffTypeController(TimeOffTypeRepository);
router.route("/")
.get(timeOffContr.index.bind(timeOffContr))
.post(timeOffContr.create.bind(timeOffContr));

router.route("/:id")
.get(timeOffContr.get.bind(timeOffContr))
.put(timeOffContr.update.bind(timeOffContr))
.delete(timeOffContr.delete.bind(timeOffContr));

export default router;