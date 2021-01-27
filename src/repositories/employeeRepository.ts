import { ContactPersonDTO, EmployeeDTO } from "../dto";
import { EntityRepository, getRepository, Repository } from "typeorm";
import { ContactPerson } from "./../entities/contactPerson";
import { ContactPersonOrganization } from "./../entities/contactPersonOrganization";
import { State } from "./../entities/state";
import { StandardSkillStandardLevel } from "./../entities/standardSkillStandardLevel";
import { Organization } from "./../entities/organization";
import { Employee } from "./../entities/employee";
import { EmploymentContract } from "./../entities/employmentContract";
import { BankAccount } from "./../entities/bankAccount";

@EntityRepository(Employee)
export class EmployeeRepository extends Repository<Employee> {

    async createAndSave(employee: EmployeeDTO): Promise<any> {
        let id: number;
        id = await this.manager.transaction(async transactionalEntityManager => {            
            if(!employee.contactPersonOrganizationId) {
                throw Error("Must provide contact person");
            }
            let contactPersonOrganizationObj = await transactionalEntityManager.findOne(ContactPersonOrganization, employee.contactPersonOrganizationId, {
                relations: ["contactPerson"]
            });
            if(!contactPersonOrganizationObj) {
                throw Error("Must provide contact person");
            }
            let contactPersonObj = await transactionalEntityManager.findOne(ContactPerson, contactPersonOrganizationObj.contactPerson.id);
            if(!contactPersonObj) {
                throw Error("Must provide contact person");
            }
            
            contactPersonObj.firstName = employee.firstName;
            contactPersonObj.lastName = employee.lastName;
            contactPersonObj.email = employee.email;
            contactPersonObj.address = employee.address;
            contactPersonObj.gender = employee.gender;
            contactPersonObj.phoneNumber = employee.phoneNumber;
            if (employee.dateOfBirth)
            contactPersonObj.dateOfBirth = new Date(employee.dateOfBirth);

            let state: State | undefined;
            if (employee.stateId) {
                state = await transactionalEntityManager.findOne(State, employee.stateId);
                if (!state) {
                    throw new Error("State not found");
                }
                contactPersonObj.state = state;
            }
            await transactionalEntityManager.save(contactPersonObj);
            let employeeObj = new Employee();
            employeeObj.contactPersonOrganization = contactPersonOrganizationObj;
            employeeObj.nextOfKinName = employee.nextOfKinName;
            employeeObj.nextOfKinPhoneNumber = employee.nextOfKinPhoneNumber;
            employeeObj.nextOfKinEmail = employee.nextOfKinEmail;
            employeeObj.nextOfKinDateOfBirth = new Date(employee.nextOfKinDateOfBirth);
            employeeObj.nextOfKinRelation = employee.nextOfKinRelation;
            employeeObj.nextOfKinGender = employee.nextOfKinGender;
            employeeObj.tfn = employee.tfn;
            employeeObj.superAnnuationId = employee.superAnnuationId;
            employeeObj.superAnnuationName = employee.superAnnuationName;
            employeeObj.memberNumber = employee.memberNumber;
            employeeObj.smsfBankAccountId = employee.smsfBankAccountId;
            employeeObj.training = employee.training;
            employeeObj = await transactionalEntityManager.save(employeeObj);
            id = employeeObj.id;

            if(!employee.latestEmploymentContract) {
                throw Error("Must have contract info");
            }
            
            let employmentContract = new EmploymentContract();
            let {
                payslipEmail, membershipAccountNo,
                payFrequency, startDate, endDate, type, noOfHours,
                noOfHoursPer, remunerationAmount, remunerationAmountPer
            } = employee.latestEmploymentContract;
            
            employmentContract.payslipEmail = payslipEmail;
            employmentContract.membershipAccountNo = membershipAccountNo;
            employmentContract.payFrequency = payFrequency;
            employmentContract.startDate = new Date(startDate);
            if(endDate) {
                employmentContract.endDate = new Date(endDate);
            }
            employmentContract.type = type;
            employmentContract.noOfHours = noOfHours;
            employmentContract.noOfHoursPer = noOfHoursPer;
            employmentContract.remunerationAmount = remunerationAmount;
            employmentContract.remunerationAmountPer = remunerationAmountPer;
            employmentContract.employee = employeeObj;
            await transactionalEntityManager.save(employmentContract);
            let { bankName, bankAccountNo, bankBsb } = employee;
            let bankAccount = new BankAccount();
            bankAccount.accountNo = bankAccountNo;
            bankAccount.bsb = bankBsb;
            bankAccount.name = bankName;
            bankAccount.employee = employeeObj;
            await transactionalEntityManager.save(bankAccount);
            return employeeObj.id;
        });
        return await this.findOneCustom(id);
    }

    async getAllActive(): Promise<any[]> {
        return this.find({ relations: ["contactPersonOrganization", "contactPersonOrganization.contactPerson", "contactPersonOrganization.organization", "bankAccounts", "employmentContracts"] });
    }

