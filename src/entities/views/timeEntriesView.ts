import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    name: 'time_entries_view',
    expression: `Select t.employee_id, tpe.milestone_id , te.date entry_date, te.id entry_id, te.actual_hours 
    From timesheets t 
      JOIN timesheet_project_entries tpe ON 
      tpe.timesheet_id = t.id 
        JOIN timesheet_entries te ON 
        te.milestone_entry_id = tpe.id
            JOIN milestones m ON
            m.id = tpe.milestone_id`,
})
export class TimeEntriesView {    
    
    @ViewColumn()
    employee_id: number

    @ViewColumn()
    milestone_id: number
    
    @ViewColumn()
    entry_date: String
    
    @ViewColumn()
    entry_id: number

    @ViewColumn()
    actual_hours: number

}