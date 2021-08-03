import { Router } from "express";
import { SubContractorContractRepository } from "./../repositories/subContractorContractRepository";
import { SharedController } from "./../controllers/sharedController";
import { ContractDTO } from "./../dto";

const router = Router();
let contr = new SharedController<ContractDTO, SubContractorContractRepository>(SubContractorContractRepository);
router.route("/")
.get(contr.index.bind(contr))
.post(contr.create.bind(contr));

router.route("/:id")
.get(contr.get.bind(contr))
.put(contr.update.bind(contr))
.delete(contr.delete.bind(contr));

export default router;