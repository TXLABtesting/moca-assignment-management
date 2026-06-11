// Shared data model: grades, ministries, employees, assignments

export const GRADES = [
  { id: '1.2', min: 14000, max: 18000, basic: 16000 },
  { id: '1.3', min: 16000, max: 21000, basic: 18500 },
  { id: '2.1', min: 18000, max: 24000, basic: 21000 },
  { id: '2.2', min: 21000, max: 27000, basic: 24000 },
  { id: '2.3', min: 24000, max: 30000, basic: 27000 },
  { id: '3.1', min: 27000, max: 34000, basic: 30500 },
  { id: '3.2', min: 30000, max: 38000, basic: 34000 },
  { id: '3.3', min: 34000, max: 42000, basic: 38000 },
  { id: '4.1', min: 38000, max: 47000, basic: 42500 },
  { id: '4.2', min: 42000, max: 52000, basic: 47000 },
  { id: '4.3', min: 47000, max: 58000, basic: 52500 },
  { id: '5',   min: 52000, max: 80000, basic: 65000 },
  { id: 'HE special', min: 80000, max: 120000, basic: 100000 },
];

export const GRADE_INDEX = (id) => GRADES.findIndex((g) => g.id === id);
export const GET_GRADE   = (id) => GRADES.find((g) => g.id === id);
// Grade 5 and above (incl. HE special): only secondment is permitted.
export const IS_SENIOR_GRADE = (id) => id === '5' || id === 'HE special';

export const ENTITIES = [
  { id: 'moca',   en: 'Ministry of Culture & Youth',                     ar: 'وزارة الثقافة والشباب' },
  { id: 'mohre',  en: 'Ministry of Human Resources & Emiratisation',     ar: 'وزارة الموارد البشرية والتوطين' },
  { id: 'mof',    en: 'Ministry of Finance',                             ar: 'وزارة المالية' },
  { id: 'moei',   en: 'Ministry of Energy & Infrastructure',             ar: 'وزارة الطاقة والبنية التحتية' },
  { id: 'moe',    en: 'Ministry of Education',                           ar: 'وزارة التربية والتعليم' },
  { id: 'mohap',  en: 'Ministry of Health & Prevention',                 ar: 'وزارة الصحة ووقاية المجتمع' },
  { id: 'mocd',   en: 'Ministry of Community Development',               ar: 'وزارة تنمية المجتمع' },
  { id: 'moj',    en: 'Ministry of Justice',                             ar: 'وزارة العدل' },
  { id: 'moi',    en: 'Ministry of Interior',                            ar: 'وزارة الداخلية' },
  { id: 'moccae', en: 'Ministry of Climate Change & Environment',        ar: 'وزارة التغير المناخي والبيئة' },
  { id: 'mofa',   en: 'Ministry of Foreign Affairs',                     ar: 'وزارة الخارجية' },
  { id: 'fahr',   en: 'Federal Authority for Human Resources',           ar: 'الهيئة الاتحادية للموارد البشرية' },
  { id: 'tdra',   en: 'Telecommunications & Digital Government Regulatory Authority', ar: 'هيئة تنظيم الاتصالات والحكومة الرقمية' },
  { id: 'esma',   en: 'Emirates Authority for Standardization & Metrology', ar: 'هيئة الإمارات للمواصفات والمقاييس' },
];

export const GET_ENTITY = (id) => ENTITIES.find((e) => e.id === id);

// Returns a display label for an entity id, OR the raw string if it's a custom
// (free-typed) entity name not in the predefined list. Never throws.
export const ENTITY_LABEL = (idOrName, lang) => {
  const e = GET_ENTITY(idOrName);
  if (e) return lang === 'ar' ? e.ar : e.en;
  return idOrName || '—';
};

