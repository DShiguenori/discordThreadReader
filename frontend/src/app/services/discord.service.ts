import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Channel } from "../models/channel.model";
import { Thread } from "../models/thread.model";
import { Message } from "../models/message.model";

@Injectable({
  providedIn: "root",
})
export class DiscordService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/channels`);
  }

  getThreads(channelId: string): Observable<Thread[]> {
    return this.http.get<Thread[]>(
      `${this.apiUrl}/channels/${channelId}/threads`
    );
  }

  getThreadMessages(threadId: string): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/threads/${threadId}/messages`
    );
  }
}
