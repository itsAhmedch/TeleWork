import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { jwtDecode } from './jwtDecode.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/login`; // Ensure this is the correct endpoint
  private loggedIn =false

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtDecode: jwtDecode,
    
  ) {}

  login(email: string, pwd: string): Observable<any> {
    console.log(environment.apiUrl);

    return this.http.post<any>(this.apiUrl, { email, pwd }).pipe(
      tap((response) => {
        // Save token to localStorage
        console.log("ffffffffff");
        
        this.setLog(true)
        console.log(this.loggedIn);
        
        localStorage.setItem('token', response.access_token);
 
      }),
      catchError((error) => {
        this.setLog(false)
        // Handle error here
        return throwError(() => new Error(error.error.message));
      })
    );
  }

  logout() {
    this.setLog(false) // Set to false on logout
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  setLog(status:boolean){
    this.loggedIn =status
  }

  getLog(){
    return this.loggedIn 
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
        this.logout()
        return {}; 
      }
    }
    
    this.logout()
    return {}; 
}

}