import { Component } from '@angular/core';
import { ExtractDataComponent } from '../../components/extract-data/extract-data.component';

@Component({
  selector: 'app-extract-page',
  standalone: true,
  imports: [ExtractDataComponent],
  templateUrl: './extract-page.component.html',
  styleUrl: './extract-page.component.scss'
})
export class ExtractPageComponent {

}
