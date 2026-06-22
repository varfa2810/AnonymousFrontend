import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { SendMessageService } from '../../core/services/send-message-service';

@Component({
  selector: 'app-request',
  imports: [RouterModule, FormsModule],
  templateUrl: './request.html',
  styleUrl: './request.scss',
  standalone: true,
})
export class Request {
  requestText: string = '';
  minLength = 10;
  maxLength = 500;
  private authService = inject(Auth);
  private sendMessageService = inject(SendMessageService);
  private router = inject(Router);

  sendRequest() {
    const trimmedMessage = this.requestText.trim();
    if (trimmedMessage.length < this.minLength) {
      return;
    }

    const formData = {
      message: trimmedMessage,
      userId: this.authService.currentUser()?.userId,
    };

    this.sendMessageService.SendMessage(formData).subscribe({
      next: (res) => {
        if (res.status === 201) {
          console.log('Message sent successfully');
          this.router.navigate(['/comments']);
        }
      },
      error: (err) => {
        console.error('Error sending message', err);
      },
    });
  }
}
