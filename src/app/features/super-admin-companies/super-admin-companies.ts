import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CompanySummary } from '../../core/interface/Interfaces';
import { SuperAdminService } from '../../core/services/super-admin.service';
import { UserAuth } from '../../core/services/user-auth';

@Component({
  selector: 'app-super-admin-companies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin-companies.html',
  styleUrl: './super-admin-companies.scss',
})
export class SuperAdminCompanies {
  private superAdminService = inject(SuperAdminService);
  private authService = inject(UserAuth);
  private router = inject(Router);

  isLoading = signal(true);
  loadError = signal('');
  searchTerm = signal('');
  copiedCompanyId = signal<string | number | null>(null);
  copiedEmail = signal<string | null>(null);
  approvingCompanyId = signal<string | number | null>(null);
  rejectingCompanyId = signal<string | number | null>(null);
  companies = signal<CompanySummary[]>([]);
  filteredCompanies = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.companies();
    }

    return this.companies().filter((company) =>
      (company.companyName ?? '').toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.superAdminService.GetAllCompanyDetails().subscribe({
      next: (res) => {
        const normalizedCompanies = this.normalizeCompanyList(res?.data ?? res);
        this.companies.set(normalizedCompanies);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load company details', err);
        this.companies.set([]);

        if (err.status === 404) {
          this.loadError.set('No company details found.');
        } else {
          this.loadError.set('Unable to load company details. Please try again later.');
        }

        this.isLoading.set(false);
      },
    });
  }


  trackByCompanyId(_index: number, company: CompanySummary): number | string {
    return company.id;
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Not available';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  copyCompanyId(companyId: string | number): void {
    const normalizedId = String(companyId);

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    navigator.clipboard.writeText(normalizedId).then(() => {
      this.copiedCompanyId.set(companyId);

      setTimeout(() => {
        if (String(this.copiedCompanyId()) === normalizedId) {
          this.copiedCompanyId.set(null);
        }
      }, 1800);
    });
  }

  copyEmail(email: string | undefined): void {
    const normalizedEmail = (email ?? '').trim();
    if (!normalizedEmail || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    navigator.clipboard.writeText(normalizedEmail).then(() => {
      this.copiedEmail.set(normalizedEmail);

      setTimeout(() => {
        if (this.copiedEmail() === normalizedEmail) {
          this.copiedEmail.set(null);
        }
      }, 1800);
    });
  }

  updateSearchTerm(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  approveCompany(companyId: string | number, action : boolean): void {
    if (String(this.approvingCompanyId()) === String(companyId)) {
      return;
    }

    this.approvingCompanyId.set(companyId);

    this.superAdminService.ApproveCompany(companyId, action).subscribe({
      next: (res) => {
        const isSuccess = res?.status === 200 || res?.status === 201 || res?.data === true;
        if (isSuccess) {
          this.updateCompanyStatus(companyId, 'Approved', true);
        }
        this.approvingCompanyId.set(null);
      },
      error: (err) => {
        console.error('Failed to approve company', err);
        this.approvingCompanyId.set(null);
      },
    });
  }

  rejectCompany(companyId: string | number): void {
    if (String(this.rejectingCompanyId()) === String(companyId)) {
      return;
    }

    this.rejectingCompanyId.set(companyId);
    queueMicrotask(() => {
      this.updateCompanyStatus(companyId, 'Rejected', false);
      this.rejectingCompanyId.set(null);
    });
  }

  approvalLabel(company: CompanySummary | null): string {
    if (!company) {
      return 'Pending';
    }

    if (typeof company.approvalStatus === 'string' && company.approvalStatus.trim().length > 0) {
      return company.approvalStatus.trim();
    }

    return company.isApproved ? 'Approved' : 'Pending';
  }

  companyStatusClass(company: CompanySummary | null): 'approved' | 'rejected' | 'pending' {
    const label = this.approvalLabel(company).toLowerCase();

    if (label === 'approved') {
      return 'approved';
    }

    if (label === 'rejected') {
      return 'rejected';
    }

    return 'pending';
  }

  isApproving(companyId: string | number): boolean {
    return String(this.approvingCompanyId()) === String(companyId);
  }

  isRejecting(companyId: string | number): boolean {
    return String(this.rejectingCompanyId()) === String(companyId);
  }

  private normalizeCompanyList(payload: unknown): CompanySummary[] {
    const rawItems: unknown[] = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.data)
        ? (payload as any).data
        : Array.isArray((payload as any)?.Data)
          ? (payload as any).Data
          : [];

    return rawItems
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item: Record<string, unknown>, index: number) =>
        this.normalizeCompany(item, this.readIdentifier(item, ['id', 'companyId']) ?? index),
      );
  }

  private normalizeCompany(payload: unknown, fallbackId: number | string): CompanySummary {
    const company = (payload ?? {}) as Record<string, unknown>;

    return {
      id: this.readIdentifier(company, ['id', 'companyId']) ?? fallbackId,
      companyName:
        this.readString(company, ['companyName', 'name', 'organizationName']) ?? 'Unnamed Company',
      email: this.readString(company, ['email', 'companyEmail']),
      phone: this.readString(company, ['phone', 'phoneNumber', 'mobile']),
      employeeStrength: this.readNumber(company, ['employeeStrength', 'strength', 'employeeCount']),
      companyAddress: this.readString(company, ['companyAddress', 'address']),
      requesterEmail: this.readString(company, ['requesterEmail', 'requestedByEmail']),
      countryName: this.readString(company, ['countryName', 'country']),
      stateName: this.readString(company, ['stateName', 'state']),
      cityName: this.readString(company, ['cityName', 'city']),
      approvalStatus: this.readString(company, ['approvalStatus', 'status']),
      isApproved: this.readBoolean(company, ['isApproved', 'approved']),
      createdDate: this.readString(company, [
        'companyCreatedDate',
        'createdDate',
        'createdAt',
        'requestedDate',
      ]),
    };
  }

  private updateCompanyStatus(
    companyId: string | number,
    approvalStatus: string,
    isApproved: boolean,
  ): void {
    this.companies.update((companies) =>
      companies.map((company) =>
        String(company.id) === String(companyId)
          ? {
            ...company,
            approvalStatus,
            isApproved,
          }
          : company,
      ),
    );
  }

  private readValue(source: Record<string, unknown>, keys: string[]): unknown {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    return null;
  }

  private readIdentifier(
    source: Record<string, unknown>,
    keys: string[],
  ): string | number | null {
    const value = this.readValue(source, keys);
    return typeof value === 'string' || typeof value === 'number' ? value : null;
  }

  private readString(source: Record<string, unknown>, keys: string[]): string | undefined {
    const value = this.readValue(source, keys);
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
  }

  private readNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
    const value = this.readValue(source, keys);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private readBoolean(source: Record<string, unknown>, keys: string[]): boolean | undefined {
    const value = this.readValue(source, keys);
    return typeof value === 'boolean' ? value : undefined;
  }
}
