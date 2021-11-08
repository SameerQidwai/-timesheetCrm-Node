import { Action, Grant, Resource } from './../constants/authorization';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { Role } from './role';

@Entity("permissions") 
export class Permission extends Base {

   @Column({ type: "varchar", length: "20", name: "resource" })
   resource: Resource;
   
   @Column({ type: "varchar", length: "20", name: "action" })
   action: Action;

   @Column({ type: "varchar", length: "20", name: "grant" })
   grant: Grant;

   @Column({ name: 'role_id', nullable: true })
   roleId: number;

   @ManyToOne(() => Role, role => role.permissions)
   @JoinColumn({ name: 'role_id' })
   role: Role;

}