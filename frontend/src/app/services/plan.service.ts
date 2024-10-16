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
    let url: string;
    
    if (getAll) {
      url = `${this.apiUrl}/plan/`;
      return this.http.post(url, { isProposal }); // Send isProposal only
    } else {
      url = `${this.apiUrl}/plan/get-Plans/${idSender}`;
      const body = {
        isProposal,
        idsTeams, // Include idsTeams in the request body
      };
      return this.http.post<any>(url, body); // Send the full body
    }
  }
  
  
  getLeaderTeamPlan():any {
    const url = `${this.apiUrl}/plan/LeaderTeam`;
    return this.http.get(url); 
  }
}  
