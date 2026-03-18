import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommentService } from '../../core/services/comment-service';

interface Comment {
  messageId: number;
  message: string;
  createdDate: string;

  likes: number;
  dislikes: number;
  loves: number;
  party: number;

  isUserLiked: boolean;
  isUserDisliked: boolean;
  isUserLoved: boolean;
  isUserParty: boolean;
}

@Component({
  selector: 'app-comments',
  imports: [RouterModule],
  templateUrl: './comments.html',
  styleUrl: './comments.scss',
  standalone: true,
})
export class Comments {
  private commentService = inject(CommentService);
  goldenLikeTarget = 20;
  bannerLikeThreshold = 15;
  isLoading = signal(true);
  showScrollTop = signal(false);
  private pendingReactions = new Set<string>();
  private animatingReactions = new Set<string>();

  comments: Comment[] = [];

  ngOnInit() {
    this.loadComments();
    this.onWindowScroll();
  }

  loadComments() {
    this.isLoading.set(true);

    this.commentService.GetAllComments().subscribe({
      next: (res) => {
        const rawComments = res?.data ?? res?.Data ?? [];
        const incoming = Array.isArray(rawComments) ? (rawComments as Partial<Comment>[]) : [];

        this.comments = incoming
          .filter((comment): comment is Partial<Comment> => !!comment)
          .map((comment) => ({
            ...(comment as Comment),
            likes: Number((comment as any).like ?? comment.likes ?? 0),
            dislikes: Number(comment.dislikes ?? 0),
            loves: Number(comment.loves ?? 0),
            party: Number(comment.party ?? 0),
            isUserLiked: Boolean(comment.isUserLiked),
            isUserDisliked: Boolean(comment.isUserDisliked),
            isUserLoved: Boolean(comment.isUserLoved),
            isUserParty: Boolean(comment.isUserParty),
          }));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load comments', err);
        this.comments = [];
        this.isLoading.set(false);
      },
    });
  }

  getReactionCount(comment: Comment, reactionName: string): number {
    switch (reactionName.toLowerCase()) {
      case 'like':
        return Number(comment.likes ?? 0);
      case 'dislike':
        return Number(comment.dislikes ?? 0);
      case 'heart':
        return Number(comment.loves ?? 0);
      case 'party':
        return Number(comment.party ?? 0);
      default:
        return 0;
    }
  }

  isGoldenComment(comment: Comment): boolean {
    return this.getReactionCount(comment, 'Like') >= this.goldenLikeTarget;
  }

  likesAwayFromGolden(comment: Comment): number {
    const likes = this.getReactionCount(comment, 'Like');

    return Math.max(this.goldenLikeTarget - likes, 0);
  }

  formatCreatedDate(createdDate: string): string {
    if (!createdDate) return '';

    const date = new Date(createdDate);
    if (Number.isNaN(date.getTime())) return createdDate;

    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  reactComments(messageId: number, reactionTypeId: number) {
    const requestKey = `${messageId}-${reactionTypeId}`;
    if (this.pendingReactions.has(requestKey)) {
      return;
    }

    const comment = this.comments.find((c) => c.messageId === messageId);
    if (!comment) return;

    const previousState = {
      likes: comment.likes,
      dislikes: comment.dislikes,
      loves: comment.loves,
      party: comment.party,
      isUserLiked: comment.isUserLiked,
      isUserDisliked: comment.isUserDisliked,
      isUserLoved: comment.isUserLoved,
      isUserParty: comment.isUserParty,
    };

    const reactData = {
      messageId,
      reactionTypeId,
    };

    this.pendingReactions.add(requestKey);
    this.triggerReactionAnimation(requestKey);
    this.applyReactionToggle(comment, reactionTypeId);

    this.commentService.ReactToComment(reactData).subscribe({
      next: (res) => {
        this.pendingReactions.delete(requestKey);

        if (res.status !== 200) {
          Object.assign(comment, previousState);
        }
      },
      error: (err) => {
        this.pendingReactions.delete(requestKey);
        Object.assign(comment, previousState);
        console.error(err);
      },
    });
  }

  isReactionAnimating(messageId: number, reactionTypeId: number): boolean {
    return this.animatingReactions.has(`${messageId}-${reactionTypeId}`);
  }

  private applyReactionToggle(comment: Comment, reactionTypeId: number) {
    switch (reactionTypeId) {
      case 1:
        comment.isUserLiked = !comment.isUserLiked;
        comment.likes += comment.isUserLiked ? 1 : -1;
        break;

      case 2:
        comment.isUserDisliked = !comment.isUserDisliked;
        comment.dislikes += comment.isUserDisliked ? 1 : -1;
        break;

      case 3:
        comment.isUserLoved = !comment.isUserLoved;
        comment.loves += comment.isUserLoved ? 1 : -1;
        break;

      case 4:
        comment.isUserParty = !comment.isUserParty;
        comment.party += comment.isUserParty ? 1 : -1;
        break;
    }
  }

  private triggerReactionAnimation(requestKey: string) {
    this.animatingReactions.delete(requestKey);
    this.animatingReactions.add(requestKey);

    setTimeout(() => {
      this.animatingReactions.delete(requestKey);
    }, 380);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.showScrollTop.set(currentScroll > 280);
  }

  scrollToTop(): void {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
