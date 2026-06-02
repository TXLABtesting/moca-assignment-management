// Dashboard — HR Officer's home view. Supports 3 layout variants via Tweaks:
//   "stats"  — classic government KPI grid + table (default, most official)
//   "focus"  — task-first "needs your attention" hero layout
//   "table"  — table-first, data-dense single-pane

const { useState: useStateD, useMemo: useMemoD } = React;

function Dashboard({ variant, onNavigate }) {
  const { t, lang } = useI18n();
  const assignments = window.ASSIGNMENTS;

  const stats = useMemoD(() => {
    const active = assignments.filter((a) => a.status === 'active').length;
    const pending = assignments.filter((a) => a.status === 'pending').length;
    const expiring = assignments.filter((a) => {
      if (a.status !== 'active') return false;
      const days = window.daysBetween(new Date(), a.endDate);
      return days > 0 && days <= 45;
    }).length;
    const total = assignments.length;
    return { active, pending, expiring, total };
  }, [assignments]);

  const byType = useMemoD(() => {
    const map = {};
    assignments.forEach((a) => {map[a.type] = (map[a.type] || 0) + 1;});
    return ['secondment', 'acting', 'loan', 'borrowing'].map((k) => ({ type: k, count: map[k] || 0 }));
  }, [assignments]);

  if (variant === 'focus') return <DashboardFocus stats={stats} onNavigate={onNavigate} byType={byType} />;
  if (variant === 'table') return <DashboardTable stats={stats} onNavigate={onNavigate} />;
  return <DashboardStats stats={stats} byType={byType} onNavigate={onNavigate} />;
}

