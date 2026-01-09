import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Summary {
  id?: string;
  title: string;
  summary: string;
  keywords: string[];
  category: string;
  threadId: string;
  channelId: string;
  channelName?: string;
  threadName?: string;
  attachments: any[];
  createdAt: Date;
}

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  isAvailable(): boolean {
    return !!this.supabase;
  }

  async saveSummary(summary: Summary): Promise<string> {
    // Handle createdAt - it might be a Date object or a string (from JSON)
    const createdAtDate =
      summary.createdAt instanceof Date
        ? summary.createdAt
        : new Date(summary.createdAt);

    const { data, error } = await this.supabase
      .from("summaries")
      .insert({
        title: summary.title,
        summary: summary.summary,
        keywords: summary.keywords,
        category: summary.category,
        thread_id: summary.threadId,
        channel_id: summary.channelId,
        channel_name: summary.channelName,
        thread_name: summary.threadName,
        attachments: summary.attachments,
        created_at: createdAtDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save summary: ${error.message}`);
    }

    return data.id;
  }

  async getSummary(id: string): Promise<Summary | null> {
    const { data, error } = await this.supabase
      .from("summaries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to get summary: ${error.message}`);
    }

    return this.mapDatabaseRowToSummary(data);
  }

  async getAllSummaries(): Promise<Summary[]> {
    const { data, error } = await this.supabase
      .from("summaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get summaries: ${error.message}`);
    }

    return data.map((row: any) => this.mapDatabaseRowToSummary(row));
  }

  async getSummariesByChannel(channelId: string): Promise<Summary[]> {
    const { data, error } = await this.supabase
      .from("summaries")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get summaries by channel: ${error.message}`);
    }

    return data.map((row: any) => this.mapDatabaseRowToSummary(row));
  }

  async getSummaryByThreadId(threadId: string): Promise<Summary | null> {
    const { data, error } = await this.supabase
      .from("summaries")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to get summary by thread ID: ${error.message}`);
    }

    return this.mapDatabaseRowToSummary(data);
  }

  async getSummariesByCategory(category: string): Promise<Summary[]> {
    const { data, error } = await this.supabase
      .from("summaries")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get summaries by category: ${error.message}`);
    }

    return data.map((row: any) => this.mapDatabaseRowToSummary(row));
  }

  async deleteSummary(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("summaries")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete summary: ${error.message}`);
    }
  }

  async searchSummaries(query: string): Promise<Summary[]> {
    const { data, error } = await this.supabase
      .from("summaries")
      .select("*")
      .or(
        `title.ilike.%${query}%,summary.ilike.%${query}%,keywords.cs.{${query}}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search summaries: ${error.message}`);
    }

    return data.map((row: any) => this.mapDatabaseRowToSummary(row));
  }

  private mapDatabaseRowToSummary(row: any): Summary {
    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      keywords: row.keywords || [],
      category: row.category,
      threadId: row.thread_id,
      channelId: row.channel_id,
      channelName: row.channel_name,
      threadName: row.thread_name,
      attachments: row.attachments || [],
      createdAt: new Date(row.created_at),
    };
  }
}
