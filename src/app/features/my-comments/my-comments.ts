import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-comments',
  imports: [RouterModule],
  templateUrl: './my-comments.html',
  styleUrl: './my-comments.scss',
  standalone: true,
})
export class MyComments {
  comments = [
    {
      id: 1,
      createdAt: '04 Mar 2026, 10:30 AM',
      content: 'Your comment content will appear here.',
    },
  ];
}
