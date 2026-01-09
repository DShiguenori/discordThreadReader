import { Injectable } from "@angular/core";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Summary } from "../models/summary.model";
import { ApiService } from "./api.service";
import { firstValueFrom } from "rxjs";

interface DiscordTopicDB extends DBSchema {
  summaries: {
    key: string;
    value: Summary;
    indexes: {
      "by-threadId": string;
      "by-channelId": string;
      "by-category": string;
      "by-createdAt": Date;
    };
  };
}

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private dbName = "DiscordTopicReader";
  private dbVersion = 1;
  private db: IDBPDatabase<DiscordTopicDB> | null = null;

  constructor(private apiService: ApiService) {}

  async initDB(): Promise<void> {
    if (this.db) {
      return;
    }

    this.db = await openDB<DiscordTopicDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        const store = db.createObjectStore("summaries", {
          keyPath: "id",
          autoIncrement: false,
        });
        store.createIndex("by-threadId", "threadId");
        store.createIndex("by-channelId", "channelId");
        store.createIndex("by-category", "category");
        store.createIndex("by-createdAt", "createdAt");
      },
    });
  }

  async saveSummary(summary: Summary): Promise<string> {
    // Save locally first (always)
    await this.initDB();
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const id = summary.id || `${summary.threadId}-${Date.now()}`;
    const summaryWithId: Summary = { ...summary, id };

    await this.db.put("summaries", summaryWithId);

    // Try to save to backend API (if available)
    try {
      const savedSummary = await firstValueFrom(
        this.apiService.saveSummary(summaryWithId)
      );
      // Update local copy with server ID if different
      if (savedSummary.id && savedSummary.id !== id) {
        await this.db.put("summaries", { ...summaryWithId, id: savedSummary.id });
        return savedSummary.id;
      }
    } catch (error) {
      // Backend save failed, but local save succeeded
      // Log warning but don't throw - local save is still successful
      console.warn("Failed to save summary to backend API:", error);
      console.warn("Summary saved locally only");
    }

    return id;
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    await this.initDB();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.get("summaries", id);
  }

  async getAllSummaries(): Promise<Summary[]> {
    await this.initDB();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.getAll("summaries");
  }

  async getSummariesByChannel(channelId: string): Promise<Summary[]> {
    await this.initDB();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.getAllFromIndex("summaries", "by-channelId", channelId);
  }

  async getSummariesByCategory(category: string): Promise<Summary[]> {
    await this.initDB();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.getAllFromIndex("summaries", "by-category", category);
  }

  async deleteSummary(id: string): Promise<void> {
    await this.initDB();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.delete("summaries", id);
  }

  async searchSummaries(query: string): Promise<Summary[]> {
    await this.initDB();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const allSummaries = await this.getAllSummaries();
    const lowerQuery = query.toLowerCase();

    return allSummaries.filter(
      (summary) =>
        summary.title.toLowerCase().includes(lowerQuery) ||
        summary.summary.toLowerCase().includes(lowerQuery) ||
        summary.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
    );
  }
}
