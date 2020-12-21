import { Router } from "express";
import { PanelDTO } from "../dto";
import { SharedController } from "../controllers/sharedController";
import { PanelRepository } from "../repositories/panelRepository";

const router = Router();
let contr = new SharedController<PanelDTO, PanelRepository>(PanelRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;