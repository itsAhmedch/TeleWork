import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import {  NgxPermissionsService, USE_PERMISSIONS_STORE } from 'ngx-permissions'; // Use the correct provider
import { TokenInterceptorFn } from './interceptors/token.interceptor';
import { AuthInterceptorFn } from './interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
 
     provideHttpClient(withInterceptors([TokenInterceptorFn])),
     provideHttpClient(withInterceptors([AuthInterceptorFn]))
  ]
};
