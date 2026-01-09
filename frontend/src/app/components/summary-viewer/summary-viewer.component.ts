import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzBadgeModule } from "ng-zorro-antd/badge";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzImageModule, NzImageService } from "ng-zorro-antd/image";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzMessageModule, NzMessageService } from "ng-zorro-antd/message";
import { Summary } from "../../models/summary.model";
import { StorageService } from "../../services/storage.service";

@Component({
  selector: "app-summary-viewer",
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTagModule,
    NzBadgeModule,
    NzButtonModule,
    NzImageModule,
    NzSpinModule,
    NzMessageModule,
  ],
  templateUrl: "./summary-viewer.component.html",
  styleUrls: ["./summary-viewer.component.css"],
})
export class SummaryViewerComponent {
  @Input() summary: Summary | null = null;
  @Input() loading = false;
  @Output() saved = new EventEmitter<Summary>();

  saving = false;

  constructor(
    private storageService: StorageService,
    private message: NzMessageService,
    private imageService: NzImageService
  ) {}

  previewImage(url: string): void {
    this.imageService.preview([
      {
        src: url,
        alt: "Attachment preview",
      },
    ]);
  }

  async saveSummary(): Promise<void> {
    if (!this.summary) {
      return;
    }

    this.saving = true;
    try {
      const result = await this.storageService.saveSummary(this.summary);
      if (result.backendSaved) {
        this.message.success("Summary saved successfully to database");
        this.saved.emit(this.summary);
      } else {
        // Backend save failed - only saved locally
        this.message.warning(
          `Summary saved locally only. Backend save failed: ${
            result.error || "Backend unavailable"
          }. ` +
            "Please check your backend configuration and ensure Supabase credentials are set."
        );
        console.error("Backend save failed:", result.error);
        // Still emit saved event since local save succeeded
        this.saved.emit(this.summary);
      }
    } catch (error: any) {
      this.message.error(
        `Failed to save summary: ${error?.message || "Unknown error"}`
      );
      console.error("Error saving summary:", error);
    } finally {
      this.saving = false;
    }
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      Technical: "blue",
      Discussion: "green",
      Question: "orange",
      Announcement: "purple",
      Planning: "cyan",
      "Bug Report": "red",
      "Feature Request": "geekblue",
      Other: "default",
    };
    return colors[category] || "default";
  }

  isImage(attachment: { contentType?: string; filename: string }): boolean {
    if (attachment.contentType) {
      return attachment.contentType.startsWith("image/");
    }
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return imageExtensions.some((ext) =>
      attachment.filename.toLowerCase().endsWith(ext)
    );
  }
}
