import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzBadgeModule } from "ng-zorro-antd/badge";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzMessageModule, NzMessageService } from "ng-zorro-antd/message";
import { NzPopconfirmModule } from "ng-zorro-antd/popconfirm";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { StorageService } from "../../services/storage.service";
import { Summary } from "../../models/summary.model";
import { SummaryViewerComponent } from "../summary-viewer/summary-viewer.component";

@Component({
  selector: "app-summary-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzTagModule,
    NzBadgeModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzMessageModule,
    NzPopconfirmModule,
    NzEmptyModule,
    NzModalModule,
    SummaryViewerComponent,
  ],
  templateUrl: "./summary-list.component.html",
  styleUrls: ["./summary-list.component.css"],
})
export class SummaryListComponent implements OnInit {
  summaries: Summary[] = [];
  filteredSummaries: Summary[] = [];
  loading = false;
  searchQuery = "";
  selectedCategory = "";

  categories: string[] = [
    "Technical",
    "Discussion",
    "Question",
    "Announcement",
    "Planning",
    "Bug Report",
    "Feature Request",
    "Other",
  ];

  constructor(
    private storageService: StorageService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadSummaries();
  }

  async loadSummaries(): Promise<void> {
    this.loading = true;
    try {
      this.summaries = await this.storageService.getAllSummaries();
      this.applyFilters();
    } catch (error) {
      this.message.error("Failed to load summaries");
      console.error("Error loading summaries:", error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    let filtered = [...this.summaries];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.summary.toLowerCase().includes(query) ||
          s.keywords.some((kw) => kw.toLowerCase().includes(query))
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter((s) => s.category === this.selectedCategory);
    }

    this.filteredSummaries = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  async deleteSummary(id: string): Promise<void> {
    try {
      await this.storageService.deleteSummary(id);
      this.message.success("Summary deleted");
      await this.loadSummaries();
    } catch (error) {
      this.message.error("Failed to delete summary");
      console.error("Error deleting summary:", error);
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

  viewSummary(summary: Summary): void {
    const modalRef = this.modal.create({
      nzTitle: summary.title,
      nzContent: SummaryViewerComponent,
      nzData: {
        summary: summary,
        loading: false,
      },
      nzWidth: "80%",
      nzStyle: { top: "20px" },
      nzFooter: null,
    });

    // Handle events after modal opens - component instance should be available
    modalRef.afterOpen.subscribe(() => {
      const componentInstance =
        modalRef.componentInstance as SummaryViewerComponent;
      if (componentInstance) {
        // Handle the saved event from the summary viewer
        componentInstance.saved.subscribe(() => {
          modalRef.close();
          this.loadSummaries();
        });

        // Handle the close event from the summary viewer
        componentInstance.closed.subscribe(() => {
          modalRef.close();
        });
      }
    });
  }
}
