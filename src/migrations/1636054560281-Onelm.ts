import { MigrationInterface, QueryRunner } from 'typeorm';

export class Onelm1636054560281 implements MigrationInterface {
  name = 'Onelm1636054560281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `files` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `attachments` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_levels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` DROP FOREIGN KEY `FK_13653078d3fb7433f1e5646dd77`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` DROP FOREIGN KEY `FK_d1c70a2af2221b5dd8759c29a89`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` CHANGE `panel_skill_id` `panel_skill_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` CHANGE `standard_level_id` `standard_level_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` DROP FOREIGN KEY `FK_0c5a6931b5879ffc4190038d9b5`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` DROP FOREIGN KEY `FK_a935f999ba61fbb6e699c474cfa`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` CHANGE `standard_skill_id` `standard_skill_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` CHANGE `panel_id` `panel_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skills` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` DROP FOREIGN KEY `FK_ebeeb4b501e6926295a2b452b4b`'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` DROP FOREIGN KEY `FK_5515a8b76c3162bbdbebd368554`'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` CHANGE `standard_skill_id` `standard_skill_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` CHANGE `standard_level_id` `standard_level_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `states` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` DROP FOREIGN KEY `FK_52ee2b73a4fcaf47bd6e5392de4`'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` DROP FOREIGN KEY `FK_3a6fc0765b6b1a6676a3e0bf63c`'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `payslip_email` `payslip_email` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `comments` `comments` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `end_date` `end_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `no_of_hours` `no_of_hours` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `file_id` `file_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `employee_id` `employee_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `leases` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `leases` CHANGE `end_date` `end_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` DROP FOREIGN KEY `FK_f10931e7bb05a3b434642ed2797`'
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` CHANGE `role_id` `role_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `roles` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_name` `next_of_kin_name` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_phone_number` `next_of_kin_phone_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_email` `next_of_kin_email` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_relation` `next_of_kin_relation` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `tfn` `tfn` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `tax_free_threshold` `tax_free_threshold` tinyint NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `help_hecs` `help_hecs` tinyint NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_name` `superannuation_name` varchar(255) NULL'
    );
    await queryRunner.query(
      "ALTER TABLE `employees` CHANGE `superannuation_type` `superannuation_type` enum ('P', 'S') NULL"
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_bank_name` `superannuation_bank_name` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_bank_account_or_membership_number` `superannuation_bank_account_or_membership_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_abn_or_usi` `superannuation_abn_or_usi` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_bank_bsb` `superannuation_bank_bsb` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_address` `superannuation_address` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `training` `training` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` DROP FOREIGN KEY `FK_a92b0a8611370896910ca96bb4b`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` DROP FOREIGN KEY `FK_ac13c04d25a86dddf489fc58ad9`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` CHANGE `end_date` `end_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` CHANGE `organization_id` `organization_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` CHANGE `contact_person_id` `contact_person_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` DROP FOREIGN KEY `FK_bf098a56e685c8a2416371c48d6`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` DROP FOREIGN KEY `FK_c66166898d2c2effe847aa10cd8`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `date_of_birth` `date_of_birth` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `phone_number` `phone_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `email` `email` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `address` `address` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `state_id` `state_id` int NULL'
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `clearance_level` `clearance_level` enum ('BV', 'NV1', 'NV2', 'PV', 'NC') NULL"
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `clearance_granted_date` `clearance_granted_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `clearance_expiry_date` `clearance_expiry_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `clearance_sponsor_id` `clearance_sponsor_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` DROP FOREIGN KEY `FK_b2942c2abac6a57dffac221431f`'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` DROP FOREIGN KEY `FK_2c6dd7f1691fbb6a7c1be80530e`'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `title` `title` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `phone_number` `phone_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `email` `email` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `address` `address` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `website` `website` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `australian_business_number` `australian_business_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `tax_code` `tax_code` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `invoice_email` `invoice_email` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `invoice_contact_number` `invoice_contact_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pi_insurer` `pi_insurer` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pl_insurer` `pl_insurer` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `wc_insurer` `wc_insurer` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pi_policy_number` `pi_policy_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pl_policy_number` `pl_policy_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `wc_policy_number` `wc_policy_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pi_insurance_expiry` `pi_insurance_expiry` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pl_insurance_expiry` `pl_insurance_expiry` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `wc_insurance_expiry` `wc_insurance_expiry` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `parent_organization_id` `parent_organization_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `delegate_contact_person_id` `delegate_contact_person_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` DROP FOREIGN KEY `FK_cc20105b139589c697648c925c3`'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` DROP FOREIGN KEY `FK_54020e3939d0c5ba1291d417921`'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` CHANGE `organization_id` `organization_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` CHANGE `employee_id` `employee_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `holiday_types` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` DROP FOREIGN KEY `FK_70ea83ba2ed4855b39d1a1bc6af`'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` DROP FOREIGN KEY `FK_348da17f1c1284cebd26fa9a626`'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` CHANGE `calendar_id` `calendar_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` CHANGE `holiday_type_id` `holiday_type_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `calendars` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `comments` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `global_settings` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `global_variable_labels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `global_variable_labels` CHANGE `state_id` `state_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `global_variable_values` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` DROP FOREIGN KEY `FK_9002ddbdfcb11a62423c1926204`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` CHANGE `selling_rate` `selling_rate` decimal(10,3) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` CHANGE `buying_rate` `buying_rate` decimal(10,3) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` CHANGE `contact_person_id` `contact_person_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` CHANGE `start_date` `start_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` CHANGE `end_date` `end_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resources` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `purchase_orders` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `purchase_orders` CHANGE `description` `description` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `purchase_orders` CHANGE `comment` `comment` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_bd0c6dbc38bfbc1e441e20b666c`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_d868bb2e5a98957d8654df3deef`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_3b99b877e6d79d6c2322a1f63d9`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_b688dce039e8bc989c9a17755ec`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_0adb323b93898590d60578893fa`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_cdf41621b4475aa672c0878f3bc`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_1b495148aa46ac6112dafb12667`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_b7722b33917eb2d46bf2701513b`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `start_date` `start_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `end_date` `end_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `bid_date` `bid_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `entry_date` `entry_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `qualified_ops` `qualified_ops` tinyint NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `tender_number` `tender_number` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `cm_percentage` `cm_percentage` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `go_percentage` `go_percentage` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `get_percentage` `get_percentage` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `hours_per_day` `hours_per_day` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `organization_id` `organization_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `panel_id` `panel_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `contact_person_id` `contact_person_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `state_id` `state_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `account_director_id` `account_director_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `account_manager_id` `account_manager_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `opportunity_manager_id` `opportunity_manager_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `project_manager_id` `project_manager_id` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `won_date` `won_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `lost_date` `lost_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `completed_date` `completed_date` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `milestones` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `milestones` CHANGE `updated_by` `updated_by` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `samples` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `leave_request_types` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `leave_request_policy_leave_request_types` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `leave_request_policies` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` DROP FOREIGN KEY `FK_405f1765f53f77832da80eee85e`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` DROP FOREIGN KEY `FK_e31b768c51b3e7958098cdd9849`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` DROP FOREIGN KEY `FK_ffa9f6eafabc43cc9689958244d`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `notes` `notes` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `submitted_at` `submitted_at` datetime NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `approved_at` `approved_at` date NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `rejected_at` `rejected_at` date NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `submitted_by` `submitted_by` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `approved_by` `approved_by` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `rejected_by` `rejected_by` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` CHANGE `notes` `notes` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` CHANGE `attachment` `attachment` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheets` CHANGE `deleted_at` `deleted_at` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheets` CHANGE `notes` `notes` text NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` ADD CONSTRAINT `FK_13653078d3fb7433f1e5646dd77` FOREIGN KEY (`panel_skill_id`) REFERENCES `panel_skills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` ADD CONSTRAINT `FK_d1c70a2af2221b5dd8759c29a89` FOREIGN KEY (`standard_level_id`) REFERENCES `standard_levels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` ADD CONSTRAINT `FK_0c5a6931b5879ffc4190038d9b5` FOREIGN KEY (`standard_skill_id`) REFERENCES `standard_skills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` ADD CONSTRAINT `FK_a935f999ba61fbb6e699c474cfa` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` ADD CONSTRAINT `FK_ebeeb4b501e6926295a2b452b4b` FOREIGN KEY (`standard_skill_id`) REFERENCES `standard_skills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` ADD CONSTRAINT `FK_5515a8b76c3162bbdbebd368554` FOREIGN KEY (`standard_level_id`) REFERENCES `standard_levels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` ADD CONSTRAINT `FK_52ee2b73a4fcaf47bd6e5392de4` FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` ADD CONSTRAINT `FK_3a6fc0765b6b1a6676a3e0bf63c` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` ADD CONSTRAINT `FK_f10931e7bb05a3b434642ed2797` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` ADD CONSTRAINT `FK_a92b0a8611370896910ca96bb4b` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` ADD CONSTRAINT `FK_ac13c04d25a86dddf489fc58ad9` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` ADD CONSTRAINT `FK_bf098a56e685c8a2416371c48d6` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` ADD CONSTRAINT `FK_c66166898d2c2effe847aa10cd8` FOREIGN KEY (`clearance_sponsor_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` ADD CONSTRAINT `FK_b2942c2abac6a57dffac221431f` FOREIGN KEY (`parent_organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` ADD CONSTRAINT `FK_2c6dd7f1691fbb6a7c1be80530e` FOREIGN KEY (`delegate_contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` ADD CONSTRAINT `FK_cc20105b139589c697648c925c3` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` ADD CONSTRAINT `FK_54020e3939d0c5ba1291d417921` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` ADD CONSTRAINT `FK_70ea83ba2ed4855b39d1a1bc6af` FOREIGN KEY (`calendar_id`) REFERENCES `calendars`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` ADD CONSTRAINT `FK_348da17f1c1284cebd26fa9a626` FOREIGN KEY (`holiday_type_id`) REFERENCES `holiday_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` ADD CONSTRAINT `FK_9002ddbdfcb11a62423c1926204` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_bd0c6dbc38bfbc1e441e20b666c` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_d868bb2e5a98957d8654df3deef` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_3b99b877e6d79d6c2322a1f63d9` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_b688dce039e8bc989c9a17755ec` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_0adb323b93898590d60578893fa` FOREIGN KEY (`account_director_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_cdf41621b4475aa672c0878f3bc` FOREIGN KEY (`account_manager_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_1b495148aa46ac6112dafb12667` FOREIGN KEY (`opportunity_manager_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_b7722b33917eb2d46bf2701513b` FOREIGN KEY (`project_manager_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` ADD CONSTRAINT `FK_405f1765f53f77832da80eee85e` FOREIGN KEY (`submitted_by`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` ADD CONSTRAINT `FK_e31b768c51b3e7958098cdd9849` FOREIGN KEY (`approved_by`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` ADD CONSTRAINT `FK_ffa9f6eafabc43cc9689958244d` FOREIGN KEY (`rejected_by`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` DROP FOREIGN KEY `FK_ffa9f6eafabc43cc9689958244d`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` DROP FOREIGN KEY `FK_e31b768c51b3e7958098cdd9849`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` DROP FOREIGN KEY `FK_405f1765f53f77832da80eee85e`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_b7722b33917eb2d46bf2701513b`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_1b495148aa46ac6112dafb12667`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_cdf41621b4475aa672c0878f3bc`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_0adb323b93898590d60578893fa`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_b688dce039e8bc989c9a17755ec`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_3b99b877e6d79d6c2322a1f63d9`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_d868bb2e5a98957d8654df3deef`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` DROP FOREIGN KEY `FK_bd0c6dbc38bfbc1e441e20b666c`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` DROP FOREIGN KEY `FK_9002ddbdfcb11a62423c1926204`'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` DROP FOREIGN KEY `FK_348da17f1c1284cebd26fa9a626`'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` DROP FOREIGN KEY `FK_70ea83ba2ed4855b39d1a1bc6af`'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` DROP FOREIGN KEY `FK_54020e3939d0c5ba1291d417921`'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` DROP FOREIGN KEY `FK_cc20105b139589c697648c925c3`'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` DROP FOREIGN KEY `FK_2c6dd7f1691fbb6a7c1be80530e`'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` DROP FOREIGN KEY `FK_b2942c2abac6a57dffac221431f`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` DROP FOREIGN KEY `FK_c66166898d2c2effe847aa10cd8`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` DROP FOREIGN KEY `FK_bf098a56e685c8a2416371c48d6`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` DROP FOREIGN KEY `FK_ac13c04d25a86dddf489fc58ad9`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` DROP FOREIGN KEY `FK_a92b0a8611370896910ca96bb4b`'
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` DROP FOREIGN KEY `FK_f10931e7bb05a3b434642ed2797`'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` DROP FOREIGN KEY `FK_3a6fc0765b6b1a6676a3e0bf63c`'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` DROP FOREIGN KEY `FK_52ee2b73a4fcaf47bd6e5392de4`'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` DROP FOREIGN KEY `FK_5515a8b76c3162bbdbebd368554`'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` DROP FOREIGN KEY `FK_ebeeb4b501e6926295a2b452b4b`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` DROP FOREIGN KEY `FK_a935f999ba61fbb6e699c474cfa`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` DROP FOREIGN KEY `FK_0c5a6931b5879ffc4190038d9b5`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` DROP FOREIGN KEY `FK_d1c70a2af2221b5dd8759c29a89`'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` DROP FOREIGN KEY `FK_13653078d3fb7433f1e5646dd77`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheets` CHANGE `notes` `notes` text CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `timesheets` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` CHANGE `attachment` `attachment` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` CHANGE `notes` `notes` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_project_entries` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_entries` CHANGE `rejected_by` `rejected_by` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_entries` CHANGE `approved_by` `approved_by` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_entries` CHANGE `submitted_by` `submitted_by` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_entries` CHANGE `rejected_at` `rejected_at` date NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_entries` CHANGE `approved_at` `approved_at` date NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_entries` CHANGE `submitted_at` `submitted_at` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` CHANGE `notes` `notes` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `timesheet_entries` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` ADD CONSTRAINT `FK_ffa9f6eafabc43cc9689958244d` FOREIGN KEY (`rejected_by`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` ADD CONSTRAINT `FK_e31b768c51b3e7958098cdd9849` FOREIGN KEY (`approved_by`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` ADD CONSTRAINT `FK_405f1765f53f77832da80eee85e` FOREIGN KEY (`submitted_by`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `leave_request_policies` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `leave_request_policy_leave_request_types` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `leave_request_types` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `samples` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `milestones` CHANGE `updated_by` `updated_by` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `milestones` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `completed_date` `completed_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `lost_date` `lost_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `won_date` `won_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `project_manager_id` `project_manager_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `opportunity_manager_id` `opportunity_manager_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `account_manager_id` `account_manager_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `account_director_id` `account_director_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `state_id` `state_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `contact_person_id` `contact_person_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `panel_id` `panel_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `organization_id` `organization_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `hours_per_day` `hours_per_day` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `get_percentage` `get_percentage` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `go_percentage` `go_percentage` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `cm_percentage` `cm_percentage` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` CHANGE `tender_number` `tender_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `qualified_ops` `qualified_ops` tinyint NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `entry_date` `entry_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `bid_date` `bid_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `end_date` `end_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `start_date` `start_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunities` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_b7722b33917eb2d46bf2701513b` FOREIGN KEY (`project_manager_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_1b495148aa46ac6112dafb12667` FOREIGN KEY (`opportunity_manager_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_cdf41621b4475aa672c0878f3bc` FOREIGN KEY (`account_manager_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_0adb323b93898590d60578893fa` FOREIGN KEY (`account_director_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_b688dce039e8bc989c9a17755ec` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_3b99b877e6d79d6c2322a1f63d9` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_d868bb2e5a98957d8654df3deef` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunities` ADD CONSTRAINT `FK_bd0c6dbc38bfbc1e441e20b666c` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `purchase_orders` CHANGE `comment` `comment` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `purchase_orders` CHANGE `description` `description` text CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `purchase_orders` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunity_resources` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunity_resource_allocations` CHANGE `end_date` `end_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunity_resource_allocations` CHANGE `start_date` `start_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunity_resource_allocations` CHANGE `contact_person_id` `contact_person_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunity_resource_allocations` CHANGE `buying_rate` `buying_rate` decimal(10,3) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunity_resource_allocations` CHANGE `selling_rate` `selling_rate` decimal(10,3) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `opportunity_resource_allocations` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` ADD CONSTRAINT `FK_9002ddbdfcb11a62423c1926204` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `global_variable_values` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `global_variable_labels` CHANGE `state_id` `state_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `global_variable_labels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `global_settings` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `comments` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `calendars` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `calendar_holidays` CHANGE `holiday_type_id` `holiday_type_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `calendar_holidays` CHANGE `calendar_id` `calendar_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `calendar_holidays` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` ADD CONSTRAINT `FK_348da17f1c1284cebd26fa9a626` FOREIGN KEY (`holiday_type_id`) REFERENCES `holiday_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `calendar_holidays` ADD CONSTRAINT `FK_70ea83ba2ed4855b39d1a1bc6af` FOREIGN KEY (`calendar_id`) REFERENCES `calendars`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `holiday_types` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `bank_accounts` CHANGE `employee_id` `employee_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `bank_accounts` CHANGE `organization_id` `organization_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `bank_accounts` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` ADD CONSTRAINT `FK_54020e3939d0c5ba1291d417921` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `bank_accounts` ADD CONSTRAINT `FK_cc20105b139589c697648c925c3` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `organizations` CHANGE `delegate_contact_person_id` `delegate_contact_person_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `organizations` CHANGE `parent_organization_id` `parent_organization_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `organizations` CHANGE `wc_insurance_expiry` `wc_insurance_expiry` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `organizations` CHANGE `pl_insurance_expiry` `pl_insurance_expiry` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `organizations` CHANGE `pi_insurance_expiry` `pi_insurance_expiry` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `wc_policy_number` `wc_policy_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pl_policy_number` `pl_policy_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pi_policy_number` `pi_policy_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `wc_insurer` `wc_insurer` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pl_insurer` `pl_insurer` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `pi_insurer` `pi_insurer` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `invoice_contact_number` `invoice_contact_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `invoice_email` `invoice_email` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `tax_code` `tax_code` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `australian_business_number` `australian_business_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `website` `website` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `address` `address` text CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `email` `email` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `phone_number` `phone_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` CHANGE `title` `title` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `organizations` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` ADD CONSTRAINT `FK_2c6dd7f1691fbb6a7c1be80530e` FOREIGN KEY (`delegate_contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` ADD CONSTRAINT `FK_b2942c2abac6a57dffac221431f` FOREIGN KEY (`parent_organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `clearance_sponsor_id` `clearance_sponsor_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `clearance_expiry_date` `clearance_expiry_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `clearance_granted_date` `clearance_granted_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `clearance_level` `clearance_level` enum ('BV', 'NV1', 'NV2', 'PV', 'NC') CHARACTER SET \"latin1\" COLLATE \"latin1_swedish_ci\" NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `state_id` `state_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `address` `address` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `email` `email` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` CHANGE `phone_number` `phone_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `date_of_birth` `date_of_birth` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_persons` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` ADD CONSTRAINT `FK_c66166898d2c2effe847aa10cd8` FOREIGN KEY (`clearance_sponsor_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` ADD CONSTRAINT `FK_bf098a56e685c8a2416371c48d6` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `contact_person_organizations` CHANGE `contact_person_id` `contact_person_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_person_organizations` CHANGE `organization_id` `organization_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_person_organizations` CHANGE `end_date` `end_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `contact_person_organizations` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` ADD CONSTRAINT `FK_ac13c04d25a86dddf489fc58ad9` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` ADD CONSTRAINT `FK_a92b0a8611370896910ca96bb4b` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `training` `training` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_address` `superannuation_address` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_bank_bsb` `superannuation_bank_bsb` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_abn_or_usi` `superannuation_abn_or_usi` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_bank_account_or_membership_number` `superannuation_bank_account_or_membership_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_bank_name` `superannuation_bank_name` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `employees` CHANGE `superannuation_type` `superannuation_type` enum ('P', 'S') CHARACTER SET \"latin1\" COLLATE \"latin1_swedish_ci\" NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `superannuation_name` `superannuation_name` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `employees` CHANGE `help_hecs` `help_hecs` tinyint NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `employees` CHANGE `tax_free_threshold` `tax_free_threshold` tinyint NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `tfn` `tfn` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_relation` `next_of_kin_relation` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_email` `next_of_kin_email` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_phone_number` `next_of_kin_phone_number` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employees` CHANGE `next_of_kin_name` `next_of_kin_name` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `employees` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `roles` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `permissions` CHANGE `role_id` `role_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `permissions` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` ADD CONSTRAINT `FK_f10931e7bb05a3b434642ed2797` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `leases` CHANGE `end_date` `end_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `leases` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `employment_contracts` CHANGE `employee_id` `employee_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `employment_contracts` CHANGE `file_id` `file_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `employment_contracts` CHANGE `no_of_hours` `no_of_hours` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `employment_contracts` CHANGE `end_date` `end_date` datetime NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `comments` `comments` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` CHANGE `payslip_email` `payslip_email` varchar(255) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL DEFAULT \'NULL\''
    );
    await queryRunner.query(
      "ALTER TABLE `employment_contracts` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` ADD CONSTRAINT `FK_3a6fc0765b6b1a6676a3e0bf63c` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` ADD CONSTRAINT `FK_52ee2b73a4fcaf47bd6e5392de4` FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `states` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `standard_skill_standard_levels` CHANGE `standard_level_id` `standard_level_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `standard_skill_standard_levels` CHANGE `standard_skill_id` `standard_skill_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `standard_skill_standard_levels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` ADD CONSTRAINT `FK_5515a8b76c3162bbdbebd368554` FOREIGN KEY (`standard_level_id`) REFERENCES `standard_levels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `standard_skill_standard_levels` ADD CONSTRAINT `FK_ebeeb4b501e6926295a2b452b4b` FOREIGN KEY (`standard_skill_id`) REFERENCES `standard_skills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `standard_skills` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `panel_skills` CHANGE `panel_id` `panel_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `panel_skills` CHANGE `standard_skill_id` `standard_skill_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `panel_skills` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` ADD CONSTRAINT `FK_a935f999ba61fbb6e699c474cfa` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skills` ADD CONSTRAINT `FK_0c5a6931b5879ffc4190038d9b5` FOREIGN KEY (`standard_skill_id`) REFERENCES `standard_skills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `panel_skill_standard_levels` CHANGE `standard_level_id` `standard_level_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `panel_skill_standard_levels` CHANGE `panel_skill_id` `panel_skill_id` int NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `panel_skill_standard_levels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` ADD CONSTRAINT `FK_d1c70a2af2221b5dd8759c29a89` FOREIGN KEY (`standard_level_id`) REFERENCES `standard_levels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `panel_skill_standard_levels` ADD CONSTRAINT `FK_13653078d3fb7433f1e5646dd77` FOREIGN KEY (`panel_skill_id`) REFERENCES `panel_skills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      "ALTER TABLE `standard_levels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `panels` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `attachments` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
    await queryRunner.query(
      "ALTER TABLE `files` CHANGE `deleted_at` `deleted_at` datetime(6) NULL DEFAULT 'NULL'"
    );
  }
}
