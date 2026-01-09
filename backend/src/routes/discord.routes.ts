import { Router, Request, Response } from "express";
import { DiscordService } from "../services/discord.service";

const router = Router();

export function createDiscordRoutes(discordService: DiscordService): Router {
  // Get all available channels
  router.get("/channels", async (req: Request, res: Response) => {
    try {
      const guildId = req.query.guildId as string | undefined;
      const channels = await discordService.getChannels(guildId);
      res.json(channels);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch channels" });
    }
  });

  // Get threads for a specific channel
  router.get(
    "/channels/:channelId/threads",
    async (req: Request, res: Response) => {
      try {
        const { channelId } = req.params;
        const threads = await discordService.getThreads(channelId);
        res.json(threads);
      } catch (error: any) {
        console.error("Error fetching threads:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to fetch threads" });
      }
    }
  );

  // Get messages from a specific thread
  router.get(
    "/threads/:threadId/messages",
    async (req: Request, res: Response) => {
      try {
        const { threadId } = req.params;
        const messages = await discordService.getThreadMessages(threadId);
        res.json(messages);
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to fetch messages" });
      }
    }
  );

  return router;
}
