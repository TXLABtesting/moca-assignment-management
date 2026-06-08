import React, { useState } from 'react';
import { useI18n, useToast, Icon, Button, Field, Select, Card } from './components';
import { ROLES } from './roles';
export { ROLES } from './roles';

export default function Settings({ onNavigate, role, setRole }) {
  const { t, lang, setLang } = useI18n();
  const toast = useToast();
  const [notifications, setNotifications] = useState({
    expiry45: true,
    expiry30: true,
    expiry15: true,
    approvalNeeded: true,
    statusChange: true,
    decreeReady: true,
    weeklyDigest: false,
  });
  const [defaultLanding, setDefaultLanding] = useState('dashboard');
  const [density, setDensity] = useState('comfortable');

  const handleSave = () => {
    toast.push(lang === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved', 'success');
  };

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('dashboard_title')}</a>
          <span className="sep">/</span>
          <span>{t('nav_settings')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('nav_settings')}</h1>
            <div className="page-subtitle">
              {lang === 'ar' ? 'تفضيلاتك وتكاملات النظام' : 'Your preferences and system integrations'}
            </div>
          </div>
          <div className="page-actions">
            <Button variant="primary" icon="check" onClick={handleSave}>
              {lang === 'ar' ? 'حفظ التغييرات' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-col" style={{ gap: 'var(--space-5)' }}>
        <Card title={lang === 'ar' ? 'التفضيلات العامة' : 'General preferences'}>
          <div className="grid-2">
            <Field label={lang === 'ar' ? 'اللغة' : 'Language'}>
              <Select value={lang} onChange={e => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="ar">عربي</option>
              </Select>
            </Field>
            <Field label={lang === 'ar' ? 'الشاشة الافتراضية' : 'Default landing screen'}>
              <Select value={defaultLanding} onChange={e => setDefaultLanding(e.target.value)}>
                <option value="dashboard">{t('nav_dashboard')}</option>
                <option value="pending">{t('nav_pending') || 'Pending approvals'}</option>
                <option value="list">{t('nav_assignments') || 'Assignments'}</option>
              </Select>
            </Field>
            <Field label={lang === 'ar' ? 'كثافة الصفوف' : 'Row density'}>
              <Select value={density} onChange={e => setDensity(e.target.value)}>
                <option value="comfortable">{lang === 'ar' ? 'مريحة' : 'Comfortable'}</option>
                <option value="compact">{lang === 'ar' ? 'مدمجة' : 'Compact'}</option>
              </Select>
            </Field>
            <Field label={lang === 'ar' ? 'المنطقة الزمنية' : 'Timezone'}>
              <Select value="gst" onChange={() => {}}>
                <option value="gst">GST (UTC+4) — {lang === 'ar' ? 'الإمارات' : 'United Arab Emirates'}</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card title={lang === 'ar' ? 'تبديل الجلسة' : 'Session persona'}
          subtitle={lang === 'ar' ? 'لأغراض العرض — اعرض النظام بصلاحيات أصحاب المصلحة المختلفين' : 'For demonstration — view the system with each stakeholder\'s permissions'}>
          <div className="flex-col" style={{ gap: 'var(--space-2)' }}>
            {ROLES.map(r => (
              <label key={r.id} className="checkbox" style={{
                cursor: 'pointer',
                border: role === r.id ? '1.5px solid var(--color-gold-500)' : '1px solid var(--border-default)',
                background: role === r.id ? 'var(--color-gold-50)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <input
                  type="radio"
                  name="role"
                  checked={role === r.id}
                  onChange={() => setRole(r.id)}
                  style={{ accentColor: 'var(--color-gold-500)' }}
                />
                <div style={{ flex: 1 }}>
                  <div className="text-strong">{lang === 'ar' ? r.label.ar : r.label.en}</div>
                  <div className="text-xs text-muted">{lang === 'ar' ? r.description.ar : r.description.en}</div>
                </div>
                {r.id === 'minister' && (
                  <span className="badge" style={{ background: 'var(--color-gold-50)', color: 'var(--color-gold-800)' }}>
                    <Icon name="file" size={11} /> {lang === 'ar' ? 'مرسوم' : 'Decree'}
                  </span>
                )}
              </label>
            ))}
          </div>
        </Card>

        <Card title={lang === 'ar' ? 'التنبيهات' : 'Notifications'}
          subtitle={lang === 'ar' ? 'متى يرسل إليك النظام إشعاراً عبر البريد الإلكتروني وداخل النظام' : 'When the system pings you by email and in-app'}>
          <div className="flex-col" style={{ gap: 'var(--space-1)' }}>
            <NotifRow
              k="expiry45"
              checked={notifications.expiry45}
              onChange={v => setNotifications({ ...notifications, expiry45: v })}
              title={lang === 'ar' ? 'تذكير 45 يوماً قبل انتهاء المهمة' : '45-day expiry reminder'}
              body={lang === 'ar' ? 'يُرسل إلى أخصائي الموارد البشرية — مالك دورة التجديد' : 'Sent to HR Specialist — owner of the renewal cycle'}
            />
            <NotifRow
              k="expiry30"
              checked={notifications.expiry30}
              onChange={v => setNotifications({ ...notifications, expiry30: v })}
              title={lang === 'ar' ? 'تذكير 30 يوماً قبل انتهاء المهمة' : '30-day expiry reminder'}
              body={lang === 'ar' ? 'يُرسل إلى أخصائي الموارد البشرية ومدير الموارد البشرية' : 'Sent to HR Specialist + HR Director'}
            />
            <NotifRow
              k="expiry15"
              checked={notifications.expiry15}
              onChange={v => setNotifications({ ...notifications, expiry15: v })}
              title={lang === 'ar' ? 'تذكير 15 يوماً قبل انتهاء المهمة' : '15-day expiry reminder'}
              body={lang === 'ar' ? 'يُرسل إلى الموارد البشرية والمعتمد النهائي والموظف' : 'Sent to HR + final approver + employee'}
            />
            <NotifRow
              k="approvalNeeded"
              checked={notifications.approvalNeeded}
              onChange={v => setNotifications({ ...notifications, approvalNeeded: v })}
              title={lang === 'ar' ? 'طلب جديد يحتاج اعتمادك' : 'New request needs your approval'}
              body={lang === 'ar' ? 'فوري — عند كل تمرير في سلسلة الاعتماد' : 'Real-time — every time the approval chain advances to you'}
            />
            <NotifRow
              k="statusChange"
              checked={notifications.statusChange}
              onChange={v => setNotifications({ ...notifications, statusChange: v })}
              title={lang === 'ar' ? 'تغيّر حالة طلب رفعته' : 'Status change on a request you submitted'}
              body={lang === 'ar' ? 'يشمل الاعتماد والرفض وطلب التعديل' : 'Includes approvals, rejections, and change requests'}
            />
            <NotifRow
              k="decreeReady"
              checked={notifications.decreeReady}
              onChange={v => setNotifications({ ...notifications, decreeReady: v })}
              title={lang === 'ar' ? 'مرسوم الوزير جاهز للإرفاق' : 'Minister\'s decree ready to attach'}
              body={lang === 'ar' ? 'للموارد البشرية فقط — لتمديد الإعارة والاستعارة' : 'HR only — for loan & borrowing extensions'}
            />
            <NotifRow
              k="weeklyDigest"
              checked={notifications.weeklyDigest}
              onChange={v => setNotifications({ ...notifications, weeklyDigest: v })}
              title={lang === 'ar' ? 'تقرير أسبوعي بالبريد' : 'Weekly email digest'}
              body={lang === 'ar' ? 'كل اثنين 8:00 ص — ملخص النشاط' : 'Every Monday 8:00 AM — portfolio summary'}
            />
          </div>
        </Card>

        <Card title={lang === 'ar' ? 'حدود وقت الاستجابة (SLA)' : 'SLA thresholds'}
          subtitle={lang === 'ar' ? 'مدد قياسية لكل خطوة في سلسلة الاعتماد. للقراءة فقط — يضبطها مدير النظام.' : 'Standard durations per approval step. Read-only — configured by the system administrator.'}>
          <div className="dl-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <SlaRow
              label={lang === 'ar' ? 'إرفاق المرسوم — موظف المراسيم' : 'Decree attachment — Decree Officer'}
              days={3}
              lang={lang}
            />
            <SlaRow
              label={lang === 'ar' ? 'اعتماد مدير الموارد البشرية' : 'HR Director approval'}
              days={5}
              lang={lang}
            />
            <SlaRow
              label={lang === 'ar' ? 'الاعتماد النهائي — رئيس قطاع / رئيس جهة' : 'Final approval — CSS Sector / Entity Head'}
              days={7}
              lang={lang}
            />
            <SlaRow
              label={lang === 'ar' ? 'مرسوم الوزير لتمديد الإعارة/الاستعارة' : 'Minister decree (loan/borrowing extension)'}
              days={14}
              lang={lang}
              special
            />
          </div>
        </Card>

        <Card title={lang === 'ar' ? 'التكاملات' : 'Integrations'}
          subtitle={lang === 'ar' ? 'حالة الاتصال مع أنظمة Oracle المؤسسية' : 'Live connection status with Oracle enterprise systems'}>
          <div className="flex-col" style={{ gap: 'var(--space-2)' }}>
            <IntegrationRow
              name="Oracle Payroll"
              desc_en="Salary & allowances are pushed automatically on approval and termination."
              desc_ar="ترسل الرواتب والبدلات تلقائياً عند الاعتماد والإنهاء."
              status="connected"
              lastSync="2 min"
              lang={lang}
            />
            <IntegrationRow
              name="Oracle Workflow Engine"
              desc_en="Dynamic approval-chain routing across stakeholders."
              desc_ar="توجيه ديناميكي لسلسلة الاعتماد بين أصحاب المصلحة."
              status="connected"
              lastSync="live"
              lang={lang}
            />
            <IntegrationRow
              name="Oracle Notifications Framework"
              desc_en="Email and in-app alerts driven by event subscriptions."
              desc_ar="إشعارات البريد والتنبيهات داخل النظام وفقاً لاشتراكات الأحداث."
              status="connected"
              lastSync="live"
              lang={lang}
            />
            <IntegrationRow
              name="Oracle BI / OTBI"
              desc_en="Backs the Reports screen and executive KPI dashboards."
              desc_ar="يدعم شاشة التقارير ولوحات مؤشرات الأداء التنفيذية."
              status="connected"
              lastSync="6 min"
              lang={lang}
            />
            <IntegrationRow
              name="Oracle Reporting Services"
              desc_en="Scheduled and on-demand Excel and PDF exports."
              desc_ar="توليد تقارير Excel و PDF المجدولة والفورية."
              status="connected"
              lastSync="1 min"
              lang={lang}
            />
            <IntegrationRow
              name={lang === 'ar' ? 'إدارة الوثائق' : 'Document Management'}
              desc_en="Stores consent letters, decrees, and supporting attachments."
              desc_ar="يخزن خطابات الموافقة والمراسيم والمرفقات الداعمة."
              status="connected"
              lastSync="4 min"
              lang={lang}
            />
          </div>
        </Card>

        <Card title={lang === 'ar' ? 'حول النظام' : 'About'}>
          <div className="dl-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <Datum2 label={lang === 'ar' ? 'النسخة' : 'Version'} value="1.0.0" />
            <Datum2 label={lang === 'ar' ? 'البيئة' : 'Environment'} value="Production" />
            <Datum2 label={lang === 'ar' ? 'نظام التشغيل' : 'Powered by'} value="Oracle Cloud HCM" />
            <Datum2
              label={lang === 'ar' ? 'الإطار التشريعي' : 'Regulatory framework'}
              value={lang === 'ar' ? 'قانون الموارد البشرية الاتحادي' : 'Federal Human Resources Law'}
            />
          </div>
          <div className="text-xs text-muted mt-4">
            {lang === 'ar'
              ? 'هذا النظام جزء من البنية الرقمية للحكومة الاتحادية لدولة الإمارات العربية المتحدة.'
              : 'This system is part of the digital infrastructure of the UAE Federal Government.'}
          </div>
        </Card>
      </div>
    </>
  );
}

function NotifRow({ checked, onChange, title, body }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)',
      cursor: 'pointer',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 3, accentColor: 'var(--color-gold-500)' }}
      />
      <div style={{ flex: 1 }}>
        <div className="text-sm text-strong">{title}</div>
        <div className="text-xs text-muted" style={{ marginTop: 2 }}>{body}</div>
      </div>
    </label>
  );
}

