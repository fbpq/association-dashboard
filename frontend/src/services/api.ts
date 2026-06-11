/**
 * API Service Layer
 * All API calls go through here. Replace MOCK_MODE = false and
 * set BASE_URL to connect to the real FastAPI backend.
 */

import type {
  LoginRequest, LoginResponse, User, ManagedUser,
  CreateUserRequest, UpdateUserRequest,
  UserProfile, UpdateProfileRequest, ChangePasswordRequest,
  UploadedFile, KPIData, DashboardCharts,
  Association, AssociationForm, AssociationMember,
  AssociationActivity, ActivityStats, AnalyticsData,
  AssociationMeeting, MeetingFilters, CreateMeetingRequest,
  AssociationFilters, FormFilters,
  PaginatedResponse, UploadLog,
} from '@/types';
import {
  MOCK_ASSOCIATIONS, MOCK_FORMS, MOCK_FILES,
  MOCK_KPI, MOCK_CHARTS, MOCK_USERS,
  MOCK_ASSOCIATION_MEMBERS,
  MOCK_ACTIVITIES, MOCK_ACTIVITY_STATS, MOCK_ANALYTICS,
  MOCK_MEETINGS,
} from './mockData';

let mockMeetings: AssociationMeeting[] = [...MOCK_MEETINGS];
let nextMeetingId = Math.max(...MOCK_MEETINGS.map(m => m.id)) + 1;

// In-memory mutable user store for mock CRUD
let mockUsers: ManagedUser[] = [...MOCK_USERS];
let nextUserId = Math.max(...MOCK_USERS.map(u => u.id)) + 1;

const BASE_URL = '/api';
const MOCK_MODE = false; // false = production (backend running), true = local dev

// ── HTTP helpers ─────────────────────────────────────────────────────────────

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'خطای سرور' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    if (MOCK_MODE) {
      await sleep(800);
      if (data.username && data.password) {
        const token = 'mock_token_' + Date.now();
        const user: User = { id: 1, username: data.username, full_name: 'مدیر سامانه', role: 'admin', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        return { access_token: token, token_type: 'bearer', user };
      }
      throw new Error('کد ملی و شماره همراه الزامی است.');
    }
    const form = new URLSearchParams();
    form.append('username', data.username);
    form.append('password', data.password);
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'خطای ورود' }));
      throw new Error(err.detail || 'خطای ورود');
    }
    return res.json();
  },

  logout: async (): Promise<void> => {
    if (MOCK_MODE) { await sleep(300); return; }
    await request('POST', '/auth/logout');
  },

  me: async (): Promise<User> => {
    if (MOCK_MODE) {
      await sleep(300);
      return { id: 1, username: 'admin', full_name: 'مدیر سامانه', role: 'admin', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    }
    return request('GET', '/auth/me');
  },
};

// ── Files API ─────────────────────────────────────────────────────────────────

