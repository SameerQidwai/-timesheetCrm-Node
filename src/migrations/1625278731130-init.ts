import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1625278731130 implements MigrationInterface {
  name = 'init1625278731130';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `files` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `unique_name` varchar(255) NOT NULL, `original_name` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `user_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `attachments` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `target_type` varchar(20) NOT NULL, `file_id` int NOT NULL, `target_id` int NOT NULL, `user_id` int NOT NULL, UNIQUE INDEX `REL_ae331f0b5f7e58b06e42dfce84` (`file_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `panels` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `standard_levels` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "CREATE TABLE `panel_skill_standard_levels` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `level_label` varchar(255) NOT NULL, `short_term_ceil` decimal(10,3) NOT NULL DEFAULT '0.000', `long_term_ceil` decimal(10,3) NOT NULL DEFAULT '0.000', `panel_skill_id` int NULL, `standard_level_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      'CREATE TABLE `panel_skills` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, `standard_skill_id` int NULL, `panel_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `standard_skills` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `standard_skill_standard_levels` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `standard_skill_id` int NULL, `standard_level_id` int NULL, `priority` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `states` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "CREATE TABLE `contact_persons` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `first_name` varchar(255) NOT NULL, `last_name` varchar(255) NOT NULL, `gender` enum ('M', 'F', 'O') NOT NULL, `date_of_birth` datetime NULL, `phone_number` varchar(255) NULL, `email` varchar(255) NULL, `address` varchar(255) NULL, `state_id` int NULL, `clearance_level` enum ('BV', 'NV1', 'NV2', 'PV', 'NC') NULL, `clearance_granted_date` datetime NULL, `clearance_expiry_date` datetime NULL, `clearance_sponsor_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "CREATE TABLE `employment_contracts` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `payslip_email` varchar(255) NULL, `comments` varchar(255) NULL, `pay_frequency` enum ('1', '2', '3', '4', '5', '6', '7') NOT NULL, `start_date` datetime NOT NULL, `end_date` datetime NULL, `type` enum ('1', '2', '3') NOT NULL, `no_of_hours` int NULL, `no_of_hours_per` enum ('1', '2', '3', '4', '5', '6', '7') NOT NULL, `remuneration_amount` int NOT NULL, `remuneration_amount_per` enum ('1', '2', '3', '4', '5', '6', '7') NOT NULL, `employee_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "CREATE TABLE `leases` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `company_name` varchar(255) NOT NULL, `vehicle_registration_no` varchar(255) NOT NULL, `vehicle_make_model` varchar(255) NOT NULL, `start_date` datetime NOT NULL, `end_date` datetime NULL, `financed_amount` int NOT NULL, `installment_frequency` enum ('1', '2', '3', '4', '5', '6', '7') NOT NULL, `pre_tax_deduction_amount` int NOT NULL, `post_tax_deduction_amount` int NOT NULL, `financer_name` varchar(255) NOT NULL, `employee_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      'CREATE TABLE `permissions` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `resource` varchar(20) NOT NULL, `action` varchar(20) NOT NULL, `grant` varchar(20) NOT NULL, `role_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `roles` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, `is_system` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "CREATE TABLE `employees` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `contact_person_organization_id` int NOT NULL, `username` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `next_of_kin_name` varchar(255) NULL, `next_of_kin_phone_number` varchar(255) NULL, `next_of_kin_email` varchar(255) NULL, `next_of_kin_relation` varchar(255) NULL, `tfn` varchar(255) NULL, `tax_free_threshold` tinyint NULL, `help_hecs` tinyint NULL, `superannuation_name` varchar(255) NULL, `superannuation_type` enum ('P', 'S') NULL, `superannuation_bank_name` varchar(255) NULL, `superannuation_bank_account_or_membership_number` varchar(255) NULL, `superannuation_abn_or_usi` varchar(255) NULL, `superannuation_bank_bsb` varchar(255) NULL, `superannuation_address` varchar(255) NULL, `training` varchar(255) NULL, `role_id` int NOT NULL, UNIQUE INDEX `IDX_31358a1a133482b25fe81b021e` (`username`), UNIQUE INDEX `REL_1bc1da6628a26dad7e37b6f05c` (`contact_person_organization_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      'CREATE TABLE `contact_person_organizations` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `start_date` datetime NOT NULL, `end_date` datetime NULL, `designation` varchar(255) NOT NULL, `organization_id` int NULL, `contact_person_id` int NULL, `status` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "CREATE TABLE `organizations` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `name` varchar(255) NOT NULL, `title` varchar(255) NULL, `phone_number` varchar(255) NULL, `email` varchar(255) NULL, `address` text NULL, `website` varchar(255) NULL, `australian_business_number` varchar(255) NULL, `business_type` enum ('1', '2', '3', '4') NOT NULL, `tax_code` varchar(255) NULL, `current_financial_year_total_forecast` decimal(15,3) NULL DEFAULT '0.000', `next_financial_year_total_forecast` decimal(15,3) NULL DEFAULT '0.000', `invoice_email` varchar(255) NULL, `invoice_contact_number` varchar(255) NULL, `pi_insurer` varchar(255) NULL, `pl_insurer` varchar(255) NULL, `wc_insurer` varchar(255) NULL, `pi_policy_number` varchar(255) NULL, `pl_policy_number` varchar(255) NULL, `wc_policy_number` varchar(255) NULL, `pi_sum_insured` decimal(15,3) NULL DEFAULT '0.000', `pl_sum_insured` decimal(15,3) NULL DEFAULT '0.000', `wc_sum_insured` decimal(15,3) NULL DEFAULT '0.000', `pi_insurance_expiry` datetime NULL, `pl_insurance_expiry` datetime NULL, `wc_insurance_expiry` datetime NULL, `parent_organization_id` int NULL, `delegate_contact_person_organization_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      'CREATE TABLE `bank_accounts` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `name` varchar(255) NOT NULL, `account_no` varchar(255) NOT NULL, `bsb` varchar(255) NOT NULL, `organization_id` int NULL, `employee_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `holiday_types` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `calendar_holidays` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `calendar_id` int NULL, `holiday_type_id` int NULL, `date` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `calendars` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, `is_active` tinyint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `comments` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `content` varchar(255) NOT NULL, `target_type` varchar(20) NOT NULL, `target_id` int NOT NULL, `user_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `global_settings` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `key_label` varchar(255) NOT NULL, `key_value` varchar(255) NOT NULL, `data_type` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "CREATE TABLE `opportunity_resource_allocations` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `opportunity_resource_id` int NOT NULL, `selling_rate` decimal(10,3) NULL, `buying_rate` decimal(10,3) NULL, `is_marked_as_selected` tinyint NOT NULL DEFAULT 0, `contact_person_id` int NULL, `start_date` datetime NULL, `end_date` datetime NULL, `effort_rate` int NOT NULL DEFAULT '100', PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      'CREATE TABLE `opportunity_resources` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `panel_skill_id` int NOT NULL, `panel_skill_standard_level_id` int NOT NULL, `billable_hours` decimal(10,3) NOT NULL, `opportunity_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `purchase_orders` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `description` text NULL, `issue_date` datetime NOT NULL, `expiry_date` datetime NOT NULL, `value` int NOT NULL, `comment` varchar(255) NULL, `expense` int NOT NULL, `project_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "CREATE TABLE `opportunities` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `title` varchar(255) NOT NULL, `value` int NOT NULL, `type` enum ('1', '2') NOT NULL, `start_date` datetime NULL, `end_date` datetime NULL, `bid_date` datetime NULL, `entry_date` datetime NULL, `qualified_ops` tinyint NULL, `tender` varchar(255) NOT NULL, `tender_number` varchar(255) NULL, `cm_percentage` int NULL, `go_percentage` int NULL, `get_percentage` int NULL, `hours_per_day` int NULL, `organization_id` int NULL, `panel_id` int NULL, `contact_person_id` int NULL, `state_id` int NULL, `account_director_id` int NULL, `account_manager_id` int NULL, `opportunity_manager_id` int NULL, `project_manager_id` int NULL, `won_date` datetime NULL, `lost_date` datetime NULL, `completed_date` datetime NULL, `status` varchar(255) NOT NULL DEFAULT 'O', PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      'CREATE TABLE `samples` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `title` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `leave_request_types` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      "CREATE TABLE `leave_request_policy_leave_request_types` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `leave_request_policy_id` int NOT NULL, `leave_request_type_id` int NOT NULL, `earn_hours` int NOT NULL, `earn_every` enum ('N', 'M', 'Y', 'EM', 'EY') NOT NULL, `reset_hours` int NOT NULL, `reset_every` enum ('N', 'M', 'Y', 'EM', 'EY') NOT NULL, `threshold` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      'CREATE TABLE `leave_request_policies` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `label` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `timesheet_entries` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `date` varchar(255) NOT NULL, `start_time` varchar(255) NOT NULL, `end_time` varchar(255) NOT NULL, `break_hours` float NOT NULL, `actual_hours` float NOT NULL, `notes` varchar(255) NULL, `submitted_at` datetime NULL, `approved_at` date NULL, `rejected_at` date NULL, `submitted_by` int NULL, `approved_by` int NULL, `rejected_by` int NULL, `project_entry_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `timesheet_project_entries` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `timesheet_id` int NOT NULL, `project_id` int NOT NULL, `notes` varchar(255) NULL, `attachment` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `timesheets` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleted_at` datetime(6) NULL, `start_date` datetime NOT NULL, `end_date` datetime NOT NULL, `employee_id` int NOT NULL, `notes` text NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `contact_person_standard_skill_standard_level` (`contactPersonsId` int NOT NULL, `standardSkillStandardLevelsId` int NOT NULL, INDEX `IDX_13419eb9942fd9a5ed7da64766` (`contactPersonsId`), INDEX `IDX_595209fce311d78badc6ade44e` (`standardSkillStandardLevelsId`), PRIMARY KEY (`contactPersonsId`, `standardSkillStandardLevelsId`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'ALTER TABLE `attachments` ADD CONSTRAINT `FK_ae331f0b5f7e58b06e42dfce847` FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
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
      'ALTER TABLE `contact_persons` ADD CONSTRAINT `FK_bf098a56e685c8a2416371c48d6` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` ADD CONSTRAINT `FK_c66166898d2c2effe847aa10cd8` FOREIGN KEY (`clearance_sponsor_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` ADD CONSTRAINT `FK_3a6fc0765b6b1a6676a3e0bf63c` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `leases` ADD CONSTRAINT `FK_523aa5808d4f206471cbeacb94b` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` ADD CONSTRAINT `FK_f10931e7bb05a3b434642ed2797` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` ADD CONSTRAINT `FK_1bc1da6628a26dad7e37b6f05c1` FOREIGN KEY (`contact_person_organization_id`) REFERENCES `contact_person_organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` ADD CONSTRAINT `FK_727d9c30d77d3a253177b2e918f` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` ADD CONSTRAINT `FK_a92b0a8611370896910ca96bb4b` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` ADD CONSTRAINT `FK_ac13c04d25a86dddf489fc58ad9` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` ADD CONSTRAINT `FK_b2942c2abac6a57dffac221431f` FOREIGN KEY (`parent_organization_id`) REFERENCES `organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` ADD CONSTRAINT `FK_ea7c37ea7af49ca216dfaf04eba` FOREIGN KEY (`delegate_contact_person_organization_id`) REFERENCES `contact_person_organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
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
      'ALTER TABLE `opportunity_resource_allocations` ADD CONSTRAINT `FK_fb8480eb3c464cd05b29276fe2f` FOREIGN KEY (`opportunity_resource_id`) REFERENCES `opportunity_resources`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` ADD CONSTRAINT `FK_9002ddbdfcb11a62423c1926204` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resources` ADD CONSTRAINT `FK_7c6a39aaedb36e7c68cb789789d` FOREIGN KEY (`panel_skill_id`) REFERENCES `panel_skills`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resources` ADD CONSTRAINT `FK_af66c23ca8241eb5c9cf660082d` FOREIGN KEY (`panel_skill_standard_level_id`) REFERENCES `panel_skill_standard_levels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resources` ADD CONSTRAINT `FK_fb6d65558a3f9b5b0483206284c` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `purchase_orders` ADD CONSTRAINT `FK_360947677fea88151debc0783dd` FOREIGN KEY (`project_id`) REFERENCES `opportunities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
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
      'ALTER TABLE `leave_request_policy_leave_request_types` ADD CONSTRAINT `FK_521609c3a872273ba155b3f222f` FOREIGN KEY (`leave_request_policy_id`) REFERENCES `leave_request_policies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `leave_request_policy_leave_request_types` ADD CONSTRAINT `FK_b27b20b1e0c035dfa3497404aec` FOREIGN KEY (`leave_request_type_id`) REFERENCES `leave_request_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
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
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` ADD CONSTRAINT `FK_d546e649c26c61eb11472bafdf5` FOREIGN KEY (`project_entry_id`) REFERENCES `timesheet_project_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` ADD CONSTRAINT `FK_ae60468502a6304c69539fd3812` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` ADD CONSTRAINT `FK_8c66e1e32578bd6f59815f6eb0c` FOREIGN KEY (`project_id`) REFERENCES `opportunities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_standard_skill_standard_level` ADD CONSTRAINT `FK_13419eb9942fd9a5ed7da64766c` FOREIGN KEY (`contactPersonsId`) REFERENCES `contact_persons`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_standard_skill_standard_level` ADD CONSTRAINT `FK_595209fce311d78badc6ade44ee` FOREIGN KEY (`standardSkillStandardLevelsId`) REFERENCES `standard_skill_standard_levels`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `contact_person_standard_skill_standard_level` DROP FOREIGN KEY `FK_595209fce311d78badc6ade44ee`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_standard_skill_standard_level` DROP FOREIGN KEY `FK_13419eb9942fd9a5ed7da64766c`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` DROP FOREIGN KEY `FK_8c66e1e32578bd6f59815f6eb0c`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_project_entries` DROP FOREIGN KEY `FK_ae60468502a6304c69539fd3812`'
    );
    await queryRunner.query(
      'ALTER TABLE `timesheet_entries` DROP FOREIGN KEY `FK_d546e649c26c61eb11472bafdf5`'
    );
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
      'ALTER TABLE `leave_request_policy_leave_request_types` DROP FOREIGN KEY `FK_b27b20b1e0c035dfa3497404aec`'
    );
    await queryRunner.query(
      'ALTER TABLE `leave_request_policy_leave_request_types` DROP FOREIGN KEY `FK_521609c3a872273ba155b3f222f`'
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
      'ALTER TABLE `purchase_orders` DROP FOREIGN KEY `FK_360947677fea88151debc0783dd`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resources` DROP FOREIGN KEY `FK_fb6d65558a3f9b5b0483206284c`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resources` DROP FOREIGN KEY `FK_af66c23ca8241eb5c9cf660082d`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resources` DROP FOREIGN KEY `FK_7c6a39aaedb36e7c68cb789789d`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` DROP FOREIGN KEY `FK_9002ddbdfcb11a62423c1926204`'
    );
    await queryRunner.query(
      'ALTER TABLE `opportunity_resource_allocations` DROP FOREIGN KEY `FK_fb8480eb3c464cd05b29276fe2f`'
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
      'ALTER TABLE `organizations` DROP FOREIGN KEY `FK_ea7c37ea7af49ca216dfaf04eba`'
    );
    await queryRunner.query(
      'ALTER TABLE `organizations` DROP FOREIGN KEY `FK_b2942c2abac6a57dffac221431f`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` DROP FOREIGN KEY `FK_ac13c04d25a86dddf489fc58ad9`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_person_organizations` DROP FOREIGN KEY `FK_a92b0a8611370896910ca96bb4b`'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` DROP FOREIGN KEY `FK_727d9c30d77d3a253177b2e918f`'
    );
    await queryRunner.query(
      'ALTER TABLE `employees` DROP FOREIGN KEY `FK_1bc1da6628a26dad7e37b6f05c1`'
    );
    await queryRunner.query(
      'ALTER TABLE `permissions` DROP FOREIGN KEY `FK_f10931e7bb05a3b434642ed2797`'
    );
    await queryRunner.query(
      'ALTER TABLE `leases` DROP FOREIGN KEY `FK_523aa5808d4f206471cbeacb94b`'
    );
    await queryRunner.query(
      'ALTER TABLE `employment_contracts` DROP FOREIGN KEY `FK_3a6fc0765b6b1a6676a3e0bf63c`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` DROP FOREIGN KEY `FK_c66166898d2c2effe847aa10cd8`'
    );
    await queryRunner.query(
      'ALTER TABLE `contact_persons` DROP FOREIGN KEY `FK_bf098a56e685c8a2416371c48d6`'
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
      'ALTER TABLE `attachments` DROP FOREIGN KEY `FK_ae331f0b5f7e58b06e42dfce847`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_595209fce311d78badc6ade44e` ON `contact_person_standard_skill_standard_level`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_13419eb9942fd9a5ed7da64766` ON `contact_person_standard_skill_standard_level`'
    );
    await queryRunner.query(
      'DROP TABLE `contact_person_standard_skill_standard_level`'
    );
    await queryRunner.query('DROP TABLE `timesheets`');
    await queryRunner.query('DROP TABLE `timesheet_project_entries`');
    await queryRunner.query('DROP TABLE `timesheet_entries`');
    await queryRunner.query('DROP TABLE `leave_request_policies`');
    await queryRunner.query(
      'DROP TABLE `leave_request_policy_leave_request_types`'
    );
    await queryRunner.query('DROP TABLE `leave_request_types`');
    await queryRunner.query('DROP TABLE `samples`');
    await queryRunner.query('DROP TABLE `opportunities`');
    await queryRunner.query('DROP TABLE `purchase_orders`');
    await queryRunner.query('DROP TABLE `opportunity_resources`');
    await queryRunner.query('DROP TABLE `opportunity_resource_allocations`');
    await queryRunner.query('DROP TABLE `global_settings`');
    await queryRunner.query('DROP TABLE `comments`');
    await queryRunner.query('DROP TABLE `calendars`');
    await queryRunner.query('DROP TABLE `calendar_holidays`');
    await queryRunner.query('DROP TABLE `holiday_types`');
    await queryRunner.query('DROP TABLE `bank_accounts`');
    await queryRunner.query('DROP TABLE `organizations`');
    await queryRunner.query('DROP TABLE `contact_person_organizations`');
    await queryRunner.query(
      'DROP INDEX `REL_1bc1da6628a26dad7e37b6f05c` ON `employees`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_31358a1a133482b25fe81b021e` ON `employees`'
    );
    await queryRunner.query('DROP TABLE `employees`');
    await queryRunner.query('DROP TABLE `roles`');
    await queryRunner.query('DROP TABLE `permissions`');
    await queryRunner.query('DROP TABLE `leases`');
    await queryRunner.query('DROP TABLE `employment_contracts`');
    await queryRunner.query('DROP TABLE `contact_persons`');
    await queryRunner.query('DROP TABLE `states`');
    await queryRunner.query('DROP TABLE `standard_skill_standard_levels`');
    await queryRunner.query('DROP TABLE `standard_skills`');
    await queryRunner.query('DROP TABLE `panel_skills`');
    await queryRunner.query('DROP TABLE `panel_skill_standard_levels`');
    await queryRunner.query('DROP TABLE `standard_levels`');
    await queryRunner.query('DROP TABLE `panels`');
    await queryRunner.query(
      'DROP INDEX `REL_ae331f0b5f7e58b06e42dfce84` ON `attachments`'
    );
    await queryRunner.query('DROP TABLE `attachments`');
    await queryRunner.query('DROP TABLE `files`');
  }
}
