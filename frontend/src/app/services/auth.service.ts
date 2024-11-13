import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { jwtDecode } from './jwtDecode.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // Ensure this is the correct endpoint
  private loggedIn = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtDecode: jwtDecode
  ) {}

  login(email: string, pwd: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/login', { email, pwd }).pipe(
      tap((response) => {
        // Save token to localStorage

        this.setLog(true);

        localStorage.setItem('token', response.access_token);
      }),
      catchError((error) => {
        this.setLog(false);
        // Handle error here
        return throwError(() => new Error(error.error.message));
      })
    );
  }

  logout(): void {
    const token = localStorage.getItem('token');

    // If there is no token, handle it (e.g., user is already logged out)
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Set the Authorization header with the token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post<any>(this.apiUrl + '/logout', {}, { headers }).subscribe(
      (response) => {
        // After successful logout, remove the token and navigate to login
        localStorage.removeItem('token');
        this.setLog(false); // Set to false after logout
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Logout failed', error);
        // Optionally, handle logout failure (e.g., show an error message)
      }
    );
  }

  setLog(status: boolean) {
    this.loggedIn = status;
  }

  getLog() {
    return this.loggedIn;
  }

  isLoggedIn(): boolean {
    return this.getLog(); // Check the login status
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getTokenData() {
    const token = this.getToken(); // Assuming you have a method to retrieve the token
    if (token) {
      try {
        const decodedToken: any = this.jwtDecode.decodeJWT(token);
        return decodedToken;
      } catch (error) {
        console.error('Invalid token format:', error);
        this.logout();
        return {};
      }
    }

    this.logout();
    return {};
  }
}
