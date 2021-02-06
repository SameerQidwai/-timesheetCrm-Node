import { Router } from "express";
import { SubContractorController } from "./../controllers/subContractorController";
import { SubContractorRepository } from "./../repositories/subContractorRepository";

const router = Router();
// let contr = new SharedController<EmployeeDTO, EmployeeRepository>(EmployeeRepository);
let contr = new SubContractorController(SubContractorRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

router.route("/get/contact-persons")
.get(contr.contactPersons.bind(contr));

export default router;