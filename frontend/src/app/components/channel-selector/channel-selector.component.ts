import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzIconModule } from "ng-zorro-antd/icon";
import { DiscordService } from "../../services/discord.service";
import { Channel } from "../../models/channel.model";

@Component({
  selector: "app-channel-selector",
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule, NzIconModule],
  templateUrl: "./channel-selector.component.html",
  styleUrls: ["./channel-selector.component.css"],
})
export class ChannelSelectorComponent implements OnInit {
  @Input() selectedChannelId: string | null = null;
  @Output() channelSelected = new EventEmitter<Channel>();

  channels: Channel[] = [];
  loading = false;
  error: string | null = null;

  constructor(private discordService: DiscordService) {}

  ngOnInit(): void {
    this.loadChannels();
  }

  loadChannels(): void {
    this.loading = true;
    this.error = null;
    this.discordService.getChannels().subscribe({
      next: (channels) => {
        this.channels = channels;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Failed to load channels";
        this.loading = false;
        console.error("Error loading channels:", err);
      },
    });
  }

  onChannelChange(channelId: string): void {
    const channel = this.channels.find((c) => c.id === channelId);
    if (channel) {
      this.channelSelected.emit(channel);
    }
  }
}
