import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    name: 'forecaste_view',
    expression: `Select 
    o_r.opportunity_id project_id, o_r.milestone_id, o_r.start_date resource_start, 
    o_r.end_date resource_end, 

    ora.buying_rate resource_buying_rate, ora.selling_rate resource_selling_rate, 
    ora.contact_person_id resource_contact_person_id,  ora.effort_rate resource_project_effort_rate,

    cpv.employee_id resource_employee_id, cpv.name resource_name,

    o.cm_percentage project_cm_percentage, o.organization_id project_organization_id, 
    o.project_manager_id, o.type project_type, o.value project_amount, o.status project_status, 
    o.phase project_phase, o.title project_title, 
    o.start_date project_start, o.end_date project_end, 

    org.name project_organization_name,
    ec.no_of_hours resource_contract_hours,  ec.start_date resource_contract_start, 
    ec.end_date  resource_contract_end,

    (ora.buying_rate *( (ec.no_of_hours /5) * (ora.effort_rate /100) ) ) forcaste_buy_rate,
    (ora.selling_rate *( (ec.no_of_hours /5) * (ora.effort_rate /100) ) ) forcaste_sell_rate

    FROM opportunities o 
      JOIN opportunity_resources o_r ON 
      o_r.opportunity_id = o.id 
        JOIN opportunity_resource_allocations ora ON 
        ora.opportunity_resource_id = o_r.id 
          JOIN contact_person_View cpv ON
          ora.contact_person_id = cpv.contact_person_id
            JOIN organizations org ON
            org.id = o.organization_id
            LEFT JOIN employment_contracts ec ON
            cpv.employee_id = ec.id

    WHERE ora.is_marked_as_selected = 1 AND o.deleted_at IS NULL AND ora.deleted_at IS NULL AND o_r.deleted_at IS NULL`,
})

export class ForecasteView {
 
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