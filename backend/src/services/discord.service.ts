import {
  Client,
  GatewayIntentBits,
  Channel,
  ThreadChannel,
  TextChannel,
  Message,
  Collection,
} from "discord.js";

export class DiscordService {
  private client: Client;
  private isReady = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.once("ready", () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.on("error", (error) => {
      console.error("Discord client error:", error);
    });
  }

  async login(token: string): Promise<void> {
    if (!this.isReady) {
      try {
        await this.client.login(token);
        // Wait a bit for the ready event
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: any) {
        // Handle specific Discord.js errors with friendly messages
        if (error.code === "TokenInvalid") {
          throw new Error(
            "❌ Invalid Discord Bot Token!\n\n" +
              "The Discord bot token provided is invalid or has expired.\n" +
              "Please check your DISCORD_BOT_TOKEN in the .env file and ensure:\n" +
              "  • The token is correct and complete\n" +
              "  • The token hasn't been regenerated in Discord Developer Portal\n" +
              "  • There are no extra spaces or quotes around the token\n\n" +
              "To get a new token:\n" +
              "  1. Go to https://discord.com/developers/applications\n" +
              "  2. Select your application\n" +
              '  3. Go to "Bot" section\n' +
              '  4. Click "Reset Token" or copy the existing token\n' +
              "  5. Update your .env file with the new token"
          );
        } else if (error.code === "DisallowedIntents") {
          throw new Error(
            "❌ Missing Required Intents!\n\n" +
              "Your Discord bot is missing required gateway intents.\n" +
              "Please enable the following intents in Discord Developer Portal:\n" +
              "  • MESSAGE CONTENT INTENT (required for reading messages)\n" +
              "  • SERVER MEMBERS INTENT (if needed)\n\n" +
              "To enable intents:\n" +
              "  1. Go to https://discord.com/developers/applications\n" +
              "  2. Select your application\n" +
              '  3. Go to "Bot" section\n' +
              '  4. Scroll down to "Privileged Gateway Intents"\n' +
              '  5. Enable "MESSAGE CONTENT INTENT"\n' +
              "  6. Save changes and restart the server"
          );
        } else if (
          error.message?.includes("ENOTFOUND") ||
          error.message?.includes("ECONNREFUSED")
        ) {
          throw new Error(
            "❌ Connection Error!\n\n" +
              "Unable to connect to Discord servers.\n" +
              "Please check your internet connection and try again."
          );
        } else {
          // Generic error with original message for debugging
          throw new Error(
            `❌ Discord Login Failed!\n\n` +
              `Error: ${error.message || "Unknown error"}\n\n` +
              `Please check:\n` +
              `  • Your Discord bot token is valid\n` +
              `  • Your internet connection is working\n` +
              `  • Discord services are operational`
          );
        }
      }
    }
  }

  async getChannels(guildId?: string): Promise<any[]> {
    if (!this.isReady) {
      throw new Error("Discord client is not ready");
    }

    const channels: any[] = [];

    // If guildId is provided, get channels from that guild
    if (guildId) {
      const guild = this.client.guilds.cache.get(guildId);
      if (guild) {
        guild.channels.cache.forEach((channel) => {
          if (channel.isTextBased() && !channel.isThread()) {
            channels.push({
              id: channel.id,
              name: channel.name,
              type: channel.type,
              guildId: guild.id,
            });
          }
        });
      }
    } else {
      // Get channels from all guilds
      this.client.guilds.cache.forEach((guild) => {
        guild.channels.cache.forEach((channel) => {
          if (channel.isTextBased() && !channel.isThread()) {
            channels.push({
              id: channel.id,
              name: channel.name,
              type: channel.type,
              guildId: guild.id,
            });
          }
        });
      });
    }

    return channels;
  }

  async getThreads(channelId: string): Promise<any[]> {
    if (!this.isReady) {
      throw new Error("Discord client is not ready");
    }

    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error("Channel not found or is not a text channel");
    }

    const textChannel = channel as TextChannel;
    const threads: any[] = [];

    // Fetch active threads
    const activeThreads = await textChannel.threads.fetchActive();
    activeThreads.threads.forEach((thread) => {
      threads.push({
        id: thread.id,
        name: thread.name,
        messageCount: thread.messageCount || 0,
        lastActivity: thread.lastMessage?.createdAt,
        channelId: channelId,
      });
    });

    // Fetch archived threads
    const archivedThreads = await textChannel.threads.fetchArchived();
    archivedThreads.threads.forEach((thread) => {
      threads.push({
        id: thread.id,
        name: thread.name,
        messageCount: thread.messageCount || 0,
        lastActivity: thread.lastMessage?.createdAt,
        channelId: channelId,
      });
    });

    return threads;
  }

  async getThreadMessages(threadId: string): Promise<any[]> {
    if (!this.isReady) {
      throw new Error("Discord client is not ready");
    }

    const channel = await this.client.channels.fetch(threadId);
    if (!channel || !channel.isThread()) {
      throw new Error("Thread not found");
    }

    const thread = channel as ThreadChannel;
    const messages: Message[] = [];
    let lastId: string | undefined;

    // Fetch messages (Discord limits to 100 per request)
    while (true) {
      const options: any = { limit: 100 };
      if (lastId) {
        options.before = lastId;
      }

      const fetched = (await thread.messages.fetch(
        options
      )) as unknown as Collection<string, Message>;
      if (fetched.size === 0) {
        break;
      }

      messages.push(...Array.from(fetched.values()));
      lastId = fetched.last()?.id;

      if (fetched.size < 100) {
        break;
      }
    }

    // Reverse to get chronological order
    messages.reverse();

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        discriminator: msg.author.discriminator,
      },
      attachments: msg.attachments.map((att) => ({
        id: att.id,
        filename: att.name || "",
        url: att.url,
        contentType: att.contentType || undefined,
        size: att.size || undefined,
      })),
      timestamp: msg.createdAt,
      threadId: threadId,
    }));
  }

  disconnect(): void {
    this.client.destroy();
    this.isReady = false;
  }
}
