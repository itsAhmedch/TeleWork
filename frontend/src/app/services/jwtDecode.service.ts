import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class jwtDecode {
  router = inject(Router);
  // Utility function to base64-url decode
  base64UrlDecode(base64Url: string): string {
    // Replace URL-safe characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary
    const padding =
      base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    // Decode base64
    const decoded = atob(base64 + padding);
    return decoded;
  }

  // Function to decode JWT
  decodeJWT(token: string): any {
    if (!token) {
      return {};
    }

    // Split the JWT into its parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');

      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return {};
    }

    // Decode the payload part
    const payload = parts[1];
    try {
      const decodedPayload = this.base64UrlDecode(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding JWT payload:', error);
      return {};
    }
  }
}
