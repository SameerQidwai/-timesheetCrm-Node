import { Router } from "express";
import sampleRoutes from "./sample";
import timeOffTypeRoutes from "./timeOffTypeRoutes";
import timeOffPolicyRoutes from "./timeOffPolicyRoutes";
import standardLevelRoutes from "./standardLevelRoutes";
import standardSkillRoutes from "./standardSkillRoutes";
import holidayTypeRoutes from "./holidayTypeRoutes";
import calendarRoutes from "./calendarRoutes";
import calendarHolidayRoutes from "./calendarHolidayRoutes";
import panelRoutes from "./panelRoutes";
import panelSkillRoutes from "./panelSkillRoutes";
import {GlobalSettingRepository} from "../repositories/globalSettingRepository";
import { getCustomRepository } from "typeorm";

const router: Router = Router();
router.use("/samples", sampleRoutes);
router.use("/time-off-types", timeOffTypeRoutes);
router.use("/time-off-policies", timeOffPolicyRoutes);
router.use("/standard-levels", standardLevelRoutes);
router.use("/standard-skills", standardSkillRoutes);
router.use("/holiday-types", holidayTypeRoutes);
router.use("/calendars", calendarRoutes);
router.use("/calendar-holidays", calendarHolidayRoutes);
router.use("/panels", panelRoutes);
router.use("/panel-skills", panelSkillRoutes);
router.post("/global-setting", async (req,res) => {
    let data =await getCustomRepository(GlobalSettingRepository).createAndSave({
        fromEmail: "tst",
        recordsPerPage: "15",
        timeZone: "gmt+5"
    });
    res.status(200).json({
        success: true,
        message: `POST`,
        data: data
    });
});
// console.log("router: ", router);

export default router;