// ============================================================
// Variant 1 — Classic stats + table (default)
// ============================================================
function DashboardStats({ stats, byType, onNavigate }) {
  const { t, lang } = useI18n();
  const assignments = window.ASSIGNMENTS;
  const [statusFilter, setStatusFilter] = useStateD('all');
  const [typeFilter, setTypeFilter] = useStateD('all');
  const [search, setSearch] = useStateD('');
  const tableRef = React.useRef(null);

  const showAllExpiring = () => {
    setStatusFilter('expiring');
    const el = tableRef.current;
    if (el) {
      requestAnimationFrame(() => {
        const main = document.querySelector('.main');
        if (main && main.scrollHeight > main.clientHeight + 4) {
          const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 12;
          main.scrollTo({ top, behavior: 'instant' });
        } else {
          const top = el.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top, behavior: 'instant' });
        }
      });
    }
  };

  const expiring = assignments.
  filter((a) => a.status === 'active').
  map((a) => ({ ...a, daysLeft: window.daysBetween(new Date(), a.endDate) })).
  filter((a) => a.daysLeft > 0 && a.daysLeft <= 90).
  sort((a, b) => a.daysLeft - b.daysLeft).
  slice(0, 5);

  const filtered = useMemoD(() => {
    return assignments.filter((a) => {
      if (statusFilter === 'expiring') {
        if (a.status !== 'active') return false;
        const d = window.daysBetween(new Date(), a.endDate);
        if (!(d > 0 && d <= 45)) return false;
      } else if (statusFilter !== 'all' && a.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (search) {
        const emp = window.GET_EMPLOYEE(a.employeeId);
        const hay = `${a.id} ${emp?.en} ${emp?.ar} ${emp?.id}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [statusFilter, typeFilter, search, assignments]);

  const counts = useMemoD(() => {
    const c = { all: assignments.length };
    assignments.forEach((a) => {c[a.status] = (c[a.status] || 0) + 1;});
    return c;
  }, [assignments]);

  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#">{t('app_title')}</a>
          <span className="sep">/</span>
          <span>{t('dashboard_title')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{lang === 'ar' ? 'مرحباً، مريم' : 'Welcome back, Mariam'}</h1>
            <div className="page-subtitle">{today}</div>
          </div>
          <div className="page-actions">
            <Button icon="download">{t('export')}</Button>
            <Button variant="primary" icon="plus" onClick={() => onNavigate('wizard')}>{t('new_assignment')}</Button>
          </div>
        </div>
      </div>

      {/* Stats — each arrow filters the assignments table below */}
      <div className="stat-grid">
        <StatCard label={t('stat_active')} value={stats.active} meta={lang === 'ar' ? '+3 هذا الشهر' : '+3 this month'} dir="up" active={statusFilter === 'active'} onClick={() => setStatusFilter('active')} />
        <StatCard label={t('stat_pending')} value={stats.pending} meta={t('awaiting_you')} accent active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} />
        <StatCard label={t('stat_expiring')} value={stats.expiring} meta={lang === 'ar' ? 'تنتهي قريباً' : 'within 45 days'} dir="warn" active={statusFilter === 'expiring'} onClick={() => setStatusFilter('expiring')} />
        <StatCard label={t('stat_total_ytd')} value={stats.total} meta={lang === 'ar' ? '+12% عن العام الماضي' : '+12% vs last year'} dir="up" onClick={() => setStatusFilter('all')} />
      </div>

      {/* Analytics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-5)', alignItems: 'stretch' }}>
        <AnalysisCard />
        <ExpiringSoonCard items={expiring} onNavigate={onNavigate} onShowAll={showAllExpiring} />
      </div>

      {/* Consolidated — all assignments with filters */}
      <div className="page-header-row" ref={tableRef} style={{ marginBottom: 'var(--space-4)', scrollMarginTop: 12 }}>
        <div>
          <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>{t('nav_assignments')}</h2>
          <div className="page-subtitle">{lang === 'ar' ? 'كل المهام في مكان واحد — سارية، قيد الاعتماد، ومنتهية' : 'Every assignment in one place — active, pending, and past'}</div>
        </div>
      </div>
      <div className="flex" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'pending', 'active', 'draft', 'rejected', 'expired'].map((s) =>
        <button key={s}
        className={`chip-filter ${statusFilter === s ? 'active' : ''}`}
        onClick={() => setStatusFilter(s)}>
            {s === 'all' ? lang === 'ar' ? 'الكل' : 'All' : t(`status_${s}`)}
            <span className="count">{counts[s] || 0}</span>
          </button>
        )}
      </div>
      <AssignmentsTable items={filtered} search={search} setSearch={setSearch} typeFilter={typeFilter} setTypeFilter={setTypeFilter} onNavigate={onNavigate} />
    </>);

}

// ============================================================
// Merged analytics — total + by-type with a year filter
// ============================================================
function AnalysisCard() {
  const { t, lang } = useI18n();
  const assignments = window.ASSIGNMENTS;
  const [year, setYear] = useStateD('all');
  const years = useMemoD(() => {
    const set = new Set(assignments.map((a) => new Date(a.startDate).getFullYear()));
    return Array.from(set).sort();
  }, [assignments]);
  const scoped = assignments.filter((a) => year === 'all' || new Date(a.startDate).getFullYear() === Number(year));
  const total = scoped.length;
  const byType = ['secondment', 'acting', 'loan', 'borrowing'].map((k) => ({ type: k, count: scoped.filter((a) => a.type === k).length }));
  const max = Math.max(...byType.map((d) => d.count), 1);
  const typeColor = (k) => k === 'secondment' ? '#5B2E91' : k === 'acting' ? '#145D49' : k === 'loan' ? '#8C3F0E' : '#1D4670';
  return (
    <Card
      title={lang === 'ar' ? 'المهام حسب النوع' : 'Assignments by type'}
      subtitle={lang === 'ar' ? 'الموزّعة حسب النوع' : 'Broken down by type'}
      actions={
      <Select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: 140, height: 32 }}>
          <option value="all">{lang === 'ar' ? 'كل السنوات' : 'All years'}</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>
      }>
      <div className="flex items-baseline justify-between" style={{ gap: 12, marginBottom: 'var(--space-3)' }} data-comment-anchor="204e93529d-div-185-7">
        <div className="text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-500)', fontWeight: 600 }}>{lang === 'ar' ? 'التوزيع حسب النوع' : 'Distribution by type'}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--color-ink-900)' }}>{total}</span>
          <span className="text-sm text-muted" data-comment-anchor="44d7123a1a-span-181-9">{year === 'all' ? lang === 'ar' ? 'إجمالي المهام' : 'total assignments' : lang === 'ar' ? `مهمة في ${year}` : `assignments in ${year}`}</span>
        </div>
      </div>
      <div className="flex-col" style={{ gap: 14 }}>
        {byType.map(({ type, count }) =>
        <div key={type}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span className="text-sm text-strong">{t(`type_${type}`)}</span>
              <span className="text-sm tabular text-muted">{count}</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-ink-100)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${count / max * 100}%`, height: '100%', background: typeColor(type), borderRadius: 999, transition: 'width 400ms ease' }} />
            </div>
          </div>
        )}
      </div>
    </Card>);

}

