import React, { useState, useMemo } from 'react';
import { useI18n, useToast, Icon, Button, Field, Input, Select, Textarea, Avatar, Alert, Card, StatusBadge, TypeBadge, Datum } from './components';
import { ASSIGNMENTS, GET_EMPLOYEE, GET_ENTITY, formatDate, formatAED, addMonths, daysBetween } from './data';

function PolicyCheck({ pass, info, title, body }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10 }}>
      <div style={{ paddingTop: 1 }}>
        {info
          ? <Icon name="info" size={16} style={{ color: 'var(--color-info-600)' }} />
          : pass
          ? <Icon name="check-circle" size={16} style={{ color: 'var(--color-success-600)' }} />
          : <Icon name="alert" size={16} style={{ color: 'var(--color-warning-600)' }} />}
      </div>
      <div>
        <div className="text-sm text-strong" style={{ marginBottom: 2 }}>{title}</div>
        <div className="text-xs text-muted" style={{ lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

function ApprovalStep({ num, label, active, special, decree }) {
  const { t, lang } = useI18n();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: active ? 'var(--color-gold-500)' : special ? 'var(--color-gold-100)' : 'var(--color-ink-100)',
        color: active ? 'var(--color-ink-900)' : special ? 'var(--color-gold-800)' : 'var(--color-ink-700)',
        display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
        boxShadow: active ? '0 0 0 4px var(--color-gold-100)' : 'none',
      }}>{decree ? <Icon name="file" size={13} /> : num}</div>
      <div style={{ flex: 1 }}>
        <div className="text-sm text-strong">{label}</div>
        {active && <div className="text-xs" style={{ color: 'var(--color-warning-700)' }}>{t('awaiting_you')}</div>}
        {decree && <div className="text-xs" style={{ color: 'var(--color-gold-700)' }}>{lang === 'ar' ? 'تُرفقه الموارد البشرية — لا اعتماد على النظام' : 'Attached by HR — no in-system approval'}</div>}
        {special && !active && !decree && <div className="text-xs" style={{ color: 'var(--color-gold-700)' }}>{t('minister_for_loan')}</div>}
      </div>
    </div>
  );
}

