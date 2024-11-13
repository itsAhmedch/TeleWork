import { Component } from '@angular/core';
import { UsersComponent } from '../../components/users/users.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss'
})
export class UsersPageComponent {

}
