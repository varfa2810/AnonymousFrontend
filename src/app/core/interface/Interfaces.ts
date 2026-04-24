export interface LoginResponse {
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

export interface CompanySummary {
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

