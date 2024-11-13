import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private apiUrl = `${environment.apiUrl}`; // Ensure this is the correct endpoint

  constructor(private http: HttpClient) {}

  // Fetch teams by Respo ID
  getTeamsByRespo(idRespo: number): Observable<any> {
    const url = `${this.apiUrl}/team/Team-By-Respo/${idRespo}`;
    return this.http.get(url);
  }

  // Fetch sub-teams by Respo ID and Team ID
  getSubTeamsByRespo(idRespo: number, idTeam: number): Observable<any> {
    const url = `${this.apiUrl}/team/SubTeam-By-Respo/${idRespo}/${idTeam}`;
    return this.http.get<any>(url);
  }

  // Fetch sub-teams by Respo ID and Team ID
  addTeam(
    name: string,
    idRespo: number,
    idParentTeam: number | null = null
  ): Observable<any> {
    const url = `${this.apiUrl}/team/`;

    // Construct the payload (data to be sent)
    const payload = {
      name: name,
      idRespo: idRespo,
      idTeam: idParentTeam, // Optional, could be null
    };

    // Send a POST request with the payload
    return this.http.post<any>(url, payload);
  }
  deleteTeam(idTeam: number): Observable<any> {
    const url = `${this.apiUrl}/team/${idTeam}`;
    return this.http.delete<any>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(`${error.error.message}`));
      })
    );
  }
}
