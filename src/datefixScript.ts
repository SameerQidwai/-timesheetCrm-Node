import moment from 'moment';
import { createConnection, getManager } from 'typeorm';
import { Attachment } from './entities/attachment';
import { BankAccount } from './entities/bankAccount';
import { Calendar } from './entities/calendar';
import { CalendarHoliday } from './entities/calendarHoliday';
import { Comment } from './entities/comment';
import { ContactPerson } from './entities/contactPerson';
import { ContactPersonOrganization } from './entities/contactPersonOrganization';
import { Employee } from './entities/employee';
import { EmploymentContract } from './entities/employmentContract';
import { File } from './entities/file';
import { HolidayType } from './entities/holidayType';
import { Lease } from './entities/lease';
import { LeaveRequest } from './entities/leaveRequest';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
import { LeaveRequestEntry } from './entities/leaveRequestEntry';
import { LeaveRequestPolicy } from './entities/leaveRequestPolicy';
import { LeaveRequestPolicyLeaveRequestType } from './entities/leaveRequestPolicyLeaveRequestType';
import { LeaveRequestType } from './entities/leaveRequestType';
import { Milestone } from './entities/milestone';
import { Opportunity } from './entities/opportunity';
import { OpportunityResource } from './entities/opportunityResource';
import { OpportunityResourceAllocation } from './entities/opportunityResourceAllocation';
import { Organization } from './entities/organization';
import { Panel } from './entities/panel';
import { PanelSkill } from './entities/panelSkill';
import { PanelSkillStandardLevel } from './entities/panelSkillStandardLevel';
import { Permission } from './entities/permission';
import { PurchaseOrder } from './entities/purchaseOrder';
import { Role } from './entities/role';
import { StandardLevel } from './entities/standardLevel';
import { StandardSkill } from './entities/standardSkill';
import { StandardSkillStandardLevel } from './entities/standardSkillStandardLevel';
import { State } from './entities/state';
import { Timesheet } from './entities/timesheet';
import { TimesheetEntry } from './entities/timesheetEntry';
import { TimesheetMilestoneEntry } from './entities/timesheetMilestoneEntry';
const connection = createConnection();

