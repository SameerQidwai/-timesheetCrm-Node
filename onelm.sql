-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 22, 2021 at 10:33 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `onelm`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `account_no` varchar(255) NOT NULL,
  `bsb` varchar(255) NOT NULL,
  `organization_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `created_at`, `updated_at`, `deleted_at`, `name`, `account_no`, `bsb`, `organization_id`, `employee_id`) VALUES
(1, '2021-04-20 12:59:25.082882', '2021-04-20 12:59:25.082882', NULL, '', '', '', 1, NULL),
(2, '2021-04-20 13:00:32.928711', '2021-04-20 13:00:32.928711', NULL, '', '', '', 2, NULL),
(3, '2021-04-20 13:12:45.699311', '2021-04-20 13:12:45.699311', NULL, 'Bank HBL', 'xxx-xxx-xxxx', 'bsab-xxx', NULL, 1),
(4, '2021-04-20 12:43:55.827249', '2021-04-20 12:43:55.827249', NULL, 'Standard Chartered', '111111111-2-3-444412', '12qwe', 3, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `calendars`
--

CREATE TABLE `calendars` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL,
  `is_active` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `calendar_holidays`
--

CREATE TABLE `calendar_holidays` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `calendar_id` int(11) DEFAULT NULL,
  `holiday_type_id` int(11) DEFAULT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `contact_persons`
--

CREATE TABLE `contact_persons` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `gender` enum('M','F','O') NOT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `clearance_level` enum('BV','NV1','NV2','PV') DEFAULT NULL,
  `clearance_granted_date` datetime DEFAULT NULL,
  `clearance_expiry_date` datetime DEFAULT NULL,
  `clearance_sponsor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `contact_persons`
--

INSERT INTO `contact_persons` (`id`, `created_at`, `updated_at`, `deleted_at`, `first_name`, `last_name`, `gender`, `date_of_birth`, `phone_number`, `email`, `address`, `state_id`, `clearance_level`, `clearance_granted_date`, `clearance_expiry_date`, `clearance_sponsor_id`) VALUES
(1, '2021-04-20 13:02:02.340824', '2021-04-20 13:12:45.000000', NULL, 'Ali', 'Mehndi ', 'M', '2021-04-20 13:09:00', '878', 'email ', 'Address', NULL, 'BV', '2021-04-20 13:01:54', '2021-04-24 13:01:56', 1),
(2, '2021-04-20 13:08:38.778522', '2021-04-20 13:13:29.000000', NULL, 'fiazan ', 'Ali ', 'M', '2021-04-06 13:13:05', '098', 'faizan@gmal.com', '15 yemen road, yemen', NULL, 'BV', '2021-04-20 13:08:30', '2021-04-30 13:08:32', 1);

-- --------------------------------------------------------

--
-- Table structure for table `contact_person_organizations`
--

CREATE TABLE `contact_person_organizations` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `designation` varchar(255) NOT NULL,
  `organization_id` int(11) DEFAULT NULL,
  `contact_person_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `contact_person_organizations`
--

INSERT INTO `contact_person_organizations` (`id`, `created_at`, `updated_at`, `deleted_at`, `start_date`, `end_date`, `designation`, `organization_id`, `contact_person_id`) VALUES
(1, '2021-04-20 13:02:47.991434', '2021-04-20 13:02:47.991434', NULL, '2021-04-12 13:02:46', NULL, 'dsad', 1, 1),
(2, '2021-04-20 13:08:38.790783', '2021-04-20 13:08:38.790783', NULL, '2021-04-21 13:08:20', NULL, 'Designer', 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `contact_person_standard_skill_standard_level`
--

CREATE TABLE `contact_person_standard_skill_standard_level` (
  `contactPersonsId` int(11) NOT NULL,
  `standardSkillStandardLevelsId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `contact_person_standard_skill_standard_level`
--