export default function Extension({ id, onNavigate }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const assignment = useMemo(() =>
    ASSIGNMENTS.find(a => a.id === id) || ASSIGNMENTS.find(a => a.status === 'active'), [id]);

  const isBorrowing = assignment.type === 'borrowing';
  const empName = isBorrowing
    ? (lang === 'ar' ? assignment.borrowedEmployee?.ar : assignment.borrowedEmployee?.en)
    : (lang === 'ar' ? GET_EMPLOYEE(assignment.employeeId)?.ar : GET_EMPLOYEE(assignment.employeeId)?.en);
  const emp = isBorrowing ? { en: assignment.borrowedEmployee?.en, ar: assignment.borrowedEmployee?.ar } : GET_EMPLOYEE(assignment.employeeId);
  const fromEnt = GET_ENTITY(assignment.fromEntity);
  const toEnt = GET_ENTITY(assignment.toEntity);

  const defaultNewEnd = useMemo(() => {
    const d = new Date(assignment.endDate);
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  }, [assignment]);

  const [form, setForm] = useState({
    newEnd: defaultNewEnd,
    months: 3,
    reason: '',
    keepAllowance: true,
    consentAttached: false,
    decreeAttached: false,
  });

  const isCapped = assignment.type === 'acting' || assignment.type === 'secondment';
  const requiresMinister = assignment.type === 'loan' || assignment.type === 'borrowing';
  const proposedEnd = isCapped ? addMonths(assignment.endDate, form.months) : form.newEnd;
  const additionalDays = daysBetween(assignment.endDate, proposedEnd);
  const exceeds180 = isCapped && Number(form.months) > 6;
  const dateOrderError = additionalDays <= 0;
  const canSubmit = !exceeds180 && !dateOrderError && form.reason.trim().length > 10 && form.consentAttached && (!requiresMinister || form.decreeAttached);

  const handleSubmit = () => {
    toast.push(t('toast_extension_sent'), 'success');
    onNavigate('detail', assignment.id);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('dashboard_title')}</a>
          <span className="sep">/</span>
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('detail', assignment.id); }} className="tabular">{assignment.id}</a>
          <span className="sep">/</span>
          <span>{t('ext_title')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('ext_title')}</h1>
            <div className="page-subtitle">{t('ext_sub')}</div>
          </div>
          <Button variant="ghost" onClick={() => onNavigate('detail', assignment.id)}>{t('cancel')}</Button>
        </div>
      </div>

      <div className="with-rail">
        <div className="flex-col" style={{ gap: 'var(--space-5)' }}>
          <Card title={lang === 'ar' ? 'المهمة الحالية' : 'Current assignment'}>
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={empName} size="lg" />
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{empName}</span>
                  <TypeBadge type={assignment.type} />
                  <StatusBadge status={assignment.status} />
                </div>
                <div className="text-sm">{lang === 'ar' ? assignment.position_ar : assignment.position_en}</div>
                <div className="text-sm text-muted">{lang === 'ar' ? fromEnt.ar : fromEnt.en} → {lang === 'ar' ? toEnt.ar : toEnt.en}</div>
              </div>
            </div>
            <div className="dl-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <Datum label={t('start_date')} value={formatDate(assignment.startDate, lang)} />
              <Datum label={t('ext_current_end')} value={formatDate(assignment.endDate, lang)} />
              <Datum label={t('grade')} value={assignment.grade} mono />
            </div>
          </Card>

          <Card title={lang === 'ar' ? 'تفاصيل التمديد' : 'Extension details'}>
            {requiresMinister && (
              <div className="mb-4">
                <Alert type="warning" icon="alert" title={lang === 'ar' ? 'يتطلب مرسوم الوزير' : "Minister's decree required"}>
                  {lang === 'ar' ? 'تمديد الإعارة أو الاستعارة يتطلب مرسوماً موقّعاً من الوزير. يبقى الوزير خطوةً في المسار لكنه لا يعتمد عبر النظام — تُرفِق الموارد البشرية المرسوم الموقّع.' : "Extending a loan or borrowing requires a decree signed by the Minister. The Minister stays a step in the path but does not approve in the system — HR attaches the signed decree."}
                </Alert>
              </div>
            )}

            <div className="grid-3 mb-4">
              <Field label={t('ext_current_end')}>
                <Input value={formatDate(assignment.endDate, lang)} readOnly style={{ background: 'var(--bg-muted)' }} />
              </Field>
              {isCapped ? (
                <Field label={lang === 'ar' ? 'مدة التمديد' : 'Extension period'} required
                  hint={lang === 'ar' ? 'بحد أقصى 6 أشهر (180 يوماً)' : 'Up to 6 months (180 days)'}>
                  <Select value={form.months} onChange={e => setForm({ ...form, months: Number(e.target.value) })}>
                    {[1, 2, 3, 4, 5, 6].map(m => (
                      <option key={m} value={m}>{m} {lang === 'ar' ? (m === 1 ? 'شهر' : m === 2 ? 'شهران' : 'أشهر') : (m === 1 ? 'month' : 'months')}</option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field label={t('ext_new_end')} required
                  error={dateOrderError ? t('err_end_before_start') : null}
                  hint={!dateOrderError ? (lang === 'ar' ? 'أي مدة — يتطلب مرسوم الوزير' : "Any period — requires the Minister's decree") : null}>
                  <Input type="date" value={form.newEnd} onChange={e => setForm({ ...form, newEnd: e.target.value })} />
                </Field>
              )}
              <Field label={lang === 'ar' ? 'تاريخ النهاية الجديد' : 'New end date'}>
                <Input value={formatDate(proposedEnd, lang)} readOnly style={{ background: 'var(--bg-muted)', fontWeight: 600 }} />
                <div className="text-xs text-muted" style={{ marginTop: 4 }}>{lang === 'ar' ? `+${additionalDays > 0 ? additionalDays : 0} يوم` : `+${additionalDays > 0 ? additionalDays : 0} days`}</div>
              </Field>
            </div>

            <div className="mb-4" style={{ padding: 'var(--space-4)', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xs text-muted" style={{ marginBottom: 8 }}>{lang === 'ar' ? 'تصور التمديد' : 'Extension preview'}</div>
              <div style={{ position: 'relative', height: 40, marginTop: 4 }}>
                <div style={{ position: 'absolute', top: 14, left: 0, right: exceeds180 ? '50%' : '40%', height: 8, background: 'var(--color-gold-400)', borderRadius: 4 }} />
                {!dateOrderError && (
                  <div style={{ position: 'absolute', top: 14, left: exceeds180 ? '50%' : '60%', right: 0, height: 8, background: exceeds180 ? 'var(--color-danger-300)' : 'var(--color-success-400)', borderRadius: 4, opacity: 0.85 }} />
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: 11, color: 'var(--color-ink-700)' }}>{formatDate(assignment.startDate, lang)}</div>
                <div style={{ position: 'absolute', top: 0, left: '60%', fontSize: 11, color: 'var(--color-ink-700)', transform: 'translateX(-50%)' }}>{formatDate(assignment.endDate, lang)}</div>
                <div style={{ position: 'absolute', top: 0, right: 0, fontSize: 11, color: exceeds180 ? 'var(--color-danger-600)' : 'var(--color-success-700)', fontWeight: 500 }}>{formatDate(proposedEnd, lang)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11 }}>
                <span className="text-muted">{lang === 'ar' ? 'الفترة الأصلية' : 'Original period'}</span>
                <span style={{ color: exceeds180 ? 'var(--color-danger-600)' : 'var(--color-success-700)', fontWeight: 500 }}>
                  {lang === 'ar' ? `+${additionalDays} يوم` : `+${additionalDays} days extension`}
                </span>
              </div>
            </div>

            <Field label={t('ext_reason')} required
              hint={lang === 'ar' ? 'الحد الأدنى ١٠ أحرف. سيُعرض هذا للمعتمدين.' : 'Minimum 10 characters. Visible to all approvers.'}>
              <Textarea rows="4" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder={t('ext_reason_ph')} />
            </Field>

            <div className="mt-4 flex-col" style={{ gap: 'var(--space-3)' }}>
              <label className="checkbox">
                <input type="checkbox" checked={form.keepAllowance} onChange={e => setForm({ ...form, keepAllowance: e.target.checked })} />
                <div>
                  <div>{lang === 'ar' ? 'الإبقاء على نفس البدل الحالي خلال فترة التمديد' : 'Keep the same allowance during the extension period'}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>{formatAED(assignment.allowance, lang)}/{lang === 'ar' ? 'شهر' : 'mo'}</div>
                </div>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={form.consentAttached} onChange={e => setForm({ ...form, consentAttached: e.target.checked })} />
                <div>
                  <div>{lang === 'ar' ? 'تم إرفاق خطاب موافقة محدّث من الموظف' : 'Updated employee consent letter is attached'}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>{lang === 'ar' ? 'إلزامي لأي تمديد' : 'Required for any extension'}</div>
                </div>
              </label>

              {requiresMinister && (form.decreeAttached ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--color-success-50)', border: '1px solid var(--color-success-100)', borderRadius: 'var(--radius-md)' }}>
                  <Icon name="file" size={16} style={{ color: 'var(--color-success-600)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="text-sm text-strong">{lang === 'ar' ? 'مرسوم الوزير الموقّع.pdf' : 'Minister_Decree_Signed.pdf'}</div>
                    <div className="text-xs text-muted">{lang === 'ar' ? 'أرفقته الموارد البشرية' : 'Attached by HR'}</div>
                  </div>
                  <Icon name="check-circle" size={16} style={{ color: 'var(--color-success-600)' }} />
                  <Button size="sm" variant="ghost" icon="x" aria-label={lang === 'ar' ? 'إزالة' : 'Remove'} onClick={() => setForm({ ...form, decreeAttached: false })} />
                </div>
              ) : (
                <div onClick={() => setForm({ ...form, decreeAttached: true })} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1.5px dashed var(--color-gold-400)', background: 'var(--color-gold-50)', borderRadius: 'var(--radius-md)' }}>
                  <Icon name="upload" size={16} style={{ color: 'var(--color-gold-700)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="text-sm text-strong">{lang === 'ar' ? 'إرفاق مرسوم الوزير الموقّع' : "Attach the Minister's signed decree"} <span style={{ color: 'var(--color-danger-600)' }}>*</span></div>
                    <div className="text-xs text-muted">{lang === 'ar' ? 'إلزامي لتمديد الإعارة والاستعارة' : 'Required to extend loan & borrowing'}</div>
                  </div>
                  <Button size="sm" onClick={e => { e.stopPropagation(); setForm({ ...form, decreeAttached: true }); }}>{lang === 'ar' ? 'تصفح' : 'Browse'}</Button>
                </div>
              ))}
            </div>

            <div className="mt-4" style={{ padding: '10px 12px', border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="upload" size={16} style={{ color: 'var(--color-ink-500)' }} />
              <span className="text-sm">{lang === 'ar' ? 'اسحب ملف PDF هنا أو ' : 'Drop a PDF here or '}</span>
              <Button size="sm">{lang === 'ar' ? 'تصفح' : 'Browse'}</Button>
            </div>
          </Card>
        </div>

        <div className="rail flex-col" style={{ gap: 'var(--space-4)' }}>
          <Card title={t('policy_summary')}>
            <div className="flex-col" style={{ gap: 'var(--space-3)' }}>
              <PolicyCheck pass={!dateOrderError && additionalDays > 0}
                title={lang === 'ar' ? 'مدة التمديد' : 'Extension period'}
                body={dateOrderError
                  ? t('err_end_before_start')
                  : isCapped
                  ? (lang === 'ar' ? `${additionalDays} يوم — ضمن حد 6 أشهر (180 يوماً)` : `${additionalDays} days — within the 6-month (180-day) cap`)
                  : (lang === 'ar' ? `${additionalDays} يوم — أي مدة بمرسوم الوزير` : `${additionalDays} days — any period with the Minister's decree`)} />
              {requiresMinister &&
                <PolicyCheck pass={form.decreeAttached}
                  title={lang === 'ar' ? 'مرسوم الوزير' : "Minister's decree"}
                  body={form.decreeAttached ? (lang === 'ar' ? 'مرفق بواسطة الموارد البشرية' : 'Attached by HR') : (lang === 'ar' ? 'مطلوب قبل الإرسال' : 'Required before submission')} />
              }
              <PolicyCheck pass={form.consentAttached}
                title={lang === 'ar' ? 'موافقة الموظف' : 'Employee consent'}
                body={form.consentAttached ? (lang === 'ar' ? 'مرفقة' : 'Attached') : (lang === 'ar' ? 'مطلوبة قبل الإرسال' : 'Required before submission')} />
              <PolicyCheck pass={form.reason.trim().length > 10}
                title={lang === 'ar' ? 'مبرر التمديد' : 'Justification'}
                body={form.reason.trim().length > 10 ? (lang === 'ar' ? 'مقدّم' : 'Provided') : (lang === 'ar' ? '١٠ أحرف على الأقل' : 'At least 10 characters')} />
              <PolicyCheck info
                title={lang === 'ar' ? 'مسار الاعتماد' : 'Approval path'}
                body={requiresMinister
                  ? (lang === 'ar' ? 'رئيس الجهة → مرسوم الوزير (ترفقه الموارد البشرية)' : "Entity Head → Minister's decree (HR attaches)")
                  : (lang === 'ar' ? 'رئيس الجهة فقط' : 'Entity Head only')} />
            </div>
          </Card>

          <Card title={lang === 'ar' ? 'مسار الاعتماد' : 'Approval path'}>
            <div className="flex-col" style={{ gap: 10 }}>
              <ApprovalStep num={1} label={t(requiresMinister ? 'approver_entity_head' : 'approver_css_sector_head')} active />
              {requiresMinister && <ApprovalStep num={2} label={lang === 'ar' ? 'مرسوم الوزير' : "Minister's decree"} special decree />}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button variant="primary" icon="send" onClick={handleSubmit} disabled={!canSubmit} style={{ width: '100%' }}>{t('submit')}</Button>
            <Button onClick={() => onNavigate('detail', assignment.id)} style={{ width: '100%' }}>{t('cancel')}</Button>
          </div>
        </div>
      </div>
    </>
  );
}
