import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzFormModule } from "ng-zorro-antd/form";
import { FormsModule } from "@angular/forms";
import { NzMessageModule, NzMessageService } from "ng-zorro-antd/message";
import { ChannelSelectorComponent } from "./components/channel-selector/channel-selector.component";
import { ThreadSelectorComponent } from "./components/thread-selector/thread-selector.component";
import { SummaryViewerComponent } from "./components/summary-viewer/summary-viewer.component";
import { SummaryListComponent } from "./components/summary-list/summary-list.component";
import { ConfigComponent } from "./components/config/config.component";
import { UrlInputModalComponent } from "./components/url-input-modal/url-input-modal.component";
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
    FormsModule,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzSpinModule,
    NzInputModule,
    NzFormModule,
    NzMessageModule,
    ChannelSelectorComponent,
    ThreadSelectorComponent,
    SummaryViewerComponent,
    SummaryListComponent,
    ConfigComponent,
    UrlInputModalComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Discord Topic Reader";
  selectedChannel: Channel | null = null;
  selectedThread: Thread | null = null;
  generatingSummary = false;
  currentView: "main" | "summaries" | "config" = "main";

  constructor(
    private discordService: DiscordService,
    private summaryService: SummaryService,
    private apiService: ApiService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  onChannelSelected(channel: Channel): void {
    this.selectedChannel = channel;
    this.selectedThread = null;
  }

  async onThreadSelected(thread: Thread): Promise<void> {
    this.selectedThread = thread;

    // First, check if a summary already exists for this thread
    try {
      const existingSummary = await firstValueFrom(
        this.apiService.getSummaryByThreadId(thread.id)
      );
      if (existingSummary) {
        // Summary exists, show it in a modal
        this.openSummaryModal(existingSummary, false);
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

      const generatedSummary = await this.summaryService.generateSummary(
        messages,
        this.selectedThread.id,
        this.selectedChannel.id,
        this.selectedChannel.name,
        this.selectedThread.name
      );
      // Show the generated summary in a modal
      this.openSummaryModal(generatedSummary, false);
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

  openSummaryModal(summary: Summary, loading: boolean = false): void {
    const modalRef = this.modal.create({
      nzTitle: summary.title,
      nzContent: SummaryViewerComponent,
      nzData: {
        summary: summary,
        loading: loading,
      },
      nzWidth: "80%",
      nzStyle: { top: "20px" },
      nzFooter: null,
    });

    // Handle events after modal opens
    modalRef.afterOpen.subscribe(() => {
      const componentInstance =
        modalRef.componentInstance as SummaryViewerComponent;
      if (componentInstance) {
        // Handle the saved event from the summary viewer
        componentInstance.saved.subscribe(() => {
          modalRef.close();
          this.onSummarySaved();
        });

        // Handle the close event from the summary viewer
        componentInstance.closed.subscribe(() => {
          modalRef.close();
        });
      }
    });
  }

  switchView(view: "main" | "summaries" | "config"): void {
    this.currentView = view;
  }

  openUrlModal(): void {
    const modalRef = this.modal.create({
      nzTitle: "Paste Discord Thread URL",
      nzContent: UrlInputModalComponent,
      nzWidth: "600px",
      nzOkText: "Generate Summary",
      nzCancelText: "Cancel",
      nzOnOk: () => {
        const componentInstance =
          modalRef.componentInstance as UrlInputModalComponent;
        if (componentInstance) {
          const threadUrl = componentInstance.threadUrl.trim();
          if (!threadUrl || !this.isValidDiscordUrl(threadUrl)) {
            this.message.error(
              "Invalid Discord URL format. Please check the URL and try again."
            );
            return false; // Prevent modal from closing
          }
          this.processThreadUrl(threadUrl);
          return true;
        }
        return false;
      },
    });

    // Focus the input after modal opens
    modalRef.afterOpen.subscribe(() => {
      const componentInstance =
        modalRef.componentInstance as UrlInputModalComponent;
      if (componentInstance) {
        setTimeout(() => {
          const input = document.querySelector(
            'input[nz-input]'
          ) as HTMLInputElement;
          if (input) {
            input.focus();
            // Handle Enter key to trigger OK
            input.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                // Trigger the modal's OK button click
                const okButton = document.querySelector(
                  ".ant-modal-footer .ant-btn-primary"
                ) as HTMLButtonElement;
                if (okButton) {
                  okButton.click();
                }
              }
            });
          }
        }, 100);
      }
    });
  }

  isValidDiscordUrl(url: string): boolean {
    if (!url || typeof url !== "string") {
      return false;
    }
    // Remove query parameters and fragments for validation
    const cleanUrl = url.trim().split("?")[0].split("#")[0];
    // Discord URL pattern: https://discord.com/channels/{guildId}/{channelId}/{messageId?}
    // or https://discord.com/channels/{guildId}/{threadId} for threads
    const discordUrlPattern =
      /^https:\/\/(discord\.com|discordapp\.com)\/channels\/\d+\/\d+(\/\d+)?\/?$/;
    return discordUrlPattern.test(cleanUrl);
  }

  extractThreadIdFromUrl(url: string): { threadId: string; messageId?: string } | null {
    if (!this.isValidDiscordUrl(url)) {
      return null;
    }

    try {
      // Remove query parameters and fragments
      const cleanUrl = url.trim().split("?")[0].split("#")[0];
      // Discord URL format: https://discord.com/channels/{guildId}/{channelId}/{messageId?}
      // For threads: the channelId is the threadId
      // For messages that started threads: we have a messageId, but the threadId might be the messageId
      const match = cleanUrl.match(
        /\/channels\/(\d+)\/(\d+)(?:\/(\d+))?\/?$/
      );

      if (match) {
        const guildId = match[1];
        const channelId = match[2];
        const messageId = match[3];

        // If there's a messageId, it could be:
        // 1. A message that started a thread (thread ID = messageId)
        // 2. A message within a thread (thread ID = channelId)
        // We'll try channelId first (most common case for thread URLs)
        // If that fails, we can try messageId
        if (messageId) {
          // Return both - we'll try channelId first, then messageId if needed
          return { threadId: channelId, messageId: messageId };
        }
        // No messageId, so channelId is the threadId
        return { threadId: channelId };
      }
    } catch (error) {
      console.error("Error extracting thread ID from URL:", error);
    }

    return null;
  }

  async processThreadUrl(url: string): Promise<void> {
    const urlData = this.extractThreadIdFromUrl(url);

    if (!urlData || !urlData.threadId) {
      this.message.error("Could not extract thread ID from URL");
      return;
    }

    this.generatingSummary = true;

    try {
      let threadId = urlData.threadId;
      let messages: any[] = [];

      // First, check if a summary already exists for this thread
      try {
        const existingSummary = await firstValueFrom(
          this.apiService.getSummaryByThreadId(threadId)
        );
        if (existingSummary) {
          // Summary exists, show it in a modal
          this.openSummaryModal(existingSummary, false);
          this.generatingSummary = false;
          return;
        }
      } catch (error: any) {
        // If error is 404, summary doesn't exist, which is fine - proceed
        if (error?.status && error.status !== 404) {
          console.warn("Error checking for existing summary:", error);
        }
      }

      // Try to fetch thread messages with the threadId (channelId from URL)
      try {
        messages = await firstValueFrom(
          this.discordService.getThreadMessages(threadId)
        );
      } catch (error: any) {
        // If that fails and we have a messageId, try using messageId as threadId
        // (some threads have the thread ID equal to the message ID that started them)
        if (urlData.messageId) {
          console.log(
            `Failed to fetch with channelId ${threadId}, trying messageId ${urlData.messageId}`
          );
          try {
            messages = await firstValueFrom(
              this.discordService.getThreadMessages(urlData.messageId)
            );
            threadId = urlData.messageId; // Update threadId to the working one
          } catch (secondError: any) {
            throw new Error(
              "Could not access thread. The URL might be invalid, or you might not have permission to access this thread."
            );
          }
        } else {
          throw error;
        }
      }

      if (!messages || messages.length === 0) {
        throw new Error(
          "No messages found in thread. The thread might be empty or you might not have access."
        );
      }

      // Extract channel info from messages if available, or use defaults
      // Note: We might not have channel/thread names from the URL alone
      const channelId = messages[0]?.threadId || threadId;
      const channelName = "Unknown Channel";
      const threadName = "Thread from URL";

      // Generate summary
      const generatedSummary = await this.summaryService.generateSummary(
        messages,
        threadId,
        channelId,
        channelName,
        threadName
      );

      // Show the generated summary in a modal
      this.openSummaryModal(generatedSummary, false);
    } catch (error: any) {
      console.error("Error processing thread URL:", error);
      const errorMessage =
        error?.message ||
        "Failed to generate summary from URL. Please check the URL and try again.";
      this.message.error(errorMessage);
    } finally {
      this.generatingSummary = false;
    }
  }
}
