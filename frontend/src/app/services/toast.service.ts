// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];

  showToast(message: string, status: boolean) {
    const classname = status ? 'bg-success text-white' : 'bg-danger text-white';
    const toast = { message, classname, delay: 3000 };
    this.toasts.push(toast);

    // Automatically remove the toast after the specified delay
    setTimeout(() => this.removeToast(toast), 3000);
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
