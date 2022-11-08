import { Attachment } from '../entities/attachment';

export class AttachmentResponse {
  id: number;
  createdAt: Date;
  fileId: number;
  uid: string;
  name: string;
  type: string;
  url: string;
  userId: number;
  thumbUrl: string;

  constructor(attachment: Attachment) {
    this.id = attachment.id;
    this.createdAt = attachment.createdAt;
    this.fileId = attachment.fileId;
    this.uid = attachment.file.uniqueName;
    this.name = attachment.file.originalName;
    this.type = attachment.file.type;
    this.url = `files/${attachment.file.uniqueName}`;
    this.userId = attachment.userId;
    this.thumbUrl = this.thumbUrlGenerator(attachment.file.type);
  }

  thumbUrlGenerator(type: string) {
    if (type === 'pdf') {
      return '/icons/pdf.png';
    } else if (type === 'doc' || type === 'docx') {
      return '/icons/doc.png';
    } else if (type === 'xls' || type === 'xlsx') {
      return '/icons/xls.png';
    } else if (type === 'ppt' || type === 'pptx') {
      return '/icons/ppt.png';
    } else if (type === 'csv') {
      return '/icons/csv.png';
    } else if (/(webp|svg|png|gif|jpg|jpeg|jfif|bmp|dpg|ico)$/i.test(type)) {
      return '/icons/img.png';
    } else {
      return '/icons/default.png';
    }
  }
}

export class AttachmentsResponse {
  attachments: AttachmentResponse[] = [];

  constructor(attachments: Attachment[]) {
    attachments.forEach((attachment) => {
      this.attachments.push(new AttachmentResponse(attachment));
    });
  }
}
