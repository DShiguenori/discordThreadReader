import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { ChannelSelectorComponent } from "./components/channel-selector/channel-selector.component";
import { ThreadSelectorComponent } from "./components/thread-selector/thread-selector.component";
import { SummaryViewerComponent } from "./components/summary-viewer/summary-viewer.component";
import { SummaryListComponent } from "./components/summary-list/summary-list.component";
import { ConfigComponent } from "./components/config/config.component";
import { DiscordService } from "./services/discord.service";
import { SummaryService } from "./services/summary.service";
import { ApiService } from "./services/api.service";
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
    NzModalModule,
    ChannelSelectorComponent,
    ThreadSelectorComponent,
    SummaryViewerComponent,
    SummaryListComponent,
    ConfigComponent,
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
  currentView: "main" | "summaries" | "config" = "main";

  constructor(
    private discordService: DiscordService,
    private summaryService: SummaryService,
    private apiService: ApiService,
    private modal: NzModalService
  ) {}

  onChannelSelected(channel: Channel): void {
    this.selectedChannel = channel;
    this.selectedThread = null;
    this.summary = null;
  }

  async onThreadSelected(thread: Thread): Promise<void> {
    this.selectedThread = thread;
    this.summary = null;

    // First, check if a summary already exists for this thread
    try {
      const existingSummary = await firstValueFrom(
        this.apiService.getSummaryByThreadId(thread.id)
      );
      if (existingSummary) {
        // Summary exists, show it immediately
        this.summary = existingSummary;
        return;
      }
    } catch (error: any) {
      // If error is 404, summary doesn't exist, which is fine - proceed to confirmation
      // For other errors, log but still allow user to try generating
      if (error?.status && error.status !== 404) {
        console.warn("Error checking for existing summary:", error);
        // Show warning but still allow generation attempt
      }
      // If status is 404 or undefined (network error, etc.), proceed to confirmation
    }

    // Summary doesn't exist, show confirmation modal before generating
    this.showConfirmationModal();
  }

  showConfirmationModal(): void {
    if (!this.selectedThread || !this.selectedChannel) {
      return;
    }

    this.modal.confirm({
      nzTitle: "Generate Summary?",
      nzContent: `This will call the OpenAI API to generate a summary for thread "${this.selectedThread?.name}". This will consume tokens.\n\nDo you want to proceed?`,
      nzOkText: "Yes, Generate Summary",
      nzCancelText: "Cancel",
      nzOnOk: () => {
        this.generateSummary();
      },
    });
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

  switchView(view: "main" | "summaries" | "config"): void {
    this.currentView = view;
  }
}
