import { Router } from "express";
import sampleRoutes from "./sample";
import timeOffTypeRoutes from "./timeOffTypeRoutes";
import timeOffPolicyRoutes from "./timeOffPolicyRoutes";
import standardLevelRoutes from "./standardLevelRoutes";
import standardSkillRoutes from "./standardSkillRoutes";

const router: Router = Router();
router.use("/samples", sampleRoutes);
router.use("/time-off-types", timeOffTypeRoutes);
router.use("/time-off-policies", timeOffPolicyRoutes);
router.use("/standard-levels", standardLevelRoutes);
router.use("/standard-skills", standardSkillRoutes);

console.log("router: ", router);

export default router;