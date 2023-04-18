export class WelcomeMail {
  public get(password: string): string {
    return `Hello,
    You have been invited to ${process.env.ORGANIZATION}. 
    Your registered account password is 123123123. Please visit ${process.env.ENV_URL} to login.
            
    Regards,
    ${process.env.ORGANIZATION} Support Team`;
  }
}
