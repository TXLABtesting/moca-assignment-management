import React, { useState, useEffect, useRef } from 'react';
import { I18nContext, ToastProvider, Icon, Button, Card, Avatar, TypeBadge, useI18n } from './components';
import { I18N } from './i18n';
import { ASSIGNMENTS, GET_EMPLOYEE, GET_ENTITY, formatDate } from './data';
import { ROLES, ROLE_MAP, DEMO_PEOPLE, getFirstName } from './roles';
import Dashboard from './dashboard';
import Wizard from './wizard';
import Detail from './detail';
import Extension from './extension';
import Directory from './directory';
import Settings from './settings';
import Login from './login';
import { Policies, Reports } from './library';

const TWEAK_DEFAULTS = {
  dashboardLayout: 'stats',
  primaryColor: '#B68A35',
  showHints: true,
  compactRows: false,
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [role, setRole] = useState(null);
  const [screen, setScreen] = useState({ name: 'dashboard', id: null });
  const [tw] = useState(TWEAK_DEFAULTS);

  const signIn = (r) => { setRole(r); setScreen({ name: 'dashboard', id: null }); };
  const signOut = () => { setRole(null); };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (tw.compactRows) document.body.classList.add('compact-rows');
    else document.body.classList.remove('compact-rows');
  }, [tw.compactRows]);

  const t = (k) => I18N[lang]?.[k] || I18N.en[k] || k;
  const i18n = { lang, setLang, t };
  const canCreate = !!(ROLE_MAP[role]?.canCreate);

  const navigate = (name, id = null) => {
    setScreen({ name, id });
    window.scrollTo({ top: 0, behavior: 'instant' });
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
  };

  if (!role) {
    return (
      <I18nContext.Provider value={i18n}>
        <Login onSignIn={signIn} lang={lang} setLang={setLang} />
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={i18n}>
      <ToastProvider>
        <div className="app-shell">
          <TopBar lang={lang} setLang={setLang} t={t} navigate={navigate} role={role} setRole={setRole} signOut={signOut} />
          <Sidebar current={screen.name} navigate={navigate} t={t} lang={lang} />
          <main className="main">
            {screen.name === 'dashboard' && <Dashboard variant={tw.dashboardLayout} onNavigate={navigate} canCreate={canCreate} role={role} />}
            {screen.name === 'list' && <Dashboard variant="table" onNavigate={navigate} canCreate={canCreate} role={role} />}
            {screen.name === 'wizard' && (canCreate ? <Wizard onNavigate={navigate} /> : <NoAccessScreen lang={lang} />)}
            {screen.name === 'detail' && <Detail id={screen.id} onNavigate={navigate} role={role} />}
            {screen.name === 'extension' && <Extension id={screen.id} onNavigate={navigate} />}
            {screen.name === 'pending' && <PendingWrapper onNavigate={navigate} role={role} />}
            {screen.name === 'directory' && <Directory onNavigate={navigate} />}
            {screen.name === 'settings' && <Settings onNavigate={navigate} role={role} setRole={setRole} />}
            {screen.name === 'policies' && <Policies onNavigate={navigate} />}
            {screen.name === 'reports' && <Reports onNavigate={navigate} />}
            {screen.name === 'placeholder' && <PlaceholderScreen title={screen.id} />}
          </main>
        </div>
      </ToastProvider>
    </I18nContext.Provider>
  );
}

function TopBar({ lang, setLang, t, navigate, role, setRole, signOut }) {
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
        <div style={{ position: 'relative', width: 320 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
          <input
            placeholder={t('search_placeholder')}
            style={{ width: '100%', height: 32, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 12, paddingInlineStart: 34, paddingInlineEnd: 12, outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.14)'; }}
            onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; }}
          />
        </div>

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

        <RoleSwitcher role={role} setRole={setRole} lang={lang} signOut={signOut} />
      </div>
    </header>
  );
}