// ============================================================
// Total assignments by year
// ============================================================
function YearlyTotalsCard() {
  const { t, lang } = useI18n();
  const assignments = window.ASSIGNMENTS;
  const byYear = useMemoD(() => {
    const map = {};
    assignments.forEach((a) => {const y = new Date(a.startDate).getFullYear();map[y] = (map[y] || 0) + 1;});
    return Object.keys(map).sort().map((y) => ({ year: y, count: map[y] }));
  }, [assignments]);
  const max = Math.max(...byYear.map((d) => d.count), 1);
  return (
    <Card title={lang === 'ar' ? 'إجمالي المهام' : 'Total assignments'} subtitle={lang === 'ar' ? 'حسب سنة البداية' : 'By start year'}>
      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', marginBottom: 'var(--space-4)', color: 'var(--color-ink-900)' }}>{assignments.length}</div>
      <div className="flex-col" style={{ gap: 14 }}>
        {byYear.map(({ year, count }) =>
        <div key={year}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span className="text-sm text-strong tabular">{year}</span>
              <span className="text-sm tabular text-muted">{count}</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-ink-100)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${count / max * 100}%`, height: '100%', background: 'var(--color-gold-500)', borderRadius: 999, transition: 'width 400ms ease' }} />
            </div>
          </div>
        )}
      </div>
    </Card>);

}

// ============================================================
// Variant 2 — Focus / task-first
// ============================================================
function DashboardFocus({ stats, byType, onNavigate }) {
  const { t, lang } = useI18n();
  const assignments = window.ASSIGNMENTS;
  const pending = assignments.filter((a) => a.status === 'pending');

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#">{t('app_title')}</a><span className="sep">/</span><span>{t('dashboard_title')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('needs_attention')}</h1>
            <div className="page-subtitle">
              {lang === 'ar' ?
              `${pending.length} طلبات تنتظر اعتمادك` :
              `${pending.length} requests are waiting on your action.`}
            </div>
          </div>
          <div className="page-actions">
            <Button variant="primary" icon="plus" onClick={() => onNavigate('wizard')}>{t('new_assignment')}</Button>
          </div>
        </div>
      </div>

      {/* Hero focus card */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-ink-900), #2A2218)', color: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-5)', position: 'relative', overflow: 'hidden', borderBottom: '3px solid var(--color-gold-500)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(182,138,53,0.18), transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)' }}>
          <HeroStat label={t('stat_pending')} value={stats.pending} highlight />
          <HeroStat label={t('stat_expiring')} value={stats.expiring} />
          <HeroStat label={t('stat_active')} value={stats.active} />
          <HeroStat label={t('stat_total_ytd')} value={stats.total} />
        </div>
      </div>

      {/* Pending requests as cards */}
      <Card title={t('needs_attention')} actions={<a href="#" onClick={(e) => {e.preventDefault();onNavigate('list');}} className="text-sm">{t('view_all')} →</a>}>
        <div className="flex-col" style={{ gap: 'var(--space-3)' }}>
          {pending.map((a) => <PendingRequestRow key={a.id} item={a} onNavigate={onNavigate} />)}
          {pending.length === 0 &&
          <div className="empty">
              <Icon name="check-circle" size={48} className="empty-icon" />
              <div className="empty-title">{lang === 'ar' ? 'لا توجد طلبات قيد الانتظار' : 'You\'re all caught up'}</div>
              <div className="empty-body">{lang === 'ar' ? 'لا توجد طلبات تنتظر اعتمادك حالياً.' : 'No requests are waiting on your action right now.'}</div>
            </div>
          }
        </div>
      </Card>
    </>);

}

// ============================================================
// Variant 3 — Table-first
// ============================================================
function DashboardTable({ stats, onNavigate }) {
  const { t, lang } = useI18n();
  const [statusFilter, setStatusFilter] = useStateD('all');
  const [typeFilter, setTypeFilter] = useStateD('all');
  const [search, setSearch] = useStateD('');
  const assignments = window.ASSIGNMENTS;

  const filtered = useMemoD(() => {
    return assignments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (search) {
        const emp = window.GET_EMPLOYEE(a.employeeId);
        const hay = `${a.id} ${emp?.en} ${emp?.ar} ${emp?.id}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [statusFilter, typeFilter, search, assignments]);

  const counts = useMemoD(() => {
    const c = { all: assignments.length };
    assignments.forEach((a) => {c[a.status] = (c[a.status] || 0) + 1;});
    return c;
  }, [assignments]);

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#">{t('app_title')}</a><span className="sep">/</span><span>{t('nav_assignments')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('nav_assignments')}</h1>
            <div className="page-subtitle">
              {lang === 'ar' ?
              `${stats.active} سارية · ${stats.pending} قيد الاعتماد · ${stats.expiring} تنتهي قريباً` :
              `${stats.active} active · ${stats.pending} pending · ${stats.expiring} expiring soon`}
            </div>
          </div>
          <div className="page-actions">
            <Button icon="download">{t('export')}</Button>
            <Button variant="primary" icon="plus" onClick={() => onNavigate('wizard')}>{t('new_assignment')}</Button>
          </div>
        </div>
      </div>

      {/* Status chip row */}
      <div className="flex" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'pending', 'active', 'draft', 'rejected', 'expired'].map((s) =>
        <button key={s}
        className={`chip-filter ${statusFilter === s ? 'active' : ''}`}
        onClick={() => setStatusFilter(s)}>
            {s === 'all' ? lang === 'ar' ? 'الكل' : 'All' : t(`status_${s}`)}
            <span className="count">{counts[s] || 0}</span>
          </button>
        )}
      </div>

      <AssignmentsTable items={filtered} search={search} setSearch={setSearch} typeFilter={typeFilter} setTypeFilter={setTypeFilter} onNavigate={onNavigate} />
    </>);

}