export const filesApi = {
  list: async (): Promise<UploadedFile[]> => {
    if (MOCK_MODE) { await sleep(600); return MOCK_FILES; }
    return request('GET', '/files');
  },

  upload: async (file: File, fileType: string, onProgress?: (p: number) => void): Promise<UploadedFile> => {
    if (MOCK_MODE) {
      for (let p = 0; p <= 100; p += 20) {
        await sleep(200);
        onProgress?.(p);
      }
      const mockFile: UploadedFile = {
        id: Date.now(),
        original_filename: file.name,
        stored_filename: `mock_${Date.now()}.xlsx`,
        file_type: fileType as UploadedFile['file_type'],
        file_size: file.size,
        uploaded_by: 'مدیر سامانه',
        status: 'success',
        parsed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        error_message: null,
        record_count: Math.floor(Math.random() * 20) + 5,
        warnings_count: Math.floor(Math.random() * 3),
      };
      return mockFile;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    const token = localStorage.getItem('access_token');
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => {
        if (xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch { reject(new Error('پاسخ سرور نامعتبر است')); }
        } else {
          let msg = `خطای آپلود (${xhr.status})`;
          try { msg = JSON.parse(xhr.responseText)?.detail || msg; } catch {}
          reject(new Error(msg));
        }
      };
      xhr.onerror = () => reject(new Error('خطای شبکه'));
      xhr.open('POST', `${BASE_URL}/files/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  delete: async (id: number): Promise<void> => {
    if (MOCK_MODE) { await sleep(500); return; }
    await request('DELETE', `/files/${id}`);
  },

  reparse: async (id: number): Promise<UploadedFile> => {
    if (MOCK_MODE) {
      await sleep(1500);
      const file = MOCK_FILES.find(f => f.id === id);
      if (!file) throw new Error('فایل یافت نشد');
      return { ...file, status: 'success', parsed_at: new Date().toISOString() };
    }
    return request('POST', `/files/${id}/parse`);
  },

  getLogs: async (id: number): Promise<UploadLog[]> => {
    if (MOCK_MODE) {
      await sleep(400);
      return [
        { id: 1, upload_id: id, level: 'info', message: 'پردازش فایل آغاز شد', row_number: null, column_name: null, created_at: new Date().toISOString() },
        { id: 2, upload_id: id, level: 'warning', message: 'ردیف ۵: مقدار ستون «وضعیت» خالی است، مقدار «نامشخص» جایگزین شد', row_number: 5, column_name: 'وضعیت', created_at: new Date().toISOString() },
        { id: 3, upload_id: id, level: 'info', message: 'پردازش با موفقیت به پایان رسید - ۱۵ رکورد استخراج شد', row_number: null, column_name: null, created_at: new Date().toISOString() },
      ];
    }
    return request('GET', `/files/${id}/logs`);
  },
};

// ── Dashboard API ─────────────────────────────────────────────────────────────

export const dashboardApi = {
  getSummary: async (): Promise<KPIData> => {
    if (MOCK_MODE) { await sleep(700); return MOCK_KPI; }
    return request('GET', '/dashboard/summary');
  },

  getCharts: async (): Promise<DashboardCharts> => {
    if (MOCK_MODE) { await sleep(500); return MOCK_CHARTS; }
    return request('GET', '/dashboard/charts');
  },

  getAssociations: async (filters: AssociationFilters): Promise<PaginatedResponse<Association>> => {
    if (MOCK_MODE) {
      await sleep(500);
      let data = [...MOCK_ASSOCIATIONS];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(a => a.name.toLowerCase().includes(q) || (a.secretary_name || '').toLowerCase().includes(q));
      }
      if (filters.activity_status) data = data.filter(a => a.activity_status === filters.activity_status);
      if (filters.logo_status) data = data.filter(a => a.logo_status === filters.logo_status);
      if (filters.needs_follow_up != null) data = data.filter(a => a.needs_follow_up === filters.needs_follow_up);
      if (filters.has_email != null) data = data.filter(a => filters.has_email ? !!a.student_email : !a.student_email);
      const total = data.length;
      const start = (filters.page - 1) * filters.per_page;
      return { items: data.slice(start, start + filters.per_page), total, page: filters.page, per_page: filters.per_page, total_pages: Math.ceil(total / filters.per_page) };
    }
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
    return request('GET', `/dashboard/associations?${params}`);
  },

  getForms: async (filters: FormFilters): Promise<PaginatedResponse<AssociationForm>> => {
    if (MOCK_MODE) {
      await sleep(500);
      let data = [...MOCK_FORMS];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(f => f.association_name.toLowerCase().includes(q) || (f.workshop_title || '').toLowerCase().includes(q) || (f.competition_title || '').toLowerCase().includes(q));
      }
      if (filters.form_type) data = data.filter(f => f.form_type === filters.form_type);
      if (filters.is_complete != null) data = data.filter(f => f.is_complete === filters.is_complete);
      if (filters.needs_follow_up != null) data = data.filter(f => f.needs_follow_up === filters.needs_follow_up);
      const total = data.length;
      const start = (filters.page - 1) * filters.per_page;
      return { items: data.slice(start, start + filters.per_page), total, page: filters.page, per_page: filters.per_page, total_pages: Math.ceil(total / filters.per_page) };
    }
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
    return request('GET', `/dashboard/forms?${params}`);
  },

  getFollowUps: async (): Promise<{ associations: Association[]; forms: AssociationForm[] }> => {
    if (MOCK_MODE) {
      await sleep(600);
      return {
        associations: MOCK_ASSOCIATIONS.filter(a => a.needs_follow_up),
        forms: MOCK_FORMS.filter(f => f.needs_follow_up),
      };
    }
    return request('GET', '/dashboard/follow-ups');
  },
};

// ── Association Members API ───────────────────────────────────────────────────

export const associationMembersApi = {
  getMembers: async (associationId: number): Promise<AssociationMember[]> => {
    if (MOCK_MODE) {
      await sleep(300);
      return MOCK_ASSOCIATION_MEMBERS[associationId] ?? [];
    }
    return request('GET', `/associations/${associationId}/members`);
  },
};

// ── Export API ─────────────────────────────────────────────────────────────────

export const exportApi = {
  downloadFile: async (url: string, filename: string): Promise<void> => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('خطا در دریافت فایل');
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  exportAssociations: async (): Promise<void> => {
    if (MOCK_MODE) {
      await sleep(1000);
      alert('در حالت نمایشی، خروجی اکسل واقعی نیاز به اتصال بک‌اند دارد. ساختار API آماده است.');
      return;
    }
    await exportApi.downloadFile('/export/associations.xlsx', 'گزارش-انجمن‌ها.xlsx');
  },

  exportForms: async (): Promise<void> => {
    if (MOCK_MODE) { await sleep(1000); alert('در حالت نمایشی'); return; }
    await exportApi.downloadFile('/export/forms.xlsx', 'گزارش-فرم‌ها.xlsx');
  },

  exportFullReport: async (): Promise<void> => {
    if (MOCK_MODE) { await sleep(1000); alert('در حالت نمایشی'); return; }
    await exportApi.downloadFile('/export/full-report.xlsx', 'گزارش-کامل-داشبورد.xlsx');
  },

  exportPDF: async (): Promise<void> => {
    if (MOCK_MODE) { await sleep(1000); alert('در حالت نمایشی'); return; }
    await exportApi.downloadFile('/export/dashboard.pdf', 'گزارش-داشبورد.pdf');
  },
};

// ── Settings API ─────────────────────────────────────────────────────────────

export const settingsApi = {
  get: async (): Promise<Record<string, string>> => {
    if (MOCK_MODE) {
      await sleep(300);
      return {
        org_name: 'باشگاه پژوهشگران جوان و نخبگان دانشگاه آزاد اسلامی',
        system_name: 'سامانه هوشمند مدیریت انجمن‌ها',
        admin_email: 'admin@iau.ac.ir',
        max_file_size_mb: '10',
      };
    }
    return request('GET', '/settings');
  },

  update: async (settings: Record<string, string>): Promise<void> => {
    if (MOCK_MODE) { await sleep(500); return; }
    await request('PUT', '/settings', { settings: Object.entries(settings).map(([key, value]) => ({ key, value })) });
  },
};

// ── Users API (admin only) ─────────────────────────────────────────────────────

export const usersApi = {
  list: async (): Promise<ManagedUser[]> => {
    if (MOCK_MODE) {
      await sleep(400);
      return [...mockUsers];
    }
    return request('GET', '/users');
  },

  create: async (data: CreateUserRequest): Promise<ManagedUser> => {
    if (MOCK_MODE) {
      await sleep(600);
      if (mockUsers.find(u => u.username === data.username)) {
        throw new Error('این نام کاربری قبلاً استفاده شده است');
      }
      const now = new Date().toISOString();
      const newUser: ManagedUser = { id: nextUserId++, ...data, is_active: true, created_at: now, updated_at: now };
      mockUsers = [...mockUsers, newUser];
      return newUser;
    }
    return request('POST', '/users', data);
  },

  update: async (id: number, data: UpdateUserRequest): Promise<ManagedUser> => {
    if (MOCK_MODE) {
      await sleep(500);
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('کاربر یافت نشد');
      const updated: ManagedUser = { ...mockUsers[idx], ...data, updated_at: new Date().toISOString() };
      mockUsers = mockUsers.map(u => u.id === id ? updated : u);
      return updated;
    }
    return request('PATCH', `/users/${id}`, data);
  },

  remove: async (id: number): Promise<void> => {
    if (MOCK_MODE) {
      await sleep(400);
      mockUsers = mockUsers.filter(u => u.id !== id);
      return;
    }
    await request('DELETE', `/users/${id}`);
  },

  resetPassword: async (id: number, password: string): Promise<void> => {
    if (MOCK_MODE) {
      await sleep(500);
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('کاربر یافت نشد');
      mockUsers = mockUsers.map(u => u.id === id ? { ...u, password, updated_at: new Date().toISOString() } : u);
      return;
    }
    await request('POST', `/users/${id}/reset-password`, { password });
  },
};

// ── Profile API ──────────────────────────────────────────────────────────────

export const profileApi = {
  get: async (_userId: number): Promise<UserProfile> => {
    if (MOCK_MODE) { await sleep(300); return {}; }
    return request('GET', '/profile');
  },

  update: async (_userId: number, data: UpdateProfileRequest): Promise<UserProfile> => {
    if (MOCK_MODE) { await sleep(500); return data as UserProfile; }
    return request('PUT', '/profile', data);
  },

  changePassword: async (_userId: number, data: ChangePasswordRequest): Promise<void> => {
    if (MOCK_MODE) { await sleep(600); return; }
    await request('POST', '/profile/change-password', data);
  },
};

// ── Activities API ────────────────────────────────────────────────────────────

export const activitiesApi = {
  list: async (params: {
    page?: number; per_page?: number; search?: string;
    activity_type?: string; months?: number;
  }): Promise<PaginatedResponse<AssociationActivity>> => {
    if (MOCK_MODE) {
      await sleep(400);
      let data = [...MOCK_ACTIVITIES];
      if (params.search) {
        const q = params.search.toLowerCase();
        data = data.filter(a =>
          a.association_name.toLowerCase().includes(q) ||
          (a.title ?? '').toLowerCase().includes(q)
        );
      }
      if (params.activity_type) data = data.filter(a => a.activity_type === params.activity_type);
      if (params.months) {
        const cutYear = new Date().getFullYear() - (params.months > 6 ? 1 : 0);
        data = data.filter(a => (a.year ?? 0) >= cutYear);
      }
      const page = params.page ?? 1;
      const per_page = params.per_page ?? 20;
      const total = data.length;
      return {
        items: data.slice((page - 1) * per_page, page * per_page),
        total, page, per_page, total_pages: Math.ceil(total / per_page),
      };
    }
    const p = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])
    );
    return request('GET', `/activities?${p}`);
  },

  getStats: async (months?: number): Promise<ActivityStats> => {
    if (MOCK_MODE) {
      await sleep(300);
      if (!months) return MOCK_ACTIVITY_STATS;
      const cutYear = new Date().getFullYear() - (months > 6 ? 1 : 0);
      const filtered = MOCK_ACTIVITIES.filter(a => (a.year ?? 0) >= cutYear);
      const byType: Record<string, number> = {};
      const byAssoc: Record<string, number> = {};
      const byMonth: Record<string, { y: number; m: number; c: number }> = {};
      const byQ: Record<string, number> = {};
      for (const a of filtered) {
        byType[a.activity_type] = (byType[a.activity_type] ?? 0) + 1;
        byAssoc[a.association_name] = (byAssoc[a.association_name] ?? 0) + 1;
        if (a.year && a.month) {
          const ml = `${a.year}/${String(a.month).padStart(2,'0')}`;
          const ql = `${a.year}/Q${Math.ceil(a.month / 3)}`;
          byMonth[ml] = { y: a.year, m: a.month, c: (byMonth[ml]?.c ?? 0) + 1 };
          byQ[ql] = (byQ[ql] ?? 0) + 1;
        }
      }
      const ACT_LABELS = MOCK_ACTIVITY_STATS.activity_labels;
      const ACT_COLORS = MOCK_ACTIVITY_STATS.activity_colors;
      return {
        total: filtered.length,
        by_type: Object.entries(byType).map(([t, c]) => ({ type: t, label: ACT_LABELS[t] ?? t, color: ACT_COLORS[t] ?? '#94a3b8', count: c })),
        by_association: Object.entries(byAssoc).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count])=>({name,count})),
        monthly_trend: Object.entries(byMonth).sort().map(([label,{y,m,c}]) => ({ label, year: y, month: m, count: c })),
        quarterly_trend: Object.entries(byQ).sort().map(([label, count]) => ({ label, count })),
        activity_labels: ACT_LABELS,
        activity_colors: ACT_COLORS,
      };
    }
    const p = months ? `?months=${months}` : '';
    return request('GET', `/activities/stats${p}`);
  },

  exportUrl: (months?: number): string => {
    const token = localStorage.getItem('access_token');
    const p = months ? `?months=${months}` : '';
    return `${BASE_URL}/activities/export${p}${token ? `&token=${token}` : ''}`;
  },

  downloadExport: async (months?: number): Promise<void> => {
    if (MOCK_MODE) { await sleep(800); alert('در حالت نمایشی، خروجی اکسل نیاز به بک‌اند دارد.'); return; }
    const token = localStorage.getItem('access_token');
    const p = months ? `?months=${months}` : '';
    const res = await fetch(`${BASE_URL}/activities/export${p}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('خطا در دریافت فایل');
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activities${months ? `_${months}month` : ''}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
  },
};

// ── Meetings API ──────────────────────────────────────────────────────────────

export const meetingsApi = {
  list: async (filters: MeetingFilters): Promise<PaginatedResponse<AssociationMeeting>> => {
    if (MOCK_MODE) {
      await sleep(400);
      let data = [...mockMeetings];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(m =>
          m.association_name.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          (m.location ?? '').toLowerCase().includes(q)
        );
      }
      if (filters.association_name) {
        const q = filters.association_name.toLowerCase();
        data = data.filter(m => m.association_name.toLowerCase().includes(q));
      }
      if (filters.meeting_type) data = data.filter(m => m.meeting_type === filters.meeting_type);
      if (filters.status) data = data.filter(m => m.status === filters.status);
      const total = data.length;
      const start = (filters.page - 1) * filters.per_page;
      return { items: data.slice(start, start + filters.per_page), total, page: filters.page, per_page: filters.per_page, total_pages: Math.ceil(total / filters.per_page) };
    }
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
    return request('GET', `/meetings?${params}`);
  },

  create: async (data: CreateMeetingRequest): Promise<AssociationMeeting> => {
    if (MOCK_MODE) {
      await sleep(600);
      const now = new Date().toISOString();
      const meeting: AssociationMeeting = {
        id: nextMeetingId++,
        association_name: data.association_name,
        title: data.title,
        meeting_date: data.meeting_date,
        meeting_time: data.meeting_time,
        location: data.location ?? null,
        meeting_type: data.meeting_type,
        agenda: data.agenda ?? null,
        description: data.description ?? null,
        attendees_count: data.attendees_count ?? null,
        status: data.status,
        decisions: data.decisions ?? null,
        created_at: now,
      };
      mockMeetings = [...mockMeetings, meeting];
      return meeting;
    }
    return request('POST', '/meetings', data);
  },

  update: async (id: number, data: Partial<CreateMeetingRequest>): Promise<AssociationMeeting> => {
    if (MOCK_MODE) {
      await sleep(500);
      const idx = mockMeetings.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('جلسه یافت نشد');
      const updated: AssociationMeeting = { ...mockMeetings[idx], ...data, location: data.location ?? mockMeetings[idx].location, agenda: data.agenda ?? mockMeetings[idx].agenda, description: data.description ?? mockMeetings[idx].description, decisions: data.decisions ?? mockMeetings[idx].decisions, attendees_count: data.attendees_count ?? mockMeetings[idx].attendees_count };
      mockMeetings = mockMeetings.map(m => m.id === id ? updated : m);
      return updated;
    }
    return request('PATCH', `/meetings/${id}`, data);
  },

  remove: async (id: number): Promise<void> => {
    if (MOCK_MODE) {
      await sleep(400);
      mockMeetings = mockMeetings.filter(m => m.id !== id);
      return;
    }
    await request('DELETE', `/meetings/${id}`);
  },
};

// ── Analytics API ─────────────────────────────────────────────────────────────

export const analyticsApi = {
  getFull: async (months?: number): Promise<AnalyticsData> => {
    if (MOCK_MODE) {
      await sleep(600);
      if (!months) return MOCK_ANALYTICS;
      const cutYear = new Date().getFullYear() - (months > 6 ? 1 : 0);
      const filtered = MOCK_ACTIVITIES.filter(a => (a.year ?? 0) >= cutYear);
      return {
        ...MOCK_ANALYTICS,
        summary: { ...MOCK_ANALYTICS.summary, total_activities: filtered.length, period_months: months },
      };
    }
    const p = months ? `?months=${months}` : '';
    return request('GET', `/analytics/full${p}`);
  },
};
