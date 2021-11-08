import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { Permission } from './permission';

@Entity("roles")
export class Role extends Base {

    @Column({ name: "label" })
    label: string;

    @Column({ name: "is_system", default: false })
    isSystem: boolean;

    @OneToMany(() => Permission, permission => permission.role, {
        cascade: true,
    })
    permissions: Permission[];
}