import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/side-bar/side-bar.component';
import { AuthGuard } from './guards/auth.guard';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { ExtractPageComponent } from './pages/extract-page/extract-page.component';
import { UploadPageComponent } from './pages/upload-page/upload-page.component';
import { UsersPageComponent } from './pages/users-page/users-page.component';
import { PlanningPageComponent } from './pages/planning-page/planning-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate:[AuthGuard],
    children: [
      { path: 'users', component: UsersPageComponent },
      { path: 'planning', component: PlanningPageComponent },
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'extract', component: ExtractPageComponent },
      { path: 'upload', component: UploadPageComponent },
      
    ],
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }, 
];
