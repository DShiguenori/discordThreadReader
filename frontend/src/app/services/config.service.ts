import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { environment } from "../../environments/environment";

export interface Prompt {
  id?: string;
  key: string;
  prompt: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPrompt(key: string = "default"): Observable<Prompt> {
    return this.http
      .get<Prompt>(`${this.apiUrl}/config/prompt?key=${key}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error("Error fetching prompt from API:", error);
          return throwError(() => error);
        })
      );
  }

  savePrompt(prompt: Prompt): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.apiUrl}/config/prompt`, prompt).pipe(
      catchError((error) => {
        console.error("Error saving prompt to API:", error);
        return throwError(() => error);
      })
    );
  }

  deletePrompt(key: string = "default"): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/config/prompt?key=${key}`)
      .pipe(
        catchError((error) => {
          console.error("Error deleting prompt from API:", error);
          return throwError(() => error);
        })
      );
  }
}
