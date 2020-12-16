import { Router } from "express";
import sampleRoutes from "./sample";
import timeOffTypeRoutes from "./sharedRoutes";

const router: Router = Router();
router.use("/samples", sampleRoutes);
router.use("/time-off-types", timeOffTypeRoutes);

console.log("router: ", router);

export default router;