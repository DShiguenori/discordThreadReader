import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { DiscordService } from "./services/discord.service";
import { createDiscordRoutes } from "./routes/discord.routes";
import { DatabaseService } from "./services/database.service";
import { createSummaryRoutes } from "./routes/summary.routes";
import { createConfigRoutes } from "./routes/config.routes";

// Configure dotenv to load from the backend directory
// Try multiple paths to find .env file
const possiblePaths: string[] = [
  path.resolve(process.cwd(), ".env"), // When running from backend/
];

// Add paths relative to __dirname if it exists (at runtime in CommonJS)
if (typeof __dirname !== "undefined") {
  possiblePaths.push(
    path.resolve(__dirname, "..", ".env"), // When running from dist/
    path.resolve(__dirname, ".env") // Fallback
  );
}

let envLoaded = false;
for (const envPath of possiblePaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    console.log(`✅ Loaded environment variables from: ${envPath}`);
    break;
  }
}

if (!envLoaded) {
  // Try default location as fallback
  dotenv.config();
  console.warn(
    "⚠️  No .env file found in expected locations, trying default dotenv.config()"
  );
}

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
  // Log environment variables (without exposing sensitive values)
  console.log("🔍 Checking Supabase configuration...");
  console.log(
    `   SUPABASE_URL: ${process.env.SUPABASE_URL ? "✓ Set" : "✗ Missing"}`
  );
  console.log(
    `   SUPABASE_ANON_KEY: ${
      process.env.SUPABASE_ANON_KEY
        ? `✓ Set (length: ${process.env.SUPABASE_ANON_KEY.length})`
        : "✗ Missing"
    }`
  );

  databaseService = new DatabaseService();
  console.log("✅ Database service initialized (Supabase)");
} catch (error: any) {
  console.error("❌ Database service initialization failed:");
  console.error(`   Error: ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
  console.warn("\n⚠️  Database service not initialized");
  console.warn("   Summaries will only be saved locally in the browser.");
  console.warn(
    "   To enable database storage, ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env"
  );
  console.warn(
    "   Make sure you've restarted the server after adding the .env file"
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
  app.use("/api", createConfigRoutes(databaseService));
  console.log("✅ Summary API routes enabled");
  console.log("✅ Config API routes enabled");
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
