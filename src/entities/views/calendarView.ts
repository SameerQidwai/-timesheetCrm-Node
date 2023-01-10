import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    name: 'calendar_view',
    expression: `Select 
        day,
        month,
        year,
        weekday,
        is_weekday,
        actual_date calendar_date,
        calendar_holidays.date calendar_holidays,
        calendar_id,
        (calendar_holidays.date IS NOT NULL ) is_holidays

        From calendar_days
            LEFT JOIN calendar_holidays
                ON DATE_FORMAT(calendar_holidays.date, '%Y-%m-%d') = DATE_FORMAT(calendar_days.actual_date, '%Y-%m-%d')
                AND calendar_holidays.deleted_at IS NULL
            LEFT JOIN calendars 
                ON calendars.id = calendar_holidays.calendar_id
                
     `,
})

export class CalendarView {
 
    @ViewColumn()
    project_id: number
  
    @ViewColumn()
    project_title: string
    
    @ViewColumn()
    milestone_id: number
    
    @ViewColumn()
    resource_buying_rate: number
    
    @ViewColumn()
    resource_selling_rate: number
    
    @ViewColumn()
    resource_contact_person_id: number
    
    @ViewColumn()
    resource_employee_id: number
    
    @ViewColumn()
    project_cm_percentage: number
    
    @ViewColumn()
    project_organization_id: number
    
    @ViewColumn()
    project_manager_id: number
    
    @ViewColumn()
    project_amount: number
  
    @ViewColumn()
    resource_start: Date
  
    @ViewColumn()
    resource_end: Date
  
    @ViewColumn()
    project_start: Date
  
    @ViewColumn()
    project_end: Date
    
    @ViewColumn()
    project_type: number
    
    @ViewColumn()
    project_status: Boolean
    
    @ViewColumn()
    project_phase: Boolean
  
    @ViewColumn()
    resource_name: String
  
    @ViewColumn()
    project_organization_name: String
  }