export const EMPLOYEES = [
  { id: 'E-204815', en: 'Ahmed Al Mansoori',   ar: 'أحمد المنصوري',   entity: 'moca',  position_en: 'Senior Cultural Programmes Specialist',    position_ar: 'أخصائي أول برامج ثقافية',                   grade: '3.2', joined: '2016-09-12' },
  { id: 'E-198432', en: 'Fatima Al Zaabi',     ar: 'فاطمة الزعابي',    entity: 'mof',   position_en: 'Financial Analyst',                         position_ar: 'محلل مالي',                                   grade: '3.1', joined: '2018-02-04' },
  { id: 'E-221056', en: 'Mohammed Al Hashimi', ar: 'محمد الهاشمي',     entity: 'moei',  position_en: 'Infrastructure Project Manager',             position_ar: 'مدير مشاريع البنية التحتية',                  grade: '4.1', joined: '2014-05-21' },
  { id: 'E-187234', en: 'Mariam Al Suwaidi',   ar: 'مريم السويدي',     entity: 'mohre', position_en: 'HR Policy Advisor',                          position_ar: 'مستشار سياسات الموارد البشرية',              grade: '3.3', joined: '2017-11-08' },
  { id: 'E-249871', en: 'Khalid Al Marri',     ar: 'خالد المري',       entity: 'moe',   position_en: 'Education Policy Officer',                   position_ar: 'مسؤول سياسات تعليمية',                        grade: '2.3', joined: '2019-08-15' },
  { id: 'E-210645', en: 'Noura Al Kaabi',      ar: 'نورا الكعبي',      entity: 'mocd',  position_en: 'Community Programmes Lead',                  position_ar: 'قائد برامج مجتمعية',                          grade: '4.2', joined: '2013-03-30' },
  { id: 'E-235712', en: 'Saif Al Falasi',      ar: 'سيف الفلاسي',      entity: 'mohap', position_en: 'Public Health Specialist',                   position_ar: 'أخصائي صحة عامة',                             grade: '3.1', joined: '2018-10-22' },
  { id: 'E-194523', en: 'Hessa Al Nuaimi',     ar: 'حصة النعيمي',      entity: 'moj',   position_en: 'Legal Counsel',                              position_ar: 'مستشار قانوني',                               grade: '4.3', joined: '2012-06-19' },
  { id: 'E-218396', en: 'Abdullah Al Shamsi',  ar: 'عبدالله الشامسي',  entity: 'tdra',  position_en: 'Digital Transformation Lead',                position_ar: 'قائد التحول الرقمي',                          grade: '4.1', joined: '2015-12-01' },
  { id: 'E-260128', en: 'Reem Al Mazrouei',    ar: 'ريم المزروعي',     entity: 'mofa',  position_en: 'Diplomatic Affairs Officer',                 position_ar: 'مسؤول شؤون دبلوماسية',                        grade: '2.2', joined: '2020-04-17' },
];

export const GET_EMPLOYEE = (id) => EMPLOYEES.find((e) => e.id === id);