connection
  .then(async () => {
    let manager = getManager();

    let attachments = await manager.find(Attachment);
    for (let attachment of attachments) {
      //--CREATED AT
      attachment.createdAt = moment
        .utc(attachment.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      attachment.updatedAt = moment
        .utc(attachment.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      attachment.deletedAt = moment
        .utc(attachment.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(attachment);
    }

    let bankAccounts = await manager.find(BankAccount);
    for (let bankAccount of bankAccounts) {
      //--CREATED AT
      bankAccount.createdAt = moment
        .utc(bankAccount.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      bankAccount.updatedAt = moment
        .utc(bankAccount.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      bankAccount.deletedAt = moment
        .utc(bankAccount.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(bankAccount);
    }

    let calendars = await manager.find(Calendar);
    for (let calendar of calendars) {
      //--CREATED AT
      calendar.createdAt = moment
        .utc(calendar.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      calendar.updatedAt = moment
        .utc(calendar.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      calendar.deletedAt = moment
        .utc(calendar.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(calendar);
    }

    let holidays = await manager.find(CalendarHoliday);
    for (let holiday of holidays) {
      //--CREATED AT
      holiday.createdAt = moment
        .utc(holiday.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      holiday.updatedAt = moment
        .utc(holiday.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      holiday.deletedAt = moment
        .utc(holiday.deletedAt)
        .add(10, 'hours')
        .toDate();
      holiday.date = moment.utc(holiday.date).add(10, 'hours').toDate();
      await manager.save(holiday);
    }

    let comments = await manager.find(Comment);
    for (let comment of comments) {
      //--CREATED AT
      comment.createdAt = moment
        .utc(comment.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      comment.updatedAt = moment
        .utc(comment.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      comment.deletedAt = moment
        .utc(comment.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(comment);
    }

    let contactPersons = await manager.find(ContactPerson);
    for (let contactPerson of contactPersons) {
      //--CREATED AT
      contactPerson.createdAt = moment
        .utc(contactPerson.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      contactPerson.updatedAt = moment
        .utc(contactPerson.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      contactPerson.deletedAt = moment
        .utc(contactPerson.deletedAt)
        .add(10, 'hours')
        .toDate();
      contactPerson.clearanceGrantedDate = moment
        .utc(contactPerson.clearanceGrantedDate)
        .add(10, 'hours')
        .toDate();
      contactPerson.clearanceExpiryDate = moment
        .utc(contactPerson.clearanceExpiryDate)
        .add(10, 'hours')
        .toDate();
      contactPerson.dateOfBirth = moment
        .utc(contactPerson.dateOfBirth)
        .add(10, 'hours')
        .toDate();
      await manager.save(contactPerson);
    }

    let associations = await manager.find(ContactPersonOrganization);
    for (let association of associations) {
      //--CREATED AT
      association.createdAt = moment
        .utc(association.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      association.updatedAt = moment
        .utc(association.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      association.deletedAt = moment
        .utc(association.deletedAt)
        .add(10, 'hours')
        .toDate();
      association.startDate = moment
        .utc(association.startDate)
        .add(10, 'hours')
        .toDate();
      association.endDate = moment
        .utc(association.endDate)
        .add(10, 'hours')
        .toDate();
      await manager.save(association);
    }

    let employees = await manager.find(Employee);
    for (let employee of employees) {
      //--CREATED AT
      employee.createdAt = moment
        .utc(employee.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      employee.updatedAt = moment
        .utc(employee.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      employee.deletedAt = moment
        .utc(employee.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(employee);
    }

    let contracts = await manager.find(EmploymentContract);
    for (let contract of contracts) {
      //--CREATED AT
      contract.createdAt = moment
        .utc(contract.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      contract.updatedAt = moment
        .utc(contract.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      contract.deletedAt = moment
        .utc(contract.deletedAt)
        .add(10, 'hours')
        .toDate();
      contract.startDate = moment
        .utc(contract.startDate)
        .add(10, 'hours')
        .toDate();
      contract.endDate = moment.utc(contract.endDate).add(10, 'hours').toDate();
      await manager.save(contract);
    }

    let files = await manager.find(File);
    for (let file of files) {
      //--CREATED AT
      file.createdAt = moment.utc(file.createdAt).add(10, 'hours').toDate();
      //--UPDATED AT
      file.updatedAt = moment.utc(file.updatedAt).add(10, 'hours').toDate();
      //--DELETED AT
      file.deletedAt = moment.utc(file.deletedAt).add(10, 'hours').toDate();
      await manager.save(file);
    }

    let holidayTypes = await manager.find(HolidayType);
    for (let holidayType of holidayTypes) {
      //--CREATED AT
      holidayType.createdAt = moment
        .utc(holidayType.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      holidayType.updatedAt = moment
        .utc(holidayType.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      holidayType.deletedAt = moment
        .utc(holidayType.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(holidayType);
    }

    let leases = await manager.find(Lease);
    for (let lease of leases) {
      //--CREATED AT
      lease.createdAt = moment.utc(lease.createdAt).add(10, 'hours').toDate();
      //--UPDATED AT
      lease.updatedAt = moment.utc(lease.updatedAt).add(10, 'hours').toDate();
      //--DELTED AT
      lease.deletedAt = moment.utc(lease.deletedAt).add(10, 'hours').toDate();
      lease.startDate = moment.utc(lease.startDate).add(10, 'hours').toDate();
      lease.endDate = moment.utc(lease.endDate).add(10, 'hours').toDate();
      await manager.save(lease);
    }

    let leaveRequests = await manager.find(LeaveRequest);
    for (let leaveRequest of leaveRequests) {
      //--CREATED AT
      leaveRequest.createdAt = moment
        .utc(leaveRequest.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      leaveRequest.updatedAt = moment
        .utc(leaveRequest.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      leaveRequest.deletedAt = moment
        .utc(leaveRequest.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(leaveRequest);
    }

    let lrBalances = await manager.find(LeaveRequestBalance);
    for (let lrBalance of lrBalances) {
      //--CREATED AT
      lrBalance.createdAt = moment
        .utc(lrBalance.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      lrBalance.updatedAt = moment
        .utc(lrBalance.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      lrBalance.deletedAt = moment
        .utc(lrBalance.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(lrBalance);
    }

    let lrEntries = await manager.find(LeaveRequestEntry);
    for (let lrEntry of lrEntries) {
      //--CREATED AT
      lrEntry.createdAt = moment
        .utc(lrEntry.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      lrEntry.updatedAt = moment
        .utc(lrEntry.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      lrEntry.deletedAt = moment
        .utc(lrEntry.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(lrEntry);
    }

    let lrPolicies = await manager.find(LeaveRequestPolicy);
    for (let lrPolicy of lrPolicies) {
      //--CREATED AT
      lrPolicy.createdAt = moment
        .utc(lrPolicy.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      lrPolicy.updatedAt = moment
        .utc(lrPolicy.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      lrPolicy.deletedAt = moment
        .utc(lrPolicy.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(lrPolicy);
    }

    let lrPolicyTypes = await manager.find(LeaveRequestPolicyLeaveRequestType);
    for (let lrPolicyType of lrPolicyTypes) {
      //--CREATED AT
      lrPolicyType.createdAt = moment
        .utc(lrPolicyType.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      lrPolicyType.updatedAt = moment
        .utc(lrPolicyType.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      lrPolicyType.deletedAt = moment
        .utc(lrPolicyType.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(lrPolicyType);
    }

    let lrTypes = await manager.find(LeaveRequestType);
    for (let lrType of lrTypes) {
      //--CREATED AT
      lrType.createdAt = moment.utc(lrType.createdAt).add(10, 'hours').toDate();
      //--UPDATED AT
      lrType.updatedAt = moment.utc(lrType.updatedAt).add(10, 'hours').toDate();
      //--DELETED AT
      lrType.deletedAt = moment.utc(lrType.deletedAt).add(10, 'hours').toDate();
      await manager.save(lrType);
    }

    let milestones = await manager.find(Milestone);
    for (let milestone of milestones) {
      //--CREATED AT
      milestone.createdAt = moment
        .utc(milestone.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      milestone.updatedAt = moment
        .utc(milestone.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      milestone.deletedAt = moment
        .utc(milestone.deletedAt)
        .add(10, 'hours')
        .toDate();
      milestone.startDate = moment
        .utc(milestone.startDate)
        .add(10, 'hours')
        .toDate();
      milestone.endDate = moment
        .utc(milestone.endDate)
        .add(10, 'hours')
        .toDate();
      await manager.save(milestone);
    }

    let opportunities = await manager.find(Opportunity);
    for (let opportunity of opportunities) {
      //--CREATED AT
      opportunity.createdAt = moment
        .utc(opportunity.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      opportunity.updatedAt = moment
        .utc(opportunity.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      opportunity.deletedAt = moment
        .utc(opportunity.deletedAt)
        .add(10, 'hours')
        .toDate();
      opportunity.startDate = moment
        .utc(opportunity.startDate)
        .add(10, 'hours')
        .toDate();
      opportunity.endDate = moment
        .utc(opportunity.endDate)
        .add(10, 'hours')
        .toDate();
      opportunity.bidDate = moment
        .utc(opportunity.bidDate)
        .add(10, 'hours')
        .toDate();
      opportunity.wonDate = moment
        .utc(opportunity.wonDate)
        .add(10, 'hours')
        .toDate();
      opportunity.completedDate = moment
        .utc(opportunity.completedDate)
        .add(10, 'hours')
        .toDate();
      await manager.save(opportunity);
    }

    let positions = await manager.find(OpportunityResource);
    for (let position of positions) {
      //--CREATED AT
      position.createdAt = moment
        .utc(position.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      position.updatedAt = moment
        .utc(position.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      position.deletedAt = moment
        .utc(position.deletedAt)
        .add(10, 'hours')
        .toDate();
      position.startDate = moment
        .utc(position.startDate)
        .add(10, 'hours')
        .toDate();
      position.endDate = moment.utc(position.endDate).add(10, 'hours').toDate();
      await manager.save(position);
    }

    let allocations = await manager.find(OpportunityResourceAllocation);
    for (let allocation of allocations) {
      //--CREATED AT
      allocation.createdAt = moment
        .utc(allocation.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      allocation.updatedAt = moment
        .utc(allocation.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      allocation.deletedAt = moment
        .utc(allocation.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(allocation);
    }

    let organizations = await manager.find(Organization);
    for (let organization of organizations) {
      //--CREATED AT
      organization.createdAt = moment
        .utc(organization.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      organization.updatedAt = moment
        .utc(organization.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      organization.deletedAt = moment
        .utc(organization.deletedAt)
        .add(10, 'hours')
        .toDate();
      organization.piInsuranceExpiry = moment
        .utc(organization.piInsuranceExpiry)
        .add(10, 'hours')
        .toDate();
      organization.plInsuranceExpiry = moment
        .utc(organization.plInsuranceExpiry)
        .add(10, 'hours')
        .toDate();
      organization.wcInsuranceExpiry = moment
        .utc(organization.wcInsuranceExpiry)
        .add(10, 'hours')
        .toDate();
      await manager.save(organization);
    }

    let panels = await manager.find(Panel);
    for (let panel of panels) {
      //--CREATED AT
      panel.createdAt = moment.utc(panel.createdAt).add(10, 'hours').toDate();
      //--UPDATED AT
      panel.updatedAt = moment.utc(panel.updatedAt).add(10, 'hours').toDate();
      //--DELETED AT
      panel.deletedAt = moment.utc(panel.deletedAt).add(10, 'hours').toDate();
      await manager.save(panel);
    }

    console.log('PANELS RAN');

    let panelSkills = await manager.find(PanelSkill);
    for (let panelSkill of panelSkills) {
      //--CREATED AT
      panelSkill.createdAt = moment
        .utc(panelSkill.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      panelSkill.updatedAt = moment
        .utc(panelSkill.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      panelSkill.deletedAt = moment
        .utc(panelSkill.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(panelSkill);
    }

    let panelSkillStandards = await manager.find(PanelSkillStandardLevel);
    for (let panelSkillStandard of panelSkillStandards) {
      //--CREATED AT
      panelSkillStandard.createdAt = moment
        .utc(panelSkillStandard.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      panelSkillStandard.updatedAt = moment
        .utc(panelSkillStandard.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      panelSkillStandard.deletedAt = moment
        .utc(panelSkillStandard.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(panelSkillStandard);
    }

    let permissions = await manager.find(Permission);
    for (let permission of permissions) {
      //--CREATED AT
      permission.createdAt = moment
        .utc(permission.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      permission.updatedAt = moment
        .utc(permission.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      permission.deletedAt = moment
        .utc(permission.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(permission);
    }

    let purchaseOrders = await manager.find(PurchaseOrder);
    for (let purchaseOrder of purchaseOrders) {
      //--CREATED AT
      purchaseOrder.createdAt = moment
        .utc(purchaseOrder.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      purchaseOrder.updatedAt = moment
        .utc(purchaseOrder.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      purchaseOrder.deletedAt = moment
        .utc(purchaseOrder.deletedAt)
        .add(10, 'hours')
        .toDate();
      purchaseOrder.expiryDate = moment
        .utc(purchaseOrder.expiryDate)
        .add(10, 'hours')
        .toDate();
      purchaseOrder.issueDate = moment
        .utc(purchaseOrder.issueDate)
        .add(10, 'hours')
        .toDate();
      await manager.save(purchaseOrder);
    }

    let roles = await manager.find(Role);
    for (let role of roles) {
      //--CREATED AT
      role.createdAt = moment.utc(role.createdAt).add(10, 'hours').toDate();
      //--UPDATED AT
      role.updatedAt = moment.utc(role.updatedAt).add(10, 'hours').toDate();
      //--DELETED AT
      role.deletedAt = moment.utc(role.deletedAt).add(10, 'hours').toDate();
      await manager.save(role);
    }

    let standardLevels = await manager.find(StandardLevel);
    for (let standardLevel of standardLevels) {
      //--CREATED AT
      standardLevel.createdAt = moment
        .utc(standardLevel.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      standardLevel.updatedAt = moment
        .utc(standardLevel.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      standardLevel.deletedAt = moment
        .utc(standardLevel.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(standardLevel);
    }

    let standardSkills = await manager.find(StandardSkill);
    for (let standardSkill of standardSkills) {
      //--CREATED AT
      standardSkill.createdAt = moment
        .utc(standardSkill.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      standardSkill.updatedAt = moment
        .utc(standardSkill.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      standardSkill.deletedAt = moment
        .utc(standardSkill.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(standardSkill);
    }

    let standardSkillLevels = await manager.find(StandardSkillStandardLevel);
    for (let standardSkillLevel of standardSkillLevels) {
      //--CREATED AT
      standardSkillLevel.createdAt = moment
        .utc(standardSkillLevel.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      standardSkillLevel.updatedAt = moment
        .utc(standardSkillLevel.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      standardSkillLevel.deletedAt = moment
        .utc(standardSkillLevel.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(standardSkillLevel);
    }

    let states = await manager.find(State);
    for (let state of states) {
      //--CREATED AT
      state.createdAt = moment.utc(state.createdAt).add(10, 'hours').toDate();
      //--UPDATED AT
      state.updatedAt = moment.utc(state.updatedAt).add(10, 'hours').toDate();
      //--DELETED AT
      state.deletedAt = moment.utc(state.deletedAt).add(10, 'hours').toDate();
      await manager.save(state);
    }

    let timesheets = await manager.find(Timesheet);
    for (let timesheet of timesheets) {
      //--CREATED AT
      timesheet.createdAt = moment
        .utc(timesheet.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      timesheet.updatedAt = moment
        .utc(timesheet.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      timesheet.deletedAt = moment
        .utc(timesheet.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(timesheet);
    }

    let tEntries = await manager.find(TimesheetEntry);
    for (let tEntry of tEntries) {
      //--CREATED AT
      tEntry.createdAt = moment.utc(tEntry.createdAt).add(10, 'hours').toDate();
      //--UPDATED AT
      tEntry.updatedAt = moment.utc(tEntry.updatedAt).add(10, 'hours').toDate();
      //--DELETED AT
      tEntry.deletedAt = moment.utc(tEntry.deletedAt).add(10, 'hours').toDate();
      tEntry.submittedAt = moment
        .utc(tEntry.submittedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(tEntry);
    }

    let tProjectEntries = await manager.find(TimesheetMilestoneEntry);
    for (let tProjectEntry of tProjectEntries) {
      console.log(
        tProjectEntry.createdAt,
        moment.utc(tProjectEntry.createdAt).add(10, 'hour')
      );
      //--CREATED AT
      tProjectEntry.createdAt = moment
        .utc(tProjectEntry.createdAt)
        .add(10, 'hours')
        .toDate();
      //--UPDATED AT
      tProjectEntry.updatedAt = moment
        .utc(tProjectEntry.updatedAt)
        .add(10, 'hours')
        .toDate();
      //--DELETED AT
      tProjectEntry.deletedAt = moment
        .utc(tProjectEntry.deletedAt)
        .add(10, 'hours')
        .toDate();
      await manager.save(tProjectEntry);
    }

    console.log('Script RAN');
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
