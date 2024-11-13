// src/app/components/toast/toast.component.ts
import { Component, TemplateRef } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports:[CommonModule ]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
