import { Router } from "express";
import { EmployeeRepository } from "./../repositories/employeeRepository";
import { EmployeeController } from "../controllers/employeeController";

const router = Router();
// let contr = new SharedController<EmployeeDTO, EmployeeRepository>(EmployeeRepository);
let contr = new EmployeeController(EmployeeRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

router.route("/get/contact-persons")
.get(contr.contactPersons.bind(contr));

router.route("/get/by-skills")
.get(contr.getEmployeesBySkill.bind(contr));

export default router;