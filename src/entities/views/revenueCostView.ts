import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'revenue_cost_view',
  expression: `Select 
    o_r.opportunity_id project_id, o_r.milestone_id, o_r.start_date resource_start, 
    o_r.end_date resource_end, 

    ora.buying_rate resource_buying_rate, ora.selling_rate resource_selling_rate, 
    ora.contact_person_id resource_contact_person_id,  ora.effort_rate resource_project_effort_rate,

    cpv.employee_id resource_employee_id, cpv.name resource_name,

    o.cm_percentage project_cm_percentage, o.organization_id project_organization_id, 
    o.project_manager_id, o.type project_type, o.value project_amount, o.status project_status, 
    o.phase project_phase, o.title project_title, o.hours_per_day project_hours_per_day,
    o.start_date project_start, o.end_date project_end, 

    org.name project_organization_name,
    ec.no_of_hours resource_contract_hours, ec.no_of_days resource_contract_days_per_week, 
    ec.start_date resource_contract_start, ec.end_date  resource_contract_end, 
    ec.remuneration_amount salary, ec.remuneration_amount_per salary_per,
    ec.type employment_type, ec.boh_percent, cpv.organization_id resource_organization_id, 
    cpv.organization_name resource_organization_name,

    (ora.buying_rate *( (o.hours_per_day) * (ora.effort_rate /100) ) ) cost_rate,
    (ora.selling_rate *( (o.hours_per_day) * (ora.effort_rate /100) ) ) revenue_rate

    FROM opportunities o 
      JOIN opportunity_resources o_r ON 
      o_r.opportunity_id = o.id 
        JOIN opportunity_resource_allocations ora ON 
        ora.opportunity_resource_id = o_r.id 
          JOIN contact_person_view cpv ON
          ora.contact_person_id = cpv.contact_person_id
            JOIN organizations org ON
            org.id = o.organization_id
            LEFT JOIN employment_contracts ec ON
            cpv.employee_id = ec.employee_id

    WHERE ora.is_marked_as_selected = 1 AND o.deleted_at IS NULL AND ora.deleted_at IS NULL AND o_r.deleted_at IS NULL AND ec.deleted_at IS NULL`,
})
export class RevenueCostView {
  @ViewColumn()
  projectId: number;

  @ViewColumn()
  milestoneId: number;
  
  @ViewColumn()
  resourceStartDate: Date;

  @ViewColumn()
  resourceEndDate: Date;

  @ViewColumn()
  resourceBuyingRate: number;

  @ViewColumn()
  resourceSellingRate: number;

  @ViewColumn()
  resourceContactPersonId: number;
  
  @ViewColumn()
  resourceEffortRate: number;

  @ViewColumn()
  resourceEmployeeId: number;

  @ViewColumn()
  resourceName: String;

  @ViewColumn()
  projectCmPercentage: number;

  @ViewColumn()
  projectOrganizationId: number;

  @ViewColumn()
  projectManagerId: number;

  @ViewColumn()
  projectType: number;

  @ViewColumn()
  projectAmount: number;
  
  @ViewColumn()
  projectStatus: Boolean;
  
  @ViewColumn()
  projectPhase: Boolean;

  @ViewColumn()
  projectTitle: string;
  
  @ViewColumn()
  projectHoursPerDay: number;

  @ViewColumn()
  projectStartDate: Date;

  @ViewColumn()
  projectEndDate: Date;

  @ViewColumn()
  projectOrganizationName: String;

  @ViewColumn()
  resourceContractHours: number;

  @ViewColumn()
  resourceContractDaysPerWeek: number

  @ViewColumn()
  resourceContractStartDate: Date;

  @ViewColumn()
  resourceContractEndDate: Date;

  @ViewColumn()
  salary: number;

  @ViewColumn()
  salaryPer: number;

  @ViewColumn()
  employmentType: number;

  @ViewColumn()
  bohPercent: number;

  @ViewColumn()
  costRate: number;

  @ViewColumn()
  revenueRate: number;
  
}
