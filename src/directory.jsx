import React, { useState, useMemo } from 'react';
import {
  useI18n, Icon, Button, Field, Input, Select, Avatar, Card, Modal, TypeBadge, StatusBadge, Datum,
} from './components';
import {
  EMPLOYEES, ENTITIES, GRADES, ASSIGNMENTS, GET_ENTITY, GET_GRADE, formatDate, formatAED,
} from './data';

export default function Directory({ onNavigate }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedEmp, setSelectedEmp] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EMPLOYEES.filter(e => {
      if (entityFilter !== 'all' && e.entity !== entityFilter) return false;
      if (gradeFilter !== 'all' && e.grade !== gradeFilter) return false;
      if (!q) return true;
      return (
        e.en.toLowerCase().includes(q) ||
        e.ar.includes(query.trim()) ||
        e.id.toLowerCase().includes(q) ||
        e.position_en.toLowerCase().includes(q) ||
        e.position_ar.includes(query.trim())
      );
    });
  }, [query, entityFilter, gradeFilter]);

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('dashboard_title')}</a>
          <span className="sep">/</span>
          <span>{t('nav_directory')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('nav_directory')}</h1>
            <div className="page-subtitle">
              {lang === 'ar' ? `${EMPLOYEES.length} موظف · مزامنة مباشرة من Oracle HCM` : `${EMPLOYEES.length} employees · live sync from Oracle HCM`}
            </div>
          </div>
          <div className="page-actions">
            <Button icon="download">{t('export')}</Button>
          </div>
        </div>
      </div>

      <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--color-info-50)', border: '1px solid var(--color-info-100)', borderRadius: 'var(--radius-md)' }}>
        <Icon name="info" size={16} style={{ color: 'var(--color-info-600)' }} />
        <div className="text-sm" style={{ flex: 1 }}>
          <span className="text-strong">{lang === 'ar' ? 'Oracle HCM هو مصدر الحقيقة' : 'Oracle HCM is the system of record'}</span>
          {' — '}
          <span className="text-muted">{lang === 'ar' ? 'بيانات الموظفين للقراءة فقط هنا. تتم التحديثات في Oracle ثم تُزامن خلال 15 دقيقة.' : 'Employee data is read-only here. Updates happen in Oracle and sync within 15 minutes.'}</span>
        </div>
        <span className="badge" style={{ background: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success-500)' }} />
          {lang === 'ar' ? 'متصل' : 'Connected'}
        </span>
      </div>

      <Card>
        <div className="grid-3 mb-4">
          <Field label={lang === 'ar' ? 'بحث' : 'Search'}>
            <div style={{ position: 'relative' }}>
              <Icon name="search" size={14} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-500)' }} />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'الاسم، الرقم الوظيفي، المسمى…' : 'Name, employee ID, position…'}
                style={{ paddingInlineStart: 34 }}
              />
            </div>
          </Field>
          <Field label={lang === 'ar' ? 'الجهة' : 'Entity'}>
            <Select value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
              <option value="all">{lang === 'ar' ? 'جميع الجهات' : 'All entities'}</option>
              {ENTITIES.map(en => (
                <option key={en.id} value={en.id}>{lang === 'ar' ? en.ar : en.en}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('grade')}>
            <Select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
              <option value="all">{lang === 'ar' ? 'جميع الدرجات' : 'All grades'}</option>
              {GRADES.map(g => (
                <option key={g.id} value={g.id}>{g.id}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="table-wrap">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th>{lang === 'ar' ? 'المسمى الوظيفي' : 'Position'}</th>
                  <th>{lang === 'ar' ? 'الجهة' : 'Entity'}</th>
                  <th>{t('grade')}</th>
                  <th>{lang === 'ar' ? 'تاريخ الالتحاق' : 'Joined'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const ent = GET_ENTITY(e.entity);
                  return (
                    <tr key={e.id} onClick={() => setSelectedEmp(e)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={lang === 'ar' ? e.ar : e.en} />
                          <div>
                            <div className="text-strong">{lang === 'ar' ? e.ar : e.en}</div>
                            <div className="text-xs text-muted tabular">{e.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{lang === 'ar' ? e.position_ar : e.position_en}</td>
                      <td>{ent ? (lang === 'ar' ? ent.ar : ent.en) : '—'}</td>
                      <td className="tabular">{e.grade}</td>
                      <td className="tabular">{formatDate(e.joined, lang)}</td>
                      <td style={{ textAlign: 'end' }}>
                        <Icon name="chevron-right" size={14} style={{ color: 'var(--color-ink-500)' }} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-ink-600)' }}>
                      {lang === 'ar' ? 'لا توجد نتائج تطابق التصفية.' : 'No employees match the filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <EmployeeProfileModal
        emp={selectedEmp}
        open={!!selectedEmp}
        onClose={() => setSelectedEmp(null)}
        onNavigate={onNavigate}
      />
    </>
  );
}

function EmployeeProfileModal({ emp, open, onClose, onNavigate }) {
  const { t, lang } = useI18n();
  if (!emp) return null;
  const ent = GET_ENTITY(emp.entity);
  const grade = GET_GRADE(emp.grade);
  const empAssignments = ASSIGNMENTS.filter(a => a.employeeId === emp.id);
  const yearsServed = Math.max(0, Math.floor((Date.now() - new Date(emp.joined).getTime()) / (365.25 * 86400000)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lang === 'ar' ? 'ملف الموظف' : 'Employee profile'}
      width={720}
      footer={<Button onClick={onClose}>{lang === 'ar' ? 'إغلاق' : 'Close'}</Button>}
    >
      <div className="flex items-center gap-4 mb-4">
        <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{lang === 'ar' ? emp.ar : emp.en}</span>
            <span className="text-sm text-muted tabular">{emp.id}</span>
          </div>
          <div className="text-sm">{lang === 'ar' ? emp.position_ar : emp.position_en}</div>
          <div className="text-sm text-muted">{ent ? (lang === 'ar' ? ent.ar : ent.en) : '—'}</div>
        </div>
        <span className="badge" style={{ background: 'var(--color-info-50)', color: 'var(--color-info-700)' }}>
          <Icon name="shield" size={11} /> Oracle HCM
        </span>
      </div>

      <div className="dl-grid mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Datum label={t('grade')} value={emp.grade} mono />
        <Datum
          label={lang === 'ar' ? 'الراتب الأساسي' : 'Basic salary'}
          value={grade ? formatAED(grade.basic, lang) : '—'}
          mono
        />
        <Datum
          label={lang === 'ar' ? 'تاريخ الالتحاق' : 'Joined'}
          value={`${formatDate(emp.joined, lang)} (${yearsServed} ${lang === 'ar' ? 'سنوات' : 'yrs'})`}
        />
      </div>

      <div className="text-sm text-strong" style={{ marginBottom: 'var(--space-2)' }}>
        {lang === 'ar' ? 'سجل المهام' : 'Assignment history'}
        <span className="text-muted" style={{ fontWeight: 400, marginInlineStart: 8 }}>({empAssignments.length})</span>
      </div>

      {empAssignments.length === 0 ? (
        <div className="empty" style={{ padding: 'var(--space-4)', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
          <div className="text-sm text-muted">{lang === 'ar' ? 'لا توجد مهام مسجلة لهذا الموظف.' : 'No assignments on record for this employee.'}</div>
        </div>
      ) : (
        <div className="flex-col" style={{ gap: 'var(--space-2)' }}>
          {empAssignments.map(a => {
            const toEnt = GET_ENTITY(a.toEntity);
            return (
              <div
                key={a.id}
                onClick={() => { onClose(); onNavigate('detail', a.id); }}
                style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-3)', padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TypeBadge type={a.type} />
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-muted tabular">{a.id}</span>
                  </div>
                  <div className="text-sm">{lang === 'ar' ? a.position_ar : a.position_en} · {toEnt ? (lang === 'ar' ? toEnt.ar : toEnt.en) : '—'}</div>
                  <div className="text-xs text-muted tabular">{formatDate(a.startDate, lang)} – {formatDate(a.endDate, lang)}</div>
                </div>
                <div style={{ alignSelf: 'center' }}>
                  <Icon name="chevron-right" size={14} style={{ color: 'var(--color-ink-500)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
