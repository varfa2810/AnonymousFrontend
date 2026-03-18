import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  standalone: true,
})
export class Settings {
  newUsername = '';
}
