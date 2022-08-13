import { ExpenseTypeDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { ExpenseType } from '../entities/expenseType';

@EntityRepository(ExpenseType)
export class ExpenseTypeRepository extends Repository<ExpenseType> {
  async getAllActive(select = false): Promise<any> {
    if (select) {
      let response: { value: number; label: String }[] = [];
      const expenseTypes = await this.find();
      expenseTypes.forEach((type) => {
        response.push({
          value: type.id,
          label: type.label,
        });
      });

      return response;
    }
    return await this.find();
  }

  async createAndSave(expenseTypeDTO: ExpenseTypeDTO): Promise<any> {
    let expenseTypObj = new ExpenseType();
    expenseTypObj.label = expenseTypeDTO.label;
    return this.save(expenseTypObj);
  }

  async updateAndReturn(
    id: number,
    expenseTypeDTO: ExpenseTypeDTO
  ): Promise<any> {
    let expenseTypObj = await this.findOne(id);
    if (!expenseTypObj) {
      throw new Error('Expense Type not found');
    }
    expenseTypObj.label = expenseTypeDTO.label;
    return this.save(expenseTypObj);
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
