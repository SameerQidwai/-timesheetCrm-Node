import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    name: 'profit_view',
    expression: `SELECT project_id, Resource_View.milestone_id, resource_start, 
        resource_end, resource_buying_rate, resource_selling_rate, 
        resource_contact_person_id, resource_id, resource_employee_id, resource_name, 
            project_organization_id, project_organization_name, 
        project_type, project_amount, project_status, project_manager_id, 
        project_phase, project_title, time_entries_view.entry_date, time_entries_view.entry_id, 
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
    project_id: number

    @ViewColumn()
    milestone_id: number
    
    @ViewColumn()
    resource_start: Date

    @ViewColumn()
    resource_end: Date

    
    @ViewColumn()
    resource_buying_rate: number
    
    @ViewColumn()
    resource_selling_rate: number
    
    @ViewColumn()
    resource_contact_person_id: number
    
    @ViewColumn()
    resource_id: number
    
    @ViewColumn()
    resource_employee_id: number
    
    @ViewColumn()
    resource_name: string
    
    @ViewColumn()
    project_organization_id: number
    
    @ViewColumn()
    project_organization_name: string

    @ViewColumn()
    project_type: number
    
    @ViewColumn()
    project_amount: number
    
    @ViewColumn()
    project_status: Boolean
    
    @ViewColumn()
    project_manager_id: number
    
    @ViewColumn()
    project_phase: Boolean
    
    @ViewColumn()
    project_title: string
    
    @ViewColumn()
    entry_date: String

    @ViewColumn()
    entry_id: number

    @ViewColumn()
    actual_hours: number

    @ViewColumn()
    project_start: Date

    @ViewColumn()
    project_end: Date
    
}