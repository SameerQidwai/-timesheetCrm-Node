import { Router } from "express";
import sampleRoutes from "./sample";
import timeOffTypeRoutes from "./timeOffTypeRoutes";
import timeOffPolicyRoutes from "./timeOffPolicyRoutes";
import standardLevelRoutes from "./standardLevelRoutes";
import standardSkillRoutes from "./standardSkillRoutes";
import holidayTypeRoutes from "./holidayTypeRoutes";
import calendarRoutes from "./calendarRoutes";
import calendarHolidayRoutes from "./calendarHolidayRoutes";

const router: Router = Router();
router.use("/samples", sampleRoutes);
router.use("/time-off-types", timeOffTypeRoutes);
router.use("/time-off-policies", timeOffPolicyRoutes);
router.use("/standard-levels", standardLevelRoutes);
router.use("/standard-skills", standardSkillRoutes);
router.use("/holiday-types", holidayTypeRoutes);
router.use("/calendars", calendarRoutes);
router.use("/calendar-holidays", calendarHolidayRoutes);

console.log("router: ", router);

export default router;