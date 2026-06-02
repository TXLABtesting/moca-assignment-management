// App shell — top bar, sidebar nav, screen router, lang state, Tweaks integration.

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp } = React;

// Tweakable defaults — Tweaks panel persists changes here via host postMessage.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dashboardLayout": "stats",
  "primaryColor": "#B68A35",
  "showHints": true,
  "compactRows": false
}/*EDITMODE-END*/;

function App() {
  const [lang, setLang] = useStateApp('en');
  const [screen, setScreen] = useStateApp({ name: 'dashboard', id: null });
  const tweaksRet = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const [tw, setTweak] = tweaksRet;
  const tweaks = { t: tw, setTweak };

  // Apply lang + dir to <html>
  useEffectApp(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Apply primary color override
  useEffectApp(() => {
    if (tw.primaryColor && tw.primaryColor !== '#B68A35') {
      // Compute a 50-900 swatch from the override; simple HSL shift approach
      document.documentElement.style.setProperty('--color-gold-500', tw.primaryColor);
    } else {
      document.documentElement.style.removeProperty('--color-gold-500');
    }
  }, [tw.primaryColor]);

  // Compact rows
  useEffectApp(() => {
    if (tw.compactRows) document.body.classList.add('compact-rows');
    else document.body.classList.remove('compact-rows');
  }, [tw.compactRows]);

  const t = (k) => window.I18N[lang]?.[k] || window.I18N.en[k] || k;
  const i18n = { lang, setLang, t };

  const navigate = (name, id = null) => {
    setScreen({ name, id });
    window.scrollTo({ top: 0, behavior: 'instant' });
    // also scroll .main if it's the scroll container
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
  };

  return (
    <I18nContext.Provider value={i18n}>
      <ToastProvider>
        <div className="app-shell" data-screen-label={`${screen.name}`}>
          <TopBar lang={lang} setLang={setLang} t={t} navigate={navigate} />
          <Sidebar current={screen.name} navigate={navigate} t={t} lang={lang} />
          <main className="main">
            {screen.name === 'dashboard' && <Dashboard variant={tw.dashboardLayout} onNavigate={navigate} />}
            {screen.name === 'list' && <DashboardListWrapper onNavigate={navigate} />}
            {screen.name === 'wizard' && <Wizard onNavigate={navigate} />}
            {screen.name === 'detail' && <Detail id={screen.id} onNavigate={navigate} />}
            {screen.name === 'extension' && <Extension id={screen.id} onNavigate={navigate} />}
            {screen.name === 'pending' && <PendingWrapper onNavigate={navigate} />}
            {screen.name === 'policies' && <Policies onNavigate={navigate} />}
            {screen.name === 'reports' && <Reports onNavigate={navigate} />}
            {screen.name === 'placeholder' && <PlaceholderScreen title={screen.id} />}
          </main>
        </div>

        {/* Tweaks panel */}
        {window.TweaksPanel && (
          <window.TweaksPanel title="Tweaks">
            <window.TweakSection label="Dashboard">
              <window.TweakRadio
                label="Layout"
                value={tw.dashboardLayout}
                onChange={v => setTweak('dashboardLayout', v)}
                options={[
                  { value: 'stats', label: 'Stats' },
                  { value: 'focus', label: 'Task-first' },
                  { value: 'table', label: 'Table' },
                ]} />
            </window.TweakSection>
            <window.TweakSection label="Theme">
              <window.TweakColor
                label="Primary swatch"
                value={tw.primaryColor}
                onChange={v => setTweak('primaryColor', v)}
                options={['#B68A35', '#0E5A4A', '#1D4670', '#7A2018']} />
              <window.TweakToggle label="Compact rows" value={tw.compactRows} onChange={v => setTweak('compactRows', v)} />
              <window.TweakToggle label="Inline field hints" value={tw.showHints} onChange={v => setTweak('showHints', v)} />
            </window.TweakSection>
          </window.TweaksPanel>
        )}
      </ToastProvider>
    </I18nContext.Provider>
  );
}

// ============================================================
// Top bar
// ============================================================
function TopBar({ lang, setLang, t, navigate }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <button onClick={() => navigate('dashboard')} style={{ background: 'transparent', border: 0, padding: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', color: 'inherit' }}>
          <div className="topbar-emblem">{lang === 'ar' ? 'م' : 'M'}</div>
          <div>
            <div className="topbar-title">{t('app_title')}</div>
            <div className="topbar-sub">{t('app_sub')}</div>
          </div>
        </button>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div style={{ position: 'relative', width: 320 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
          <input
            placeholder={t('search_placeholder')}
            style={{
              width: '100%', height: 32, borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
              color: '#fff', fontSize: 12, paddingInlineStart: 34, paddingInlineEnd: 12,
              outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.14)'; }}
            onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; }}
          />
        </div>

        {/* Lang toggle */}
        <div className="lang-toggle" role="radiogroup" aria-label="Language">
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'}>EN</button>
          <button onClick={() => setLang('ar')} className={lang === 'ar' ? 'active' : ''} aria-pressed={lang === 'ar'}>عربي</button>
        </div>

        <button className="topbar-iconbtn" aria-label={t('notifications')}>
          <Icon name="bell" size={16} />
          <span className="dot" />
        </button>
        <button className="topbar-iconbtn" aria-label={t('help')}>
          <Icon name="help" size={16} />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">{lang === 'ar' ? 'م' : 'M'}</div>
          <div className="topbar-user-meta">
            <div className="topbar-user-name">{t('user_name')}</div>
            <div className="topbar-user-role">{t('user_role')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Sidebar
// ============================================================
function Sidebar({ current, navigate, t, lang }) {
  const items = [
    { id: 'dashboard',  icon: 'dashboard', label: t('nav_dashboard') },
  ];

  const adminItems = [
    { id: 'directory', icon: 'users',    label: t('nav_directory') },
    { id: 'policies',  icon: 'book',     label: t('nav_policies') },
    { id: 'reports',   icon: 'chart',    label: t('nav_reports') },
    { id: 'settings',  icon: 'settings', label: t('nav_settings') },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">{t('nav_workspace')}</div>
        {items.map(it => (
          <button key={it.id} className={`sidebar-item ${current === it.id ? 'active' : ''}`}
            onClick={() => navigate(it.id === 'expiring' ? 'placeholder' : it.id, it.id === 'expiring' ? 'Expiring soon' : null)}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">{t('nav_admin')}</div>
        {adminItems.map(it => (
          <button key={it.id} className={`sidebar-item ${current === it.id ? 'active' : ''}`}
            onClick={() => (it.id === 'policies' || it.id === 'reports') ? navigate(it.id) : navigate('placeholder', it.label)}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

// ============================================================
// List wrapper (reuse the table-first dashboard variant view)
// ============================================================
function DashboardListWrapper({ onNavigate }) {
  return <window.Dashboard variant="table" onNavigate={onNavigate} />;
}

// ============================================================
// Pending wrapper — filters to only pending items, like a focused inbox
// ============================================================
function PendingWrapper({ onNavigate }) {
  const { t, lang } = useI18n();
  const items = window.ASSIGNMENTS.filter(a => a.status === 'pending');
  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('dashboard_title')}</a>
          <span className="sep">/</span>
          <span>{t('nav_pending')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('nav_pending')}</h1>
            <div className="page-subtitle">
              {lang === 'ar'
                ? `${items.length} طلبات تتطلب اتخاذ قرار`
                : `${items.length} requests need a decision`}
            </div>
          </div>
        </div>
      </div>
      <Card>
        <div className="flex-col" style={{ gap: 'var(--space-3)' }}>
          {items.map(a => {
            const emp = window.GET_EMPLOYEE(a.employeeId);
            const fromEnt = window.GET_ENTITY(a.fromEntity);
            const toEnt = window.GET_ENTITY(a.toEntity);
            return (
              <div key={a.id} onClick={() => onNavigate('detail', a.id)} style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="lg" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-strong">{lang === 'ar' ? emp.ar : emp.en}</span>
                    <TypeBadge type={a.type} />
                    <span className="text-xs text-muted tabular">{a.id}</span>
                  </div>
                  <div className="text-sm" style={{ marginBottom: 4 }}>{lang === 'ar' ? a.position_ar : a.position_en}</div>
                  <div className="text-xs text-muted">
                    {lang === 'ar' ? fromEnt.ar : fromEnt.en} → {lang === 'ar' ? toEnt.ar : toEnt.en} · {window.formatDate(a.startDate, lang)} – {window.formatDate(a.endDate, lang)}
                  </div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div className="text-xs text-muted">{lang === 'ar' ? 'بانتظار' : 'Awaiting'}</div>
                  <div className="text-sm text-strong mb-2">{t(`approver_${a.awaitingApprover}`)}</div>
                  <Button variant="primary" size="sm" iconAfter="arrow-right">{lang === 'ar' ? 'مراجعة' : 'Review'}</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

function PlaceholderScreen({ title }) {
  const { lang } = useI18n();
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="empty card">
        <Icon name="briefcase" size={48} className="empty-icon" />
        <div className="empty-title">{lang === 'ar' ? 'الشاشة قيد التطوير' : 'Screen in development'}</div>
        <div className="empty-body" style={{ maxWidth: 400, margin: '0 auto' }}>
          {lang === 'ar'
            ? 'هذه إحدى الشاشات المساعدة في النظام. التركيز الحالي على الشاشات الأربع الأساسية: اللوحة الرئيسية، إنشاء مهمة، تفاصيل المهمة، طلب التمديد.'
            : 'This is one of the supporting screens. Focus is on the four primary screens: dashboard, create assignment, assignment detail, and extension request.'}
        </div>
      </div>
    </>
  );
}

// ============================================================
// Mount
// ============================================================
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
