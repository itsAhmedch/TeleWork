import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { jwtDecode } from './jwtDecode.service';
import { firstValueFrom } from 'rxjs'; // Import for converting Observable to Promise



export interface CreateUserDto {
  email: string;
  name: string;
  lastName: string;
  pwd: string;
  role: string;
  teamId: number;   // Optional field
  subteamId: number; // Optional field
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`; // Ensure this is the correct endpoint
  private loggedIn = false;

  constructor(private http: HttpClient) {}

 
  
async getFilteredUsers(search?: string, page?: number, limit?: number): Promise<any> {

  const params = new HttpParams()
      .set('search', search || '')
      .set('page', page?.toString() || '1')
      .set('limit', limit?.toString() || '10');

  return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/user/by-respo`, {
       
          params,
      }).pipe(
          catchError(error => {
              console.error('Error fetching users:', error);
              return throwError(() => new Error('Error fetching users'));
          })
      )
  );
}



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
  

  removeUser(id:number){
    const url = `${this.apiUrl}/user/${id}`;
    return this.http.delete<any>(url);
  }

  addUser(createUserDto: CreateUserDto): Observable<any> {
    console.log(createUserDto);
    
      return this.http.post(`${this.apiUrl}/user`, createUserDto).pipe(
        catchError((error) => {
          const errorMsg=error.error.message        
          return throwError(() => new Error(errorMsg));
        })
      );
        
    }
  editUser(EditUSer: any,id:number): Observable<any> {
      console.log(EditUSer);

      return this.http.patch(`${this.apiUrl}/user/${id}`, EditUSer)
        .pipe(
          catchError((error) => {
            const errorMsg=error.error.message
            console.log(errorMsg);
            
            if (Array.isArray(errorMsg)) {
              return throwError(() => new Error(errorMsg[errorMsg.length - 1]));
            }
            
           
            return throwError(() => new Error(errorMsg));
          })
        );
    }


  }

