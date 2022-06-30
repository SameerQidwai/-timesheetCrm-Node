import { Router } from 'express';
import authRoutes from './authRoutes';
import sampleRoutes from './sample';
import leaveRequestTypeRoutes from './leaveRequestTypeRoutes';
import leaveRequestPolicyRoutes from './leaveRequestPolicyRoutes';
import standardLevelRoutes from './standardLevelRoutes';
import standardSkillRoutes from './standardSkillRoutes';
import holidayTypeRoutes from './holidayTypeRoutes';
import calendarRoutes from './calendarRoutes';
import calendarHolidayRoutes from './calendarHolidayRoutes';
import panelRoutes from './panelRoutes';
import panelSkillRoutes from './panelSkillRoutes';
import { GlobalSettingRepository } from '../repositories/globalSettingRepository';
import organizationRoutes from './organizationRoutes';
import stateRoutes from './stateRoutes';
import contactPersonRoutes from './contactPersonRoutes';
import employeeRoutes from './employeeRoutes';
import subContractorRoutes from './subContractorRoutes';
import employmentContractRoutes from './employmentContractRoutes';
import subContractorContractRoutes from './subContractorContractRoutes';
import opportunityRoutes from './opportunityRoutes';
import projectRoutes from './projectRoutes';
import timesheetRoutes from './timesheetRoutes';
import fileRoutes from './fileRoutes';
import attachmentRoutes from './attachmentRoutes';
import commentRoutes from './commentRoutes';
import helperRoutes from './helperRoutes';
import roleRoutes from './roleRoutes';
import globalRoutes from './globalRoutes';
import globalVariableRoutes from './globalVariableRoutes';
import leaveRequests from './leaveRequestRoutes';
import leaveRequestBalances from './leaveRequestBalanceRoutes';
import milestoneRoutes from './milestoneRoutes';
import importExportRoutes from './importExportRoutes';

const router: Router = Router();
router.use('', authRoutes);
router.use('/samples', sampleRoutes);
router.use('/leave-request-types', leaveRequestTypeRoutes);
router.use('/leave-request-policies', leaveRequestPolicyRoutes);
router.use('/standard-levels', standardLevelRoutes);
router.use('/standard-skills', standardSkillRoutes);
router.use('/holiday-types', holidayTypeRoutes);
router.use('/calendars', calendarRoutes);
router.use('/calendar-holidays', calendarHolidayRoutes);
router.use('/panels', panelRoutes);
router.use('/panel-skills', panelSkillRoutes);
router.use('/organizations', organizationRoutes);
router.use('/contactpersons', contactPersonRoutes);
router.use('/states', stateRoutes);
router.use('/employees', employeeRoutes);
router.use('/sub-contractors', subContractorRoutes);
router.use('/employment-contracts', employmentContractRoutes);
router.use('/sub-contractors-contracts', subContractorContractRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/projects', projectRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/timesheets', timesheetRoutes);
router.use('/files', fileRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/comments', commentRoutes);
router.use('/helpers', helperRoutes);
router.use('/roles', roleRoutes);
router.use('/global-setting', globalRoutes);
router.use('/global-variables', globalVariableRoutes);
router.use('/leave-requests', leaveRequests);
router.use('/leave-request-balances', leaveRequestBalances);
router.use('/data', importExportRoutes);
// router.use("/opportunity-resources", opportunityResourceRoutes);

// console.log("router: ", router);

export default router;
