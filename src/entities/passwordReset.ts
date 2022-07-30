import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';

@Entity('password_resets')
export class PasswordReset extends Base {
  @Column({ name: 'email' })
  email: String;
  @Column({ name: 'token' })
  token: string;
  @Column({ name: 'used', default: false })
  used: boolean;
}
