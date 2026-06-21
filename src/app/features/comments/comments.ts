import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommentService } from '../../core/services/comment-service';
import { Auth } from '../../core/services/auth';
import { CommentDto, MessageComment } from '../../core/interface/Interfaces';

type CommentThreadRecord = Record<string, unknown>;
type ReactionCommentRecord = Omit<CommentDto, 'createdDate'> & {
  createdDate: string | Date;
  like?: number;
};

@Component({
  selector: 'app-comments',
  imports: [RouterModule, FormsModule],
  templateUrl: './comments.html',
  styleUrl: './comments.scss',
  standalone: true,
})
export class Comments {
  private commentService = inject(CommentService);
  private authService = inject(Auth);
  goldenLikeTarget = 1;
  bannerLikeThreshold = 15;
  readonly minCommentLength = 2;
  readonly maxCommentLength = 300;
  isLoading = signal(true);
  showScrollTop = signal(false);
  private pendingReactions = new Set<string>();
  private animatingReactions = new Set<string>();
  expandedMessageId = signal<number | null>(null);
  threadLoadingMessageId = signal<number | null>(null);
  threadErrorMessageId = signal<number | null>(null);
  messageThreads = signal<Record<number, MessageComment[]>>({});
  commentDrafts = signal<Record<number, string>>({});
  submittingCommentMessageId = signal<number | null>(null);
  commentSubmitErrors = signal<Record<number, string>>({});

  comments: CommentDto[] = [];

  ngOnInit() {
    this.loadComments();
    this.onWindowScroll();
  }

  loadComments() {
    this.isLoading.set(true);

    this.commentService.GetAllComments().subscribe({
      next: (res) => {
        const incoming = Array.isArray(res?.data) ? res.data : [];

        this.comments = incoming.map((comment) => this.normalizeComment(comment));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load comments', err);
        this.comments = [];
        this.isLoading.set(false);
      },
    });
  }