    async getAllContactPersons(): Promise<any[]> {

        // return getRepository(ContactPerson)
        // .createQueryBuilder("contactPerson")
        // .innerJoinAndSelect("contactPerson.contactPersonOrganizations", "contactPersonOrganization", "contactPersonOrganization.organization.id = 1")
        // .leftJoinAndSelect("contactPersonOrganization.employee", "employee", "employee.contactPersonOrganization.id = contactPersonOrganization.id")
        // .leftJoinAndSelect(qb => qb.subQuery().select("e.*, MAX(e.startDate)", "max_date").from(EmploymentContract, "e").groupBy("e.employee.id"), "employmentContract", "employmentContract.employee_id = employee.id")
        // .printSql().getRawMany();
        
        return getRepository(ContactPerson)
        .createQueryBuilder("contactPerson")
        .innerJoinAndSelect("contactPerson.contactPersonOrganizations", "contactPersonOrganization", "contactPersonOrganization.organization.id = 1")
        .leftJoinAndSelect("contactPersonOrganization.employee", "employee", "employee.contactPersonOrganization.id = contactPersonOrganization.id")
        .leftJoinAndSelect("employee.employmentContracts", "employmentContract", "employmentContract.employee.id = employee.id")
        .getMany();
    }

    async updateAndReturn(id: number, employee: EmployeeDTO): Promise<any|undefined> {
        await this.manager.transaction(async transactionalEntityManager => {    
            let employeeObj = await this.findOneCustom(id);
            if(!employeeObj) {
                throw Error("Employee not found");
            }
            let contactPersonObj = await transactionalEntityManager.findOne(ContactPerson, employeeObj.contactPersonOrganization.contactPerson.id);
            if(!contactPersonObj) {
                throw Error("Employee not found");
            }
            
            contactPersonObj.firstName = employee.firstName;
            contactPersonObj.lastName = employee.lastName;
            contactPersonObj.email = employee.email;
            contactPersonObj.address = employee.address;
            contactPersonObj.gender = employee.gender;
            contactPersonObj.phoneNumber = employee.phoneNumber;
            if (employee.dateOfBirth)
            contactPersonObj.dateOfBirth = new Date(employee.dateOfBirth);

            let state: State | undefined;
            if (employee.stateId) {
                state = await transactionalEntityManager.findOne(State, employee.stateId);
                if (!state) {
                    throw new Error("State not found");
                }
                contactPersonObj.state = state;
            }
            await transactionalEntityManager.save(contactPersonObj);
            employeeObj.nextOfKinName = employee.nextOfKinName;
            employeeObj.nextOfKinPhoneNumber = employee.nextOfKinPhoneNumber;
            employeeObj.nextOfKinEmail = employee.nextOfKinEmail;
            employeeObj.nextOfKinDateOfBirth = new Date(employee.nextOfKinDateOfBirth);
            employeeObj.nextOfKinRelation = employee.nextOfKinRelation;
            employeeObj.nextOfKinGender = employee.nextOfKinGender;
            employeeObj.tfn = employee.tfn;
            employeeObj.superAnnuationId = employee.superAnnuationId;
            employeeObj.superAnnuationName = employee.superAnnuationName;
            employeeObj.memberNumber = employee.memberNumber;
            employeeObj.smsfBankAccountId = employee.smsfBankAccountId;
            employeeObj.training = employee.training;
            employeeObj = await transactionalEntityManager.save(employeeObj);
            
            if(!employee.latestEmploymentContract) {
                throw Error("Must have contract info");
            }
            
            let {
                payslipEmail, membershipAccountNo,
                payFrequency, startDate, endDate, type, noOfHours,
                noOfHoursPer, remunerationAmount, remunerationAmountPer
            } = employee.latestEmploymentContract;
            
            // find latest contract here
            let employmentContract = await transactionalEntityManager.getRepository(EmploymentContract)
            .createQueryBuilder("employmentContract").where(qb => {
                return "start_date = " + qb.subQuery().select("Max(start_date)").from("employment_contracts", 'e').where("employee_id = " + employeeObj.id).getSql();
            }).getOne();
            console.log("employmentContract: ", employmentContract);
            
            if(!employmentContract) {
                throw Error("Contract Not found");
            }
            employmentContract.payslipEmail = payslipEmail;
            employmentContract.membershipAccountNo = membershipAccountNo;
            employmentContract.payFrequency = payFrequency;
            employmentContract.startDate = new Date(startDate);
            if(endDate) {
                employmentContract.endDate = new Date(endDate);
            }
            employmentContract.type = type;
            employmentContract.noOfHours = noOfHours;
            employmentContract.noOfHoursPer = noOfHoursPer;
            employmentContract.remunerationAmount = remunerationAmount;
            employmentContract.remunerationAmountPer = remunerationAmountPer;
            employmentContract.employee = employeeObj;
            await transactionalEntityManager.save(employmentContract);
            let { bankName, bankAccountNo, bankBsb } = employee;
            let bankAccount = await transactionalEntityManager.getRepository(BankAccount).findOne({
                where: {
                    employee: {
                        id: employeeObj.id
                    }
                }
            });
            if(!bankAccount) {
                throw Error("Bank Account not found");
            }

            bankAccount.accountNo = bankAccountNo;
            bankAccount.bsb = bankBsb;
            bankAccount.name = bankName;
            bankAccount.employee = employeeObj;
            await transactionalEntityManager.save(bankAccount);
            return employeeObj.id;
        });
        return this.findOneCustom(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id, { relations: ["contactPersonOrganization", "contactPersonOrganization.contactPerson", "contactPersonOrganization.organization", "bankAccounts", "employmentContracts"] });
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }

}