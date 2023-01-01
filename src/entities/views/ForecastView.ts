// import { ViewEntity, ViewColumn } from "typeorm"

// @ViewEntity({
//     name: 'forecast_view',
//     expression: `Select 
//             cost_rate,
//             revenue_rate,
//             project_type_id
            
//         From calendar_view 
//             LEFT JOIN calendars_days
//             ON calendar_view
//     `,
// })

// export class RevenueCostViews {
 
//     @ViewColumn()
//     project_id: number
  
//     @ViewColumn()
//     project_title: string
    
//     @ViewColumn()
//     milestone_id: number
    
//     @ViewColumn()
//     resource_buying_rate: number
    
//     @ViewColumn()
//     resource_selling_rate: number
    
//     @ViewColumn()
//     resource_contact_person_id: number
    
//     @ViewColumn()
//     resource_employee_id: number
    
//     @ViewColumn()
//     project_cm_percentage: number
    
//     @ViewColumn()
//     project_organization_id: number
    
//     @ViewColumn()
//     project_manager_id: number
    
//     @ViewColumn()
//     project_amount: number
  
//     @ViewColumn()
//     resource_start: Date
  
//     @ViewColumn()
//     resource_end: Date
  
//     @ViewColumn()
//     project_start: Date
  
//     @ViewColumn()
//     project_end: Date
    
//     @ViewColumn()
//     project_type: number
    
//     @ViewColumn()
//     project_status: Boolean
    
//     @ViewColumn()
//     project_phase: Boolean
  
//     @ViewColumn()
//     resource_name: String
  
//     @ViewColumn()
//     project_organization_name: String
//   }