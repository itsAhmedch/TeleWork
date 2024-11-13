import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

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

  GetDAyInfo(date: string) {
    const url = `${this.apiUrl}/Daily-Work/get-day-status/${date}`;

    return this.http.get<any>(url);
  }
}
