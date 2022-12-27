import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    name: 'leaves_view',
    expression: `SELECT
        lr.id leave_request_id,

        (CASE WHEN approved_by IS NOT NULL 
                THEN
                    'APPROVED'
            WHEN rejected_by IS NOT NULL
                THEN
                    'REJECTED'
            WHEN submitted_by IS NOT NULL 
                THEN 
                    'SUBMITTED'
        END) leave_status,

        lre.id leave_entry_id,

        hours leave_entry_hours,

        date leave_entry_date,
        
        type_id leave_type_id,

        (CASE WHEN lr.type_id IS NULL 
            THEN
                'unpaid'
            ELSE
                lrt.label
        END) leave_type_name,

        lr.employee_id,

        cpv.name employee_name,
        
        cpv.contact_person_id,

        lr.work_id project_id,

        o.title project_title


        FROM leave_requests lr
            JOIN leave_request_entries lre ON 
                lr.id = lre.leave_request_id
            JOIN contact_person_View cpv ON
                lr.employee_id = cpv.employee_id
            LEFT JOIN leave_request_types lrt ON
                lr.type_id = lrt.id
            LEFT JOIN opportunities o ON
                lr.work_id = o.id

    WHERE lr.deleted_at IS NULL AND lre.deleted_at IS NULL AND lrt.deleted_at IS NULL
    `        
    })

    export class LeavesView {

    @ViewColumn()
    project_id: number

    @ViewColumn()
    project_title: string    

    @ViewColumn()
    resource_start: Date

    @ViewColumn()
    project_status: Boolean

}