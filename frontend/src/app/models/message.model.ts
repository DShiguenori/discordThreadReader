export interface Attachment {
  id: string;
  filename: string;
  url: string;
  contentType?: string;
  size?: number;
}

export interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator?: string;
  };
  attachments: Attachment[];
  timestamp: Date;
  threadId: string;
}
