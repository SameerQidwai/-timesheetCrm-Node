import { Action, Grant, Resource } from './../constants/authorization';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { Role } from './role';

@Entity("permissions") 
export class Permission extends Base {

   @Column({ name: "resource" })
   resource: Resource;
   
   @Column({ name: "action" })
   action: Action;

   @Column({ name: "grant" })
   grant: Grant;

   @Column({ name: 'role_id', nullable: true })
   roleId: number;

   @ManyToOne(() => Role, role => role.permissions)
   @JoinColumn({ name: 'role_id' })
   role: Role;

}