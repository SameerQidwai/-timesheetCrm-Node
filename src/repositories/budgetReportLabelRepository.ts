import { EntityRepository, Repository } from 'typeorm';
import moment from 'moment';
import { BudgetReportLabelDTO, BudgetReportUpdateDTO } from '../dto';
import {
  BudgetReportLabelResponse,
  BudgetReportLabelsResponse,
} from '../responses/budgetReportLabelResponses';
import { BudgetReportLabel } from '../entities/budgetReportLabel';
import { BudgetReportLabelValue } from '../entities/budgetReportLabelValue';
import { BudgetReportResponse } from '../responses/budgetReportResponses';

@EntityRepository(BudgetReportLabel)
export class BudgetReportLabelRepository extends Repository<BudgetReportLabel> {
  async createAndSave(
    budgetReportLabelDTO: BudgetReportLabelDTO,
    userId: number
  ): Promise<any> {
    let labelObj = new BudgetReportLabel();
    labelObj.title = budgetReportLabelDTO.title;
    labelObj.createdBy = userId;
    labelObj.updatedBy = userId;
    let label = await this.save(labelObj);

    let responseLabel = await this.findOne(label.id, { relations: ['values'] });

    if (!responseLabel) {
      throw new Error('Label not found');
    }

    return new BudgetReportLabelResponse(responseLabel);
  }

  async getAllActive(): Promise<any> {
    let labels = await this.find({
      where: { isActive: true },
      relations: ['values'],
    });

    return new BudgetReportLabelsResponse(labels).labels;
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
    budgetReportUpdateDTO: BudgetReportUpdateDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      for (let title in budgetReportUpdateDTO) {
        let label = (
          await this.find({
            where: { title, isActive: true },
            relations: ['values'],
          })
        )[0];

        if (!label) continue;

        await transactionalEntityManager.remove(label.values);
        label.values = [];

        for (let span in budgetReportUpdateDTO[title]) {
          let valueObj = new BudgetReportLabelValue();
          valueObj.value = budgetReportUpdateDTO[title][span];
          valueObj.span = span;
          valueObj.createdAt = moment().toDate();
          label.values.push(valueObj);
        }

        await transactionalEntityManager.save(label);
      }
    });
  }

  async getReport(): Promise<any | undefined> {
    let labels = await this.find({
      where: { isActive: true },
      relations: ['values'],
    });
    return new BudgetReportResponse(labels).labels;
  }
}
