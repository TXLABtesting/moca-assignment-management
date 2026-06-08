import React, { useState } from 'react';
import { Icon } from './components';
import { ROLES, DEMO_PEOPLE } from './roles';

export default function Login({ onSignIn, lang, setLang }) {
  const [selectedRole, setSelectedRole] = useState('hr_specialist');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => onSignIn(selectedRole), 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 480px',
      background: 'var(--bg-page)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2419 50%, #4A3818 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-8)',
        color: '#fff',
      }}>
        <div
          style={{
            position: 'absolute',
            top: -200, insetInlineEnd: -200,
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(182,138,53,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150, insetInlineStart: -100,
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(182,138,53,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-3)' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'var(--color-gold-500)', color: '#1A1A1A',
              display: 'grid', placeItems: 'center',
              fontWeight: 700, fontSize: 22,
            }}>{lang === 'ar' ? 'م' : 'M'}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {lang === 'ar' ? 'وزارة الثقافة' : 'Ministry of Culture'}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                {lang === 'ar' ? 'الإمارات العربية المتحدة' : 'United Arab Emirates'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 480 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.15, marginBottom: 'var(--space-3)' }}>
            {lang === 'ar' ? 'نظام إدارة المهام الوظيفية' : 'Assignment Management System'}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
            {lang === 'ar'
              ? 'إدارة التكليف والندب والإعارة والاستعارة وفقاً للإطار التشريعي للموارد البشرية الاتحادية، مع تكامل كامل مع Oracle HCM.'
              : 'Manage secondment, acting, loan, and borrowing assignments under the federal HR framework, fully integrated with Oracle HCM.'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Feature icon="shield" label={lang === 'ar' ? 'دخول موحّد آمن' : 'Secure single sign-on'} />
            <Feature icon="check-circle" label={lang === 'ar' ? 'متوافق مع القانون الاتحادي' : 'Federal law compliant'} />
            <Feature icon="refresh" label={lang === 'ar' ? 'مزامنة مع Oracle' : 'Synced with Oracle'} />
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 11, opacity: 0.6 }}>
          {lang === 'ar'
            ? '© ٢٠٢٦ حكومة الإمارات العربية المتحدة. جميع الحقوق محفوظة.'
            : '© 2026 Government of the United Arab Emirates. All rights reserved.'}
        </div>
      </div>

      <div style={{
        background: '#fff',
        padding: 'var(--space-8) var(--space-7)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-6)' }}>
          <div className="lang-toggle" role="radiogroup" aria-label="Language" style={{ background: 'var(--bg-muted)' }}>
            <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'}>EN</button>
            <button onClick={() => setLang('ar')} className={lang === 'ar' ? 'active' : ''} aria-pressed={lang === 'ar'}>عربي</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380, width: '100%', marginInline: 'auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-ink-900)' }}>
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
          </h2>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-5)' }}>
            {lang === 'ar'
              ? 'استخدم بيانات اعتمادك المؤسسية للدخول إلى النظام.'
              : 'Use your organisational credentials to access the system.'}
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '14px 16px',
              background: 'var(--color-gold-500)',
              color: '#1A1A1A',
              border: 0,
              borderRadius: 'var(--radius-md)',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading ? 'wait' : 'pointer',
              marginBottom: 'var(--space-3)',
              transition: 'background 120ms ease',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--color-gold-600)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--color-gold-500)')}
          >
            <Icon name="shield" size={18} />
            {loading
              ? (lang === 'ar' ? 'جارٍ الدخول…' : 'Signing in…')
              : (lang === 'ar' ? 'الدخول عبر SSO المؤسسي' : 'Continue with Organisation SSO')}
          </button>

          <div className="text-xs text-muted" style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
            {lang === 'ar'
              ? 'سيتم تحويلك إلى مزود الهوية المؤسسي للوزارة.'
              : 'You will be redirected to the Ministry identity provider.'}
          </div>

          <div style={{ position: 'relative', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border-default)' }} />
            <span style={{ position: 'relative', background: '#fff', padding: '0 var(--space-3)', fontSize: 11, color: 'var(--color-ink-500)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {lang === 'ar' ? 'وضع العرض التوضيحي' : 'Demo mode'}
            </span>
          </div>

          <div style={{ marginBottom: 'var(--space-2)' }}>
            <div className="text-xs text-strong" style={{ marginBottom: 'var(--space-2)', color: 'var(--color-ink-700)' }}>
              {lang === 'ar' ? 'اختر دوراً للعرض:' : 'Sign in as:'}
            </div>
            <div className="flex-col" style={{ gap: 6, maxHeight: 280, overflowY: 'auto', paddingInlineEnd: 4 }}>
              {ROLES.map(r => {
                const person = DEMO_PEOPLE[r.id];
                return (
                  <label
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: selectedRole === r.id ? '1.5px solid var(--color-gold-500)' : '1px solid var(--border-default)',
                      background: selectedRole === r.id ? 'var(--color-gold-50)' : '#fff',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'border-color 120ms ease, background 120ms ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="demo-role"
                      checked={selectedRole === r.id}
                      onChange={() => setSelectedRole(r.id)}
                      style={{ accentColor: 'var(--color-gold-500)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="text-sm text-strong">{lang === 'ar' ? r.label.ar : r.label.en}</div>
                      {person && (
                        <div className="text-xs text-muted">{lang === 'ar' ? person.ar : person.en}</div>
                      )}
                    </div>
                    {r.canCreate && (
                      <span className="badge" style={{ background: 'var(--color-info-50)', color: 'var(--color-info-700)', flexShrink: 0 }}>
                        {lang === 'ar' ? 'إنشاء' : 'Create'}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          {lang === 'ar' ? 'تحتاج مساعدة؟ ' : 'Need help? '}
          <a href="#" style={{ color: 'var(--color-gold-700)' }}>{lang === 'ar' ? 'تواصل مع الدعم الفني' : 'Contact IT support'}</a>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.9 }}>
      <Icon name={icon} size={14} style={{ color: 'var(--color-gold-400)' }} />
      <span>{label}</span>
    </div>
  );
}

