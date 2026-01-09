import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzMessageModule, NzMessageService } from "ng-zorro-antd/message";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { ConfigService, Prompt } from "../../services/config.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-config",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule,
    NzSpinModule,
  ],
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.css"],
})
export class ConfigComponent implements OnInit {
  prompt: string = "";
  loading = false;
  saving = false;
  hasChanges = false;
  defaultPrompt = `Analyze the following Discord thread conversation and create a comprehensive summary.

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

  constructor(
    private configService: ConfigService,
    private message: NzMessageService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadPrompt();
  }

  async loadPrompt(): Promise<void> {
    this.loading = true;
    try {
      const savedPrompt = await firstValueFrom(
        this.configService.getPrompt("default")
      );
      this.prompt = savedPrompt.prompt;
      this.hasChanges = false;
    } catch (error: any) {
      // If 404, use default prompt
      if (error?.status === 404) {
        this.prompt = this.defaultPrompt;
        this.message.info(
          "No saved prompt found. Using default prompt. You can edit and save it."
        );
      } else {
        this.message.error("Failed to load prompt from database");
        console.error("Error loading prompt:", error);
        // Fallback to default prompt
        this.prompt = this.defaultPrompt;
      }
    } finally {
      this.loading = false;
    }
  }

  onPromptChange(): void {
    this.hasChanges = true;
  }

  async savePrompt(): Promise<void> {
    if (!this.prompt.trim()) {
      this.message.warning("Prompt cannot be empty");
      return;
    }

    this.saving = true;
    try {
      const promptData: Prompt = {
        key: "default",
        prompt: this.prompt.trim(),
      };
      await firstValueFrom(this.configService.savePrompt(promptData));
      this.message.success("Prompt saved successfully");
      this.hasChanges = false;
    } catch (error: any) {
      this.message.error(
        `Failed to save prompt: ${error?.message || "Unknown error"}`
      );
      console.error("Error saving prompt:", error);
    } finally {
      this.saving = false;
    }
  }

  resetToDefault(): void {
    this.prompt = this.defaultPrompt;
    this.hasChanges = true;
  }
}
