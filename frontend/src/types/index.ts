// ==================== Auth ====================
export type UserRole = 'admin' | 'assistant' | 'viewer';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  position?: string;
  avatar?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManagedUser extends User {
  password?: string; // only in mock mode
  position?: string;
}

export interface CreateUserRequest {
  username: string;
  full_name: string;
  password: string;
  role: UserRole;
  position?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  password?: string;
  position?: string;
}

export interface AssociationMember {
  id: number;
  association_id: number;
  role: 'secretary' | 'vice_secretary' | 'inspector' | 'member1' | 'member2' | 'alternate';
  role_label: string;
  full_name: string;
  national_id?: string;
  phone?: string;
  email?: string;
  major?: string;
  semester?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ==================== Uploaded Files ====================
export type FileType = 'associations' | 'forms' | 'unknown';
export type FileStatus = 'pending' | 'processing' | 'success' | 'error';

export interface UploadedFile {
  id: number;
  original_filename: string;
  stored_filename: string;
  file_type: FileType;
  file_size: number;
  uploaded_by: string;
  status: FileStatus;
  parsed_at: string | null;
  created_at: string;
  error_message: string | null;
  record_count: number | null;
  warnings_count: number | null;
}

// ==================== Association ====================
export type ActivityStatus = 'فعال' | 'نیمه‌فعال' | 'کم‌فعالیت' | 'نامشخص';
export type LogoStatus = 'دارد' | 'ناقص' | 'ندارد' | 'نامشخص';

export interface Association {
  id: number;
  upload_id: number;
  name: string;
  secretary_name: string | null;
  phone: string | null;
  activity_status: ActivityStatus;
  logo_status: LogoStatus;
  header_status: LogoStatus;
  student_email: string | null;
  roadmap_session: string | null;
  channel_bale: string | null;
  channel_rubika: string | null;
  channel_igap: string | null;
  channel_ita: string | null;
  content_production: string | null;
  form_competition: string | null;
  form_workshop: string | null;
  status: string | null;
  site_activity_registered: string | null;
  roadmap: string | null;
  new_license_session: string | null;
  notes: string | null;
  needs_follow_up: boolean;
  missing_fields: string[];
  created_at: string;
}

// ==================== Association Form ====================
export type FormType = 'کارگاه' | 'مسابقه' | 'نامشخص';
export type SignatureStatus = 'کامل' | 'ناقص' | 'نامشخص';

export interface AssociationForm {
  id: number;
  upload_id: number;
  association_name: string;
  workshop_title: string | null;
  competition_title: string | null;
  event_date: string | null;
  status: string | null;
  sig_secretary: string | null;
  sig_advisor: string | null;
  sig_inspector: string | null;
  sig_dean: string | null;
  sig_head_associations: string | null;
  sig_director_general: string | null;
  description: string | null;
  form_type: FormType;
  is_complete: boolean;
  has_missing_signature: boolean;
  is_cancelled: boolean;
  needs_follow_up: boolean;
  created_at: string;
}

// ==================== Dashboard ====================
export interface KPIData {
  total_associations: number;
  active_associations: number;
  semi_active_associations: number;
  low_activity_associations: number;
  unknown_activity_associations: number;
  has_logo: number;
  no_logo: number;
  has_header: number;
  no_header: number;
  has_email: number;
  no_email: number;
  needs_follow_up_associations: number;
  total_forms: number;
  workshops: number;
  competitions: number;
  complete_forms: number;
  incomplete_forms: number;
  no_date_forms: number;
  cancelled_forms: number;
  needs_follow_up_forms: number;
  last_upload_date: string | null;
  last_processed_date: string | null;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardCharts {
  activity_status_chart: ChartDataItem[];
  logo_status_chart: ChartDataItem[];
  form_type_chart: ChartDataItem[];
  signature_status_chart: ChartDataItem[];
  associations_by_channel: ChartDataItem[];
}

// ==================== Pagination ====================
export interface PaginationParams {
  page: number;
  per_page: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ==================== Filters ====================
export interface AssociationFilters extends PaginationParams {
  activity_status?: ActivityStatus | '';
  logo_status?: LogoStatus | '';
  has_email?: boolean | null;
  needs_follow_up?: boolean | null;
}

export interface FormFilters extends PaginationParams {
  association_name?: string;
  form_type?: FormType | '';
  is_complete?: boolean | null;
  needs_follow_up?: boolean | null;
  has_missing_signature?: boolean | null;
}

// ==================== Export ====================
export type ExportType = 'associations' | 'forms' | 'full_report' | 'dashboard_pdf';

export interface ExportRequest {
  export_type: ExportType;
  filters?: AssociationFilters | FormFilters;
}

// ==================== Profile ====================
export interface UserProfile {
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string; // base64 data URL (stored separately in localStorage)
  department?: string;
  position?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  department?: string;
  position?: string;
}

export interface ChangePasswordRequest {
  current_password?: string;
  new_password: string;
}

// ==================== Association Activities ====================
export type ActivityType =
  | 'بازدید_علمی' | 'نشریه' | 'سخنرانی_علمی' | 'همکاری_علمی'
  | 'کارگاه' | 'نمایشگاه' | 'دوره_کمک_آموزشی' | 'همایش_علمی'
  | 'کرسی_اندیشه_ورزی' | 'مسابقه_علمی';

export const ACTIVITY_LABELS: Record<string, string> = {
  بازدید_علمی:         'بازدید علمی',
  نشریه:               'نشریه',
  سخنرانی_علمی:        'سخنرانی علمی',
  همکاری_علمی:         'همکاری و مشارکت علمی',
  کارگاه:              'برگزاری کارگاه',
  نمایشگاه:            'برگزاری نمایشگاه',
  دوره_کمک_آموزشی:     'دوره‌های کمک آموزشی',
  همایش_علمی:          'برگزاری همایش علمی',
  کرسی_اندیشه_ورزی:    'کرسی اندیشه‌ورزی',
  مسابقه_علمی:         'مسابقه علمی',
};

export const ACTIVITY_COLORS: Record<string, string> = {
  بازدید_علمی:         '#2174b8',
  نشریه:               '#7fa343',
  سخنرانی_علمی:        '#f59e0b',
  همکاری_علمی:         '#8b5cf6',
  کارگاه:              '#ec4899',
  نمایشگاه:            '#06b6d4',
  دوره_کمک_آموزشی:     '#f97316',
  همایش_علمی:          '#10b981',
  کرسی_اندیشه_ورزی:    '#6366f1',
  مسابقه_علمی:         '#ef4444',
};

export interface AssociationActivity {
  id: number;
  association_name: string;
  activity_type: ActivityType;
  activity_label: string;
  title?: string | null;
  event_date?: string | null;
  semester?: string | null;
  academic_year?: string | null;
  month?: number | null;
  year?: number | null;
  participants_count?: number | null;
  description?: string | null;
  status?: string | null;
}

export interface ActivityStats {
  total: number;
  by_type: { type: string; label: string; color: string; count: number }[];
  by_association: { name: string; count: number }[];
  monthly_trend: { label: string; year: number; month: number; count: number }[];
  quarterly_trend: { label: string; count: number }[];
  activity_labels: Record<string, string>;
  activity_colors: Record<string, string>;
}

export interface AnalyticsData {
  summary: {
    total_associations: number;
    active_associations: number;
    total_activities: number;
    total_forms: number;
    unique_active_associations: number;
    avg_activities_per_assoc: number;
    period_months: number | null;
  };
  assoc_status: { name: string; count: number }[];
  logo_status: { name: string; count: number }[];
  activity_by_type: { type: string; label: string; count: number; color: string }[];
  monthly_trend: { label: string; count: number }[];
  top_associations: { association_name: string; count: number }[];
  participants_stats: { total: number; mean: number; median: number; max: number; min: number };
  forms_summary: { total: number; complete: number; cancelled: number; needs_follow_up: number; completion_rate: number };
  forms_by_type: { form_type: string; count: number }[];
  activity_form_correlation: number;
}

// ==================== Association Meetings ====================
export type MeetingType = 'عادی' | 'فوری' | 'هیئت‌رئیسه' | 'مشترک';
export type MeetingStatus = 'برنامه‌ریزی شده' | 'برگزار شد' | 'لغو شد';

export interface AssociationMeeting {
  id: number;
  association_name: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  location: string | null;
  meeting_type: MeetingType;
  agenda: string | null;
  description: string | null;
  attendees_count: number | null;
  status: MeetingStatus;
  decisions: string | null;
  created_at: string;
}

export interface MeetingFilters extends PaginationParams {
  association_name?: string;
  meeting_type?: MeetingType | '';
  status?: MeetingStatus | '';
}

export interface CreateMeetingRequest {
  association_name: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  location?: string;
  meeting_type: MeetingType;
  agenda?: string;
  description?: string;
  attendees_count?: number;
  status: MeetingStatus;
  decisions?: string;
}

// ==================== Settings ====================
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  updated_at: string;
}

export interface SettingsUpdateRequest {
  settings: { key: string; value: string }[];
}

// ==================== UI State ====================
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

// ==================== Upload Log ====================
export interface UploadLog {
  id: number;
  upload_id: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  row_number: number | null;
  column_name: string | null;
  created_at: string;
}
