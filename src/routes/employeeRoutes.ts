import { Router } from "express";
import { EmployeeRepository } from "./../repositories/employeeRepository";
import { EmployeeController } from "../controllers/employeeController";
import { LeaseController } from "./../controllers/leaseController";

const router = Router();
let contr = new EmployeeController(EmployeeRepository);
let leaseContr = new LeaseController();
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


router.route("/:employeeId/leases")
.get(leaseContr.index.bind(leaseContr))
.post(leaseContr.create.bind(leaseContr));

router.route("/:employeeId/leases/:id")
.get(leaseContr.get.bind(leaseContr))
.put(leaseContr.update.bind(leaseContr))
.delete(leaseContr.delete.bind(leaseContr));

export default router;