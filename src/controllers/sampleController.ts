import { Sample } from "src/entities/sample";
import { SampleRepository } from "src/repositories/sampleRepository";
import { BaseController } from "./baseController";

export class SampleController extends BaseController<Sample, SampleRepository> {
    
}