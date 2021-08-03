import { Router } from "express";
import { StateDTO } from "../dto";
import { SharedController } from "../controllers/sharedController";
import { StateRepository } from "../repositories/stateRepository";

const router = Router();
let contr = new SharedController<StateDTO, StateRepository>(StateRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;