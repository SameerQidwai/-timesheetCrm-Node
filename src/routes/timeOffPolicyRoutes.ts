import { Router } from "express";
import { TimeOffPolicyDTO } from "src/dto";
import { SharedController } from "../controllers/sharedController";
import { TimeOffPolicyRepository } from "../repositories/timeOffPolicyRepository";

const router = Router();
let timeOffContr = new SharedController<TimeOffPolicyDTO, TimeOffPolicyRepository>(TimeOffPolicyRepository);
router.route("/")
.get(timeOffContr.index.bind(timeOffContr))
.post(timeOffContr.create.bind(timeOffContr));

router.route("/:id")
.get(timeOffContr.get.bind(timeOffContr))
.put(timeOffContr.update.bind(timeOffContr))
.delete(timeOffContr.delete.bind(timeOffContr));

export default router;