// ============================================================
// Sub-components
// ============================================================
function StatCard({ label, value, meta, dir, accent, onClick, active }) {
  const baseBorder = active ? 'var(--color-gold-500)' : accent ? 'var(--color-gold-300)' : 'var(--border-default)';
  const tinted = accent || active;
  return (
    <div className="stat-card" onClick={onClick}
    style={{ ...(tinted ? { borderColor: baseBorder, background: 'var(--color-gold-50)' } : {}), boxShadow: active ? 'var(--shadow-sm)' : undefined, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 120ms, box-shadow 120ms' }}
    onMouseEnter={onClick ? (e) => {e.currentTarget.style.borderColor = 'var(--color-gold-400)';e.currentTarget.style.boxShadow = 'var(--shadow-sm)';} : undefined}
    onMouseLeave={onClick ? (e) => {e.currentTarget.style.borderColor = baseBorder;e.currentTarget.style.boxShadow = active ? 'var(--shadow-sm)' : 'var(--shadow-xs)';} : undefined}>
      {onClick && <Icon name="arrow-right" size={16} className="icon-flip" style={{ position: 'absolute', insetInlineEnd: 14, insetBlockStart: 14, color: active ? 'var(--color-gold-600)' : 'var(--color-ink-400)' }} />}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-meta ${dir === 'up' ? 'up' : dir === 'down' ? 'down' : ''}`} style={dir === 'warn' ? { color: 'var(--color-warning-600)' } : undefined}>
        {dir === 'up' && <Icon name="arrow-up" size={12} />}
        {dir === 'down' && <Icon name="arrow-down" size={12} />}
        {dir === 'warn' && <Icon name="clock" size={12} />}
        {meta}
      </div>
      {accent && <div className="stat-bar" />}
    </div>);

}

function HeroStat({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 600, color: highlight ? 'var(--color-gold-300)' : '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>);

}

function NeedsAttentionCard({ onNavigate }) {
  const { t, lang } = useI18n();
  const items = window.ASSIGNMENTS.filter((a) => a.status === 'pending').slice(0, 3);
  return (
    <Card
      title={t('needs_attention')}
      subtitle={lang === 'ar' ? `${items.length} طلبات تتطلب إجراءً` : `${items.length} items require action`}
      actions={<Button variant="ghost" size="sm" iconAfter="arrow-right" onClick={() => onNavigate('list')}>{t('view_all')}</Button>}>
      <div className="flex-col" style={{ gap: 'var(--space-2)' }}>
        {items.map((a) => <PendingRequestRow key={a.id} item={a} onNavigate={onNavigate} compact />)}
      </div>
    </Card>);

}

function PendingRequestRow({ item, onNavigate, compact }) {
  const { t, lang } = useI18n();
  const emp = window.GET_EMPLOYEE(item.employeeId);
  const toEntity = window.GET_ENTITY(item.toEntity);
  const fromEntity = window.GET_ENTITY(item.fromEntity);
  const elapsed = window.daysBetween(item.updatedAt, new Date());
  return (
    <div
      onClick={() => onNavigate('detail', item.id)}
      style={{ padding: compact ? '10px 12px' : '14px 16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', transition: 'all 100ms', background: 'var(--bg-surface)' }}
      onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'var(--color-gold-400)';e.currentTarget.style.background = 'var(--color-gold-50)';}}
      onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--border-default)';e.currentTarget.style.background = 'var(--bg-surface)';}}>
      <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="text-strong">{lang === 'ar' ? emp.ar : emp.en}</span>
          <TypeBadge type={item.type} />
        </div>
        <div className="text-sm text-muted" style={{ marginTop: 2 }}>
          {lang === 'ar' ? fromEntity.ar : fromEntity.en} <Icon name="arrow-right" size={11} className="icon-flip" style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} /> {lang === 'ar' ? toEntity.ar : toEntity.en}
        </div>
      </div>
      <div style={{ textAlign: 'end' }}>
        <div className="text-xs text-muted">{lang === 'ar' ? 'بانتظار' : 'Awaiting'}</div>
        <div className="text-sm text-strong">{t(`approver_${item.awaitingApprover}`)}</div>
      </div>
      <div style={{ textAlign: 'end', minWidth: 70 }}>
        <div className="text-xs text-muted">{item.id}</div>
        <div className="text-xs" style={{ color: elapsed > 3 ? 'var(--color-warning-600)' : 'var(--color-ink-500)' }}>
          {elapsed === 0 ? lang === 'ar' ? 'اليوم' : 'today' : lang === 'ar' ? `قبل ${elapsed} يوم` : `${elapsed}d ago`}
        </div>
      </div>
      <Icon name="chevron-right" size={16} className="icon-flip" style={{ color: 'var(--color-ink-400)' }} />
    </div>);

}

function RecentAssignmentsTable({ items, onNavigate }) {
  const { t, lang } = useI18n();
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">{t('recent_activity')}</h3>
          <div className="card-subtitle">{lang === 'ar' ? 'آخر ٦ تحديثات' : 'Last 6 updates'}</div>
        </div>
        <Button variant="ghost" size="sm" iconAfter="arrow-right" onClick={() => onNavigate('list')}>{t('view_all')}</Button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{t('col_employee')}</th>
            <th>{t('col_type')}</th>
            <th>{t('col_to_entity')}</th>
            <th>{t('col_status')}</th>
            <th>{t('col_updated')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => {
            const emp = window.GET_EMPLOYEE(a.employeeId);
            const ent = window.GET_ENTITY(a.toEntity);
            return (
              <tr key={a.id} onClick={() => onNavigate('detail', a.id)}>
                <td>
                  <div className="avatar-cell">
                    <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="sm" />
                    <div>
                      <div className="cell-primary">{lang === 'ar' ? emp.ar : emp.en}</div>
                      <div className="cell-muted tabular">{a.id}</div>
                    </div>
                  </div>
                </td>
                <td><TypeBadge type={a.type} /></td>
                <td>{lang === 'ar' ? ent.ar : ent.en}</td>
                <td><StatusBadge status={a.status} /></td>
                <td className="cell-muted">{window.formatDate(a.updatedAt, lang)}</td>
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}

function ByTypeCard({ byType }) {
  const { t, lang } = useI18n();
  const max = Math.max(...byType.map((d) => d.count), 1);
  return (
    <Card title={t('by_type')} subtitle={lang === 'ar' ? 'توزيع جميع المهام' : 'Distribution of all assignments'}>
      <div className="flex-col" style={{ gap: 14 }}>
        {byType.map(({ type, count }) =>
        <div key={type}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span className="text-sm text-strong">{t(`type_${type}`)}</span>
              <span className="text-sm tabular text-muted">{count}</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-ink-100)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
              width: `${count / max * 100}%`,
              height: '100%',
              background: type === 'secondment' ? '#5B2E91' :
              type === 'acting' ? '#145D49' :
              type === 'loan' ? '#8C3F0E' : '#1D4670',
              borderRadius: 999,
              transition: 'width 400ms ease'
            }} />
            </div>
          </div>
        )}
      </div>
    </Card>);

}

function ExpiringSoonCard({ items, onNavigate, onShowAll }) {
  const { t, lang } = useI18n();
  return (
    <Card title={t('upcoming_expirations')} subtitle={lang === 'ar' ? 'تنتهي خلال 90 يوماً' : 'Next 90 days'}
    actions={onShowAll ? <Button size="sm" variant="ghost" iconAfter="arrow-right" onClick={onShowAll}>{lang === 'ar' ? 'عرض الكل' : 'Show all'}</Button> : null}>
      {items.length === 0 ?
      <div className="text-sm text-muted">{lang === 'ar' ? 'لا توجد مهام تنتهي قريباً' : 'No upcoming expirations'}</div> :

      <div className="flex-col" style={{ gap: 10 }}>
          {items.map((a) => {
          const emp = window.GET_EMPLOYEE(a.employeeId);
          const urgent = a.daysLeft <= 45;
          return (
            <div key={a.id} onClick={() => onNavigate('detail', a.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '6px 0' }}>
                <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm text-strong" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'ar' ? emp.ar : emp.en}</div>
                  <div className="text-xs text-muted">{window.formatDate(a.endDate, lang)}</div>
                </div>
                <span className="badge" style={{ background: urgent ? 'var(--color-warning-50)' : 'var(--color-ink-100)', color: urgent ? 'var(--color-warning-700)' : 'var(--color-ink-700)' }}>
                  {a.daysLeft}{lang === 'ar' ? ' ي' : 'd'}
                </span>
              </div>);

        })}
        </div>
      }
      {items.length > 0 && onShowAll &&
      <button type="button" onClick={onShowAll}
      style={{ marginTop: 'var(--space-3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', border: '1px solid var(--color-warning-100)', background: 'var(--color-warning-50)', color: 'var(--color-warning-700)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: 'inherit' }}>
          <Icon name="alert" size={14} />
          {lang === 'ar' ? 'عرض كل المهام المنتهية في الجدول' : 'Show all expirations in the table'}
        </button>
      }
    </Card>);

}

function AssignmentsTable({ items, search, setSearch, typeFilter, setTypeFilter, onNavigate }) {
  const { t, lang } = useI18n();
  return (
    <div className="table-wrap">
      <div className="toolbar">
        <InputWithIcon icon="search" placeholder={t('search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: 180, height: 34 }}>
          <option value="all">{lang === 'ar' ? 'كل الأنواع' : 'All types'}</option>
          <option value="secondment">{t('type_secondment')}</option>
          <option value="acting">{t('type_acting')}</option>
          <option value="loan">{t('type_loan')}</option>
          <option value="borrowing">{t('type_borrowing')}</option>
        </Select>
        <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
          <Button size="sm" icon="filter">{t('filters')}</Button>
          <Button size="sm" icon="download">{t('export')}</Button>
        </div>
      </div>
      <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>{t('col_id')}</th>
            <th>{t('col_employee')}</th>
            <th>{t('col_type')}</th>
            <th>{t('col_from_entity')}</th>
            <th>{t('col_to_entity')}</th>
            <th>{t('col_grade')}</th>
            <th>{t('col_start')}</th>
            <th>{t('col_end')}</th>
            <th>{t('col_status')}</th>
            <th className="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => {
              const emp = window.GET_EMPLOYEE(a.employeeId);
              const from = window.GET_ENTITY(a.fromEntity);
              const to = window.GET_ENTITY(a.toEntity);
              return (
                <tr key={a.id} onClick={() => onNavigate('detail', a.id)}>
                <td className="cell-muted tabular">{a.id}</td>
                <td>
                  <div className="avatar-cell">
                    <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="sm" />
                    <div>
                      <div className="cell-primary">{lang === 'ar' ? emp.ar : emp.en}</div>
                      <div className="cell-muted tabular">{emp.id}</div>
                    </div>
                  </div>
                </td>
                <td><TypeBadge type={a.type} /></td>
                <td>{lang === 'ar' ? from.ar : from.en}</td>
                <td>{lang === 'ar' ? to.ar : to.en}</td>
                <td className="tabular text-strong">{a.grade}</td>
                <td className="cell-muted tabular">{window.formatDate(a.startDate, lang)}</td>
                <td className="cell-muted tabular">{window.formatDate(a.endDate, lang)}</td>
                <td><StatusBadge status={a.status} /></td>
                <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" size="sm" icon="eye" aria-label={t('view')} onClick={() => onNavigate('detail', a.id)} />
                    {a.status === 'active' && <Button variant="ghost" size="sm" icon="refresh" aria-label={t('extend')} onClick={() => onNavigate('extension', a.id)} />}
                    {a.status === 'draft' && <Button variant="ghost" size="sm" icon="edit" aria-label={t('edit')} onClick={() => onNavigate('wizard')} />}
                  </div>
                </td>
              </tr>);

            })}
        </tbody>
      </table>
      </div>
      <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-muted)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-600)' }}>
        <span>{t('showing')} <strong className="tabular">{items.length}</strong> {t('of')} <strong className="tabular">{window.ASSIGNMENTS.length}</strong> {t('rows')}</span>
        <div className="flex gap-2 items-center">
          <Button size="sm" icon="chevron-left" className="icon-flip" disabled />
          <span className="text-sm tabular">1 / 1</span>
          <Button size="sm" iconAfter="chevron-right" disabled />
        </div>
      </div>
    </div>);

}

Object.assign(window, { Dashboard, AssignmentsTable });