// Sample assignments — mix of statuses and types to demonstrate UI
export const ASSIGNMENTS = [
  {
    id: 'ASG-2025-00187', type: 'secondment', status: 'active',
    employeeId: 'E-204815', fromEntity: 'moca', toEntity: 'mohre',
    position_en: 'Senior HR Strategy Advisor', position_ar: 'مستشار أول استراتيجيات الموارد البشرية',
    grade: '3.3', startDate: '2025-09-01', endDate: '2026-08-31',
    salaryBasic: 38000, allowance: 9500, payingEntity: 'moca',
    reason_en: 'Support the federal HR strategy refresh initiative.',
    reason_ar: 'دعم مبادرة تحديث استراتيجية الموارد البشرية الاتحادية.',
    awaitingApprover: null, updatedAt: '2025-08-28T10:14:00',
  },
  {
    id: 'ASG-2025-00203', type: 'acting', status: 'pending',
    employeeId: 'E-198432', fromEntity: 'mof', toEntity: 'mof',
    position_en: 'Acting Director, Budget Planning', position_ar: 'مدير بالإنابة، تخطيط الميزانية',
    grade: '4.2', startDate: '2026-01-15', endDate: '2026-07-15',
    salaryBasic: 47000, allowance: 0, payingEntity: 'mof',
    reason_en: 'Cover director leave; candidate identified through succession plan.',
    reason_ar: 'تغطية إجازة المدير؛ المرشح محدد عبر خطة التعاقب.',
    awaitingApprover: 'css_sector_head', updatedAt: '2026-05-19T09:42:00',
  },
  {
    id: 'ASG-2025-00198', type: 'loan', status: 'active',
    employeeId: 'E-221056', fromEntity: 'moei', toEntity: 'esma',
    position_en: 'Lead Engineer, Standards Programme', position_ar: 'مهندس رئيسي، برنامج المواصفات',
    grade: '4.2', startDate: '2025-06-01', endDate: '2026-05-31',
    salaryBasic: 47000, allowance: 11750, payingEntity: 'esma',
    reason_en: 'Loan to external authority for national standards programme delivery.',
    reason_ar: 'إعارة إلى هيئة خارجية لتسليم برنامج المواصفات الوطنية.',
    awaitingApprover: null, updatedAt: '2025-05-25T14:30:00',
  },
  {
    id: 'ASG-2026-00021', type: 'borrowing', status: 'pending',
    employeeId: null,
    borrowedEmployee: { en: 'Mariam Al Suwaidi', ar: 'مريم السويدي' },
    fromEntity: 'mohre', toEntity: 'fahr',
    position_en: 'Senior HR Policy Researcher', position_ar: 'باحث أول سياسات موارد بشرية',
    grade: '3.3', startDate: '2026-06-01', endDate: '2027-05-31',
    salaryBasic: 38000, allowance: 8500, payingEntity: 'fahr',
    reason_en: 'Borrow specialist for federal HR policy renewal cycle.',
    reason_ar: 'استعارة متخصص لدورة تحديث السياسات الاتحادية للموارد البشرية.',
    awaitingApprover: 'entity_head', updatedAt: '2026-05-21T11:08:00',
  },
  {
    id: 'ASG-2025-00211', type: 'secondment', status: 'pending',
    employeeId: 'E-249871', fromEntity: 'moe', toEntity: 'mocd',
    position_en: 'Youth Programmes Coordinator', position_ar: 'منسق برامج الشباب',
    grade: '3.1', startDate: '2026-07-01', endDate: '2027-01-01',
    salaryBasic: 30500, allowance: 7625, payingEntity: 'moe',
    reason_en: 'Cross-entity collaboration on national youth wellbeing initiative.',
    reason_ar: 'تعاون بين الجهات على مبادرة سلامة الشباب الوطنية.',
    awaitingApprover: 'hr_director', updatedAt: '2026-05-20T16:21:00',
  },
  {
    id: 'ASG-2025-00156', type: 'acting', status: 'active',
    employeeId: 'E-210645', fromEntity: 'mocd', toEntity: 'mocd',
    position_en: 'Acting Assistant Undersecretary, Community Affairs', position_ar: 'وكيل وزارة مساعد بالإنابة، شؤون المجتمع',
    grade: '4.3', startDate: '2025-03-15', endDate: '2026-06-30',
    salaryBasic: 52500, allowance: 0, payingEntity: 'mocd',
    reason_en: 'Cover vacancy pending external recruitment.',
    reason_ar: 'تغطية شاغر بانتظار التوظيف الخارجي.',
    awaitingApprover: null, updatedAt: '2025-03-10T08:50:00',
  },
  {
    id: 'ASG-2025-00134', type: 'secondment', status: 'expired',
    employeeId: 'E-235712', fromEntity: 'mohap', toEntity: 'moccae',
    position_en: 'Environmental Health Advisor', position_ar: 'مستشار صحة بيئية',
    grade: '3.2', startDate: '2024-05-01', endDate: '2025-04-30',
    salaryBasic: 34000, allowance: 8500, payingEntity: 'mohap',
    reason_en: 'Joint task force on environmental health framework.',
    reason_ar: 'فريق عمل مشترك لإطار الصحة البيئية.',
    awaitingApprover: null, updatedAt: '2025-05-02T09:00:00',
  },
  {
    id: 'ASG-2026-00033', type: 'loan', status: 'draft',
    employeeId: 'E-194523', fromEntity: 'moj', toEntity: 'fahr',
    position_en: 'Senior Legal Counsel, HR Policy', position_ar: 'مستشار قانوني أول، سياسات الموارد البشرية',
    grade: '4.3', startDate: '2026-08-01', endDate: '2027-07-31',
    salaryBasic: 52500, allowance: 13125, payingEntity: 'fahr',
    reason_en: 'Draft — pending receiving entity confirmation.',
    reason_ar: 'مسودة — بانتظار تأكيد الجهة المستقبلة.',
    awaitingApprover: null, updatedAt: '2026-05-18T13:45:00',
  },
  {
    id: 'ASG-2025-00229', type: 'borrowing', status: 'rejected',
    employeeId: null,
    borrowedEmployee: { en: 'Abdullah Al Shamsi', ar: 'عبدالله الشامسي' },
    fromEntity: 'tdra', toEntity: 'moca',
    position_en: 'Digital Programmes Manager', position_ar: 'مدير برامج رقمية',
    grade: '4.1', startDate: '2026-04-01', endDate: '2027-03-31',
    salaryBasic: 42500, allowance: 10000, payingEntity: 'moca',
    reason_en: 'Rejected — receiving entity budget unavailable for FY 2026.',
    reason_ar: 'مرفوض — لا تتوفر ميزانية الجهة المستقبلة للسنة المالية 2026.',
    awaitingApprover: null, updatedAt: '2026-03-12T15:20:00',
    rejection_en: 'Receiving entity finance department flagged insufficient FY2026 budget allocation. Please resubmit with updated paying entity arrangement.',
    rejection_ar: 'أشارت الإدارة المالية في الجهة المستقبلة إلى عدم كفاية تخصيصات ميزانية السنة المالية 2026. يُرجى إعادة التقديم مع ترتيب محدث للجهة الدافعة.',
  },
  {
    id: 'ASG-2025-00175', type: 'secondment', status: 'active',
    employeeId: 'E-260128', fromEntity: 'mofa', toEntity: 'moca',
    position_en: 'International Cultural Affairs Specialist', position_ar: 'أخصائي شؤون ثقافية دولية',
    grade: '2.3', startDate: '2025-10-01', endDate: '2026-06-15',
    salaryBasic: 27000, allowance: 6750, payingEntity: 'mofa',
    reason_en: 'Support UAE pavilion cultural programming.',
    reason_ar: 'دعم البرمجة الثقافية للجناح الإماراتي.',
    awaitingApprover: null, updatedAt: '2025-09-25T11:30:00',
  },
];

