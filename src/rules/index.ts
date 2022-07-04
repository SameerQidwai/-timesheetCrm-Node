import { BaseRule } from './baseRules';
import contactPersonXLSXRules from './contactPersonXLSXRules';
import employeeXLSXRules from './employeeXLSXRules';
import leaveRequestRules from './leaveRequestRules';
import opportunityXLSXRules from './opportunityXLSXRules';
import organizationXLSXRules from './organizationXLSXRules';
import projectXLSXRules from './projectXLSXRules';
import subContractorXLSXRules from './subContractorXLSXRules';

export let leaveRequestValidator: BaseRule = leaveRequestRules;
export let organizationXLSXValidator: BaseRule = organizationXLSXRules;
export let contactPersonXLSXValidator: BaseRule = contactPersonXLSXRules;
export let opportunityXLSXValidator: BaseRule = opportunityXLSXRules;
export let projectXLSXValidator: BaseRule = projectXLSXRules;
export let employeeXLSXValidator: BaseRule = employeeXLSXRules;
export let subContractorXLSXValidator: BaseRule = subContractorXLSXRules;