function SlaRow({ label, days, lang, special }) {
  return (
    <div className="dl-item">
      <div className="dl-label">{label}</div>
      <div className="dl-value tabular">
        {days} {lang === 'ar' ? 'يوم عمل' : 'business days'}
        {special && <span className="badge" style={{ marginInlineStart: 8, background: 'var(--color-gold-50)', color: 'var(--color-gold-800)' }}>
          {lang === 'ar' ? 'مرسوم' : 'Decree'}
        </span>}
      </div>
    </div>
  );
}

function IntegrationRow({ name, desc_en, desc_ar, status, lastSync, lang }) {
  const connected = status === 'connected';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-sm)',
        background: 'var(--color-ink-100)', display: 'grid', placeItems: 'center',
        flexShrink: 0,
      }}>
        <Icon name="shield" size={16} style={{ color: 'var(--color-ink-700)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="text-sm text-strong">{name}</div>
        <div className="text-xs text-muted" style={{ marginTop: 2 }}>{lang === 'ar' ? desc_ar : desc_en}</div>
      </div>
      <div style={{ textAlign: 'end' }}>
        <span className="badge" style={{
          background: connected ? 'var(--color-success-50)' : 'var(--color-warning-50)',
          color: connected ? 'var(--color-success-700)' : 'var(--color-warning-700)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: connected ? 'var(--color-success-500)' : 'var(--color-warning-500)',
          }} />
          {connected ? (lang === 'ar' ? 'متصل' : 'Connected') : (lang === 'ar' ? 'غير متصل' : 'Disconnected')}
        </span>
        <div className="text-xs text-muted" style={{ marginTop: 4 }}>
          {lang === 'ar' ? `آخر مزامنة: ${lastSync}` : `Last sync: ${lastSync}`}
        </div>
      </div>
    </div>
  );
}

function Datum2({ label, value }) {
  return (
    <div className="dl-item">
      <div className="dl-label">{label}</div>
      <div className="dl-value">{value}</div>
    </div>
  );
}
