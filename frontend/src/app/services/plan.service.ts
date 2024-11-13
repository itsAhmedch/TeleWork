import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

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
      //getAll === true -- > get all the the responsibles' teams data else getting with id's respo
      url = `${this.apiUrl}/plan/`;
      return this.http.post(url, { isProposal }); // isProposal === true --> getting the proposal days
      // else getting  the the working days
    } else {
      url = `${this.apiUrl}/plan/get-Plans/${idSender}`;
      const body = {
        isProposal,
        idsTeams, // Include idsTeams in the request body
      };
      return this.http.post<any>(url, body); // Send the full body
    }
  }

  getLeaderTeamPlan(): any {
    const url = `${this.apiUrl}/plan/LeaderTeam`;
    return this.http.get(url);
  }

  getMyWorkingDays(): any {
    const url = `${this.apiUrl}/plan/MyPlans/`;

    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error fetching your working days'));
      })
    );
  }
  getMyProposalDays(): any {
    const url = `${this.apiUrl}/plan/my-proposal-plans/`;

    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error fetching your Proposal days'));
      })
    );
  }
}
