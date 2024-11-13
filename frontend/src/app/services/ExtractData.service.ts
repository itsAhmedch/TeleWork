import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class extractDataService {
  private apiUrl = `${environment.apiUrl}`; // Ensure this is the correct endpoint

  constructor(private http: HttpClient) {}

  downloadTeamPlan(
    ResoId: number,
    teamId: number,
    startDate: string,
    endDate: string,
    extractType: string
  ) {
    let url = '';

    if (extractType === 'plan') {
      url = `${this.apiUrl}/plan/exportTeamPlanToExcel?idRespo=${ResoId}&idTeam=${teamId}&start=${startDate}&end=${endDate}`;
    } else if (extractType === 'times') {
      url = `${this.apiUrl}/Daily-Work/exportTeamTimes?idRespo=${ResoId}&idTeam=${teamId}&start=${startDate}&end=${endDate}`;
    }
    const token = localStorage.getItem('site-token'); // or wherever you store your token

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(url, { responseType: 'blob' }).subscribe(
      (blob) => {
        // Create a URL for the blob and trigger the download
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${extractType}.xlsx`;
        link.click();

        // Clean up the URL object
        window.URL.revokeObjectURL(downloadURL);
      },
      (error) => {
        console.error('Download failed:', error);
      }
    );
  }
}
