import { ViewEntity, ViewColumn } from "typeorm"

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
export class ContactPersonView {
 
  @ViewColumn()
  contact_person_id: number
  
  @ViewColumn()
  employee_id: number

  @ViewColumn()
  organization_id: number
  
  @ViewColumn()
  state_id: number
  
  @ViewColumn()
  gender: string
  
  @ViewColumn()
  phone_number: string
  
  @ViewColumn()
  email: string 
  
  @ViewColumn()
  designation: string 
  
  @ViewColumn()
  role_id: number
  
  
  @ViewColumn()
  line_manager_id: number 
  
  @ViewColumn()
  active: boolean

  @ViewColumn()
  organization_name: string

  @ViewColumn()
  name: String 

}