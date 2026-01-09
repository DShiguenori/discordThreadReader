import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { ChannelSelectorComponent } from "./components/channel-selector/channel-selector.component";
import { ThreadSelectorComponent } from "./components/thread-selector/thread-selector.component";
import { SummaryViewerComponent } from "./components/summary-viewer/summary-viewer.component";
import { SummaryListComponent } from "./components/summary-list/summary-list.component";
import { DiscordService } from "./services/discord.service";
import { SummaryService } from "./services/summary.service";
import { Channel } from "./models/channel.model";
import { Thread } from "./models/thread.model";
import { Summary } from "./models/summary.model";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    ChannelSelectorComponent,
    ThreadSelectorComponent,
    SummaryViewerComponent,
    SummaryListComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Discord Topic Reader";
  selectedChannel: Channel | null = null;
  selectedThread: Thread | null = null;
  summary: Summary | null = null;
  generatingSummary = false;
  currentView: "main" | "summaries" = "main";

  constructor(
    private discordService: DiscordService,
    private summaryService: SummaryService
  ) {}

  onChannelSelected(channel: Channel): void {
    this.selectedChannel = channel;
    this.selectedThread = null;
    this.summary = null;
  }

  onThreadSelected(thread: Thread): void {
    this.selectedThread = thread;
    this.summary = null;
    this.generateSummary();
  }

  async generateSummary(): Promise<void> {
    if (!this.selectedThread || !this.selectedChannel) {
      return;
    }

    this.generatingSummary = true;
    try {
      const messages = await firstValueFrom(
        this.discordService.getThreadMessages(this.selectedThread.id)
      );
      if (!messages) {
        throw new Error("No messages received");
      }

      this.summary = await this.summaryService.generateSummary(
        messages,
        this.selectedThread.id,
        this.selectedChannel.id,
        this.selectedChannel.name,
        this.selectedThread.name
      );
    } catch (error: any) {
      console.error("Error generating summary:", error);
      // Show the detailed error message from the service
      const errorMessage =
        error?.message ||
        "Failed to generate summary. Please check your OpenAI API key and try again.";
      alert(errorMessage);
    } finally {
      this.generatingSummary = false;
    }
  }

  onSummarySaved(): void {
    // Summary was saved, could navigate to summaries list
  }

  switchView(view: "main" | "summaries"): void {
    this.currentView = view;
  }
}