INSERT INTO `contact_person_standard_skill_standard_level` (`contactPersonsId`, `standardSkillStandardLevelsId`) VALUES
(1, 2),
(1, 4),
(2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `contact_person_organization_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `next_of_kin_name` varchar(255) DEFAULT NULL,
  `next_of_kin_phone_number` varchar(255) DEFAULT NULL,
  `next_of_kin_email` varchar(255) DEFAULT NULL,
  `next_of_kin_relation` varchar(255) DEFAULT NULL,
  `tfn` varchar(255) DEFAULT NULL,
  `tax_free_threshold` tinyint(4) DEFAULT NULL,
  `help_hecs` tinyint(4) DEFAULT NULL,
  `superannuation_name` varchar(255) DEFAULT NULL,
  `superannuation_type` enum('P','S') DEFAULT NULL,
  `superannuation_bank_name` varchar(255) DEFAULT NULL,
  `superannuation_bank_account_or_membership_number` varchar(255) DEFAULT NULL,
  `superannuation_abn_or_usi` varchar(255) DEFAULT NULL,
  `superannuation_bank_bsb` varchar(255) DEFAULT NULL,
  `superannuation_address` varchar(255) DEFAULT NULL,
  `training` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `created_at`, `updated_at`, `deleted_at`, `contact_person_organization_id`, `username`, `next_of_kin_name`, `next_of_kin_phone_number`, `next_of_kin_email`, `next_of_kin_relation`, `tfn`, `tax_free_threshold`, `help_hecs`, `superannuation_name`, `superannuation_type`, `superannuation_bank_name`, `superannuation_bank_account_or_membership_number`, `superannuation_abn_or_usi`, `superannuation_bank_bsb`, `superannuation_address`, `training`) VALUES
(1, '2021-04-20 13:12:45.693539', '2021-04-20 13:12:45.693539', NULL, 1, 'aliM@gmail.com', NULL, NULL, NULL, NULL, 'TA-xx', 1, 0, 'Name', 'P', NULL, '9898', '09898', NULL, NULL, 'Trained'),
(2, '2021-04-20 13:13:29.403133', '2021-04-20 13:13:29.403133', NULL, 2, 'alif@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employment_contracts`
--

CREATE TABLE `employment_contracts` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `payslip_email` varchar(255) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `pay_frequency` enum('1','2','3','4','5','6','7') NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `type` enum('1','2','3') NOT NULL,
  `no_of_hours` int(11) DEFAULT NULL,
  `no_of_hours_per` enum('1','2','3','4','5','6','7') NOT NULL,
  `remuneration_amount` int(11) NOT NULL,
  `remuneration_amount_per` enum('1','2','3','4','5','6','7') NOT NULL,
  `employee_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `employment_contracts`
--

INSERT INTO `employment_contracts` (`id`, `created_at`, `updated_at`, `deleted_at`, `payslip_email`, `comments`, `pay_frequency`, `start_date`, `end_date`, `type`, `no_of_hours`, `no_of_hours_per`, `remuneration_amount`, `remuneration_amount_per`, `employee_id`) VALUES
(1, '2021-04-20 13:12:45.696389', '2021-04-20 13:12:45.696389', NULL, 'ailM@gmail.com', 'Comments', '3', '2021-04-08 13:10:39', '2021-04-23 13:10:43', '1', 10, '3', 20000, '1', 1),
(2, '2021-04-20 13:13:29.406277', '2021-04-20 13:13:29.406277', NULL, NULL, 'comments', '1', '2021-04-14 13:13:08', '2021-04-27 13:13:10', '1', 10, '3', 200, '2', 2);

-- --------------------------------------------------------

--
-- Table structure for table `global_settings`
--

CREATE TABLE `global_settings` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `key_label` varchar(255) NOT NULL,
  `key_value` varchar(255) NOT NULL,
  `data_type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `holiday_types`
--

CREATE TABLE `holiday_types` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `leases`
--

CREATE TABLE `leases` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `company_name` varchar(255) NOT NULL,
  `vehicle_registration_no` varchar(255) NOT NULL,
  `vehicle_make_model` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `financed_amount` int(11) NOT NULL,
  `installment_frequency` enum('1','2','3','4','5','6','7') NOT NULL,
  `pre_tax_deduction_amount` int(11) NOT NULL,
  `post_tax_deduction_amount` int(11) NOT NULL,
  `financer_name` varchar(255) NOT NULL,
  `employee_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `opportunities`
--

CREATE TABLE `opportunities` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `value` int(11) NOT NULL,
  `type` enum('1','2') NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `bid_date` datetime DEFAULT NULL,
  `entry_date` datetime DEFAULT NULL,
  `qualified_ops` tinyint(4) DEFAULT NULL,
  `tender` varchar(255) NOT NULL,
  `tender_number` varchar(255) DEFAULT NULL,
  `cm_percentage` int(11) DEFAULT NULL,
  `go_percentage` int(11) DEFAULT NULL,
  `get_percentage` int(11) DEFAULT NULL,
  `hours_per_day` int(11) DEFAULT NULL,
  `organization_id` int(11) DEFAULT NULL,
  `panel_id` int(11) DEFAULT NULL,
  `contact_person_id` int(11) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `account_director_id` int(11) DEFAULT NULL,
  `account_manager_id` int(11) DEFAULT NULL,
  `opportunity_manager_id` int(11) DEFAULT NULL,
  `project_manager_id` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'O'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `opportunities`
--

INSERT INTO `opportunities` (`id`, `created_at`, `updated_at`, `deleted_at`, `title`, `value`, `type`, `start_date`, `end_date`, `bid_date`, `entry_date`, `qualified_ops`, `tender`, `tender_number`, `cm_percentage`, `go_percentage`, `get_percentage`, `hours_per_day`, `organization_id`, `panel_id`, `contact_person_id`, `state_id`, `account_director_id`, `account_manager_id`, `opportunity_manager_id`, `project_manager_id`, `status`) VALUES
(1, '2021-04-20 12:44:05.590397', '2021-04-20 12:44:05.590397', NULL, 'Ecommerce website', 20000, '1', NULL, NULL, NULL, NULL, 1, 'abc tender', '12345', 20, 30, 70, 8, 1, 1, NULL, 1, NULL, NULL, NULL, NULL, 'O'),
(2, '2021-04-20 14:42:04.119680', '2021-04-20 14:44:24.000000', NULL, 'Service', 200, '1', '2021-04-05 14:41:55', '2021-04-30 14:41:57', '2021-04-06 14:42:00', '2021-04-20 14:39:33', 0, 'Sudoware', '+922983938', 10, 1, 1, NULL, 3, 1, NULL, 1, NULL, NULL, NULL, NULL, 'P');

-- --------------------------------------------------------

--
-- Table structure for table `opportunity_resources`
--

CREATE TABLE `opportunity_resources` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `panel_skill_id` int(11) NOT NULL,
  `panel_skill_standard_level_id` int(11) NOT NULL,
  `billable_hours` decimal(10,3) NOT NULL,
  `opportunity_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `opportunity_resources`
--

INSERT INTO `opportunity_resources` (`id`, `created_at`, `updated_at`, `deleted_at`, `panel_skill_id`, `panel_skill_standard_level_id`, `billable_hours`, `opportunity_id`) VALUES
(1, '2021-04-20 12:45:57.045586', '2021-04-20 12:45:57.045586', NULL, 1, 1, '10.000', 1),
(2, '2021-04-20 12:46:06.731220', '2021-04-20 12:46:06.731220', NULL, 2, 3, '1.000', 1),
(3, '2021-04-20 12:46:17.653614', '2021-04-20 12:46:17.653614', NULL, 1, 2, '10.000', 1);

-- --------------------------------------------------------

--
-- Table structure for table `opportunity_resource_allocations`
--

CREATE TABLE `opportunity_resource_allocations` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `opportunity_resource_id` int(11) NOT NULL,
  `selling_rate` decimal(10,3) DEFAULT NULL,
  `buying_rate` decimal(10,3) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `effort_rate` int(11) NOT NULL DEFAULT 0,
  `is_marked_as_selected` tinyint(4) NOT NULL DEFAULT 0,
  `contact_person_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `opportunity_resource_allocations`
--

INSERT INTO `opportunity_resource_allocations` (`id`, `created_at`, `updated_at`, `deleted_at`, `opportunity_resource_id`, `selling_rate`, `buying_rate`, `start_date`, `end_date`, `effort_rate`, `is_marked_as_selected`, `contact_person_id`) VALUES
(1, '2021-04-20 12:46:26.685434', '2021-04-20 12:47:17.000000', NULL, 1, '200.000', '30.000', NULL, NULL, 0, 1, 1),
(2, '2021-04-20 12:46:37.684139', '2021-04-20 12:46:37.684139', NULL, 1, '24.000', '20.000', NULL, NULL, 0, 0, 2),
(3, '2021-04-20 12:46:48.223225', '2021-04-20 12:46:48.223225', NULL, 2, '30.000', '10.000', NULL, NULL, 0, 0, 1),
(4, '2021-04-20 12:47:00.602446', '2021-04-20 12:47:18.000000', NULL, 2, '10.000', '10.000', NULL, NULL, 0, 1, 2),
(5, '2021-04-20 12:47:14.624241', '2021-04-20 12:47:19.000000', NULL, 3, '10.000', '30.000', NULL, NULL, 0, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `australian_business_number` varchar(255) DEFAULT NULL,
  `business_type` enum('1','2','3','4') NOT NULL,
  `tax_code` varchar(255) DEFAULT NULL,
  `current_financial_year_total_forecast` decimal(10,3) DEFAULT 0.000,
  `next_financial_year_total_forecast` decimal(10,3) DEFAULT 0.000,
  `invoice_email` varchar(255) DEFAULT NULL,
  `invoice_contact_number` varchar(255) DEFAULT NULL,
  `pi_insurer` varchar(255) DEFAULT NULL,
  `pl_insurer` varchar(255) DEFAULT NULL,
  `wc_insurer` varchar(255) DEFAULT NULL,
  `pi_policy_number` varchar(255) DEFAULT NULL,
  `pl_policy_number` varchar(255) DEFAULT NULL,
  `wc_policy_number` varchar(255) DEFAULT NULL,
  `pi_sum_insured` decimal(10,3) DEFAULT 0.000,
  `pl_sum_insured` decimal(10,3) DEFAULT 0.000,
  `wc_sum_insured` decimal(10,3) DEFAULT 0.000,
  `pi_insurance_expiry` datetime DEFAULT NULL,
  `pl_insurance_expiry` datetime DEFAULT NULL,
  `wc_insurance_expiry` datetime DEFAULT NULL,
  `parent_organization_id` int(11) DEFAULT NULL,
  `delegate_contact_person_organization_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `created_at`, `updated_at`, `deleted_at`, `name`, `phone_number`, `email`, `address`, `website`, `australian_business_number`, `business_type`, `tax_code`, `current_financial_year_total_forecast`, `next_financial_year_total_forecast`, `invoice_email`, `invoice_contact_number`, `pi_insurer`, `pl_insurer`, `wc_insurer`, `pi_policy_number`, `pl_policy_number`, `wc_policy_number`, `pi_sum_insured`, `pl_sum_insured`, `wc_sum_insured`, `pi_insurance_expiry`, `pl_insurance_expiry`, `wc_insurance_expiry`, `parent_organization_id`, `delegate_contact_person_organization_id`) VALUES
