import type { Association, AssociationForm, AssociationMember, AssociationActivity, ActivityStats, AnalyticsData, UploadedFile, KPIData, DashboardCharts, ManagedUser, AssociationMeeting } from '@/types';

export const MOCK_USERS: ManagedUser[] = [
  { id: 1,  username: 'admin',           full_name: 'علی رضایی',          role: 'admin',     position: 'مدیر کل سامانه انجمن‌ها',                                                               is_active: true,  password: 'admin1234',    created_at: '2024-08-01T09:00:00Z', updated_at: '2024-08-01T09:00:00Z' },
  { id: 2,  username: 'sara',            full_name: 'سارا احمدی',          role: 'assistant', position: 'دستیار امور انجمن‌ها',                                                                   is_active: true,  password: 'sara1234',     created_at: '2024-09-10T10:00:00Z', updated_at: '2024-09-10T10:00:00Z' },
  { id: 3,  username: 'reza',            full_name: 'رضا محمدی',           role: 'assistant', position: 'دستیار امور انجمن‌ها',                                                                   is_active: true,  password: 'reza1234',     created_at: '2024-09-15T11:00:00Z', updated_at: '2024-09-15T11:00:00Z' },
  { id: 4,  username: 'maryam',          full_name: 'مریم کریمی',          role: 'viewer',    position: 'کاربر سامانه',                                                                           is_active: true,  password: 'maryam1234',   created_at: '2024-10-01T08:00:00Z', updated_at: '2024-10-01T08:00:00Z' },
  { id: 5,  username: 'hasan',           full_name: 'حسن نوری',            role: 'viewer',    position: 'کاربر سامانه',                                                                           is_active: false, password: 'hasan1234',    created_at: '2024-10-20T14:00:00Z', updated_at: '2024-11-01T09:00:00Z' },
  { id: 6,  username: 'rais.anjoman',    full_name: 'محمد احمدی',          role: 'assistant', position: 'رئیس اداره انجمن‌ها، تیم‌های علمی و فناوری',                                            is_active: true,  password: 'rais1234',     created_at: '2024-08-05T09:00:00Z', updated_at: '2024-08-05T09:00:00Z' },
  { id: 7,  username: 'karshenas.nashr', full_name: 'زهرا کریمی',          role: 'assistant', position: 'کارشناس مسئول نشریات علمی-دانشجویی و مسئول بازدیدها',                                  is_active: true,  password: 'zk1234',       created_at: '2024-08-10T10:00:00Z', updated_at: '2024-08-10T10:00:00Z' },
  { id: 8,  username: 'masoul.kargar',   full_name: 'امیرحسین موسوی',      role: 'assistant', position: 'مسئول راهبری کارگاه‌های انجمن‌ها، لوگو و مُهر انجمن‌ها و آرشیو اطلاعات',              is_active: true,  password: 'am1234',       created_at: '2024-08-12T11:00:00Z', updated_at: '2024-08-12T11:00:00Z' },
  { id: 9,  username: 'dastyar.it',      full_name: 'نیلوفر رضوی',         role: 'assistant', position: 'دستیار فناوری اطلاعات',                                                                  is_active: true,  password: 'nr1234',       created_at: '2024-09-01T09:00:00Z', updated_at: '2024-09-01T09:00:00Z' },
  { id: 10, username: 'dastyar.elm',     full_name: 'محسن طاهری',          role: 'assistant', position: 'دستیار علمی و پژوهشی',                                                                   is_active: true,  password: 'mt1234',       created_at: '2024-09-01T09:00:00Z', updated_at: '2024-09-01T09:00:00Z' },
  { id: 11, username: 'hamkar.anjoman',  full_name: 'فاطمه نجفی',          role: 'viewer',    position: 'همکار دانشجو امور انجمن‌ها',                                                             is_active: true,  password: 'fn1234',       created_at: '2024-09-20T08:00:00Z', updated_at: '2024-09-20T08:00:00Z' },
  { id: 12, username: 'hamkar.it',       full_name: 'سینا مرادی',          role: 'viewer',    position: 'همکار دانشجو فناوری اطلاعات',                                                            is_active: true,  password: 'sm1234',       created_at: '2024-09-20T08:00:00Z', updated_at: '2024-09-20T08:00:00Z' },
  { id: 13, username: 'hamkar.elm',      full_name: 'آرزو صادقی',          role: 'viewer',    position: 'همکار دانشجو علمی و پژوهشی',                                                             is_active: true,  password: 'as1234',       created_at: '2024-09-20T08:00:00Z', updated_at: '2024-09-20T08:00:00Z' },
];

