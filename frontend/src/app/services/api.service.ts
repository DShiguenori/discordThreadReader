import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { Summary } from "../models/summary.model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  saveSummary(summary: Summary): Observable<Summary> {
    return this.http.post<Summary>(`${this.apiUrl}/summaries`, summary).pipe(
      catchError((error) => {
        console.error("Error saving summary to API:", error);
        return throwError(() => error);
      })
    );
  }

  getAllSummaries(): Observable<Summary[]> {
    return this.http.get<Summary[]>(`${this.apiUrl}/summaries`).pipe(
      catchError((error) => {
        console.error("Error fetching summaries from API:", error);
        return throwError(() => error);
      })
    );
  }

  getSummary(id: string): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/summaries/${id}`).pipe(
      catchError((error) => {
        console.error("Error fetching summary from API:", error);
        return throwError(() => error);
      })
    );
  }

  getSummariesByChannel(channelId: string): Observable<Summary[]> {
    return this.http
      .get<Summary[]>(`${this.apiUrl}/summaries/channel/${channelId}`)
      .pipe(
        catchError((error) => {
          console.error("Error fetching summaries by channel from API:", error);
          return throwError(() => error);
        })
      );
  }

  getSummariesByCategory(category: string): Observable<Summary[]> {
    return this.http
      .get<Summary[]>(`${this.apiUrl}/summaries/category/${category}`)
      .pipe(
        catchError((error) => {
          console.error(
            "Error fetching summaries by category from API:",
            error
          );
          return throwError(() => error);
        })
      );
  }

  getSummaryByThreadId(threadId: string): Observable<Summary> {
    return this.http
      .get<Summary>(`${this.apiUrl}/summaries/thread/${threadId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Re-throw 404 as is - it means summary doesn't exist
          if (error.status === 404) {
            return throwError(() => error);
          }
          console.error("Error fetching summary by thread ID from API:", error);
          return throwError(() => error);
        })
      );
  }

  searchSummaries(query: string): Observable<Summary[]> {
    return this.http
      .get<Summary[]>(
        `${this.apiUrl}/summaries/search/${encodeURIComponent(query)}`
      )
      .pipe(
        catchError((error) => {
          console.error("Error searching summaries from API:", error);
          return throwError(() => error);
        })
      );
  }

  deleteSummary(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/summaries/${id}`).pipe(
      catchError((error) => {
        console.error("Error deleting summary from API:", error);
        return throwError(() => error);
      })
    );
  }
}
