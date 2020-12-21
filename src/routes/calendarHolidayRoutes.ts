import { Router } from "express";
import { CalendarHolidayDTO } from "../dto";
import { CalendarHolidayRepository } from "../repositories/calendarHolidayRepository";
import { SharedController } from "../controllers/sharedController";

const router = Router();
let contr = new SharedController<CalendarHolidayDTO, CalendarHolidayRepository>(CalendarHolidayRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;