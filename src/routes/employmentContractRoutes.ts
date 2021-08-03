import { Router } from "express";
import { SharedController } from "./../controllers/sharedController";
import { EmploymentContractDTO } from "./../dto";
import { EmploymentContractRepository } from "./../repositories/employmentContractRepository";

const router = Router();
let contr = new SharedController<EmploymentContractDTO, EmploymentContractRepository>(EmploymentContractRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;