import { ViewEntity, PrimaryGeneratedColumn, ViewColumn } from "typeorm"

@ViewEntity({
    name: 'contact_person_View',
    expression: `Select CONCAT(cp.first_name, ' ', cp.last_name)  name, cp.id contact_person_id, 
    cpo.organization_id, e.id employee_id, cp.state_id, cp.gender, cp.phone_number, cp.email, cpo.designation, cpo.status,
    e.role_id, e.line_manager_id, e.active, org.name organization_name
    FROM contact_persons cp 
        LEFT JOIN  contact_person_organizations cpo ON 
        cp.id = cpo.contact_person_id 
            LEFT JOIN employees e ON 
            e.contact_person_organization_id = cpo.id
            JOIN organizations org ON
            org.id = cpo.organization_id
    WHERE cp.deleted_at IS NULL AND cpo.deleted_at IS NULL AND e.deleted_at IS NULL`,
})
export class ResourceView {
 
  @ViewColumn()
  opportunity_id: number
  
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
  project_type: number
  
  @ViewColumn()
  project_status: Boolean
  
  @ViewColumn()
  project_phase: Boolean

  @ViewColumn()
  resource_name: String

  @ViewColumn()
  organization_name: String
}