  getReactionCount(comment: CommentDto, reactionName: string): number {
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

  isGoldenComment(comment: CommentDto): boolean {
    return this.getReactionCount(comment, 'Like') >= this.goldenLikeTarget;
  }

  likesAwayFromGolden(comment: CommentDto): number {
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

  toggleCommentsThread(messageId: number): void {
    if (this.expandedMessageId() === messageId) {
      this.expandedMessageId.set(null);
      this.threadLoadingMessageId.set(null);
      this.threadErrorMessageId.set(null);
      return;
    }

    this.expandedMessageId.set(messageId);
    this.fetchMessageThread(messageId);
  }

  isThreadExpanded(messageId: number): boolean {
    return this.expandedMessageId() === messageId;
  }

  isThreadLoading(messageId: number): boolean {
    return this.threadLoadingMessageId() === messageId;
  }

  hasThreadError(messageId: number): boolean {
    return this.threadErrorMessageId() === messageId;
  }

  getMessageThread(messageId: number): MessageComment[] {
    return this.messageThreads()[messageId] ?? [];
  }

  getCommentDraft(messageId: number): string {
    return this.commentDrafts()[messageId] ?? '';
  }

  updateCommentDraft(messageId: number, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.commentDrafts.update((drafts) => ({
      ...drafts,
      [messageId]: value,
    }));

    if (this.commentSubmitErrors()[messageId]) {
      this.commentSubmitErrors.update((errors) => ({
        ...errors,
        [messageId]: '',
      }));
    }
  }

  isSubmittingComment(messageId: number): boolean {
    return this.submittingCommentMessageId() === messageId;
  }

  canSubmitComment(messageId: number): boolean {
    const draft = this.getCommentDraft(messageId).trim();
    return draft.length >= this.minCommentLength && !this.isSubmittingComment(messageId);
  }

  getCommentSubmitError(messageId: number): string {
    return this.commentSubmitErrors()[messageId] ?? '';
  }

  sendComment(messageId: number): void {
    const userId = this.authService.currentUser()?.userId;
    const draft = this.getCommentDraft(messageId).trim();

    if (!userId) {
      this.setCommentSubmitError(messageId, 'Your session is missing. Please log in again.');
      return;
    }

    if (draft.length < this.minCommentLength) {
      this.setCommentSubmitError(messageId, 'Write a slightly longer comment before sending.');
      return;
    }

    const commentPayload = {
      messageId,
      comment: draft,
      userId,
    };

    this.submittingCommentMessageId.set(messageId);
    this.setCommentSubmitError(messageId, '');

    this.commentService.CommentOnMessage(commentPayload).subscribe({
      next: (res) => {
        const isSuccessful = res?.status === 200 || res?.status === 201 || res?.data === true;
        if (!isSuccessful) {
          this.submittingCommentMessageId.set(null);
          this.setCommentSubmitError(messageId, 'We could not send your comment right now.');
          return;
        }

        this.commentDrafts.update((drafts) => ({
          ...drafts,
          [messageId]: '',
        }));

        this.fetchMessageThread(messageId, true);
      },
      error: (err) => {
        console.error('Failed to send comment', err);
        this.submittingCommentMessageId.set(null);
        this.setCommentSubmitError(messageId, 'We could not send your comment right now.');
      },
    });
  }

  private applyReactionToggle(comment: CommentDto, reactionTypeId: number) {
    switch (reactionTypeId) {
      case 1:
        comment.isUserLiked = !comment.isUserLiked;
        comment.likes = Math.max(0, comment.likes + (comment.isUserLiked ? 1 : -1));
        break;

      case 2:
        comment.isUserDisliked = !comment.isUserDisliked;
        comment.dislikes = Math.max(0, comment.dislikes + (comment.isUserDisliked ? 1 : -1));
        break;

      case 3:
        comment.isUserLoved = !comment.isUserLoved;
        comment.loves = Math.max(0, comment.loves + (comment.isUserLoved ? 1 : -1));
        break;

      case 4:
        comment.isUserParty = !comment.isUserParty;
        comment.party = Math.max(0, comment.party + (comment.isUserParty ? 1 : -1));
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

  private fetchMessageThread(messageId: number, forceReload = false): void {
    this.threadErrorMessageId.set(null);

    if (!forceReload && this.messageThreads()[messageId]) {
      return;
    }

    this.threadLoadingMessageId.set(messageId);

    this.commentService.GetCommentsByMessageId(messageId).subscribe({
      next: (res) => {
        const rawComments = res?.data ?? res ?? [];
        const incoming = Array.isArray(rawComments) ? rawComments : [];
        const normalizedComments = incoming
          .filter((comment) => !!comment && typeof comment === 'object')
          .map((comment, index) =>
            this.normalizeMessageComment(comment as unknown as CommentThreadRecord, index)
          );

        this.messageThreads.update((threads) => ({
          ...threads,
          [messageId]: normalizedComments,
        }));

        if (this.threadLoadingMessageId() === messageId) {
          this.threadLoadingMessageId.set(null);
        }

        if (this.submittingCommentMessageId() === messageId) {
          this.submittingCommentMessageId.set(null);
        }
      },
      error: (err) => {
        console.error('Failed to load message comments', err);
        this.messageThreads.update((threads) => ({
          ...threads,
          [messageId]: [],
        }));
        this.threadErrorMessageId.set(messageId);

        if (this.threadLoadingMessageId() === messageId) {
          this.threadLoadingMessageId.set(null);
        }

        if (this.submittingCommentMessageId() === messageId) {
          this.submittingCommentMessageId.set(null);
        }
      },
    });
  }

  private setCommentSubmitError(messageId: number, message: string): void {
    this.commentSubmitErrors.update((errors) => ({
      ...errors,
      [messageId]: message,
    }));
  }

  private normalizeMessageComment(comment: CommentThreadRecord, index: number): MessageComment {
    return {
      id:
        this.asNumber(comment['commentId']) ??
        this.asNumber(comment['id']) ??
        this.asNumber(comment['messageCommentId']) ??
        `comment-${index + 1}`,
      message:
        this.asString(comment['comment']) ??
        this.asString(comment['message']) ??
        this.asString(comment['content']) ??
        'Comment unavailable.',
      createdDate:
        this.asString(comment['createdDate']) ??
        this.asString(comment['createdAt']) ??
        this.asString(comment['commentDate']) ??
        '',
      authorName:
        this.asString(comment['authorName']) ??
        this.asString(comment['userName']) ??
        this.asString(comment['username']) ??
        this.asString(comment['postedBy']) ??
        undefined,
    };
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private asNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeComment(comment: ReactionCommentRecord): CommentDto {
    return {
      messageId: Number(comment.messageId),
      message: String(comment.message ?? ''),
      createdDate:
        comment.createdDate instanceof Date
          ? comment.createdDate.toISOString()
          : String(comment.createdDate ?? ''),
      likes: Number(((comment as unknown as { like?: number }).like ?? comment.likes ?? 0)),
      dislikes: Number(comment.dislikes ?? 0),
      loves: Number(comment.loves ?? 0),
      party: Number(comment.party ?? 0),
      isUserLiked: Boolean(comment.isUserLiked),
      isUserDisliked: Boolean(comment.isUserDisliked),
      isUserLoved: Boolean(comment.isUserLoved),
      isUserParty: Boolean(comment.isUserParty),
    };
  }
}
