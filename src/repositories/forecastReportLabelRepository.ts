import { EntityRepository, Repository } from 'typeorm';
import moment from 'moment-timezone';
import { ForecastReportLabelDTO, ForecastReportUpdateDTO } from '../dto';
import {
  ForecastReportLabelResponse,
  ForecastReportLabelsResponse,
} from '../responses/forecastReportLabelResponses';
import { ForecastReportLabel } from '../entities/forecastReportLabel';
import { ForecastReportLabelValue } from '../entities/forecastReportLabelValue';
import { ForecastReportResponse } from '../responses/forecastReportResponses';

@EntityRepository(ForecastReportLabel)
export class ForecastReportLabelRepository extends Repository<ForecastReportLabel> {
  async createAndSave(
    forecastReportLabelDTO: ForecastReportLabelDTO,
    userId: number
  ): Promise<any> {
    let labelObj = new ForecastReportLabel();
    labelObj.title = forecastReportLabelDTO.title;
    labelObj.createdBy = userId;
    labelObj.updatedBy = userId;
    let label = await this.save(labelObj);

    let responseLabel = await this.findOne(label.id, { relations: ['values'] });

    if (!responseLabel) {
      throw new Error('Label not found');
    }

    return new ForecastReportLabelResponse(responseLabel);
  }

  async getAllActive(): Promise<any> {
    let labels = await this.find({
      where: { isActive: true },
      relations: ['values'],
    });

    return new ForecastReportLabelsResponse(labels).labels;
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
    forecastReportUpdateDTO: ForecastReportUpdateDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      for (let title in forecastReportUpdateDTO) {
        let label = (
          await this.find({
            where: { title, isActive: true },
            relations: ['values'],
          })
        )[0];

        if (!label) continue;

        await transactionalEntityManager.remove(label.values);
        label.values = [];

        for (let span in forecastReportUpdateDTO[title]) {
          let momentObj = moment(span, 'MMM YY', true);
          if (!momentObj.isValid()) continue;

          let valueObj = new ForecastReportLabelValue();
          valueObj.value = forecastReportUpdateDTO[title][span];
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
    return new ForecastReportResponse(labels).labels;
  }
}
