import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';

@Entity('integration_auth')
export class IntegrationAuth extends Base {
  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({ name: 'id' })
  employee: Employee;

  @Column({ name: 'token_set', unique: true, nullable: true, type: 'text' })
  tokenSet: string | null; // unique refresh_token tool

  @Column({ name: 'tool_name', nullable: true })
  toolName: String; // token_type barrer

  // @Column({ name: 'id_token', unique: true, nullable: true, type: 'text' })
  // idToken: String| null; // unique id_token tool

  // @Column({ name: 'access_token', unique: true, nullable: true, type: 'text' })
  // accessToken: string| null; // unique access_token tool

  // @Column({ name: 'refresh_token', unique: true, nullable: true, type: 'text'  })
  // refreshToken: string| null; // unique refresh_token tool

  // @Column({ name: 'session_state', unique: true, nullable: true  })
  // sessionState: string; // unique session_state tool

  // @Column({ name: 'scope', nullable: true  })
  // scope: string; // password for login

  // @Column({ name: 'token_type', nullable: true  })
  // tokenType: String; // token_type barrer

  // @Column({ name: 'expiresIn', default: 0, type: 'numeric' })
  // expiresIn: number; // number
}
