import { Notification } from '../entities/notification';
import { StandardMailInterface } from '../utilities/interfaces';
import { BaseMail } from './baseMail';

export class ExpenseSheetMail
  extends BaseMail
  implements StandardMailInterface
{
  fileName: string;

  constructor(userName: string | String, content: string, url: string) {
    super();
    this.fileName = 'expenseSheetContent.html';
    this.subject = `Expense Sheet Update`;
    this.getHtml();
    this.getTemplate();
    this.replacements = {
      userName,
      content,
      url,
    };
    this.getMail();
  }
}
