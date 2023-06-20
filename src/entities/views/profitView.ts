import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    name: 'profit_view',
    expression: `SELECT project_id, Resource_View.milestone_id, resource_start, 
        resource_end, resource_buying_rate, resource_selling_rate, 
        resource_contact_person_id, resource_id, resource_employee_id, resource_name, 
            project_organization_id, project_organization_name, 
        project_type, project_amount, project_status, project_manager_id, 
        project_phase, project_title, 
        time_entries_view.timesheet_id, time_entries_view.milestone_entry_id, 
        time_entries_view.entry_date, time_entries_view.entry_id, 
        time_entries_view.actual_hours, project_start, project_end

        FROM Resource_View
            LEFT JOIN time_entries_view
                ON resource_employee_id = time_entries_view.employee_id
                AND Resource_View.milestone_id = time_entries_view.milestone_id
                AND STR_TO_DATE(time_entries_view.entry_date,'%e-%m-%Y') BETWEEN STR_TO_DATE(DATE_FORMAT(resource_start,'%e-%m-%Y'),'%e-%m-%Y')  
                AND resource_end`
    })
        // AND STR_TO_DATE(time_entries_view.entry_date,'%e-%m-%Y') 
        //     BETWEEN STR_TO_DATE(DATE_FORMAT(res_start,'%e-%m-%Y'),'%e-%m-%Y') AND Resource_View.res_end;
export class ProfitView {

    @ViewColumn()
    projectId: number

    @ViewColumn()
    milestoneId: number
    
    @ViewColumn()
    resourceStart: Date

    @ViewColumn()
    resourceEnd: Date

    
    @ViewColumn()
    resourceBuyingRate: number
    
    @ViewColumn()
    resourceSellingRate: number
    
    @ViewColumn()
    resourceContactPersonId: number
    
    @ViewColumn()
    resourceId: number
    
    @ViewColumn()
    resourceEmployeeId: number
    
    @ViewColumn()
    resourceName: string
    
    @ViewColumn()
    projectOrganizationId: number
    
    @ViewColumn()
    projectOrganizationName: string

    @ViewColumn()
    projectType: number
    
    @ViewColumn()
    projectAmount: number
    
    @ViewColumn()
    projectStatus: Boolean
    
    @ViewColumn()
    projectManagerId: number
    
    @ViewColumn()
    projectPhase: Boolean
    
    @ViewColumn()
    projectTitle: string
    
    @ViewColumn()
    timesheetId: String

    @ViewColumn()
    milestoneEntryId: String

    @ViewColumn()
    entryDate: String

    @ViewColumn()
    entryId: number

    @ViewColumn()
    actualHours: number

    @ViewColumn()
    projectStart: Date

    @ViewColumn()
    projectEnd: Date
    
}