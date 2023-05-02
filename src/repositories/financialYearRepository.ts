import { EntityRepository, In, LessThan, Repository } from 'typeorm';
import { FinancialYear } from '../entities/financialYear';
import { FinancialYearDTO } from '../dto';
import moment from 'moment';
import { Opportunity } from '../entities/opportunity';

@EntityRepository(FinancialYear)
export class FinancialYearRepository extends Repository<FinancialYear> {
  async getAllActive(): Promise<any> {
    let years = await this.find({});

    return years;
  }

  async createAndSave(
    financialYearDTO: FinancialYearDTO,
    userId: number
  ): Promise<any> {
    let years = await this.find({
      order: { endDate: 'DESC' },
    });

    let { label } = financialYearDTO;

    const startDate = moment(financialYearDTO.startDate).startOf('day');
    const endDate = moment(financialYearDTO.endDate).endOf('day');

    let lastClosedFinancialYear = await this.findOne({
      order: { endDate: 'DESC' },
      where: { closed: true },
    });

    if (lastClosedFinancialYear) {
      if (moment(lastClosedFinancialYear.endDate).isAfter(startDate, 'date')) {
        throw new Error('Cannot create year before last closed year');
      }
    }

    if (years.length) {
      const lastYear = years[0];
      const firstYear = years[years.length - 1];

      const firstYearStartDate = moment(firstYear.startDate);
      const lastYearEndDate = moment(lastYear.endDate);

      if (
        !startDate.isAfter(lastYearEndDate, 'date') &&
        !endDate.isBefore(firstYearStartDate, 'date')
      ) {
        throw new Error('Years Cannot Overlap');
      }

      if (
        (endDate.isBefore(firstYearStartDate, 'date') &&
          !endDate.isSame(
            firstYearStartDate.subtract(1, 'day').startOf('day'),
            'date'
          )) ||
        (startDate.isAfter(lastYearEndDate, 'date') &&
          !startDate.isSame(lastYearEndDate.add(1, 'day'), 'date'))
      ) {
        throw new Error('Gap is not allowed between Financial Years');
      }
    }

    if (startDate.isSameOrAfter(endDate)) {
      throw new Error('Incorrect date range');
    }

    let year = new FinancialYear();

    year.label = label;
    year.startDate = moment(startDate).toDate();
    year.endDate = moment(endDate).toDate();

    // return 'hi';
    return this.save(year);
  }

  async closeYear(id: number, userId: number): Promise<any> {
    if (!id) throw new Error('Year not found');

    await this.manager.transaction(async (transactionalEntityManager) => {
      let year = await this.findOne(id);

      if (!year) throw new Error('Year not found');

      if (year.closed) throw new Error('Year is already closed');

      let years = await this.find({
        where: { endDate: LessThan(year.startDate) },
      });

      for (let loopYear of years) {
        if (!loopYear.closed) {
          throw new Error('All the previous years are required to be closed');
        }
      }

      //Closing same year projects
      let projects = await this.manager.find(Opportunity, {
        where: { status: In(['P', 'C']) },
      });

      let savingProjects: Opportunity[] = [];

      for (let project of projects) {
        const projectStartDate = moment(project.startDate);
        const projectEndDate = moment(project.endDate);

        if (
          projectStartDate.isBetween(
            year.startDate,
            year.endDate,
            'date',
            '[]'
          ) &&
          projectEndDate.isBetween(
            year.startDate,
            year.endDate,
            'date',
            '[]'
          ) &&
          project.phase
        ) {
          project.phase = false;
          savingProjects.push(project);
        }
      }

      await transactionalEntityManager.save(savingProjects);

      year.closed = true;
      year.closedBy = userId;
      year.closedAt = moment().toDate();

      return transactionalEntityManager.save(year);
    });
  }
}
