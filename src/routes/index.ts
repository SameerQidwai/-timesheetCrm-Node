import { Router } from "express";
import sampleRoutes from "./sample";
import timeOffTypeRoutes from "./timeOffTypeRoutes";
import timeOffPolicyRoutes from "./timeOffPolicyRoutes";

const router: Router = Router();
router.use("/samples", sampleRoutes);
router.use("/time-off-types", timeOffTypeRoutes);
router.use("/time-off-policies", timeOffPolicyRoutes);

console.log("router: ", router);

export default router;