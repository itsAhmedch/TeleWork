import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { NgxPermissionsModule } from 'ngx-permissions';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    NgxPermissionsModule // Include this if you're using ngx-permissions
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    AuthService,
    AuthGuard,
   
  ],
})
export class AppComponent {
  title = 'frontend';
}
