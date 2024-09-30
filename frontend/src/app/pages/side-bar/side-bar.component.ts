import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Constants } from '../../../shared/SideBar.Links';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'], // Corrected from 'styleUrl' to 'styleUrls'
  providers: [AuthService],
})
export class DashboardComponent {
  isSidebarCollapsed = false;
  img = 'assets/Telework.png';
  name: string = '';
  Links: { route: string; label: string; icon: string }[] = [];
  role=''
  constructor(private authService: AuthService,private router:Router) {}

  ngOnInit(): void {
    const tokenData = this.authService.getTokenData();

    if (tokenData) {
      this.role = tokenData.role;
      this.setLinksByRole(this.role);
      console.log(this.Links);
    } else {
      this.authService.logout();
    }
  }

  setLinksByRole(role: string): void {
    this.Links = Constants.Links.filter((link) => link.role.includes(role));
    this.router.navigate([this.Links[0].route])
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    if (window.confirm('Are you sure you want to log out?')) {
      this.authService.logout();
    }
  }
}
