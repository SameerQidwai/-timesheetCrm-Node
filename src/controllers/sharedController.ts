import { BaseController, IRepository } from "./baseController";

export class SharedController<E, R extends IRepository<E>> extends BaseController<E, R> {
    
}