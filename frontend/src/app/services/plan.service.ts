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
import { jwtDecode } from './jwtDecode.service';
import { firstValueFrom } from 'rxjs'; // Import for converting Observable to Promise

@Injectable({
  providedIn: 'root',
})
export class planService {
  private apiUrl = `${environment.apiUrl}`; // Ensure this is the correct endpoint

  constructor(private http: HttpClient) {}

  savePlan(
    idSender: number,
    planChanges: { CollabId: number; date: string; action: string }[]
  ): Observable<any> {
    const url = `${this.apiUrl}/plan/SavePlan/${idSender}`;

    // Body structure: directly passing the planChanges array
    const body = {
      planChanges: planChanges, // Ensuring it matches what the controller expects
    };

    return this.http.post<any>(url, body);
  }

  getPlans(
    idSender: number,
    idsTeams: number[],
    isProposal: boolean,
    getAll: boolean
  ) {
    let url;
    if (getAll) {
      url = `${this.apiUrl}/plan/`;

      return this.http.get<any>(url);
    } else {
      // Construct the URL with the sender ID only
      url = `${this.apiUrl}/plan/get-Plans/${idSender}`;
      // Create the request body with the isProposal and idsTeams array
      const body = {
        isProposal,
        idsTeams, // Include the idsTeams in the request body
      };

      // Use POST to send the body
      return this.http.post<any>(url, body); // Use POST instead of GET
    }
  }
  getAllPlans() {
    const url = `${this.apiUrl}/plan/`;

    return this.http.get(url);
  }
  getLeaderTeamPlan() {
    const url = `${this.apiUrl}/plan/LeaderTeam`;
    return this.http.get<any>(url); 
  }
}  
