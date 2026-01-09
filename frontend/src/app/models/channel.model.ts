export interface Channel {
  id: string;
  name: string;
  type: number; // Discord channel type
  guildId?: string;
}