export const formatDate = (iso, lang) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (lang === 'ar') return d.toLocaleDateString('ar-AE', { year: 'numeric', month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (iso, lang) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = formatDate(iso, lang);
  const time = d.toLocaleTimeString(lang === 'ar' ? 'ar-AE' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};

export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// Add whole calendar months to an ISO date, returning an ISO (yyyy-mm-dd) string.
export const addMonths = (iso, m) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + Number(m || 0));
  return d.toISOString().slice(0, 10);
};

export const formatAED = (n, lang) => {
  if (n == null || n === '') return '—';
  const num = Number(n).toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-AE');
  return lang === 'ar' ? `${num} د.إ` : `AED ${num}`;
};

// Existing entitlements the employee already receives — in a real deployment these
// are read straight from Oracle HCM/Payroll. Derived here from grade, tenure & duration.
export const GET_ENTITLEMENTS = (emp, durationDays, lang) => {
  if (!emp) return [];
  const g = GET_GRADE(emp.grade);
  const basic = g ? g.basic : 0;
  const fmt = (n) => formatAED(n, lang);
  const yearsServed = Math.max(0, Math.floor((Date.now() - new Date(emp.joined).getTime()) / (365.25 * 86400000)));
  const senior = GRADE_INDEX(emp.grade) >= GRADE_INDEX('4.1');
  const leaveDays = Math.round((Number(durationDays) || 0) / 365 * 30);
  const per = lang === 'ar' ? ' / سنة' : ' / yr';
  const perMo = lang === 'ar' ? ' / شهر' : ' / mo';
  return [
    { key: 'phone',     label_en: 'Phone allowance',              label_ar: 'بدل الهاتف',                    value: senior ? fmt(700) + perMo : (lang === 'ar' ? 'لا يوجد' : 'None') },
    { key: 'insurance', label_en: 'Health insurance',             label_ar: 'التأمين الصحي',                 value: senior ? (lang === 'ar' ? 'الفئة الأولى — العائلة' : 'Category A — family') : (lang === 'ar' ? 'الفئة الثانية' : 'Category B') },
    { key: 'retirement',label_en: 'Retirement / pension',         label_ar: 'المعاش / التقاعد',              value: fmt(Math.round(basic * 0.20)) + (lang === 'ar' ? ' / شهر (حصة جهة العمل)' : ' / mo (employer share)') },
    { key: 'eos',       label_en: 'End-of-service (to date)',     label_ar: 'مكافأة نهاية الخدمة (حتى تاريخه)', value: fmt(Math.round(basic * yearsServed)) },
    { key: 'leave',     label_en: 'Leave days over the period',  label_ar: 'أيام الإجازة خلال الفترة',     value: `${leaveDays} ${lang === 'ar' ? 'يوم' : 'days'}` },
  ];
};
