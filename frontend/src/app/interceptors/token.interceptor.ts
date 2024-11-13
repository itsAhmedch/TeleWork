import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';


export const TokenInterceptorFn = (req: HttpRequest<any>, next: (req: HttpRequest<any>) => Observable<HttpEvent<any>>): Observable<HttpEvent<any>> => {
  const token = localStorage.getItem('token');

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    
    return next(clonedReq); // Call next with the cloned request
  }

  return next(req); // Call next with the original request
};
