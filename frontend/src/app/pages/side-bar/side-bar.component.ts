import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Constants } from '../../../shared/SideBar.Links';
import { ConfirmComponent } from '../../components/Confirm Modal/confirm.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule, ConfirmComponent],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'], // Corrected from 'styleUrl' to 'styleUrls'
  providers: [AuthService],
})
export class DashboardComponent {
  isSidebarCollapsed = false;
  img = 'assets/Telework.png';

  Links: { route: string; label: string; icon: string }[] = [];

  MyInfo = {
    role: '',
    username: '',
  };

  showLogoutModal: boolean = false;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const tokenData = this.authService.getTokenData();

    if (tokenData) {
      this.MyInfo.role = tokenData.role;
      this.setLinksByRole(this.MyInfo.role);
      this.MyInfo.username = tokenData.username;
    } else {
      this.authService.logout();
    }
  }

  setLinksByRole(role: string): void {
    this.Links = Constants.Links.filter((link) => link.role.includes(role));
    this.router.navigate([this.Links[0].route]);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  openLogoutModel() {
    this.showLogoutModal = true;
  }
  logout() {
    this.authService.logout();
  }
}
