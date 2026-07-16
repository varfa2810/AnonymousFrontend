export interface LoginResponseDto {
  token: string;
  userId: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface RegisterCompanyDto {
  companyName: string;
  employeeStrength: number;
  email: string;
  phone: string;
  countryId: number;
  stateId: number;
  cityId: number;
  companyAddress: string;
  requesterEmail: string;
}

export interface CompanySummaryDto {
  id: number | string;
  companyName: string;
  email?: string;
  phone?: string;
  employeeStrength?: number;
  companyAddress?: string;
  requesterEmail?: string;
  countryName?: string;
  stateName?: string;
  cityName?: string;
  approvalStatus?: string;
  isApproved?: boolean;
  createdDate?: string;
}

export interface CommentDto {
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

export interface MessageComment {
  id: number | string;
  message: string;
  createdDate: string;
  authorName?: string;
}

export interface MessageDto {
  messageId: number;
  message: string;
  createdDate: Date;

  likes: number;
  dislikes: number;
  loves: number;
  party: number;

  isUserLiked: boolean;
  isUserDisliked: boolean;
  isUserLoved: boolean;
  isUserParty: boolean;
}

export interface ReactToMessageDto {
  messageId: number;
  reactionTypeId: number;
}

export interface CommentResponseDto {
  messageId: number;
  commentId: number;
  comment: string;
}

export interface ViolationOption {
  id: number;
  optionName: string;
}

export interface ReportMessageDto {
  messageId: number;
  violatedOption: number;
  comment: string;
}
