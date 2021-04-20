import { Router } from "express";
import { ProjectController } from "./../controllers/projectController";
import { ProjectRepository } from "./../repositories/projectRepository";
import { ProjectResourceController } from "./../controllers/projectResourceController";

const router = Router();
let contr = new ProjectController(ProjectRepository);
let resourceContr = new ProjectResourceController();

router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

router.route("/:projectId/resources")
.get(resourceContr.index.bind(resourceContr))
.post(resourceContr.create.bind(resourceContr));

router.route("/:projectId/resources/:id")
.get(resourceContr.get.bind(resourceContr))
.put(resourceContr.update.bind(resourceContr))
.delete(resourceContr.delete.bind(resourceContr));

export default router;