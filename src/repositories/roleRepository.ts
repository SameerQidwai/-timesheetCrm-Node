import { Role } from './../entities/role';
import { EntityRepository, Repository } from 'typeorm';
import { PermissionDTO } from './../dto';
import { Permission } from './../entities/permission';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
  async createAndSave(role: any): Promise<any> {
    let obj = new Role();
    obj.label = role.label;
    return await this.save(obj);
  }

  async getAllActive(): Promise<any[]> {
    return this.find({
      relations: ['permissions'],
    });
  }

  async updateAndReturn(id: number, role: any): Promise<any | undefined> {
    // await this.update(id, role);
    await this.createQueryBuilder()
      .update(Role)
      .set(role)
      .where('id = :id', { id: id })
      .andWhere('isSystem = 0')
      .execute();
    return this.findOne(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id, {
      relations: ['permissions'],
    });
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }

  async updatePermissions(id: number, permissions: PermissionDTO[]) {
    let role: Role = await this.findOneCustom(id);
    console.log('role: ', role);
    if (!role || role.isSystem) {
      throw new Error('Role not found!');
    }
    let permissionObjects = permissions.map((p) => {
      let permission = new Permission();
      permission.action = p.action;
      permission.resource = p.resource;
      permission.grant = p.grant;
      permission.roleId = id;
      return permission;
    });
    role.permissions = permissionObjects;
    console.log('role2: ', role);

    await this.save(role);
    return this.findOneCustom(id);
  }

  async helperGetActiveRoles(): Promise<any[]> {
    let response: any = [];
    let roles = await this.find();

    console.log(roles);
    roles.forEach((role) => {
      let Obj: any = {};
      Obj.value = role.id;
      Obj.label = role.label;

      response.push(Obj);
    });

    return response;
  }
}
