import { Router } from "express";
import { CalendarDTO } from "src/dto";
import { CalendarRepository } from "../repositories/calendarRepository";
import { SharedController } from "../controllers/sharedController";

const router = Router();
let contr = new SharedController<CalendarDTO, CalendarRepository>(CalendarRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;