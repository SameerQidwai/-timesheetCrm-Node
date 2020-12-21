import { Router } from "express";
import { HolidayTypeDTO } from "src/dto";
import { SharedController } from "../controllers/sharedController";
import { HolidayTypeRepository } from "../repositories/holidayTypeRepository";

const router = Router();
let contr = new SharedController<HolidayTypeDTO, HolidayTypeRepository>(HolidayTypeRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;