(1, '2021-04-20 12:59:25.078190', '2021-04-20 12:59:25.078190', NULL, '1LM', '+6287987', '9827837', 'Address ', '1lm.com', '', '3', '', '0.000', '0.000', '', '', '', '', '', '', '', '', '0.000', '0.000', '0.000', NULL, NULL, NULL, NULL, NULL),
(2, '2021-04-20 13:00:32.923432', '2021-04-20 13:00:32.923432', NULL, '5cube', '', '', '', '', '', '2', '', '0.000', '0.000', '', '', '', '', '', '', '', '', '0.000', '0.000', '0.000', NULL, NULL, NULL, NULL, NULL),
(3, '2021-04-20 12:43:55.818834', '2021-04-20 12:43:55.818834', NULL, 'AB Security', '+176456789', 'mqwet@absecurity.com', 'test address that is never to goiing to exist any way', 'https://absecurity.com', '123456', '1', '123456', '400000.000', '0.000', 'test@test.com', '+664543454', 'abd', '1qw', 'asdf', '123456', '123456', '123456', '1000.000', '1000.000', '1000.000', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `panels`
--

CREATE TABLE `panels` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `panels`
--

INSERT INTO `panels` (`id`, `created_at`, `updated_at`, `deleted_at`, `label`) VALUES
(1, '2021-04-20 12:54:20.927902', '2021-04-20 12:54:20.927902', NULL, '1LM'),
(2, '2021-04-20 12:43:51.123689', '2021-04-20 12:43:51.123689', NULL, 'Panel C');

-- --------------------------------------------------------

--
-- Table structure for table `panel_skills`
--

CREATE TABLE `panel_skills` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL,
  `standard_skill_id` int(11) DEFAULT NULL,
  `panel_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `panel_skills`
--

INSERT INTO `panel_skills` (`id`, `created_at`, `updated_at`, `deleted_at`, `label`, `standard_skill_id`, `panel_id`) VALUES
(1, '2021-04-20 12:55:51.124235', '2021-04-20 12:55:51.124235', NULL, 'Native Developer', 1, 1),
(2, '2021-04-20 12:57:20.087830', '2021-04-20 12:57:20.087830', NULL, 'Native Designer', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `panel_skill_standard_levels`
--

CREATE TABLE `panel_skill_standard_levels` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `level_label` varchar(255) NOT NULL,
  `short_term_ceil` decimal(10,3) NOT NULL DEFAULT 0.000,
  `long_term_ceil` decimal(10,3) NOT NULL DEFAULT 0.000,
  `panel_skill_id` int(11) DEFAULT NULL,
  `standard_level_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `panel_skill_standard_levels`
--

INSERT INTO `panel_skill_standard_levels` (`id`, `created_at`, `updated_at`, `deleted_at`, `level_label`, `short_term_ceil`, `long_term_ceil`, `panel_skill_id`, `standard_level_id`) VALUES
(1, '2021-04-20 12:55:51.128258', '2021-04-20 12:55:51.128258', NULL, 'Expert', '200.000', '300.000', 1, 4),
(2, '2021-04-20 12:55:51.131002', '2021-04-20 12:55:51.131002', NULL, 'Senior', '102.000', '200.000', 1, 3),
(3, '2021-04-20 12:57:20.092018', '2021-04-20 12:57:20.092018', NULL, 'Junior', '899.000', '2839.000', 2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `samples`
--

CREATE TABLE `samples` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `standard_levels`
--

CREATE TABLE `standard_levels` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `standard_levels`
--

INSERT INTO `standard_levels` (`id`, `created_at`, `updated_at`, `deleted_at`, `label`) VALUES
(1, '2021-04-20 12:51:10.534033', '2021-04-20 12:51:10.534033', NULL, 'Senior'),
(2, '2021-04-20 12:51:21.321582', '2021-04-20 12:51:21.321582', NULL, 'Junior'),
(3, '2021-04-20 12:51:34.429806', '2021-04-20 12:51:34.429806', NULL, 'Intern'),
(4, '2021-04-20 12:51:39.942561', '2021-04-20 12:51:39.942561', NULL, 'Lead');

-- --------------------------------------------------------

--
-- Table structure for table `standard_skills`
--

CREATE TABLE `standard_skills` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `standard_skills`
--

INSERT INTO `standard_skills` (`id`, `created_at`, `updated_at`, `deleted_at`, `label`) VALUES
(1, '2021-04-20 12:52:38.405723', '2021-04-20 12:52:38.405723', NULL, 'Developer'),
(2, '2021-04-20 12:53:12.955506', '2021-04-20 12:53:12.955506', NULL, 'Desioger');

-- --------------------------------------------------------

--
-- Table structure for table `standard_skill_standard_levels`
--

CREATE TABLE `standard_skill_standard_levels` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `standard_skill_id` int(11) DEFAULT NULL,
  `standard_level_id` int(11) DEFAULT NULL,
  `priority` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `standard_skill_standard_levels`
--

INSERT INTO `standard_skill_standard_levels` (`id`, `created_at`, `updated_at`, `deleted_at`, `standard_skill_id`, `standard_level_id`, `priority`) VALUES
(1, '2021-04-20 12:52:38.413806', '2021-04-20 12:52:38.413806', NULL, 1, 4, 1),
(2, '2021-04-20 12:52:38.417937', '2021-04-20 12:52:38.417937', NULL, 1, 1, 2),
(3, '2021-04-20 12:53:12.959856', '2021-04-20 12:53:12.959856', NULL, 2, 1, 1),
(4, '2021-04-20 12:53:12.968852', '2021-04-20 12:53:12.968852', NULL, 2, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `states`
--

INSERT INTO `states` (`id`, `created_at`, `updated_at`, `deleted_at`, `label`) VALUES
(1, '0000-00-00 00:00:00.000000', '0000-00-00 00:00:00.000000', NULL, 'Alabama');

-- --------------------------------------------------------

--
-- Table structure for table `leave_request_policies`
--

CREATE TABLE `leave_request_policies` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `leave_request_policy_leave_request_types`
--

CREATE TABLE `leave_request_policy_leave_request_types` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `leave_request_policy_id` int(11) NOT NULL,
  `leave_request_type_id` int(11) NOT NULL,
  `earn_hours` int(11) NOT NULL,
  `earn_every` enum('N','M','Y','EM','EY') NOT NULL,
  `reset_hours` int(11) NOT NULL,
  `reset_every` enum('N','M','Y','EM','EY') NOT NULL,
  `threshold` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `leave_request_types`
--

CREATE TABLE `leave_request_types` (
  `id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_cc20105b139589c697648c925c3` (`organization_id`),
  ADD KEY `FK_54020e3939d0c5ba1291d417921` (`employee_id`);

--
-- Indexes for table `calendars`
--
ALTER TABLE `calendars`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `calendar_holidays`
--
ALTER TABLE `calendar_holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_70ea83ba2ed4855b39d1a1bc6af` (`calendar_id`),
  ADD KEY `FK_348da17f1c1284cebd26fa9a626` (`holiday_type_id`);

--
-- Indexes for table `contact_persons`
--
ALTER TABLE `contact_persons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_bf098a56e685c8a2416371c48d6` (`state_id`),
  ADD KEY `FK_c66166898d2c2effe847aa10cd8` (`clearance_sponsor_id`);

--
-- Indexes for table `contact_person_organizations`
--
ALTER TABLE `contact_person_organizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_a92b0a8611370896910ca96bb4b` (`organization_id`),
  ADD KEY `FK_ac13c04d25a86dddf489fc58ad9` (`contact_person_id`);

--
-- Indexes for table `contact_person_standard_skill_standard_level`
--
ALTER TABLE `contact_person_standard_skill_standard_level`
  ADD PRIMARY KEY (`contactPersonsId`,`standardSkillStandardLevelsId`),
  ADD KEY `IDX_13419eb9942fd9a5ed7da64766` (`contactPersonsId`),
  ADD KEY `IDX_595209fce311d78badc6ade44e` (`standardSkillStandardLevelsId`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_31358a1a133482b25fe81b021e` (`username`),
  ADD UNIQUE KEY `REL_1bc1da6628a26dad7e37b6f05c` (`contact_person_organization_id`);

--
-- Indexes for table `employment_contracts`
--
ALTER TABLE `employment_contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_3a6fc0765b6b1a6676a3e0bf63c` (`employee_id`);

--
-- Indexes for table `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `holiday_types`
--
ALTER TABLE `holiday_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leases`
--
ALTER TABLE `leases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_523aa5808d4f206471cbeacb94b` (`employee_id`);

--
-- Indexes for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_bd0c6dbc38bfbc1e441e20b666c` (`organization_id`),
  ADD KEY `FK_d868bb2e5a98957d8654df3deef` (`panel_id`),
  ADD KEY `FK_3b99b877e6d79d6c2322a1f63d9` (`contact_person_id`),
  ADD KEY `FK_b688dce039e8bc989c9a17755ec` (`state_id`),
  ADD KEY `FK_0adb323b93898590d60578893fa` (`account_director_id`),
  ADD KEY `FK_cdf41621b4475aa672c0878f3bc` (`account_manager_id`),
  ADD KEY `FK_1b495148aa46ac6112dafb12667` (`opportunity_manager_id`),
  ADD KEY `FK_b7722b33917eb2d46bf2701513b` (`project_manager_id`);

--
-- Indexes for table `opportunity_resources`
--
ALTER TABLE `opportunity_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_7c6a39aaedb36e7c68cb789789d` (`panel_skill_id`),
  ADD KEY `FK_af66c23ca8241eb5c9cf660082d` (`panel_skill_standard_level_id`),
  ADD KEY `FK_fb6d65558a3f9b5b0483206284c` (`opportunity_id`);

--
-- Indexes for table `opportunity_resource_allocations`
--
ALTER TABLE `opportunity_resource_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_fb8480eb3c464cd05b29276fe2f` (`opportunity_resource_id`),
  ADD KEY `FK_9002ddbdfcb11a62423c1926204` (`contact_person_id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_b2942c2abac6a57dffac221431f` (`parent_organization_id`),
  ADD KEY `FK_ea7c37ea7af49ca216dfaf04eba` (`delegate_contact_person_organization_id`);

--
-- Indexes for table `panels`
--
ALTER TABLE `panels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `panel_skills`
--
ALTER TABLE `panel_skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_0c5a6931b5879ffc4190038d9b5` (`standard_skill_id`),
  ADD KEY `FK_a935f999ba61fbb6e699c474cfa` (`panel_id`);

--
-- Indexes for table `panel_skill_standard_levels`
--
ALTER TABLE `panel_skill_standard_levels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_13653078d3fb7433f1e5646dd77` (`panel_skill_id`),
  ADD KEY `FK_d1c70a2af2221b5dd8759c29a89` (`standard_level_id`);

--
-- Indexes for table `samples`
--
ALTER TABLE `samples`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `standard_levels`
--
ALTER TABLE `standard_levels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `standard_skills`
--
ALTER TABLE `standard_skills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `standard_skill_standard_levels`
--
ALTER TABLE `standard_skill_standard_levels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_ebeeb4b501e6926295a2b452b4b` (`standard_skill_id`),
  ADD KEY `FK_5515a8b76c3162bbdbebd368554` (`standard_level_id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_request_policies`
--
ALTER TABLE `leave_request_policies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_request_policy_leave_request_types`
--
ALTER TABLE `leave_request_policy_leave_request_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_521609c3a872273ba155b3f222f` (`leave_request_policy_id`),
  ADD KEY `FK_b27b20b1e0c035dfa3497404aec` (`leave_request_type_id`);

--
-- Indexes for table `leave_request_types`
--
ALTER TABLE `leave_request_types`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `calendars`
--
ALTER TABLE `calendars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `calendar_holidays`
--
ALTER TABLE `calendar_holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_persons`
--
ALTER TABLE `contact_persons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contact_person_organizations`
--
ALTER TABLE `contact_person_organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employment_contracts`
--
ALTER TABLE `employment_contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `global_settings`
--
ALTER TABLE `global_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holiday_types`
--
ALTER TABLE `holiday_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leases`
--
ALTER TABLE `leases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `opportunities`
--
ALTER TABLE `opportunities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `opportunity_resources`
--
ALTER TABLE `opportunity_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `opportunity_resource_allocations`
--
ALTER TABLE `opportunity_resource_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `panels`
--
ALTER TABLE `panels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `panel_skills`
--
ALTER TABLE `panel_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `panel_skill_standard_levels`
--
ALTER TABLE `panel_skill_standard_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `samples`
--
ALTER TABLE `samples`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `standard_levels`
--
ALTER TABLE `standard_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `standard_skills`
--
ALTER TABLE `standard_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `standard_skill_standard_levels`
--
ALTER TABLE `standard_skill_standard_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `leave_request_policies`
--
ALTER TABLE `leave_request_policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_request_policy_leave_request_types`
--
ALTER TABLE `leave_request_policy_leave_request_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_request_types`
--
ALTER TABLE `leave_request_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `FK_54020e3939d0c5ba1291d417921` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_cc20105b139589c697648c925c3` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `calendar_holidays`
--
ALTER TABLE `calendar_holidays`
  ADD CONSTRAINT `FK_348da17f1c1284cebd26fa9a626` FOREIGN KEY (`holiday_type_id`) REFERENCES `holiday_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_70ea83ba2ed4855b39d1a1bc6af` FOREIGN KEY (`calendar_id`) REFERENCES `calendars` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `contact_persons`
--
ALTER TABLE `contact_persons`
  ADD CONSTRAINT `FK_bf098a56e685c8a2416371c48d6` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_c66166898d2c2effe847aa10cd8` FOREIGN KEY (`clearance_sponsor_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `contact_person_organizations`
--
ALTER TABLE `contact_person_organizations`
  ADD CONSTRAINT `FK_a92b0a8611370896910ca96bb4b` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_ac13c04d25a86dddf489fc58ad9` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `contact_person_standard_skill_standard_level`
--
ALTER TABLE `contact_person_standard_skill_standard_level`
  ADD CONSTRAINT `FK_13419eb9942fd9a5ed7da64766c` FOREIGN KEY (`contactPersonsId`) REFERENCES `contact_persons` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_595209fce311d78badc6ade44ee` FOREIGN KEY (`standardSkillStandardLevelsId`) REFERENCES `standard_skill_standard_levels` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `FK_1bc1da6628a26dad7e37b6f05c1` FOREIGN KEY (`contact_person_organization_id`) REFERENCES `contact_person_organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `employment_contracts`
--
ALTER TABLE `employment_contracts`
  ADD CONSTRAINT `FK_3a6fc0765b6b1a6676a3e0bf63c` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `leases`
--
ALTER TABLE `leases`
  ADD CONSTRAINT `FK_523aa5808d4f206471cbeacb94b` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD CONSTRAINT `FK_0adb323b93898590d60578893fa` FOREIGN KEY (`account_director_id`) REFERENCES `employees` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_1b495148aa46ac6112dafb12667` FOREIGN KEY (`opportunity_manager_id`) REFERENCES `employees` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_3b99b877e6d79d6c2322a1f63d9` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_b688dce039e8bc989c9a17755ec` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_b7722b33917eb2d46bf2701513b` FOREIGN KEY (`project_manager_id`) REFERENCES `employees` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_bd0c6dbc38bfbc1e441e20b666c` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_cdf41621b4475aa672c0878f3bc` FOREIGN KEY (`account_manager_id`) REFERENCES `employees` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_d868bb2e5a98957d8654df3deef` FOREIGN KEY (`panel_id`) REFERENCES `panels` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `opportunity_resources`
--
ALTER TABLE `opportunity_resources`
  ADD CONSTRAINT `FK_7c6a39aaedb36e7c68cb789789d` FOREIGN KEY (`panel_skill_id`) REFERENCES `panel_skills` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_af66c23ca8241eb5c9cf660082d` FOREIGN KEY (`panel_skill_standard_level_id`) REFERENCES `panel_skill_standard_levels` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_fb6d65558a3f9b5b0483206284c` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `opportunity_resource_allocations`
--
ALTER TABLE `opportunity_resource_allocations`
  ADD CONSTRAINT `FK_9002ddbdfcb11a62423c1926204` FOREIGN KEY (`contact_person_id`) REFERENCES `contact_persons` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_fb8480eb3c464cd05b29276fe2f` FOREIGN KEY (`opportunity_resource_id`) REFERENCES `opportunity_resources` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `organizations`
--
ALTER TABLE `organizations`
  ADD CONSTRAINT `FK_b2942c2abac6a57dffac221431f` FOREIGN KEY (`parent_organization_id`) REFERENCES `organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_ea7c37ea7af49ca216dfaf04eba` FOREIGN KEY (`delegate_contact_person_organization_id`) REFERENCES `contact_person_organizations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `panel_skills`
--
ALTER TABLE `panel_skills`
  ADD CONSTRAINT `FK_0c5a6931b5879ffc4190038d9b5` FOREIGN KEY (`standard_skill_id`) REFERENCES `standard_skills` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_a935f999ba61fbb6e699c474cfa` FOREIGN KEY (`panel_id`) REFERENCES `panels` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `panel_skill_standard_levels`
--
ALTER TABLE `panel_skill_standard_levels`
  ADD CONSTRAINT `FK_13653078d3fb7433f1e5646dd77` FOREIGN KEY (`panel_skill_id`) REFERENCES `panel_skills` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_d1c70a2af2221b5dd8759c29a89` FOREIGN KEY (`standard_level_id`) REFERENCES `standard_levels` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `standard_skill_standard_levels`
--
ALTER TABLE `standard_skill_standard_levels`
  ADD CONSTRAINT `FK_5515a8b76c3162bbdbebd368554` FOREIGN KEY (`standard_level_id`) REFERENCES `standard_levels` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_ebeeb4b501e6926295a2b452b4b` FOREIGN KEY (`standard_skill_id`) REFERENCES `standard_skills` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `leave_request_policy_leave_request_types`
--
ALTER TABLE `leave_request_policy_leave_request_types`
  ADD CONSTRAINT `FK_521609c3a872273ba155b3f222f` FOREIGN KEY (`leave_request_policy_id`) REFERENCES `leave_request_policies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_b27b20b1e0c035dfa3497404aec` FOREIGN KEY (`leave_request_type_id`) REFERENCES `leave_request_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
