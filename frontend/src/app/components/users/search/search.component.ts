import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent  {
  constructor(private readonly userService: UserService){}
  searchQuery: string = '';

  @Output() search: EventEmitter<string> = new EventEmitter();

  onSearch() {
    this.search.emit(this.searchQuery);
  }
}
