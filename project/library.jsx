// Policy Library + Reports — consolidated reference & analytics screens.
// Content is driven by the policy rules in i18n and the live assignment data.

const { useMemo: useMemoLib, useState: useStateLib } = React;

// ============================================================
// Small horizontal bar-list used across the report cards
// ============================================================
function BarList({ rows, colorFor }) {
  const max = Math.max(...rows.map(r => r.count), 1);
  return (
    <div className="flex-col" style={{ gap: 14 }}>
      {rows.map(r => (
        <div key={r.key}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span className="text-sm text-strong">{r.label}</span>
            <span className="text-sm tabular text-muted">{r.count}</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-ink-100)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(r.count / max) * 100}%`, height: '100%', background: colorFor ? colorFor(r.key) : 'var(--color-gold-500)', borderRadius: 999, transition: 'width 400ms ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Policy Library — tabbed by assignment type, plus SLA & integrations
// ============================================================
const POLICY_TABS = [
  { id: 'secondment',   en: 'Secondment',          ar: 'التكليف' },
  { id: 'acting',       en: 'Acting',              ar: 'الندب' },
  { id: 'loan',         en: 'Loan',                ar: 'الإعارة' },
  { id: 'borrowing',    en: 'Borrowing',           ar: 'الاستعارة' },
  { id: 'sla',          en: 'SLA & Notifications', ar: 'SLA والتنبيهات' },
  { id: 'integrations', en: 'Integrations',        ar: 'التكاملات' },
];

const POLICY_CONTENT = {
  acting: [
    { en: 'An employee may not be seconded to more than one entity during the same period.', ar: 'لا يجوز ندب الموظف لأكثر من جهة واحدة في نفس الفترة الزمنية.' },
    { en: 'The secondment allowance is due only when the secondment exceeds 60 calendar days.', ar: 'يُستحق بدل الندب فقط إذا تجاوزت مدة الندب 60 يوماً تقويمياً.' },
    { en: 'The allowance is calculated retroactively from the start date once 60 days are completed.', ar: 'يُحتسب البدل بأثر رجعي من تاريخ البدء عند اكتمال 60 يوماً.' },
    { en: 'Allowance value = 25% of the basic salary at the start of the salary range (minimum) of the destination grade.', ar: 'قيمة البدل = 25% من الراتب الأساسي لبداية مربوط الدرجة المُندب إليها.' },
    { en: 'The initial secondment period may not exceed one calendar year (365 days).', ar: 'لا تتجاوز الفترة الأولية للندب سنة ميلادية واحدة (365 يوماً).' },
    { en: 'One extension only is allowed, up to a maximum of 180 days, with the entity head\u2019s approval.', ar: 'يجوز التمديد مرة واحدة فقط بحد أقصى 180 يوماً بموافقة رئيس الجهة.' },
    { en: 'No further extension is permitted once the maximum has been reached.', ar: 'لا يُسمح بأي تمديد إضافي بعد استيفاء الحد الأقصى.' },
    { en: 'An employee may not be seconded to a grade more than two grades above their current grade.', ar: 'لا يمكن ندب الموظف بأكثر من درجتين فوق درجته الحالية.' },
    { en: 'The entity responsible for paying the allowance must be specified before the request is submitted.', ar: 'يجب تحديد الجهة المسؤولة عن صرف البدل قبل رفع الطلب.' },
    { en: 'The secondment allowance stops automatically when the assignment ends or the period expires.', ar: 'يتوقف بدل الندب تلقائياً عند إنهاء التكليف أو انتهاء الفترة.' },
  ],
  secondment: [
    { en: 'The entity head may temporarily assign an employee in an acting capacity based on work requirements.', ar: 'يحق لرئيس الجهة تكليف موظف مؤقتاً بناءً على متطلبات العمل.' },
    { en: 'Start date, end date, and the reason for the acting assignment are mandatory fields.', ar: 'تاريخ البداية والنهاية وسبب التكليف حقول إلزامية.' },
    { en: 'The entity head\u2019s approval is mandatory before the acting assignment is activated.', ar: 'موافقة رئيس الجهة إلزامية قبل تفعيل التكليف.' },
    { en: 'No financial allowance or additional entitlements are paid during the acting period.', ar: 'لا يُصرف أي بدل مالي أو مستحقات إضافية خلال فترة التكليف.' },
    { en: 'The acting assignment may be ended at any time based on administrative or operational requirements.', ar: 'يمكن إنهاء التكليف في أي وقت بناءً على متطلبات إدارية أو تشغيلية.' },
    { en: 'The employee\u2019s status is updated automatically in the system upon approval.', ar: 'يتم تحديث وضع الموظف في النظام تلقائياً عند الاعتماد.' },
  ],
  loan: [
    { en: 'A loan may be made to any external entity or company — including federal entities, government companies, local governments, and private-sector companies.', ar: 'يجوز الإعارة إلى أي جهة أو شركة خارجية — بما في ذلك الجهات الاتحادية والشركات الحكومية والحكومات المحلية وشركات القطاع الخاص.' },
    { en: 'Approval of both the lending entity and the receiving entity is required.', ar: 'تستلزم موافقة الجهة المعيرة والجهة المعار إليها.' },
    { en: 'An official decision is issued by the head of the lending entity, stating: the receiving entity name, loan duration, the entity responsible for salary, and financial entitlements.', ar: 'يصدر قرار رسمي من رئيس الجهة المعيرة يتضمن: اسم الجهة المستقبلة، مدة الإعارة، الجهة المسؤولة عن الراتب، والمستحقات المالية.' },
    { en: 'The loan period is one calendar year; any extension requires the Minister\u2019s approval only.', ar: 'مدة الإعارة سنة ميلادية واحدة، التمديد بموافقة الوزير فقط.' },
    { en: 'The loan ends on expiry of its period, or by notice from either entity at least 30 full days in advance.', ar: 'تنتهي الإعارة بانتهاء المدة أو بإشعار من أي من الجهتين قبل 30 يوماً كاملاً.' },
    { en: 'The employee may request early termination by submitting a justification to HR with the sector head\u2019s approval.', ar: 'يمكن للموظف طلب الإنهاء المبكر بتقديم مبرر إلى الموارد البشرية وموافقة رئيس القطاع.' },
    { en: 'HR must prepare a comprehensive financial study and attach it to the request.', ar: 'يجب على الموارد البشرية إعداد دراسة مالية شاملة وإرفاقها بالطلب.' },
  ],
  borrowing: [
    { en: 'Approval of the competent authority in the lending entity and the approval of the borrowing entity are required.', ar: 'تستلزم موافقة السلطة المختصة في الجهة المعيرة وموافقة الجهة المستعيرة.' },
    { en: 'An official decision is issued by the head of the borrowing entity, stating: borrowing duration, the entity responsible for salary, and allowances.', ar: 'يصدر قرار رسمي من رئيس الجهة المستعيرة يتضمن: مدة الاستعارة، الجهة المسؤولة عن الراتب، والبدلات.' },
    { en: 'The borrowing period is one calendar year; any extension requires the Minister\u2019s approval only.', ar: 'مدة الاستعارة سنة ميلادية، التمديد بموافقة الوزير فقط.' },
    { en: 'An optional borrowing allowance may be paid, capped at AED 10,000 per month.', ar: 'يجوز صرف بدل استعارة اختياري بحد أقصى 10,000 درهم شهرياً.' },
    { en: 'HR must prepare a comprehensive financial study and attach it to the request.', ar: 'يجب على الموارد البشرية إعداد دراسة مالية شاملة وإرفاقها بالطلب.' },
  ],
  sla: [
    { en: 'Automatic notification 45 days before any assignment ends \u2014 sent to: HR.', ar: 'إشعار تلقائي قبل 45 يوماً من انتهاء أي تكليف — يُرسل إلى: HR.' },
    { en: 'Automatic notification 30 days before \u2014 sent to: HR, line manager.', ar: 'إشعار تلقائي قبل 30 يوماً — يُرسل إلى: HR، المدير المباشر.' },
    { en: 'Automatic notification 15 days before \u2014 sent to: HR, line manager, and the employee concerned.', ar: 'إشعار تلقائي قبل 15 يوماً — يُرسل إلى: HR، المدير المباشر، الموظف المعني.' },
    { en: 'Approval SLA: the system tracks every stage and alerts the system administrator when the duration is exceeded.', ar: 'SLA الاعتماد: يتتبع النظام كل مرحلة ويُنبّه مدير النظام عند تجاوز المدة.' },
    { en: 'All operations are logged automatically in the Audit Trail with timestamp and user.', ar: 'تُسجَّل جميع العمليات في سجل التدقيق (Audit Trail) تلقائياً مع التوقيت والمستخدم.' },
    { en: 'An SLA dashboard is available to executives in real time.', ar: 'لوحة مؤشرات SLA متاحة للمديرين التنفيذيين بشكل مباشر.' },
  ],
  integrations: [
    { name: 'Oracle Payroll', en: 'Automatically updates employee salaries and allowances upon approval and termination.', ar: 'تحديث رواتب الموظفين والبدلات تلقائياً عند الاعتماد والإنهاء.' },
    { name: 'Oracle Workflow Engine', en: 'Manages and routes dynamic approval paths automatically.', ar: 'إدارة مسارات الاعتماد الديناميكية وتوجيهها تلقائياً.' },
    { name: 'Oracle Notifications Framework', en: 'Sends email notifications and in-system alerts.', ar: 'إرسال إشعارات البريد الإلكتروني والتنبيهات داخل النظام.' },
    { name: 'Oracle BI / OTBI', en: 'Interactive analytical reports and executive KPI dashboards.', ar: 'تقارير تحليلية تفاعلية ولوحات مؤشرات الأداء التنفيذية.' },
    { name: 'Oracle Reporting Services', en: 'Generates scheduled and on-demand Excel and PDF reports.', ar: 'توليد تقارير Excel و PDF المجدولة والفورية.' },
    { name: 'Document Management', en: 'Manages and verifies attachments and official documents.', ar: 'إدارة المرفقات والوثائق الرسمية والتحقق منها.' },
  ],
};

function Policies({ onNavigate }) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useStateLib('acting');
  const items = POLICY_CONTENT[tab] || [];

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('app_title')}</a>
          <span className="sep">/</span>
          <span>{t('nav_policies')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('nav_policies')}</h1>
            <div className="page-subtitle">{lang === 'ar' ? 'سياسات كل نوع من المهام الوظيفية الاتحادية' : 'Policies for each type of federal assignment'}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="tabs" style={{ margin: 0, padding: '0 var(--space-5)', flexWrap: 'wrap' }}>
          {POLICY_TABS.map(tb => (
            <button key={tb.id} className={`tab ${tab === tb.id ? 'active' : ''}`} onClick={() => setTab(tb.id)}>
              {lang === 'ar' ? tb.ar : tb.en}
            </button>
          ))}
        </div>
        <div style={{ padding: 'var(--space-4) var(--space-6) var(--space-5)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((it, i) => (
              <li key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-gold-500)', marginTop: 8, flexShrink: 0 }} />
                <span className="text-sm" style={{ lineHeight: 1.65, color: 'var(--color-ink-800)' }}>
                  {it.name
                    ? <><strong style={{ color: 'var(--color-ink-900)' }}>{it.name}:</strong> {lang === 'ar' ? it.ar : it.en}</>
                    : (lang === 'ar' ? it.ar : it.en)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Reports
// ============================================================
function Reports({ onNavigate }) {
  const { t, lang } = useI18n();
  const assignments = window.ASSIGNMENTS;

  const stats = useMemoLib(() => {
    const active = assignments.filter(a => a.status === 'active').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const expiring = assignments.filter(a => {
      if (a.status !== 'active') return false;
      const d = window.daysBetween(new Date(), a.endDate);
      return d > 0 && d <= 45;
    }).length;
    return { active, pending, expiring, total: assignments.length };
  }, [assignments]);

  const byType = useMemoLib(() => {
    const map = {};
    assignments.forEach(a => { map[a.type] = (map[a.type] || 0) + 1; });
    return ['secondment', 'acting', 'loan', 'borrowing'].map(k => ({ key: k, label: t(`type_${k}`), count: map[k] || 0 }));
  }, [assignments, lang]);

  const byStatus = useMemoLib(() => {
    const map = {};
    assignments.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
    return ['active', 'pending', 'draft', 'rejected', 'expired'].map(k => ({ key: k, label: t(`status_${k}`), count: map[k] || 0 }));
  }, [assignments, lang]);

  const byYear = useMemoLib(() => {
    const map = {};
    assignments.forEach(a => { const y = new Date(a.startDate).getFullYear(); map[y] = (map[y] || 0) + 1; });
    return Object.keys(map).sort().map(y => ({ key: y, label: y, count: map[y] }));
  }, [assignments]);

  const byEntity = useMemoLib(() => {
    const map = {};
    assignments.forEach(a => { map[a.toEntity] = (map[a.toEntity] || 0) + 1; });
    return Object.keys(map)
      .map(id => ({ key: id, label: lang === 'ar' ? window.GET_ENTITY(id).ar : window.GET_ENTITY(id).en, count: map[id] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [assignments, lang]);

  const typeColor = k => k === 'secondment' ? '#5B2E91' : k === 'acting' ? '#145D49' : k === 'loan' ? '#8C3F0E' : '#1D4670';
  const statusColor = k => ({ active: 'var(--color-success-500)', pending: 'var(--color-warning-500)', draft: 'var(--color-ink-400)', rejected: 'var(--color-danger-500)', expired: 'var(--color-ink-300)' }[k] || 'var(--color-gold-500)');

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('app_title')}</a>
          <span className="sep">/</span>
          <span>{t('nav_reports')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('nav_reports')}</h1>
            <div className="page-subtitle">{lang === 'ar' ? 'نظرة تحليلية على كل المهام الوظيفية' : 'Analytical overview across all assignments'}</div>
          </div>
          <div className="page-actions">
            <Button icon="download">{t('export')}</Button>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label={t('stat_total_ytd')} value={stats.total} meta={lang === 'ar' ? '+12% عن العام الماضي' : '+12% vs last year'} dir="up" />
        <StatCard label={t('stat_active')} value={stats.active} meta={lang === 'ar' ? 'سارية حالياً' : 'currently active'} />
        <StatCard label={t('stat_pending')} value={stats.pending} meta={t('awaiting_you')} accent />
        <StatCard label={t('stat_expiring')} value={stats.expiring} meta={lang === 'ar' ? 'خلال 45 يوماً' : 'within 45 days'} dir="warn" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <Card title={t('by_type')} subtitle={lang === 'ar' ? 'توزيع جميع المهام' : 'Distribution of all assignments'}>
          <BarList rows={byType} colorFor={typeColor} />
        </Card>
        <Card title={t('by_status')} subtitle={lang === 'ar' ? 'حالة كل المهام' : 'Status across the portfolio'}>
          <BarList rows={byStatus} colorFor={statusColor} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-5)' }}>
        <Card title={lang === 'ar' ? 'إجمالي المهام حسب السنة' : 'Total assignments by year'}
          subtitle={lang === 'ar' ? 'بناءً على تاريخ بداية المهمة' : 'Based on assignment start date'}>
          <BarList rows={byYear} />
        </Card>
        <Card title={lang === 'ar' ? 'الجهات المستقبلة الأكثر نشاطاً' : 'Most active receiving entities'}
          subtitle={lang === 'ar' ? 'أعلى ٦ جهات' : 'Top 6 entities'}>
          <BarList rows={byEntity} />
        </Card>
      </div>
    </>
  );
}

Object.assign(window, { Policies, Reports });
