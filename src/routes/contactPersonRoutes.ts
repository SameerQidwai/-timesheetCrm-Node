import { Router } from "express";
import { ContactPersonDTO } from "../dto";
import { SharedController } from "../controllers/sharedController";
import { ContactPersonRepository } from "../repositories/contactPersonRepository";

const router = Router();
let contr = new SharedController<ContactPersonDTO, ContactPersonRepository>(ContactPersonRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;