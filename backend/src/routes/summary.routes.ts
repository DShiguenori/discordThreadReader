import { Router, Request, Response } from "express";
import { DatabaseService } from "../services/database.service";

const router = Router();

export function createSummaryRoutes(databaseService: DatabaseService): Router {
  // Save a summary
  router.post("/summaries", async (req: Request, res: Response) => {
    try {
      const summary = req.body;
      const id = await databaseService.saveSummary(summary);
      res.status(201).json({ id, ...summary });
    } catch (error: any) {
      console.error("Error saving summary:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to save summary" });
    }
  });

  // Get all summaries
  router.get("/summaries", async (req: Request, res: Response) => {
    try {
      const summaries = await databaseService.getAllSummaries();
      res.json(summaries);
    } catch (error: any) {
      console.error("Error fetching summaries:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch summaries" });
    }
  });

  // Get a specific summary by ID
  router.get("/summaries/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const summary = await databaseService.getSummary(id);
      if (!summary) {
        return res.status(404).json({ error: "Summary not found" });
      }
      res.json(summary);
    } catch (error: any) {
      console.error("Error fetching summary:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch summary" });
    }
  });

  // Get summaries by channel
  router.get(
    "/summaries/channel/:channelId",
    async (req: Request, res: Response) => {
      try {
        const { channelId } = req.params;
        const summaries = await databaseService.getSummariesByChannel(
          channelId
        );
        res.json(summaries);
      } catch (error: any) {
        console.error("Error fetching summaries by channel:", error);
        res.status(500).json({
          error: error.message || "Failed to fetch summaries by channel",
        });
      }
    }
  );

  // Get summary by thread ID
  router.get(
    "/summaries/thread/:threadId",
    async (req: Request, res: Response) => {
      try {
        const { threadId } = req.params;
        const summary = await databaseService.getSummaryByThreadId(threadId);
        if (!summary) {
          return res.status(404).json({ error: "Summary not found" });
        }
        res.json(summary);
      } catch (error: any) {
        console.error("Error fetching summary by thread ID:", error);
        res.status(500).json({
          error: error.message || "Failed to fetch summary by thread ID",
        });
      }
    }
  );

  // Get summaries by category
  router.get(
    "/summaries/category/:category",
    async (req: Request, res: Response) => {
      try {
        const { category } = req.params;
        const summaries = await databaseService.getSummariesByCategory(
          category
        );
        res.json(summaries);
      } catch (error: any) {
        console.error("Error fetching summaries by category:", error);
        res.status(500).json({
          error: error.message || "Failed to fetch summaries by category",
        });
      }
    }
  );

  // Search summaries
  router.get(
    "/summaries/search/:query",
    async (req: Request, res: Response) => {
      try {
        const { query } = req.params;
        const summaries = await databaseService.searchSummaries(query);
        res.json(summaries);
      } catch (error: any) {
        console.error("Error searching summaries:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to search summaries" });
      }
    }
  );

  // Delete a summary
  router.delete("/summaries/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await databaseService.deleteSummary(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting summary:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to delete summary" });
    }
  });

  return router;
}
