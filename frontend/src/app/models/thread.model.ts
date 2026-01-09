export interface Thread {
  id: string;
  name: string;
  messageCount: number;
  lastActivity?: Date;
  channelId: string;
}
