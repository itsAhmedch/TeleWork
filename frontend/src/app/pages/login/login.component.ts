import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast notification/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,ToastComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate(
          '0.6s ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('scaleUp', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('0.4s ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class LoginComponent {
  img = environment.imgUrl;

  errorMessage = '';

  signUpForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    pwd: new FormControl('', [
      Validators.required,
  
      Validators.pattern('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,}$'),
    ]),
  });

  constructor(private authService: AuthService, private router: Router,private toastService: ToastService) {}

  onSubmit() {
    if (this.signUpForm.valid) {
      const email = this.signUpForm.get('email')?.value;
      const pwd = this.signUpForm.get('pwd')?.value;
      if (email && pwd) {
        this.authService.login(email, pwd).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: (err:any) => {
            this.errorMessage = err;
          },
        });
      }
    }
  }



}
