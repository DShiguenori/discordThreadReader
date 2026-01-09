import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Message, Attachment } from "../models/message.model";
import { Summary } from "../models/summary.model";
import { ConfigService } from "./config.service";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SummaryService {
  private openaiApiKey = environment.openaiApiKey;
  private openaiApiUrl = "https://api.openai.com/v1/chat/completions";

  private defaultPrompt = `Analyze the following Discord thread conversation and create a comprehensive summary.

Thread Context:
- Channel: {{channelName}}
- Thread: {{threadName}}

Conversation:
{{messagesText}}

Please provide a JSON response with the following structure:
{
  "title": "A concise, descriptive title for this discussion",
  "summary": "A detailed summary of what was discussed, including key points and decisions",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "One of: Technical, Discussion, Question, Announcement, Planning, Bug Report, Feature Request, Other"
}

Include references to any attachments or files mentioned in the conversation.`;

  constructor(private configService: ConfigService) {}

  async generateSummary(
    messages: Message[],
    threadId: string,
    channelId: string,
    channelName?: string,
    threadName?: string
  ): Promise<Summary> {
    if (!this.openaiApiKey || this.openaiApiKey.trim() === "") {
      throw new Error(
        "❌ OpenAI API Key Not Configured!\n\n" +
          "Please add your OpenAI API key to the environment.ts file.\n\n" +
          "To get your API key:\n" +
          "  1. Go to https://platform.openai.com/api-keys\n" +
          "  2. Click '+ Create new secret key'\n" +
          "  3. Copy the full key (starts with 'sk-')\n" +
          "  4. Update frontend/src/environments/environment.ts"
      );
    }

    // Validate key format (OpenAI keys start with 'sk-' and are typically 40+ characters)
    const trimmedKey = this.openaiApiKey.trim();
    if (!trimmedKey.startsWith("sk-") || trimmedKey.length < 20) {
      throw new Error(
        "❌ Invalid OpenAI API Key Format!\n\n" +
          "The API key appears to be incomplete or incorrectly formatted.\n\n" +
          "OpenAI API keys:\n" +
          "  • Start with 'sk-' or 'sk-proj-'\n" +
          "  • Are typically 40-60+ characters long\n" +
          "  • Should not contain spaces or quotes\n\n" +
          "Please check your key in environment.ts and ensure you copied the complete key."
      );
    }

    // Prepare messages content
    const messagesText = messages
      .map((msg) => {
        const attachmentsInfo =
          msg.attachments.length > 0
            ? `\n[Attachments: ${msg.attachments
                .map((a) => a.filename)
                .join(", ")}]`
            : "";
        return `[${msg.author.username}]: ${msg.content}${attachmentsInfo}`;
      })
      .join("\n\n");

    // Collect all attachments
    const allAttachments: Attachment[] = [];
    messages.forEach((msg) => {
      allAttachments.push(...msg.attachments);
    });

    // Get prompt from database or use default
    let promptTemplate = this.defaultPrompt;
    try {
      const savedPrompt = await firstValueFrom(
        this.configService.getPrompt("default")
      );
      if (savedPrompt && savedPrompt.prompt) {
        promptTemplate = savedPrompt.prompt;
      }
    } catch (error) {
      // If error (e.g., 404), use default prompt
      console.log("Using default prompt (no saved prompt found)");
    }

    // Replace placeholders in the prompt template
    const prompt = promptTemplate
      .replace(/\{\{channelName\}\}/g, channelName || "Unknown")
      .replace(/\{\{threadName\}\}/g, threadName || "Unknown")
      .replace(/\{\{messagesText\}\}/g, messagesText);

    try {
      const response = await fetch(this.openaiApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o", // Using gpt-4o (more accessible) instead of gpt-4
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that analyzes Discord conversations and creates structured summaries. Always respond with valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate summary";
        try {
          const error = await response.json();
          const openaiError = error.error;

          if (openaiError) {
            // Handle specific OpenAI error codes
            if (
              openaiError.code === "invalid_api_key" ||
              response.status === 401
            ) {
              errorMessage =
                "❌ Invalid OpenAI API Key!\n\n" +
                "The API key provided is invalid or has been revoked.\n\n" +
                "Please check:\n" +
                "  • Your API key is correct and complete\n" +
                "  • The key hasn't been deleted or regenerated\n" +
                "  • There are no extra spaces or quotes around the key\n\n" +
                "To get a new key:\n" +
                "  1. Go to https://platform.openai.com/api-keys\n" +
                "  2. Click '+ Create new secret key'\n" +
                "  3. Copy the key immediately (you can only see it once)\n" +
                "  4. Update your environment.ts file with the new key";
            } else if (
              openaiError.code === "insufficient_quota" ||
              response.status === 429
            ) {
              errorMessage =
                "❌ API Quota Exceeded!\n\n" +
                "You've exceeded your OpenAI API quota or rate limit.\n\n" +
                "Please check:\n" +
                "  • Your OpenAI account has available credits\n" +
                "  • You haven't exceeded your usage limits\n" +
                "  • Visit https://platform.openai.com/usage to check your usage";
            } else if (
              openaiError.message?.includes("does not exist") ||
              openaiError.message?.includes("you do not have access")
            ) {
              errorMessage =
                "❌ Model Access Error!\n\n" +
                `${openaiError.message}\n\n` +
                "The model you're trying to use is not available for your account.\n\n" +
                "Available models you can use:\n" +
                "  • gpt-4o (recommended - latest GPT-4)\n" +
                "  • gpt-4o-mini (faster, cheaper)\n" +
                "  • gpt-3.5-turbo (most accessible)\n\n" +
                "The application will try to use 'gpt-4o' by default.\n" +
                "If you need a different model, check your OpenAI account access.";
            } else if (openaiError.message) {
              errorMessage = `❌ OpenAI API Error: ${openaiError.message}`;
            } else {
              errorMessage = `❌ OpenAI API Error (${response.status}): ${
                openaiError.code || "Unknown error"
              }`;
            }
          } else {
            errorMessage = `❌ API Request Failed (${response.status}): ${response.statusText}`;
          }
        } catch (parseError) {
          // If we can't parse the error, use the status
          errorMessage = `❌ API Request Failed (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const summaryData = JSON.parse(data.choices[0].message.content);

      const summary: Summary = {
        title: summaryData.title,
        summary: summaryData.summary,
        keywords: summaryData.keywords || [],
        category: summaryData.category || "Other",
        threadId,
        channelId,
        channelName,
        threadName,
        attachments: allAttachments,
        createdAt: new Date(),
      };

      return summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      throw error;
    }
  }
}
