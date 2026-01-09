import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NzListModule } from "ng-zorro-antd/list";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzButtonModule } from "ng-zorro-antd/button";
import { DiscordService } from "../../services/discord.service";
import { Thread } from "../../models/thread.model";

@Component({
  selector: "app-thread-selector",
  standalone: true,
  imports: [
    CommonModule,
    NzListModule,
    NzCardModule,
    NzSpinModule,
    NzEmptyModule,
    NzButtonModule,
  ],
  templateUrl: "./thread-selector.component.html",
  styleUrls: ["./thread-selector.component.css"],
})
export class ThreadSelectorComponent implements OnInit, OnChanges {
  @Input() channelId: string | null = null;
  @Output() threadSelected = new EventEmitter<Thread>();

  threads: Thread[] = [];
  loading = false;
  error: string | null = null;

  constructor(private discordService: DiscordService) {}

  ngOnInit(): void {
    if (this.channelId) {
      this.loadThreads();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["channelId"] && this.channelId) {
      this.loadThreads();
    } else if (changes["channelId"] && !this.channelId) {
      this.threads = [];
    }
  }

  loadThreads(): void {
    if (!this.channelId) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.discordService.getThreads(this.channelId).subscribe({
      next: (threads) => {
        this.threads = threads;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Failed to load threads";
        this.loading = false;
        console.error("Error loading threads:", err);
      },
    });
  }

  selectThread(thread: Thread): void {
    this.threadSelected.emit(thread);
  }
}