export const MOCK_ASSOCIATIONS: Association[] = [
  { id: 1, upload_id: 1, name: 'انجمن علمی کامپیوتر', secretary_name: 'علی محمدی', phone: '09121234567', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'computer@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: 'دارد', channel_igap: null, channel_ita: null, content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
  { id: 2, upload_id: 1, name: 'انجمن علمی برق', secretary_name: 'فاطمه حسینی', phone: '09357654321', activity_status: 'فعال', logo_status: 'دارد', header_status: 'ناقص', student_email: 'electric@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: null, channel_igap: null, channel_ita: null, content_production: 'متوسط', form_competition: 'ثبت شده', form_workshop: 'ثبت نشده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'در حال انجام', new_license_session: null, notes: 'هدر نیاز به بازطراحی دارد', needs_follow_up: true, missing_fields: ['header_status', 'form_workshop'], created_at: '2024-09-15T08:00:00Z' },
  { id: 3, upload_id: 1, name: 'انجمن علمی مکانیک', secretary_name: 'محمدرضا کریمی', phone: '09191234567', activity_status: 'نیمه‌فعال', logo_status: 'دارد', header_status: 'دارد', student_email: null, roadmap_session: 'برگزار نشده', channel_bale: null, channel_rubika: null, channel_igap: null, channel_ita: null, content_production: 'کم', form_competition: 'ثبت نشده', form_workshop: 'ثبت شده', status: 'نیمه‌فعال', site_activity_registered: 'خیر', roadmap: 'تکمیل نشده', new_license_session: null, notes: null, needs_follow_up: true, missing_fields: ['student_email', 'roadmap_session', 'channel_bale', 'site_activity_registered'], created_at: '2024-09-15T08:00:00Z' },
  { id: 4, upload_id: 1, name: 'انجمن علمی شیمی', secretary_name: 'زهرا رضایی', phone: '09361234567', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'chemistry@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: 'دارد', channel_igap: 'دارد', channel_ita: null, content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
  { id: 5, upload_id: 1, name: 'انجمن علمی ریاضی', secretary_name: 'امیر احمدی', phone: '09121111111', activity_status: 'کم‌فعالیت', logo_status: 'ندارد', header_status: 'ندارد', student_email: null, roadmap_session: 'برگزار نشده', channel_bale: null, channel_rubika: null, channel_igap: null, channel_ita: null, content_production: 'ندارد', form_competition: 'ثبت نشده', form_workshop: 'ثبت نشده', status: 'کم‌فعالیت', site_activity_registered: 'خیر', roadmap: 'تکمیل نشده', new_license_session: null, notes: 'نیاز به پیگیری فوری', needs_follow_up: true, missing_fields: ['logo_status', 'header_status', 'student_email', 'roadmap_session', 'channel_bale'], created_at: '2024-09-15T08:00:00Z' },
  { id: 6, upload_id: 1, name: 'انجمن علمی عمران', secretary_name: 'مریم کاظمی', phone: '09353456789', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'civil@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: 'دارد', channel_igap: null, channel_ita: 'دارد', content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
  { id: 7, upload_id: 1, name: 'انجمن علمی معماری', secretary_name: 'سارا موسوی', phone: '09141234567', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'architecture@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: 'دارد', channel_igap: 'دارد', channel_ita: 'دارد', content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
  { id: 8, upload_id: 1, name: 'انجمن علمی مدیریت', secretary_name: 'رضا قاسمی', phone: '09161234567', activity_status: 'نیمه‌فعال', logo_status: 'ناقص', header_status: 'دارد', student_email: 'management@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: null, channel_rubika: 'دارد', channel_igap: null, channel_ita: null, content_production: 'کم', form_competition: 'ثبت نشده', form_workshop: 'ثبت شده', status: 'نیمه‌فعال', site_activity_registered: 'خیر', roadmap: 'در حال انجام', new_license_session: null, notes: null, needs_follow_up: true, missing_fields: ['logo_status', 'channel_bale', 'form_competition', 'site_activity_registered'], created_at: '2024-09-15T08:00:00Z' },
  { id: 9, upload_id: 1, name: 'انجمن علمی حقوق', secretary_name: 'نیلوفر صادقی', phone: '09031234567', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'law@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: 'دارد', channel_igap: null, channel_ita: null, content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
  { id: 10, upload_id: 1, name: 'انجمن علمی زیست‌شناسی', secretary_name: 'حسین نوری', phone: '09171234567', activity_status: 'نامشخص', logo_status: 'نامشخص', header_status: 'نامشخص', student_email: null, roadmap_session: null, channel_bale: null, channel_rubika: null, channel_igap: null, channel_ita: null, content_production: null, form_competition: null, form_workshop: null, status: 'نامشخص', site_activity_registered: null, roadmap: null, new_license_session: null, notes: 'اطلاعات کامل نشده', needs_follow_up: true, missing_fields: ['logo_status', 'header_status', 'student_email', 'roadmap_session', 'channel_bale', 'site_activity_registered', 'roadmap'], created_at: '2024-09-15T08:00:00Z' },
  { id: 11, upload_id: 1, name: 'انجمن علمی فیزیک', secretary_name: 'مهدی ابراهیمی', phone: '09221234567', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'physics@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: null, channel_igap: null, channel_ita: null, content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
  { id: 12, upload_id: 1, name: 'انجمن علمی روانشناسی', secretary_name: 'شیرین علوی', phone: '09301234567', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'psychology@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: 'دارد', channel_igap: 'دارد', channel_ita: null, content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
  { id: 13, upload_id: 1, name: 'انجمن علمی اقتصاد', secretary_name: 'پویا رستمی', phone: null, activity_status: 'کم‌فعالیت', logo_status: 'ندارد', header_status: 'ناقص', student_email: null, roadmap_session: 'برگزار نشده', channel_bale: null, channel_rubika: null, channel_igap: null, channel_ita: null, content_production: 'ندارد', form_competition: 'ثبت نشده', form_workshop: 'ثبت نشده', status: 'کم‌فعالیت', site_activity_registered: 'خیر', roadmap: 'تکمیل نشده', new_license_session: null, notes: 'پیگیری شود', needs_follow_up: true, missing_fields: ['phone', 'logo_status', 'student_email', 'channel_bale', 'form_competition', 'form_workshop'], created_at: '2024-09-15T08:00:00Z' },
  { id: 14, upload_id: 1, name: 'انجمن علمی گردشگری', secretary_name: 'آرزو فرهادی', phone: '09381234567', activity_status: 'نیمه‌فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'tourism@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: null, channel_igap: null, channel_ita: null, content_production: 'متوسط', form_competition: 'ثبت نشده', form_workshop: 'ثبت شده', status: 'نیمه‌فعال', site_activity_registered: 'خیر', roadmap: 'در حال انجام', new_license_session: null, notes: null, needs_follow_up: true, missing_fields: ['form_competition', 'site_activity_registered'], created_at: '2024-09-15T08:00:00Z' },
  { id: 15, upload_id: 1, name: 'انجمن علمی هوش مصنوعی', secretary_name: 'دانیار خانی', phone: '09121122334', activity_status: 'فعال', logo_status: 'دارد', header_status: 'دارد', student_email: 'ai@iau.ac.ir', roadmap_session: 'برگزار شد', channel_bale: 'دارد', channel_rubika: 'دارد', channel_igap: 'دارد', channel_ita: 'دارد', content_production: 'فعال', form_competition: 'ثبت شده', form_workshop: 'ثبت شده', status: 'فعال', site_activity_registered: 'بله', roadmap: 'تکمیل شده', new_license_session: null, notes: null, needs_follow_up: false, missing_fields: [], created_at: '2024-09-15T08:00:00Z' },
];

export const MOCK_FORMS: AssociationForm[] = [
  { id: 1, upload_id: 2, association_name: 'انجمن علمی کامپیوتر', workshop_title: 'کارگاه برنامه‌نویسی پایتون', competition_title: null, event_date: '1402/09/15', status: 'تایید شده', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: 'کارگاه آموزشی پایتون برای مبتدیان', form_type: 'کارگاه', is_complete: true, has_missing_signature: false, is_cancelled: false, needs_follow_up: false, created_at: '2024-09-15T08:00:00Z' },
  { id: 2, upload_id: 2, association_name: 'انجمن علمی کامپیوتر', workshop_title: null, competition_title: 'مسابقه هکاتون', event_date: '1402/10/20', status: 'در انتظار', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'ندارد', sig_dean: 'ندارد', sig_head_associations: 'دارد', sig_director_general: 'ندارد', description: 'مسابقه هکاتون سه روزه', form_type: 'مسابقه', is_complete: false, has_missing_signature: true, is_cancelled: false, needs_follow_up: true, created_at: '2024-09-15T08:00:00Z' },
  { id: 3, upload_id: 2, association_name: 'انجمن علمی برق', workshop_title: 'کارگاه الکترونیک', competition_title: null, event_date: '1402/08/10', status: 'تایید شده', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: null, form_type: 'کارگاه', is_complete: true, has_missing_signature: false, is_cancelled: false, needs_follow_up: false, created_at: '2024-09-15T08:00:00Z' },
  { id: 4, upload_id: 2, association_name: 'انجمن علمی شیمی', workshop_title: 'کارگاه آزمایشگاهی', competition_title: null, event_date: null, status: 'ناقص', sig_secretary: 'دارد', sig_advisor: 'ندارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: 'تاریخ هنوز مشخص نشده', form_type: 'کارگاه', is_complete: false, has_missing_signature: true, is_cancelled: false, needs_follow_up: true, created_at: '2024-09-15T08:00:00Z' },
  { id: 5, upload_id: 2, association_name: 'انجمن علمی عمران', workshop_title: null, competition_title: 'مسابقه طراحی سازه', event_date: '1402/11/05', status: 'تایید شده', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: null, form_type: 'مسابقه', is_complete: true, has_missing_signature: false, is_cancelled: false, needs_follow_up: false, created_at: '2024-09-15T08:00:00Z' },
  { id: 6, upload_id: 2, association_name: 'انجمن علمی معماری', workshop_title: 'کارگاه طراحی شهری', competition_title: null, event_date: '1402/09/01', status: 'لغو شده', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: 'لغو به دلیل عدم حضور استاد', form_type: 'کارگاه', is_complete: true, has_missing_signature: false, is_cancelled: true, needs_follow_up: false, created_at: '2024-09-15T08:00:00Z' },
  { id: 7, upload_id: 2, association_name: 'انجمن علمی مدیریت', workshop_title: 'سمینار رهبری سازمانی', competition_title: null, event_date: '1402/10/15', status: 'در انتظار', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'ندارد', sig_head_associations: 'ندارد', sig_director_general: 'ندارد', description: null, form_type: 'کارگاه', is_complete: false, has_missing_signature: true, is_cancelled: false, needs_follow_up: true, created_at: '2024-09-15T08:00:00Z' },
  { id: 8, upload_id: 2, association_name: 'انجمن علمی حقوق', workshop_title: null, competition_title: 'مسابقه دادرسی', event_date: '1402/12/01', status: 'تایید شده', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: null, form_type: 'مسابقه', is_complete: true, has_missing_signature: false, is_cancelled: false, needs_follow_up: false, created_at: '2024-09-15T08:00:00Z' },
  { id: 9, upload_id: 2, association_name: 'انجمن علمی روانشناسی', workshop_title: 'کارگاه مهارت‌های ارتباطی', competition_title: null, event_date: '1402/08/20', status: 'تایید شده', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: 'با حضور متخصص ارتباطات', form_type: 'کارگاه', is_complete: true, has_missing_signature: false, is_cancelled: false, needs_follow_up: false, created_at: '2024-09-15T08:00:00Z' },
  { id: 10, upload_id: 2, association_name: 'انجمن علمی هوش مصنوعی', workshop_title: 'کارگاه یادگیری ماشین', competition_title: null, event_date: '1402/11/20', status: 'تایید شده', sig_secretary: 'دارد', sig_advisor: 'دارد', sig_inspector: 'دارد', sig_dean: 'دارد', sig_head_associations: 'دارد', sig_director_general: 'دارد', description: 'کارگاه با تمرکز بر TensorFlow', form_type: 'کارگاه', is_complete: true, has_missing_signature: false, is_cancelled: false, needs_follow_up: false, created_at: '2024-09-15T08:00:00Z' },
];

export const MOCK_FILES: UploadedFile[] = [
  { id: 1, original_filename: 'انجمن_ها_آبان1402.xlsx', stored_filename: 'assoc_20241115_143022.xlsx', file_type: 'associations', file_size: 245760, uploaded_by: 'مدیر سامانه', status: 'success', parsed_at: '2024-11-15T14:31:05Z', created_at: '2024-11-15T14:30:22Z', error_message: null, record_count: 15, warnings_count: 2 },
  { id: 2, original_filename: 'فرم_ها_آبان1402.xlsx', stored_filename: 'forms_20241115_143500.xlsx', file_type: 'forms', file_size: 189440, uploaded_by: 'مدیر سامانه', status: 'success', parsed_at: '2024-11-15T14:36:12Z', created_at: '2024-11-15T14:35:00Z', error_message: null, record_count: 10, warnings_count: 0 },
  { id: 3, original_filename: 'انجمن_ها_مهر1402.xlsx', stored_filename: 'assoc_20241018_091200.xlsx', file_type: 'associations', file_size: 238000, uploaded_by: 'مدیر سامانه', status: 'success', parsed_at: '2024-10-18T09:13:00Z', created_at: '2024-10-18T09:12:00Z', error_message: null, record_count: 14, warnings_count: 3 },
  { id: 4, original_filename: 'فرم_های_ناقص.xlsx', stored_filename: 'forms_20241022_160000.xlsx', file_type: 'unknown', file_size: 55000, uploaded_by: 'مدیر سامانه', status: 'error', parsed_at: null, created_at: '2024-10-22T16:00:00Z', error_message: 'ستون‌های مورد انتظار در فایل یافت نشد. لطفاً ساختار فایل را بررسی کنید.', record_count: null, warnings_count: null },
  { id: 5, original_filename: 'انجمن_ها_شهریور1402.xlsx', stored_filename: 'assoc_20240915_110000.xlsx', file_type: 'associations', file_size: 220000, uploaded_by: 'مدیر سامانه', status: 'success', parsed_at: '2024-09-15T11:01:00Z', created_at: '2024-09-15T11:00:00Z', error_message: null, record_count: 12, warnings_count: 1 },
];

export const MOCK_KPI: KPIData = {
  total_associations: 15,
  active_associations: 8,
  semi_active_associations: 4,
  low_activity_associations: 2,
  unknown_activity_associations: 1,
  has_logo: 12,
  no_logo: 2,
  has_header: 13,
  no_header: 1,
  has_email: 11,
  no_email: 4,
  needs_follow_up_associations: 6,
  total_forms: 10,
  workshops: 7,
  competitions: 3,
  complete_forms: 6,
  incomplete_forms: 3,
  no_date_forms: 1,
  cancelled_forms: 1,
  needs_follow_up_forms: 3,
  last_upload_date: '2024-11-15T14:30:22Z',
  last_processed_date: '2024-11-15T14:36:12Z',
};

export const MOCK_CHARTS: DashboardCharts = {
  activity_status_chart: [
    { name: 'فعال', value: 8, color: '#7fa343' },
    { name: 'نیمه‌فعال', value: 4, color: '#D97706' },
    { name: 'کم‌فعالیت', value: 2, color: '#DC2626' },
    { name: 'نامشخص', value: 1, color: '#94A3B8' },
  ],
  logo_status_chart: [
    { name: 'دارد', value: 12, color: '#7fa343' },
    { name: 'ناقص', value: 1, color: '#D97706' },
    { name: 'ندارد', value: 2, color: '#DC2626' },
  ],
  form_type_chart: [
    { name: 'کارگاه', value: 7, color: '#2174b8' },
    { name: 'مسابقه', value: 3, color: '#7C3AED' },
  ],
  signature_status_chart: [
    { name: 'امضای کامل', value: 6, color: '#7fa343' },
    { name: 'نقص امضا', value: 3, color: '#DC2626' },
    { name: 'لغو شده', value: 1, color: '#94A3B8' },
  ],
  associations_by_channel: [
    { name: 'بله', value: 9, color: '#2174b8' },
    { name: 'روبیکا', value: 7, color: '#7C3AED' },
    { name: 'ایگپ', value: 4, color: '#0891B2' },
    { name: 'ایتا', value: 3, color: '#7fa343' },
  ],
};

// ── Association members (procedurally generated for all associations) ─────────

const MEMBER_NAMES = [
  'علی محمدی','فاطمه حسینی','محمدرضا کریمی','زهرا رضایی','امیر احمدی',
  'مریم کاظمی','سارا موسوی','رضا قاسمی','نیلوفر صادقی','حسین نوری',
  'مهدی ابراهیمی','شیرین علوی','پویا رستمی','آرزو فرهادی','دانیار خانی',
  'ناهید شریفی','کیانوش تهرانی','سپیده جعفری','بهروز اکبری','لیلا منصوری',
];

const MAJORS = [
  'مهندسی کامپیوتر','مهندسی برق','مهندسی مکانیک','شیمی','ریاضی',
  'عمران','معماری','مدیریت','حقوق','زیست‌شناسی','فیزیک','روانشناسی',
];

const MEMBER_ROLES: { role: AssociationMember['role']; role_label: string }[] = [
  { role: 'secretary',      role_label: 'دبیر' },
  { role: 'vice_secretary', role_label: 'نایب دبیر' },
  { role: 'inspector',      role_label: 'بازرس' },
  { role: 'member1',        role_label: 'عضو اصلی اول' },
  { role: 'member2',        role_label: 'عضو اصلی دوم' },
  { role: 'alternate',      role_label: 'عضو علی‌البدل' },
];

function seed(n: number) { return ((n * 1103515245 + 12345) & 0x7fffffff) % 20; }

export const MOCK_ASSOCIATION_MEMBERS: Record<number, AssociationMember[]> =
  Object.fromEntries(
    MOCK_ASSOCIATIONS.map(assoc => [
      assoc.id,
      MEMBER_ROLES.map((r, i) => {
        const idx = seed(assoc.id * 7 + i);
        const phoneDigits = String((assoc.id * 13 + i * 7) % 100000000).padStart(8, '0');
        return {
          id:             assoc.id * 10 + i,
          association_id: assoc.id,
          role:           r.role,
          role_label:     r.role_label,
          full_name:      MEMBER_NAMES[idx],
          national_id:    String(1000000000 + assoc.id * 100 + i),
          phone:          `091${phoneDigits.slice(0, 2)}${phoneDigits.slice(2, 6)}${phoneDigits.slice(6)}`,
          email:          i === 0 ? assoc.student_email ?? undefined : undefined,
          major:          MAJORS[(assoc.id + i) % MAJORS.length],
          semester:       `${((assoc.id + i) % 8) + 1}`,
        } as AssociationMember;
      }),
    ]),
  );

// ── Mock Activities ──────────────────────────────────────────────────────────

const ACT_TYPES: AssociationActivity['activity_type'][] = [
  'بازدید_علمی', 'نشریه', 'سخنرانی_علمی', 'همکاری_علمی', 'کارگاه',
  'نمایشگاه', 'دوره_کمک_آموزشی', 'همایش_علمی', 'کرسی_اندیشه_ورزی', 'مسابقه_علمی',
];

const ACT_LABELS: Record<string, string> = {
  بازدید_علمی: 'بازدید علمی', نشریه: 'نشریه', سخنرانی_علمی: 'سخنرانی علمی',
  همکاری_علمی: 'همکاری و مشارکت علمی', کارگاه: 'برگزاری کارگاه',
  نمایشگاه: 'برگزاری نمایشگاه', دوره_کمک_آموزشی: 'دوره‌های کمک آموزشی',
  همایش_علمی: 'برگزاری همایش علمی', کرسی_اندیشه_ورزی: 'کرسی اندیشه‌ورزی',
  مسابقه_علمی: 'مسابقه علمی',
};

const ACT_TITLES: Record<string, string[]> = {
  بازدید_علمی:       ['بازدید از پارک علم و فناوری', 'بازدید از مراکز صنعتی', 'بازدید از آزمایشگاه‌های تحقیقاتی'],
  نشریه:             ['نشریه علمی شماره ۱', 'نشریه تخصصی فصل پاییز', 'نشریه دانشجویی'],
  سخنرانی_علمی:      ['سخنرانی در حوزه هوش مصنوعی', 'سخنرانی تخصصی استاد مدعو', 'وبینار علمی آنلاین'],
  همکاری_علمی:       ['همکاری با انجمن‌های دانشگاه‌های دیگر', 'پروژه مشترک پژوهشی', 'تفاهم‌نامه همکاری علمی'],
  کارگاه:            ['کارگاه آموزش پایتون', 'کارگاه مهارت‌های نرم', 'کارگاه طراحی وب'],
  نمایشگاه:          ['نمایشگاه دستاوردهای علمی', 'نمایشگاه پروژه‌های دانشجویی', 'نمایشگاه کتاب تخصصی'],
  دوره_کمک_آموزشی:   ['دوره تقویتی ریاضیات', 'دوره آمادگی آزمون جامع', 'کلاس‌های جبرانی'],
  همایش_علمی:        ['همایش ملی پژوهش‌های نوین', 'همایش دانشجویی فناوری', 'کنفرانس علمی تخصصی'],
  کرسی_اندیشه_ورزی:  ['کرسی آزاداندیشی درباره AI', 'میزگرد علمی تخصصی', 'نشست اندیشه‌ورزی دانشجویان'],
  مسابقه_علمی:       ['مسابقه برنامه‌نویسی', 'المپیاد علمی دانشجویان', 'مسابقه طراحی پروژه'],
};

function mockAct(id: number, assocId: number, assocName: string): AssociationActivity {
  const typeIdx  = (id * 3 + assocId) % 10;
  const type     = ACT_TYPES[typeIdx];
  const titleArr = ACT_TITLES[type];
  const titleIdx = id % titleArr.length;
  const month    = ((id * 7 + assocId * 3) % 12) + 1;
  const year     = month >= 7 ? 2024 : 2025;
  const pMonth   = month >= 7 ? month - 6 : month + 6;  // rough Shamsi month
  const participants = ((id * 17 + assocId * 5) % 80) + 10;
  return {
    id,
    association_name: assocName,
    activity_type:    type,
    activity_label:   ACT_LABELS[type],
    title:            titleArr[titleIdx],
    event_date:       `${year >= 2025 ? 1403 : 1402}/${String(pMonth).padStart(2,'0')}/15`,
    semester:         month >= 7 ? 'اول' : 'دوم',
    academic_year:    '۱۴۰۲-۱۴۰۳',
    month,
    year,
    participants_count: participants,
    description:      null,
    status:           id % 8 === 0 ? 'لغو شد' : 'برگزار شد',
  };
}

let _actId = 1;
export const MOCK_ACTIVITIES: AssociationActivity[] = MOCK_ASSOCIATIONS.flatMap(assoc =>
  Array.from({ length: 6 }, () => mockAct(_actId++, assoc.id, assoc.name))
);

// ── Mock Meetings ────────────────────────────────────────────────────────────

export const MOCK_MEETINGS: AssociationMeeting[] = [
  { id: 1,  association_name: 'انجمن علمی کامپیوتر',    title: 'جلسه برنامه‌ریزی ترم اول',          meeting_date: '1403/07/10', meeting_time: '14:00', location: 'اتاق شورا، ساختمان اداری',   meeting_type: 'عادی',        agenda: 'بررسی برنامه فعالیت‌های ترم اول و تعیین مسئولیت‌ها',    description: 'جلسه اول ترم برای هماهنگی برنامه‌های پیش‌رو', attendees_count: 8,  status: 'برگزار شد',         decisions: 'برنامه کارگاه پایتون برای آبان ماه تصویب شد',             created_at: '2024-10-01T12:00:00Z' },
  { id: 2,  association_name: 'انجمن علمی برق',         title: 'جلسه فوری بررسی مشکلات مجوز',      meeting_date: '1403/07/20', meeting_time: '10:30', location: 'دفتر رئیس انجمن‌ها',          meeting_type: 'فوری',        agenda: 'پیگیری مشکل مجوز برگزاری رویداد',                            description: 'جلسه اضطراری برای رفع مشکل مجوز',              attendees_count: 4,  status: 'برگزار شد',         decisions: 'مقرر شد مدارک تکمیل و تا پایان هفته ارسال شود',           created_at: '2024-10-10T09:00:00Z' },
  { id: 3,  association_name: 'انجمن علمی مکانیک',      title: 'جلسه هیئت‌رئیسه ارزیابی عملکرد',  meeting_date: '1403/08/05', meeting_time: '16:00', location: 'سالن کنفرانس دانشکده',         meeting_type: 'هیئت‌رئیسه', agenda: 'ارزیابی عملکرد نیمه‌اول سال',                               description: 'بررسی گزارش عملکرد شش ماهه انجمن',              attendees_count: 6,  status: 'برگزار شد',         decisions: 'نیاز به افزایش فعالیت‌های محتوایی احساس شد',              created_at: '2024-10-25T14:00:00Z' },
  { id: 4,  association_name: 'انجمن علمی شیمی',        title: 'جلسه مشترک با انجمن فیزیک',        meeting_date: '1403/08/15', meeting_time: '11:00', location: 'آزمایشگاه مرکزی',              meeting_type: 'مشترک',       agenda: 'برنامه‌ریزی همایش مشترک علوم پایه',                          description: 'هماهنگی برای همایش بین‌انجمنی',                 attendees_count: 12, status: 'برگزار شد',         decisions: 'همایش مشترک در آذرماه برگزار خواهد شد',                    created_at: '2024-11-04T10:00:00Z' },
  { id: 5,  association_name: 'انجمن علمی ریاضی',       title: 'جلسه برنامه‌ریزی المپیاد',         meeting_date: '1403/08/22', meeting_time: '15:30', location: 'اتاق انجمن ریاضی',             meeting_type: 'عادی',        agenda: 'برنامه‌ریزی مسابقه المپیاد علمی دانشجویان',                  description: 'تعیین سوالات و داوران المپیاد',                  attendees_count: 5,  status: 'برنامه‌ریزی شده', decisions: null,                                                        created_at: '2024-11-11T08:00:00Z' },
  { id: 6,  association_name: 'انجمن علمی عمران',       title: 'جلسه هماهنگی نمایشگاه دستاوردها', meeting_date: '1403/09/01', meeting_time: '13:00', location: 'سالن اجتماعات دانشکده',        meeting_type: 'عادی',        agenda: 'هماهنگی نمایشگاه دستاوردهای علمی دانشجویان',                description: 'آماده‌سازی و تقسیم وظایف نمایشگاه',             attendees_count: 9,  status: 'برنامه‌ریزی شده', decisions: null,                                                        created_at: '2024-11-20T11:00:00Z' },
  { id: 7,  association_name: 'انجمن علمی معماری',      title: 'جلسه بررسی طرح‌های دانشجویی',     meeting_date: '1403/09/10', meeting_time: '10:00', location: 'آتلیه معماری',                 meeting_type: 'عادی',        agenda: 'بررسی و نقد طرح‌های دانشجویان برای ارائه در نمایشگاه',      description: 'نشست نقد و بررسی آثار دانشجویان',               attendees_count: 15, status: 'برگزار شد',         decisions: 'هشت طرح برتر برای نمایشگاه انتخاب شدند',                  created_at: '2024-11-29T09:30:00Z' },
  { id: 8,  association_name: 'انجمن علمی مدیریت',      title: 'جلسه هیئت‌رئیسه انتخاب دبیر',    meeting_date: '1403/09/18', meeting_time: '17:00', location: 'اتاق شورای انجمن مدیریت',      meeting_type: 'هیئت‌رئیسه', agenda: 'انتخاب دبیر جدید انجمن',                                     description: 'رأی‌گیری برای انتخاب دبیر ترم دوم',             attendees_count: 7,  status: 'لغو شد',            decisions: 'جلسه به دلیل کمبود نصاب لغو و مجدداً برگزار می‌شود',     created_at: '2024-12-07T16:00:00Z' },
  { id: 9,  association_name: 'انجمن علمی حقوق',        title: 'جلسه برنامه‌ریزی کرسی آزاداندیشی', meeting_date: '1403/09/25', meeting_time: '14:30', location: 'آمفی‌تئاتر دانشکده حقوق',      meeting_type: 'عادی',        agenda: 'برنامه‌ریزی کرسی آزاداندیشی با موضوع حقوق دیجیتال',         description: 'تدوین برنامه و دعوت از اساتید',                 attendees_count: 6,  status: 'برگزار شد',         decisions: 'موضوع «حریم خصوصی در فضای دیجیتال» انتخاب شد',           created_at: '2024-12-14T13:00:00Z' },
  { id: 10, association_name: 'انجمن علمی روانشناسی',   title: 'جلسه مشترک با مرکز مشاوره',        meeting_date: '1403/10/05', meeting_time: '09:00', location: 'مرکز مشاوره دانشگاه',           meeting_type: 'مشترک',       agenda: 'همکاری در برگزاری کارگاه مهارت‌های زندگی',                   description: 'تفاهم‌نامه همکاری با مرکز مشاوره',              attendees_count: 10, status: 'برگزار شد',         decisions: 'سه جلسه کارگاهی در بهمن ماه برنامه‌ریزی شد',             created_at: '2024-12-24T08:00:00Z' },
  { id: 11, association_name: 'انجمن علمی فیزیک',       title: 'جلسه بررسی بودجه ترم دوم',         meeting_date: '1403/10/15', meeting_time: '11:30', location: 'اتاق انجمن فیزیک',             meeting_type: 'هیئت‌رئیسه', agenda: 'بررسی و تصویب بودجه فعالیت‌های ترم دوم',                     description: 'تخصیص منابع مالی برای برنامه‌های ترم دوم',      attendees_count: 5,  status: 'برنامه‌ریزی شده', decisions: null,                                                        created_at: '2025-01-04T10:30:00Z' },
  { id: 12, association_name: 'انجمن علمی هوش مصنوعی',  title: 'جلسه برنامه‌ریزی هکاتون',          meeting_date: '1403/10/25', meeting_time: '16:30', location: 'آزمایشگاه هوش مصنوعی',         meeting_type: 'عادی',        agenda: 'برنامه‌ریزی هکاتون ۴۸ ساعته بهار ۱۴۰۴',                      description: 'تعیین موضوع، داوران و اسپانسرهای هکاتون',       attendees_count: 11, status: 'برگزار شد',         decisions: 'موضوع هکاتون «هوش مصنوعی در سلامت» تعیین شد',            created_at: '2025-01-14T15:00:00Z' },
  { id: 13, association_name: 'انجمن علمی اقتصاد',      title: 'جلسه فوری بررسی اعتراض دانشجویان', meeting_date: '1403/11/02', meeting_time: '08:30', location: 'دفتر دبیر انجمن',               meeting_type: 'فوری',        agenda: 'بررسی اعتراض دانشجویان نسبت به برنامه فعالیت‌ها',           description: 'رسیدگی به شکایات و پیشنهادات دانشجویان',        attendees_count: 8,  status: 'برگزار شد',         decisions: 'تشکیل کمیته دانشجویی برای بازنگری برنامه‌ها',            created_at: '2025-01-21T08:00:00Z' },
  { id: 14, association_name: 'انجمن علمی گردشگری',     title: 'جلسه برنامه‌ریزی تور علمی',        meeting_date: '1403/11/10', meeting_time: '13:30', location: 'سالن انجمن گردشگری',            meeting_type: 'عادی',        agenda: 'برنامه‌ریزی تور علمی به اصفهان',                            description: 'هماهنگی لجستیک و محتوای تور علمی',              attendees_count: 7,  status: 'برنامه‌ریزی شده', decisions: null,                                                        created_at: '2025-01-29T12:00:00Z' },
  { id: 15, association_name: 'انجمن علمی زیست‌شناسی',  title: 'اولین جلسه سال ۱۴۰۳-۱۴۰۴',         meeting_date: '1403/07/05', meeting_time: '15:00', location: 'آزمایشگاه زیست‌شناسی',         meeting_type: 'عادی',        agenda: 'تعیین اهداف و تکالیف سال تحصیلی',                           description: 'آشنایی اعضا و برنامه‌ریزی سال تحصیلی جدید',    attendees_count: 9,  status: 'برگزار شد',         decisions: 'کمیته‌های تخصصی برای هر حوزه تشکیل شد',                  created_at: '2024-09-25T14:00:00Z' },
];

// ── Mock Stats & Analytics (derived from MOCK_ACTIVITIES) ────────────────────

const ACT_COLORS: Record<string, string> = {
  بازدید_علمی:'#2174b8', نشریه:'#7fa343', سخنرانی_علمی:'#f59e0b', همکاری_علمی:'#8b5cf6',
  کارگاه:'#ec4899', نمایشگاه:'#06b6d4', دوره_کمک_آموزشی:'#f97316',
  همایش_علمی:'#10b981', کرسی_اندیشه_ورزی:'#6366f1', مسابقه_علمی:'#ef4444',
};

function buildStats(acts: AssociationActivity[]): ActivityStats {
  const byType: Record<string, number> = {};
  const byAssoc: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byQuarter: Record<string, number> = {};

  for (const a of acts) {
    byType[a.activity_type]       = (byType[a.activity_type] ?? 0) + 1;
    byAssoc[a.association_name]   = (byAssoc[a.association_name] ?? 0) + 1;
    if (a.year && a.month) {
      const ml = `${a.year}/${String(a.month).padStart(2, '0')}`;
      const ql = `${a.year}/Q${Math.ceil(a.month / 3)}`;
      byMonth[ml]   = (byMonth[ml] ?? 0) + 1;
      byQuarter[ql] = (byQuarter[ql] ?? 0) + 1;
    }
  }

  return {
    total: acts.length,
    by_type: Object.entries(byType).map(([t, c]) => ({
      type: t, label: ACT_LABELS[t] ?? t, color: ACT_COLORS[t] ?? '#94a3b8', count: c,
    })),
    by_association: Object.entries(byAssoc)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, count]) => ({ name, count })),
    monthly_trend: Object.entries(byMonth).sort().map(([label, count]) => {
      const [y, m] = label.split('/');
      return { label, year: +y, month: +m, count };
    }),
    quarterly_trend: Object.entries(byQuarter).sort().map(([label, count]) => ({ label, count })),
    activity_labels: ACT_LABELS,
    activity_colors: ACT_COLORS,
  };
}

export const MOCK_ACTIVITY_STATS: ActivityStats = buildStats(MOCK_ACTIVITIES);

export const MOCK_ANALYTICS: AnalyticsData = {
  summary: {
    total_associations: MOCK_ASSOCIATIONS.length,
    active_associations: MOCK_ASSOCIATIONS.filter(a => a.activity_status === 'فعال').length,
    total_activities: MOCK_ACTIVITIES.length,
    total_forms: MOCK_FORMS.length,
    unique_active_associations: new Set(MOCK_ACTIVITIES.map(a => a.association_name)).size,
    avg_activities_per_assoc: +(MOCK_ACTIVITIES.length / MOCK_ASSOCIATIONS.length).toFixed(1),
    period_months: null,
  },
  assoc_status: [
    { name: 'فعال', count: MOCK_ASSOCIATIONS.filter(a => a.activity_status === 'فعال').length },
    { name: 'نیمه‌فعال', count: MOCK_ASSOCIATIONS.filter(a => a.activity_status === 'نیمه‌فعال').length },
    { name: 'کم‌فعالیت', count: MOCK_ASSOCIATIONS.filter(a => a.activity_status === 'کم‌فعالیت').length },
    { name: 'نامشخص', count: MOCK_ASSOCIATIONS.filter(a => a.activity_status === 'نامشخص').length },
  ].filter(d => d.count > 0),
  logo_status: [
    { name: 'دارد', count: MOCK_ASSOCIATIONS.filter(a => a.logo_status === 'دارد').length },
    { name: 'ناقص', count: MOCK_ASSOCIATIONS.filter(a => a.logo_status === 'ناقص').length },
    { name: 'ندارد', count: MOCK_ASSOCIATIONS.filter(a => a.logo_status === 'ندارد').length },
  ].filter(d => d.count > 0),
  activity_by_type: MOCK_ACTIVITY_STATS.by_type,
  monthly_trend: MOCK_ACTIVITY_STATS.monthly_trend.map(t => ({ label: t.label, count: t.count })),
  top_associations: MOCK_ACTIVITY_STATS.by_association.map(a => ({ association_name: a.name, count: a.count })),
  participants_stats: (() => {
    const vals = MOCK_ACTIVITIES.map(a => a.participants_count ?? 0).filter(Boolean);
    const sum = vals.reduce((s, v) => s + v, 0);
    const sorted = [...vals].sort((a, b) => a - b);
    return {
      total: sum,
      mean: +(sum / vals.length).toFixed(1),
      median: sorted[Math.floor(sorted.length / 2)] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      min: sorted[0] ?? 0,
    };
  })(),
  forms_summary: {
    total: MOCK_FORMS.length,
    complete: MOCK_FORMS.filter(f => f.is_complete).length,
    cancelled: MOCK_FORMS.filter(f => f.is_cancelled).length,
    needs_follow_up: MOCK_FORMS.filter(f => f.needs_follow_up).length,
    completion_rate: +((MOCK_FORMS.filter(f => f.is_complete).length / MOCK_FORMS.length) * 100).toFixed(1),
  },
  forms_by_type: [
    { form_type: 'کارگاه', count: MOCK_FORMS.filter(f => f.form_type === 'کارگاه').length },
    { form_type: 'مسابقه', count: MOCK_FORMS.filter(f => f.form_type === 'مسابقه').length },
  ].filter(d => d.count > 0),
  activity_form_correlation: 0.72,
};
