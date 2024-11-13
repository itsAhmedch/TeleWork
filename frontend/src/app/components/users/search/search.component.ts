import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  constructor() {}

  searchQuery: string = '';

  @Output() search: EventEmitter<string> = new EventEmitter();

  onSearch() {
    if (!this.searchQuery.trim()) {
      // If the search query is empty or just whitespace, emit an empty string
      this.searchQuery = '';
    }
    
    this.search.emit(this.searchQuery);
  }
}
