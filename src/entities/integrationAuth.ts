import { Entity, Column, JoinColumn, ManyToOne, getRepository, Repository } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { TokenSet, XeroClient } from 'xero-node';
import dotenv from 'dotenv';
dotenv.config();
@Entity('integration_auth')
export class IntegrationAuth extends Base {
  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({ name: 'userId' })
  employee: Employee;

  @Column({ name: 'token_set', nullable: true, type: 'json' })
  tokenSet: object | null; // unique refresh_token tool

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
  public async getXeroToken(): Promise<{xero: any, tenantId:string|null}> {
    const xero = new XeroClient();
    await xero.initialize();

    // Retrieve tokenSet from the database (assuming you have a repository for IntegrationAuthToken)
    // const integration: IntegrationAuth | undefined = await integrationRepository.findOne({toolName: 'xero'});
    if (this.toolName !== 'xero'){
      return {xero: null, tenantId: null}
    }
    
    if ( !this.tokenSet) {
      return {xero: null, tenantId: null};
    }
    
    // let tenantId = this.tokenSet?.tenantId
    let tokenSet = this.tokenSet as TokenSet;
    await xero.setTokenSet(tokenSet);
    let readTokenSet = await xero.readTokenSet();
    
    if (readTokenSet.expired()) {
      tokenSet = await xero.refreshWithRefreshToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET, tokenSet.refresh_token)
      try {
        const integrationRepository = getRepository(IntegrationAuth);
        let insert = await integrationRepository.update({toolName: 'xero'}, {tokenSet: tokenSet});
        
      }catch (e){
        console.log(e)
        return {xero, tenantId: ''}
      }
    }
    await xero.setTokenSet(tokenSet);
    await xero.updateTenants(false)
    const tenantId = xero.tenants[0].tenantId; 

    return {xero, tenantId};
  }
}

