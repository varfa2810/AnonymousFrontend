import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-about',
  imports: [RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  standalone: true,
})
export class About {

  private authService = inject(Auth);

  isSuperAdmin = this.authService.isSuperAdmin();
}
