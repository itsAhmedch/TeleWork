import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class dailyWorkService {
  private apiUrl = `${environment.apiUrl}`; // Ensure this is the correct endpoint

  constructor(private http: HttpClient) {}

  sendWorkStatus(): Observable<any> {
    const url = `${this.apiUrl}/Daily-Work`;

    return this.http.post<any>(url, {});
  }
  getStatus(): Observable<any> {
    const url = `${this.apiUrl}/Daily-Work/get-my-status`;

    return this.http.get<any>(url);
  }
}
