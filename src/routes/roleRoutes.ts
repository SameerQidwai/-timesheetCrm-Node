import { Router } from "express";
import { RoleController } from "./../controllers/roleController";
import { RoleRepository } from "./../repositories/roleRepository";

const router = Router();
let contr = new RoleController(RoleRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

router.route("/:id/update-permissions")
.put(contr.updatePermissions.bind(contr))
export default router;