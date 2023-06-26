import { EntityRepository, Repository } from 'typeorm';
import moment from 'moment-timezone';
import { CashflowReportLabelDTO, CashflowReportUpdateDTO } from '../dto';
import {
  CashflowReportLabelResponse,
  CashflowReportLabelsResponse,
} from '../responses/cashflowReportLabelResponses';
import { CashflowReportLabel } from '../entities/cashflowReportLabel';
import { CashflowReportLabelValue } from '../entities/cashflowReportLabelValue';
import { CashflowReportResponse } from '../responses/cashflowReportResponses';

@EntityRepository(CashflowReportLabel)
export class CashflowReportLabelRepository extends Repository<CashflowReportLabel> {
  async createAndSave(
    cashflowReportLabelDTO: CashflowReportLabelDTO,
    userId: number
  ): Promise<any> {
    let labelObj = new CashflowReportLabel();
    labelObj.title = cashflowReportLabelDTO.title;
    labelObj.createdBy = userId;
    labelObj.updatedBy = userId;
    let label = await this.save(labelObj);

    let responseLabel = await this.findOne(label.id, { relations: ['values'] });

    if (!responseLabel) {
      throw new Error('Label not found');
    }

    return new CashflowReportLabelResponse(responseLabel);
  }

  async getAllActive(): Promise<any> {
    let labels = await this.find({
      where: { isActive: true },
      relations: ['values'],
    });

    return new CashflowReportLabelsResponse(labels).labels;
  }

  async getFYActive(startDate:string, endDate:string): Promise<any> {
    // let labels = await this.find({
    //   where: { isActive: true },
    //   relations: ['values'],
    // });

    const labels = await this.createQueryBuilder('label')
    .leftJoinAndSelect('label.values', 'values')
    .where('label.isActive = :isActive', { isActive: true })
    .andWhere(`STR_TO_DATE(CONCAT('01 ', values.span), '%d %b %y') BETWEEN :startDate AND :endDate`, {
      startDate: `${startDate}`, // Extract month and year from startDate
      endDate: `${endDate}`, // Extract month and year from endDate
    })
    .getMany();

    return new CashflowReportLabelsResponse(labels).labels;
  }

  async customDelete(title: String): Promise<any | undefined> {
    let label = (
      await this.find({
        where: { title, isActive: true },
        relations: ['values'],
      })
    )[0];
    if (!label) {
      throw new Error('Label not found!');
    }

    return this.softRemove(label);
  }

  async updateReport(
    cashflowReportUpdateDTO: CashflowReportUpdateDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      for (let title in cashflowReportUpdateDTO) {
        let label = (
          await this.find({
            where: { title, isActive: true },
            relations: ['values'],
          })
        )[0];

        if (!label) continue;

        await transactionalEntityManager.remove(label.values);
        label.values = [];

        for (let span in cashflowReportUpdateDTO[title]) {
          if (span == 'description') {
            label.description = cashflowReportUpdateDTO[title][span].toString();
          }

          let momentObj = moment(span, 'MMM YY', true);
          if (!momentObj.isValid()) continue;

          let valueObj = new CashflowReportLabelValue();
          valueObj.value = cashflowReportUpdateDTO[title][span];
          valueObj.span = span;
          valueObj.createdAt = moment().toDate();
          label.values.push(valueObj);
        }

        await transactionalEntityManager.save(label);
      }
    });
  }

  async getReport(startDate:string, endDate:string): Promise<any | undefined> {
    const labels = await this.createQueryBuilder('label')
    .leftJoinAndSelect('label.values', 'values')
    .where('label.isActive = :isActive', { isActive: true })
    .andWhere(`STR_TO_DATE(CONCAT('01 ', values.span), '%d %b %y') BETWEEN :startDate AND :endDate`, {
      startDate: `${startDate}`, // Extract month and year from startDate
      endDate: `${endDate}`, // Extract month and year from endDate
    })
    .getMany();
    return new CashflowReportResponse(labels).labels;
  }
}
