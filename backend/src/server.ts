import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DiscordService } from "./services/discord.service";
import { createDiscordRoutes } from "./routes/discord.routes";
import { DatabaseService } from "./services/database.service";
import { createSummaryRoutes } from "./routes/summary.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json());

// Initialize Discord service
const discordService = new DiscordService();

// Initialize Database service (optional - only if Supabase is configured)
let databaseService: DatabaseService | null = null;
try {
  databaseService = new DatabaseService();
  console.log("✅ Database service initialized (Supabase)");
} catch (error: any) {
  console.warn("⚠️  Database service not initialized:", error.message);
  console.warn("   Summaries will only be saved locally in the browser.");
  console.warn(
    "   To enable database storage, set SUPABASE_URL and SUPABASE_ANON_KEY in .env"
  );
}

// Discord bot token from environment
const discordToken = process.env.DISCORD_BOT_TOKEN;

if (!discordToken) {
  console.error("ERROR: DISCORD_BOT_TOKEN environment variable is not set!");
  console.error("Please set DISCORD_BOT_TOKEN in your .env file");
  process.exit(1);
}

// Login to Discord
discordService.login(discordToken).catch((error) => {
  console.error("\n" + "=".repeat(60));
  console.error("🚨 DISCORD CONNECTION ERROR");
  console.error("=".repeat(60));
  console.error("\n" + error.message);
  console.error("\n" + "=".repeat(60));
  console.error(
    "\nServer startup aborted. Please fix the issue above and try again.\n"
  );
  process.exit(1);
});

// Routes
app.use("/api", createDiscordRoutes(discordService));

// Summary routes (only if database is configured)
if (databaseService) {
  app.use("/api", createSummaryRoutes(databaseService));
  console.log("✅ Summary API routes enabled");
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  discordService.disconnect();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  discordService.disconnect();
  process.exit(0);
});
