import { BaseController, IRepository } from "./baseController";

export class SharedController<D, R extends IRepository<D>> extends BaseController<D, R> {
    
}