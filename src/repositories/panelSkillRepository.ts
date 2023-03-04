import { PanelSkillDTO, StandardLevelDTO } from '../dto';
import { EntityRepository, In, Repository } from 'typeorm';
import { StandardSkill } from './../entities/standardSkill';
import { StandardSkillStandardLevel } from './../entities/standardSkillStandardLevel';
import { StandardLevel } from './../entities/standardLevel';
import { PanelSkill } from '../entities/panelSkill';
import { Panel } from '../entities/panel';
import { PanelSkillStandardLevel } from '../entities/panelSkillStandardLevel';
import { OpportunityResource } from '../entities/opportunityResource';

@EntityRepository(PanelSkill)
export class PanelSkillRepository extends Repository<PanelSkill> {
  async createAndSave(panelSkill: PanelSkillDTO): Promise<any> {
    let id: number;
    id = await this.manager.transaction(async (transactionalEntityManager) => {
      let panelSkillObj = new PanelSkill();
      panelSkillObj.label = panelSkill.label;
      let standardSkill = await transactionalEntityManager.find(StandardSkill, {
        where: {
          id: panelSkill.standardSkillId,
        },
      });
      let panel = await transactionalEntityManager.find(Panel, {
        where: {
          id: panelSkill.panelId,
        },
      });
      if (!standardSkill.length) {
        throw new Error('Standard Skill not found');
      }
      if (!panel.length) {
        throw new Error('Panel not found');
      }
      console.log('lengths: ', panel.length, standardSkill.length);

      // panelSkillObj.standardSkill = standardSkill[0];
      // panelSkillObj.panel = panel[0];

      panelSkillObj.standardSkillId = standardSkill[0].id;
      panelSkillObj.panelId = panel[0].id;

      panelSkillObj = await transactionalEntityManager.save(panelSkillObj);
      id = panelSkillObj.id;
      let standardLevelList = await transactionalEntityManager.findByIds(
        StandardLevel,
        panelSkill.panelSkillStandardLevels.map((x) => x.standardLevelId)
      );
      console.log('standardLevelList.length: ', standardLevelList.length);

      let panelSkillStandardLevels = panelSkill.panelSkillStandardLevels.map(
        (panelSkillStandardLevel) => {
          let panelSkillStandardLevelObj = new PanelSkillStandardLevel();
          let standardLevel = standardLevelList.filter(
            (x) => x.id == panelSkillStandardLevel.standardLevelId
          );
          if (!standardLevel.length) {
            throw new Error('standardLevel not found!');
          }
          panelSkillStandardLevelObj.standardLevelId = standardLevel[0].id;
          panelSkillStandardLevelObj.levelLabel =
            panelSkillStandardLevel.levelLabel;
          panelSkillStandardLevelObj.shortTermCeil =
            panelSkillStandardLevel.shortTermCeil;
          panelSkillStandardLevelObj.longTermCeil =
            panelSkillStandardLevel.longTermCeil;
          panelSkillStandardLevelObj.panelSkillId = panelSkillObj.id;
          return panelSkillStandardLevelObj;
        }
      );

      panelSkillStandardLevels = await transactionalEntityManager.save(
        panelSkillStandardLevels
      );
      console.log('panelSkillStandardLevels: ', panelSkillStandardLevels);
      return panelSkillObj.id;
    });
    return await this.findOneCustom(id);
  }

  async getAllActive(options?: any): Promise<any[]> {
    let params: any = {
      relations: [
        'standardSkill',
        'panelSkillStandardLevels',
        'panelSkillStandardLevels.standardLevel',
      ],
    };
    if (options) {
      params = {
        ...params,
        where: {
          panel: {
            id: options.panelId,
          },
        },
      };
    }
    return this.find(params);
  }

