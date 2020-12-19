import { Router } from "express";
import { StandardLevelDTO } from "src/dto";
import { SharedController } from "../controllers/sharedController";
import { StandardLevelRepository } from "../repositories/standardLevelRepository";

const router = Router();
let contr = new SharedController<StandardLevelDTO, StandardLevelRepository>(StandardLevelRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;