function RoleSwitcher({ role, setRole, lang, signOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = ROLE_MAP[role] || ROLES[0];
  const person = DEMO_PEOPLE[role];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const personName = person ? (lang === 'ar' ? person.ar : person.en) : (lang === 'ar' ? current.label.ar : current.label.en);
  const initial = (personName || '').replace(/^[\.\-_\s]+/, '').charAt(0) || 'U';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="topbar-user"
        style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="topbar-avatar">{initial}</div>
        <div className="topbar-user-meta">
          <div className="topbar-user-name">{personName}</div>
          <div className="topbar-user-role">{lang === 'ar' ? current.label.ar : current.label.en}</div>
        </div>
        <Icon name="chevron-down" size={12} style={{ color: 'rgba(255,255,255,0.7)', marginInlineStart: 4 }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            insetInlineEnd: 0,
            top: 'calc(100% + 8px)',
            minWidth: 320,
            background: '#fff',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-muted)' }}>
            <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {lang === 'ar' ? 'تبديل الجلسة' : 'Switch session'}
            </div>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {ROLES.map(r => {
              const rPerson = DEMO_PEOPLE[r.id];
              return (
                <button
                  key={r.id}
                  role="menuitemradio"
                  aria-checked={role === r.id}
                  onClick={() => { setRole(r.id); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    width: '100%',
                    background: role === r.id ? 'var(--color-gold-50)' : '#fff',
                    border: 0,
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'start',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ width: 18, paddingTop: 2 }}>
                    {role === r.id && <Icon name="check" size={14} style={{ color: 'var(--color-gold-700)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="text-sm text-strong">{lang === 'ar' ? r.label.ar : r.label.en}</div>
                    {rPerson && (
                      <div className="text-xs" style={{ color: 'var(--color-ink-700)', marginTop: 1 }}>{lang === 'ar' ? rPerson.ar : rPerson.en}</div>
                    )}
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>{lang === 'ar' ? r.description.ar : r.description.en}</div>
                  </div>
                  {r.canCreate && (
                    <span className="badge" style={{ background: 'var(--color-info-50)', color: 'var(--color-info-700)', flexShrink: 0 }}>
                      {lang === 'ar' ? 'إنشاء' : 'Create'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              width: '100%',
              background: 'var(--bg-muted)',
              border: 0,
              borderTop: '1px solid var(--border-default)',
              cursor: 'pointer',
              textAlign: 'start',
              fontFamily: 'inherit',
              color: 'var(--color-danger-700)',
            }}
          >
            <Icon name="x-circle" size={14} />
            <span className="text-sm text-strong">{lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ current, navigate, t, lang }) {
  const items = [
    { id: 'dashboard', icon: 'dashboard', label: t('nav_dashboard') },
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
            onClick={() => navigate(it.id)}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-section">
        <div className="sidebar-label">{t('nav_admin')}</div>
        {adminItems.map(it => (
          <button key={it.id} className={`sidebar-item ${current === it.id ? 'active' : ''}`}
            onClick={() => navigate(it.id)}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function PendingWrapper({ onNavigate, role }) {
  const { t, lang } = useI18n();
  const allPending = ASSIGNMENTS.filter(a => a.status === 'pending');
  const items = allPending.filter(a => a.awaitingApprover === role);
  const currentRole = ROLES.find(r => r.id === role) || ROLES[1];
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
                ? `${items.length} طلبات تنتظر اعتماد ${currentRole.label.ar} (من إجمالي ${allPending.length})`
                : `${items.length} requests waiting on ${currentRole.label.en} (of ${allPending.length} total)`}
            </div>
          </div>
        </div>
      </div>
      <Card>
        {items.length === 0 ? (
          <div className="empty">
            <Icon name="check-circle" size={48} className="empty-icon" style={{ color: 'var(--color-success-500)' }} />
            <div className="empty-title">
              {lang === 'ar' ? 'لا يوجد طلب بانتظار قرارك' : 'No requests need your decision'}
            </div>
            <div className="empty-body">
              {lang === 'ar'
                ? `لا توجد طلبات معلقة في انتظار اعتماد ${currentRole.label.ar} حالياً.`
                : `Nothing is currently waiting on ${currentRole.label.en}.`}
              {allPending.length > 0 && ' '}
              {allPending.length > 0 && (lang === 'ar'
                ? `يوجد ${allPending.length} طلب في سلسلة الاعتماد عند أصحاب مصلحة آخرين.`
                : `${allPending.length} request${allPending.length === 1 ? ' is' : 's are'} elsewhere in the chain.`)}
            </div>
          </div>
        ) : (
        <div className="flex-col" style={{ gap: 'var(--space-3)' }}>
          {items.map(a => {
            const empName = a.employeeId
              ? (lang === 'ar' ? GET_EMPLOYEE(a.employeeId)?.ar : GET_EMPLOYEE(a.employeeId)?.en)
              : (lang === 'ar' ? a.borrowedEmployee?.ar : a.borrowedEmployee?.en);
            const fromEnt = GET_ENTITY(a.fromEntity);
            const toEnt = GET_ENTITY(a.toEntity);
            return (
              <div key={a.id} onClick={() => onNavigate('detail', a.id)} style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                <Avatar name={empName} size="lg" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-strong">{empName}</span>
                    <TypeBadge type={a.type} />
                    <span className="text-xs text-muted tabular">{a.id}</span>
                  </div>
                  <div className="text-sm" style={{ marginBottom: 4 }}>{lang === 'ar' ? a.position_ar : a.position_en}</div>
                  <div className="text-xs text-muted">
                    {lang === 'ar' ? fromEnt.ar : fromEnt.en} → {lang === 'ar' ? toEnt.ar : toEnt.en} · {formatDate(a.startDate, lang)} – {formatDate(a.endDate, lang)}
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
        )}
      </Card>
    </>
  );
}

function NoAccessScreen({ lang }) {
  return (
    <div className="empty card">
      <Icon name="shield" size={48} className="empty-icon" />
      <div className="empty-title">{lang === 'ar' ? 'صلاحية غير متاحة' : 'Permission required'}</div>
      <div className="empty-body" style={{ maxWidth: 460, margin: '0 auto' }}>
        {lang === 'ar'
          ? 'إنشاء طلبات المهام محصور بأخصائيي الموارد البشرية. يُرجى تبديل الجلسة من القائمة العلوية.'
          : 'Creating assignment requests is restricted to HR personnel. Switch session from the top-right menu.'}
      </div>
    </div>
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
            ? 'هذه إحدى الشاشات المساعدة في النظام.'
            : 'This is one of the supporting screens in development.'}
        </div>
      </div>
    </>
  );
}
