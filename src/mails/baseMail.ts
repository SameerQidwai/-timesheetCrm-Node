import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import path from 'path';
import { StandardMailInterface } from 'src/utilities/interfaces';

export class BaseMail implements StandardMailInterface {
  fileName: string;
  html: string;
  subject: string;
  template: HandlebarsTemplateDelegate;
  content: string;
  replacements: {};

  public getHtml(): string {
    const filePath = path.join(__dirname, `../mails/${this.fileName}`);
    this.html = readFileSync(filePath, 'utf-8').toString();
    return this.html;
  }

  public getTemplate() {
    this.template = compile(this.html);
    return this.template;
  }

  public getMail() {
    this.content = this.template(this.replacements);
    return this.content;
  }
}
