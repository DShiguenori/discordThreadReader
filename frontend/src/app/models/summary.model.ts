import { Attachment } from "./message.model";

export interface Summary {
  id?: string;
  title: string;
  summary: string;
  keywords: string[];
  category: string;
  threadId: string;
  channelId: string;
  channelName?: string;
  threadName?: string;
  attachments: Attachment[];
  createdAt: Date;
}
