import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment.development';

import { firstValueFrom } from 'rxjs'; // Import for converting Observable to Promise
import { CreateUserDto } from '../interfaces/user.interface';
import { Employee } from '../interfaces/employeesList.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`; // Ensure this is the correct endpoint
  private loggedIn = false;

  constructor(private http: HttpClient) {}

  async getFilteredUsers(
    search?: string,
    page?: number,
    limit?: number
  ): Promise<any> {
    const params = new HttpParams()
      .set('search', search || '')
      .set('page', page?.toString() || '1')
      .set('limit', limit?.toString() || '10');

    return firstValueFrom(
      this.http
        .get<any>(`${this.apiUrl}/user/by-respo`, {
          params,
        })
        .pipe(
          catchError((error) => {
            console.error('Error fetching users:', error);
            return throwError(() => new Error('Error fetching users'));
          })
        )
    );
  }

  removeUser(id: number) {
    const url = `${this.apiUrl}/user/${id}`;
    return this.http.delete(url);
  }

  addUser(createUserDto: CreateUserDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/user`, createUserDto).pipe(
      catchError((error) => {
        const errorMsg = error.error.message;
        return throwError(() => new Error(errorMsg));
      })
    );
  }
  editUser(EditUSer: any, id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user/${id}`, EditUSer).pipe(
      catchError((error) => {
        const errorMsg = error.error.message;

        if (Array.isArray(errorMsg)) {
          return throwError(() => new Error(errorMsg[errorMsg.length - 1]));
        }

        return throwError(() => new Error(errorMsg));
      })
    );
  }

  getRespoList(): any {
    return this.http.get(`${this.apiUrl}/user/get-Respo`).pipe(
      catchError((error) => {
        console.error('Error fetching responsibles:', error);
        return throwError(() => new Error('Error fetching responsibles'));
      })
    );
  }

  getCollabsNames(
    idRespo: number,
    idTeam: number,
    getAll: boolean
  ): Observable<Employee[]> {
    let url: string;
    if (getAll) {
      url = `${this.apiUrl}/user/get-collabs-Names/`;
    } else {
      url = `${this.apiUrl}/user/get-collabs-Names/${idRespo}/${idTeam}`;
    }
    return this.http.get<Employee[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching responsibles:', error);
        return throwError(() => new Error('Error fetching responsibles'));
      })
    );
  }
  getMyTeamNames(): Observable<Employee[]> {
    const url = `${this.apiUrl}/user/TeamNames/`;

    return this.http.get<Employee[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching responsibles:', error);
        return throwError(() => new Error('Error fetching responsibles'));
      })
    );
  }
}
