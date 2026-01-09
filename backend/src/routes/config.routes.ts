import { Router, Request, Response } from "express";
import { DatabaseService, Prompt } from "../services/database.service";

const router = Router();

export function createConfigRoutes(databaseService: DatabaseService): Router {
  // Get the default prompt
  router.get("/config/prompt", async (req: Request, res: Response) => {
    try {
      const key = (req.query.key as string) || "default";
      const prompt = await databaseService.getPrompt(key);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error: any) {
      console.error("Error fetching prompt:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch prompt" });
    }
  });

  // Save or update a prompt
  router.post("/config/prompt", async (req: Request, res: Response) => {
    try {
      const promptData: Prompt = req.body;
      if (!promptData.key) {
        promptData.key = "default";
      }
      if (!promptData.prompt) {
        return res.status(400).json({ error: "Prompt content is required" });
      }
      const savedPrompt = await databaseService.savePrompt(promptData);
      res.json(savedPrompt);
    } catch (error: any) {
      console.error("Error saving prompt:", error);
      res.status(500).json({ error: error.message || "Failed to save prompt" });
    }
  });

  // Delete a prompt
  router.delete("/config/prompt", async (req: Request, res: Response) => {
    try {
      const key = (req.query.key as string) || "default";
      await databaseService.deletePrompt(key);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting prompt:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to delete prompt" });
    }
  });

  return router;
}
