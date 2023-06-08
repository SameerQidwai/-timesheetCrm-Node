import moment from 'moment-timezone';
import { createConnection, getManager, In } from 'typeorm';
import { Timesheet } from './entities/timesheet';
import { TimesheetEntry } from './entities/timesheetEntry';
import { TimesheetMilestoneEntry } from './entities/timesheetMilestoneEntry';
const connection = createConnection();

connection
  .then(async () => {
    moment.tz.setDefault('Etc/UTC');
    const manager = getManager();

    let deleteableTimesheets: Number[] = [];
    let deleteablePEntries: Number[] = [];
    let deleteableEntries: Number[] = [];

    let entries = await manager.find(TimesheetEntry, {
      relations: [
        'milestoneEntry',
        'milestoneEntry.timesheet',
        'milestoneEntry.timesheet.employee',
        'milestoneEntry.timesheet.employee.contactPersonOrganization',
        'milestoneEntry.timesheet.employee.contactPersonOrganization.contactPerson',
        'milestoneEntry.milestone',
        'milestoneEntry.milestone.opportunityResources',
        'milestoneEntry.milestone.opportunityResources.opportunityResourceAllocations',
      ],
      withDeleted: true,
      // where: { id: In([3185, 3186, 3187, 3188, 3189, 3190, 3191]) },
    });

    for (let entry of entries) {
      let entryDate = moment(entry.date, 'DD-MM-YYYY');

      let resources = entry.milestoneEntry.milestone.opportunityResources;

      let _exists = false;

      for (let resource of resources) {
        if (
          entryDate.isBetween(
            resource.startDate,
            resource.endDate,
            'date',
            '[]'
          )
        ) {
          for (let allocation of resource.opportunityResourceAllocations) {
            if (
              allocation.contactPersonId ===
              entry.milestoneEntry.timesheet.employee.contactPersonOrganization
                .contactPerson.id
            )
              _exists = true;
          }
        }
      }

      if (!_exists) {
        if (!deleteableEntries.includes(entry.id))
          deleteableEntries.push(entry.id);
        if (!deleteablePEntries.includes(entry.milestoneEntryId))
          deleteablePEntries.push(entry.milestoneEntryId);
        if (!deleteableTimesheets.includes(entry.milestoneEntry.timesheetId))
          deleteableTimesheets.push(entry.milestoneEntry.timesheetId);
      }
    }

    console.log(deleteableEntries.length);
    console.log(deleteablePEntries.length);
    console.log(deleteableTimesheets.length);

    await manager.delete(TimesheetEntry, deleteableEntries);
    await manager.delete(TimesheetMilestoneEntry, deleteablePEntries);
    await manager.delete(Timesheet, deleteableTimesheets);

    process.exit();
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
