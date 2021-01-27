import { EmployeeDTO } from "./../dto";
import { BaseController } from "./baseController";
import { EmployeeRepository } from "./../repositories/employeeRepository";
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";

export class EmployeeController extends BaseController<EmployeeDTO, EmployeeRepository> {
    
    async contactPersons(req: Request, res: Response) {
        const repository= getCustomRepository(EmployeeRepository);        
        let records = await repository.getAllContactPersons();
        console.log("records: ", records);
        res.status(200).json({
            success: true,
            message: "Get ALL",
            data: records
        });
    }
    
}