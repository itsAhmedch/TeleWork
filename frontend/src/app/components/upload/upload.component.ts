import { Component } from '@angular/core';
import { HttpClientModule, HttpClient, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import { ToastComponent } from '../toast notification/toast.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule,ToastComponent],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  uploadProgress: number | null = null;

  constructor(private http: HttpClient,private toastService:ToastService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => (this.previewUrl = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }
  isImage(file: File): boolean {
    return file && file.type.startsWith('image/');
  }

  onUpload() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post(environment.apiUrl + '/upload/image', formData, {
        reportProgress: true,
        observe: 'events',
      }).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
        } else if (event.type === HttpEventType.Response) {
         
          this.toastService.showToast('Uploaded successfully',true)
          this.uploadProgress = null; // Reset progress after upload
        }
      }, error => {
        this.toastService.showToast('Upload failed',false)
        console.error('Upload failed:', error);
        this.uploadProgress = null; // Reset progress after error
      });
    } else {
      this.toastService.showToast('No file selected',false)
      console.warn('No file selected');
    }
  }
}