  async updateAndReturn(
    id: number,
    panelSkill: PanelSkillDTO
  ): Promise<any | undefined> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      // console.log('wtf');
      let panelSkillObj = await this.findOneCustom(id);
      panelSkillObj.label = panelSkill.label;
      let standardSkill = await transactionalEntityManager.find(StandardSkill, {
        where: {
          id: panelSkill.standardSkillId,
        },
      });
      let panel = await transactionalEntityManager.find(Panel, {
        where: {
          id: panelSkill.panelId,
        },
      });
      if (!standardSkill.length) {
        throw new Error('Standard Skill not found');
      }
      if (!panel.length) {
        throw new Error('Panel not found');
      }
      console.log('lengths: ', panel.length, standardSkill.length);

      panelSkillObj.standardSkillId = standardSkill[0].id;
      panelSkillObj.panelId = panel[0].id;
      let standardLevelList = await transactionalEntityManager.findByIds(
        StandardLevel,
        panelSkill.panelSkillStandardLevels.map((x) => x.standardLevelId)
      );

      let panelSkillStandardLevelsPromise =
        panelSkill.panelSkillStandardLevels.map(
          async (panelSkillStandardLevel) => {
            let panelSkillStandardLevelObj: PanelSkillStandardLevel | undefined;
            let panelSkillStandardLevelObjFound =
              await transactionalEntityManager.find(PanelSkillStandardLevel, {
                relations: ['panelSkill'],
                where: {
                  id: panelSkillStandardLevel.id,
                },
              });
            if (!panelSkillStandardLevelObjFound.length) {
              panelSkillStandardLevelObj = new PanelSkillStandardLevel();
              // panelSkillStandardLevelObj.panelSkill = panelSkillObj;
              panelSkillStandardLevelObj.panelSkillId = panelSkillObj.id;
            } else {
              panelSkillStandardLevelObj = panelSkillStandardLevelObjFound[0];
            }
            console.log(
              'panelSkillStandardLevelObj - found or not: ',
              panelSkillStandardLevelObj
            );

            panelSkillStandardLevelObj.levelLabel =
              panelSkillStandardLevel.levelLabel;
            panelSkillStandardLevelObj.shortTermCeil =
              panelSkillStandardLevel.shortTermCeil;
            panelSkillStandardLevelObj.longTermCeil =
              panelSkillStandardLevel.longTermCeil;
            let standardLevel = standardLevelList.filter(
              (x) => x.id == panelSkillStandardLevel.standardLevelId
            );
            if (!standardLevel.length) {
              throw new Error('standardLevel not found!');
            }
            panelSkillStandardLevelObj.standardLevelId = standardLevel[0].id;
            // console.log(
            //   'HEREEE SDAKHUDHAKHD',
            //   panelSkillStandardLevelObj.standardLevelId
            // );
            // panelSkillStandardLevelObj.standardLevel = standardLevel[0];
            return panelSkillStandardLevelObj;
          }
        );
      let panelSkillStandardLevels = await Promise.all(
        panelSkillStandardLevelsPromise
      );
      // console.log('AIHDIKAHSDDHSHKSHDKAKH', panelSkillStandardLevels);

      panelSkillObj['panelSkillStandardLevels'] = panelSkillStandardLevels;
      await transactionalEntityManager.save(panelSkillObj);
    });
    return await this.findOneCustom(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, {
      relations: [
        'standardSkill',
        'panelSkillStandardLevels',
        'panelSkillStandardLevels.standardLevel',
      ],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    let panelSkill = await this.findOne(id, {
      relations: ['panelSkillStandardLevels'],
    });

    if (!panelSkill) {
      throw new Error('Panel Skill Not found ');
    }

    let panelSkillStandardLevelIds: Array<number> = [];

    for (let panelSkillStandardLevel of panelSkill.panelSkillStandardLevels) {
      panelSkillStandardLevelIds.push(panelSkillStandardLevel.id);
    }

    if (panelSkillStandardLevelIds.length) {
      let assignedToContactPerson = await this.manager.find(
        OpportunityResource,
        { where: { panelSkillStandardLevelId: In(panelSkillStandardLevelIds) } }
      );

      if (assignedToContactPerson.length) {
        throw new Error('Skill assigned in allocation');
      }
    }

    return this.softRemove(panelSkill);
  }
}
