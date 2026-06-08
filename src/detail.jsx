import React, { useState, useMemo } from 'react';
import {
  useI18n, useToast, Icon, Button, Field, Textarea, TypeBadge, StatusBadge,
  Avatar, Alert, Card, Modal, Datum,
} from './components';
import {
  ASSIGNMENTS, GET_EMPLOYEE, GET_ENTITY, GET_GRADE,
  daysBetween, formatDate, formatDateTime, formatAED,
} from './data';
import { buildTimeline, getApprovalChain, DEMO_PEOPLE, ROLE_MAP } from './roles';

function primaryAction(awaitingRole, lang) {
  if (awaitingRole === 'hr_decree') {
    return { label: lang === 'ar' ? 'إرفاق المرسوم والإحالة' : 'Attach decree & forward', icon: 'file' };
  }
  if (awaitingRole === 'css_sector_head' || awaitingRole === 'entity_head') {
    return { label: lang === 'ar' ? 'اعتماد وتوقيع' : 'Approve & sign', icon: 'check' };
  }
  return { label: lang === 'ar' ? 'اعتماد' : 'Approve', icon: 'check' };
}

function resolveEmployee(assignment) {
  if (assignment.employeeId) return GET_EMPLOYEE(assignment.employeeId);
  return {
    en: assignment.borrowedEmployee?.en || 'External Employee',
    ar: assignment.borrowedEmployee?.ar || 'موظف خارجي',
    id: '—',
    position_en: assignment.position_en,
    position_ar: assignment.position_ar,
    grade: assignment.grade,
    entity: assignment.fromEntity,
    joined: null,
  };
}

export default function Detail({ id, onNavigate, role = 'hr_specialist' }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [comment, setComment] = useState('');

  const assignment = useMemo(() =>
    ASSIGNMENTS.find(a => a.id === id) || ASSIGNMENTS.find(a => a.status === 'pending'),
    [id]);

  if (!assignment) return <div className="empty">No assignment.</div>;

  const emp = resolveEmployee(assignment);
  const fromEnt = GET_ENTITY(assignment.fromEntity);
  const toEnt = GET_ENTITY(assignment.toEntity);
  const gradeObj = GET_GRADE(assignment.grade);
  const dur = daysBetween(assignment.startDate, assignment.endDate);
  const daysLeft = daysBetween(new Date(), assignment.endDate);
  const isActive = assignment.status === 'active';
  const isPending = assignment.status === 'pending';
  const isExpiringSoon = isActive && daysLeft > 0 && daysLeft <= 45;
  const canAct = isPending && assignment.awaitingApprover === role;

  const handleApprove = () => { setShowApprove(false); toast.push(t('toast_approved'), 'success'); };
  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setShowReject(false);
    toast.push(t('toast_rejected'), 'danger');
  };

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('dashboard_title')}</a>
          <span className="sep">/</span>
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('list'); }}>{t('nav_assignments')}</a>
          <span className="sep">/</span>
          <span className="tabular">{assignment.id}</span>
        </div>
        <div className="page-header-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-3 mb-2" style={{ flexWrap: 'wrap' }}>
              <TypeBadge type={assignment.type} />
              <StatusBadge status={assignment.status} />
              {isPending && <span className="badge" style={{ background: 'var(--color-warning-50)', color: 'var(--color-warning-700)' }}><Icon name="clock" size={11} /> {lang === 'ar' ? `بانتظار ${t(`approver_${assignment.awaitingApprover}`)}` : `Awaiting ${t(`approver_${assignment.awaitingApprover}`)}`}</span>}
              {isExpiringSoon && <span className="badge" style={{ background: 'var(--color-warning-50)', color: 'var(--color-warning-700)' }}><Icon name="alert" size={11} /> {lang === 'ar' ? `تنتهي خلال ${daysLeft} يوم` : `Expires in ${daysLeft} days`}</span>}
            </div>
            <h1 className="page-title" style={{ fontSize: 'var(--text-2xl)' }}>
              {lang === 'ar' ? emp.ar : emp.en} → {lang === 'ar' ? (assignment.position_ar || toEnt.ar) : (assignment.position_en || toEnt.en)}
            </h1>
            <div className="page-subtitle tabular">{assignment.id} · {lang === 'ar' ? 'تم الإنشاء' : 'Created'} {formatDate(assignment.updatedAt, lang)}</div>
          </div>
          <div className="page-actions">
            {canAct && (
              <>
                <Button variant="danger-secondary" icon="x-circle" onClick={() => setShowReject(true)}>{t('reject')}</Button>
                <Button icon="message" onClick={() => setTab('overview')}>{t('request_changes')}</Button>
                {(() => { const pa = primaryAction(assignment.awaitingApprover, lang); return (
                  <Button variant="primary" icon={pa.icon} onClick={() => setShowApprove(true)}>{pa.label}</Button>
                ); })()}
              </>
            )}
            {isPending && !canAct && (
              <Button disabled icon="clock">
                {lang === 'ar' ? `بانتظار ${t(`approver_${assignment.awaitingApprover}`)}` : `Awaiting ${t(`approver_${assignment.awaitingApprover}`)}`}
              </Button>
            )}
            {isActive && (
              <>
                <Button icon="download">{lang === 'ar' ? 'تنزيل المذكرة' : 'Download memo'}</Button>
                <Button variant="primary" icon="refresh" onClick={() => onNavigate('extension', assignment.id)}>{t('extend')}</Button>
              </>
            )}
            {assignment.status === 'draft' && (
              <Button variant="primary" icon="edit" onClick={() => onNavigate('wizard')}>{lang === 'ar' ? 'متابعة التعديل' : 'Continue editing'}</Button>
            )}
          </div>
        </div>
      </div>

      {assignment.status === 'rejected' && assignment.rejection_en && (
        <div className="mb-5">
          <Alert type="danger" title={lang === 'ar' ? 'تم رفض هذا الطلب' : 'This request was rejected'}>
            {lang === 'ar' ? assignment.rejection_ar : assignment.rejection_en}
          </Alert>
        </div>
      )}

      {isExpiringSoon && (
        <div className="mb-5">
          <Alert type="warning" title={lang === 'ar' ? `تنتهي هذه المهمة خلال ${daysLeft} يوماً` : `This assignment expires in ${daysLeft} days`}>
            {lang === 'ar' ? 'يُرسل النظام تذكيرات تلقائية في 45 و30 و15 يوماً.' : 'Auto-reminders are set for 45, 30, and 15 days. Start the extension before the end date.'}
            {' '}<a href="#" onClick={e => { e.preventDefault(); onNavigate('extension', assignment.id); }}>{lang === 'ar' ? 'بدء طلب التمديد' : 'Start an extension request'} →</a>
          </Alert>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}><Icon name="info" size={14} />{t('overview')}</button>
        <button className={`tab ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}><Icon name="clock" size={14} />{t('timeline_tab')}<span className="count">3</span></button>
        <button className={`tab ${tab === 'documents' ? 'active' : ''}`} onClick={() => setTab('documents')}><Icon name="paperclip" size={14} />{t('documents')}<span className="count">4</span></button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}><Icon name="list" size={14} />{t('history')}</button>
      </div>

      <div className="with-rail">
        <div>
          {tab === 'overview' && <OverviewTab assignment={assignment} emp={emp} fromEnt={fromEnt} toEnt={toEnt} gradeObj={gradeObj} dur={dur} />}
          {tab === 'timeline' && <TimelineTab assignment={assignment} comment={comment} setComment={setComment} />}
          {tab === 'documents' && <DocumentsTab />}
          {tab === 'history' && <HistoryTab />}
        </div>
        <div className="rail flex-col" style={{ gap: 'var(--space-4)' }}>
          <SummaryRail assignment={assignment} emp={emp} fromEnt={fromEnt} toEnt={toEnt} dur={dur} daysLeft={daysLeft} />
          <NextActionsRail assignment={assignment} isPending={isPending} isActive={isActive} canAct={canAct} role={role} onNavigate={onNavigate} onApprove={() => setShowApprove(true)} onReject={() => setShowReject(true)} />
        </div>
      </div>

      <Modal open={showReject} onClose={() => setShowReject(false)}
        title={t('reject') + ' — ' + assignment.id}
        footer={<>
          <Button variant="ghost" onClick={() => setShowReject(false)}>{t('cancel')}</Button>
          <Button variant="danger" icon="x-circle" onClick={handleReject} disabled={!rejectReason.trim()}>{t('reject')}</Button>
        </>}>
        <Alert type="danger" icon="alert">
          {lang === 'ar' ? 'الرفض سيوقف الطلب نهائياً. يجب إعادة التقديم لإعادة المعالجة.' : 'Rejecting stops this request. The submitter must create a new one to retry.'}
        </Alert>
        <Field label={lang === 'ar' ? 'سبب الرفض' : 'Reason for rejection'} required className="mt-3"
          hint={lang === 'ar' ? 'سيرى مقدم الطلب هذه الرسالة.' : 'The submitter will see this message.'}>
          <Textarea rows="5" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            placeholder={lang === 'ar' ? 'وضح السبب وما الذي يمكن إصلاحه…' : 'Explain why and what could be fixed…'} />
        </Field>
      </Modal>

      <Modal open={showApprove} onClose={() => setShowApprove(false)}
        title={primaryAction(assignment.awaitingApprover, lang).label + ' — ' + assignment.id}
        footer={<>
          <Button variant="ghost" onClick={() => setShowApprove(false)}>{t('cancel')}</Button>
          <Button variant="primary" icon={primaryAction(assignment.awaitingApprover, lang).icon} onClick={handleApprove}>{t('confirm')}</Button>
        </>}>
        {(() => {
          const chain = getApprovalChain(assignment.type);
          const idx = chain.indexOf(assignment.awaitingApprover);
          const nextRole = idx >= 0 && idx < chain.length - 1 ? chain[idx + 1] : null;
          const nextPerson = nextRole ? DEMO_PEOPLE[nextRole] : null;
          const nextRoleLabel = nextRole ? ROLE_MAP[nextRole]?.label : null;
          return (
            <>
              <div className="text-sm" style={{ marginBottom: 'var(--space-3)' }}>
                {nextRole
                  ? (lang === 'ar' ? 'سيتم تمرير الطلب إلى الخطوة التالية:' : 'This will move the request to the next step:')
                  : (lang === 'ar' ? 'هذا هو الاعتماد النهائي. سيُفعَّل الطلب فور التأكيد.' : 'This is the final approval. The assignment activates immediately on confirm.')}
              </div>
              {nextRole && (
                <div className="flex items-center gap-3 mb-3" style={{ padding: '12px', background: 'var(--color-success-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success-100)' }}>
                  <Avatar name={lang === 'ar' ? nextPerson.ar : nextPerson.en} />
                  <div>
                    <div className="text-strong">{lang === 'ar' ? nextPerson.ar : nextPerson.en}</div>
                    <div className="text-sm text-muted">{lang === 'ar' ? nextRoleLabel.ar : nextRoleLabel.en}</div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
        <Field label={lang === 'ar' ? 'تعليق (اختياري)' : 'Comment (optional)'}>
          <Textarea rows="3" placeholder={lang === 'ar' ? 'أضف ملاحظة للموافقين التاليين…' : 'Add a note for the next approvers…'} />
        </Field>
      </Modal>
    </>
  );
}

function OverviewTab({ assignment, emp, fromEnt, toEnt, gradeObj, dur }) {
  const { t, lang } = useI18n();
  const [showProfile, setShowProfile] = useState(false);
  const allowancePct = assignment.allowance > 0 ? Math.round((assignment.allowance / assignment.salaryBasic) * 100) : 0;
  const isBorrowing = assignment.type === 'borrowing';

  return (
    <div className="flex-col" style={{ gap: 'var(--space-5)' }}>
      <Card title={t('step_employee')}>
        <div className="flex items-center gap-4">
          <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="lg" />
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{lang === 'ar' ? emp.ar : emp.en}</span>
              <span className="text-sm text-muted tabular">{emp.id}</span>
            </div>
            <div className="text-sm">{lang === 'ar' ? emp.position_ar : emp.position_en}</div>
            <div className="text-sm text-muted">{lang === 'ar' ? fromEnt.ar : fromEnt.en} · {t('grade')} {emp.grade}{!isBorrowing ? ` · ${formatAED(GET_GRADE(emp.grade)?.basic, lang)}` : ''}</div>
          </div>
          {!isBorrowing && <Button size="sm" variant="secondary" icon="eye" onClick={() => setShowProfile(true)}>{lang === 'ar' ? 'الملف الشخصي' : 'View profile'}</Button>}
        </div>
      </Card>

      <Card title={t('step_details')}>
        <div className="dl-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
          <Datum label={t('target_entity')} value={lang === 'ar' ? toEnt.ar : toEnt.en} />
          <Datum label={t('target_position')} value={lang === 'ar' ? assignment.position_ar : assignment.position_en} />
          <Datum label={t('target_grade')} value={assignment.grade} mono />
          <Datum label={t('start_date')} value={formatDate(assignment.startDate, lang)} />
          <Datum label={t('end_date')} value={formatDate(assignment.endDate, lang)} />
          <Datum label={t('duration')} value={`${dur} ${t('days')}`} mono />
        </div>
        <div className="mt-4">
          <div className="dl-label">{t('reason')}</div>
          <div className="text-sm" style={{ padding: '12px 14px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', lineHeight: 1.6, marginTop: 4 }}>
            {lang === 'ar' ? assignment.reason_ar : assignment.reason_en}
          </div>
        </div>
      </Card>

      <Card title={t('compensation_title')}>
        <div className="dl-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
          <Datum label={t('salary_basic')} value={formatAED(assignment.salaryBasic, lang)} />
          <Datum label={t('allowance_amount')} value={assignment.allowance > 0 ? `${formatAED(assignment.allowance, lang)} (${allowancePct}%)` : (lang === 'ar' ? 'لا يوجد' : 'None')} />
          <Datum label={t('paying_entity')} value={lang === 'ar' ? GET_ENTITY(assignment.payingEntity)?.ar : GET_ENTITY(assignment.payingEntity)?.en} />
          <Datum label={lang === 'ar' ? 'إجمالي الشهري' : 'Monthly total'}
            value={formatAED(assignment.salaryBasic + (assignment.allowance || 0), lang)} />
          <Datum label={lang === 'ar' ? 'إجمالي تكلفة المهمة' : 'Total assignment cost'}
            value={formatAED(Math.round((assignment.salaryBasic + (assignment.allowance || 0)) * dur / 30), lang)} />
          <Datum label={lang === 'ar' ? 'الحالة المالية' : 'Finance status'}
            value={<span className="badge badge-approved"><Icon name="check" size={11} /> {lang === 'ar' ? 'معتمد مالياً' : 'Finance cleared'}</span>} />
        </div>
      </Card>

      {!isBorrowing && (
        <Modal open={showProfile} onClose={() => setShowProfile(false)}
          title={lang === 'ar' ? 'الملف الشخصي للموظف' : 'Employee profile'}
          footer={<Button variant="primary" onClick={() => setShowProfile(false)}>{t('close')}</Button>}>
          <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-4)' }}>
            <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="lg" />
            <div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{lang === 'ar' ? emp.ar : emp.en}</div>
              <div className="text-sm text-muted tabular">{emp.id}</div>
            </div>
          </div>
          <div className="dl-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
            <Datum label={t('current_position')} value={lang === 'ar' ? emp.position_ar : emp.position_en} />
            <Datum label={t('current_entity')} value={lang === 'ar' ? fromEnt.ar : fromEnt.en} />
            <Datum label={t('current_grade')} value={emp.grade} mono />
            <Datum label={t('basic_salary')} value={formatAED(GET_GRADE(emp.grade)?.basic, lang)} />
            {emp.joined && <Datum label={t('join_date')} value={formatDate(emp.joined, lang)} />}
          </div>
        </Modal>
      )}
    </div>
  );
}

function TimelineTab({ assignment, comment, setComment }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const items = useMemo(() => buildTimeline(assignment), [assignment]);

  const handlePost = () => {
    if (!comment.trim()) return;
    toast.push(lang === 'ar' ? 'تم نشر التعليق' : 'Comment posted', 'success');
    setComment('');
  };

  return (
    <Card title={t('approval_path')} subtitle={lang === 'ar' ? `${items.length} مستويات اعتماد` : `${items.length}-level approval chain`}>
      <div className="timeline">
        {items.map((item, i) => (
          <div key={i} className={`timeline-item ${item.status}`}>
            <div className="timeline-marker">
              {item.status === 'done' && <Icon name="check" size={14} />}
              {item.status === 'active' && <Icon name="clock" size={14} />}
              {item.status === 'rejected' && <Icon name="x" size={14} />}
              {item.status === 'pending' && <span style={{ fontSize: 11, fontWeight: 600 }}>{i + 1}</span>}
            </div>
            <div className="timeline-body">
              <div className="timeline-head">
                <span className="timeline-name">{lang === 'ar' ? item.name_ar : item.name_en}</span>
                <span className="timeline-role">{lang === 'ar' ? item.role_ar : item.role_en}</span>
                {item.timestamp && <span className="timeline-time tabular">{formatDateTime(item.timestamp, lang)}</span>}
                {item.status === 'active' && <span className="badge badge-pending" style={{ fontSize: 10 }}><Icon name="clock" size={11} /> {lang === 'ar' ? 'قيد المراجعة' : 'Reviewing'}</span>}
                {item.status === 'pending' && <span className="text-xs text-muted" style={{ marginInlineStart: 'auto' }}>{lang === 'ar' ? 'لم يبدأ بعد' : 'Not started'}</span>}
              </div>
              {(item.comment_en || item.comment_ar) && (
                <div className="timeline-comment">{lang === 'ar' ? item.comment_ar : item.comment_en}</div>
              )}
              {item.status === 'active' && (() => {
                const pa = primaryAction(item.role, lang);
                return (
                  <div className="mt-3" style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="primary" icon={pa.icon}>{pa.label}</Button>
                    <Button size="sm" icon="message">{t('request_changes')}</Button>
                    <Button size="sm" variant="danger-secondary" icon="x">{t('reject')}</Button>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="section-heading">{t('notes')}</div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Avatar name="Mariam Al Mansoori" size="md" />
          <div style={{ flex: 1 }}>
            <Textarea rows="3" placeholder={t('add_comment')} value={comment} onChange={e => setComment(e.target.value)} />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="text-xs text-muted">
                <Icon name="info" size={12} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 4 }} />
                {lang === 'ar' ? 'يظهر التعليق لجميع المعتمدين.' : 'Comments are visible to all approvers and stakeholders.'}
              </div>
              <Button variant="primary" size="sm" icon="send" onClick={handlePost}>{t('post_comment')}</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DocumentsTab() {
  const { t, lang } = useI18n();
  const docs = [
    { name_en: 'Employee Consent Letter.pdf', name_ar: 'خطاب موافقة الموظف.pdf', size: '184 KB', date: '2026-05-18', author_en: 'Mariam Al Mansoori', author_ar: 'مريم المنصوري' },
    { name_en: 'MoCD Request Memo — Youth Programmes.pdf', name_ar: 'مذكرة طلب وزارة تنمية المجتمع.pdf', size: '312 KB', date: '2026-05-17', author_en: 'Dr. Saeed Al Tayer', author_ar: 'د. سعيد الطاير' },
    { name_en: 'Job Description — Youth Programmes Coordinator.pdf', name_ar: 'الوصف الوظيفي — منسق برامج الشباب.pdf', size: '96 KB', date: '2026-05-17', author_en: 'HR Department', author_ar: 'إدارة الموارد البشرية' },
    { name_en: 'HR Approval Memo.pdf', name_ar: 'مذكرة اعتماد الموارد البشرية.pdf', size: '142 KB', date: '2026-05-19', author_en: 'Aisha Al Hosani', author_ar: 'عائشة الحوسني' },
  ];
  return (
    <Card title={t('documents')} actions={<Button size="sm" icon="upload">{t('add_attachment')}</Button>}>
      <div className="flex-col" style={{ gap: 'var(--space-2)' }}>
        {docs.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-info-50)', color: 'var(--color-info-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="file" size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm text-strong" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'ar' ? d.name_ar : d.name_en}</div>
              <div className="text-xs text-muted">{formatDate(d.date, lang)} · {lang === 'ar' ? d.author_ar : d.author_en} · {d.size}</div>
            </div>
            <Button size="sm" variant="ghost" icon="eye" aria-label={t('view')} />
            <Button size="sm" variant="ghost" icon="download" aria-label={lang === 'ar' ? 'تنزيل' : 'Download'} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function HistoryTab() {
  const { t, lang } = useI18n();
  const entries = [
    { time: '2026-05-19T11:20:00', actor_en: 'Aisha Al Hosani', actor_ar: 'عائشة الحوسني', action_en: 'Attached decree and forwarded to HR Director', action_ar: 'أرفقت المرسوم وأحالت إلى مدير الموارد البشرية', icon: 'file', color: 'var(--color-success-600)' },
    { time: '2026-05-18T16:21:00', actor_en: 'System', actor_ar: 'النظام', action_en: 'Routed to HR Decree Officer', action_ar: 'تم التوجيه إلى موظف المراسيم', icon: 'send', color: 'var(--color-info-600)' },
    { time: '2026-05-18T09:14:00', actor_en: 'Mariam Al Mansoori', actor_ar: 'مريم المنصوري', action_en: 'Submitted for approval', action_ar: 'قدّم للاعتماد', icon: 'send', color: 'var(--color-info-600)' },
    { time: '2026-05-18T09:11:00', actor_en: 'Mariam Al Mansoori', actor_ar: 'مريم المنصوري', action_en: 'Uploaded employee consent letter', action_ar: 'رفع خطاب موافقة الموظف', icon: 'upload', color: 'var(--color-ink-600)' },
    { time: '2026-05-18T08:47:00', actor_en: 'Mariam Al Mansoori', actor_ar: 'مريم المنصوري', action_en: 'Created draft', action_ar: 'أنشأ مسودة', icon: 'edit', color: 'var(--color-ink-600)' },
  ];
  return (
    <Card title={t('history')} subtitle={lang === 'ar' ? 'كل إجراء يُسجّل لأغراض التدقيق' : 'Every action is logged for audit purposes'}>
      <div className="flex-col" style={{ gap: 0 }}>
        {entries.map((e, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 'var(--space-3)', padding: '12px 0', borderBottom: i < entries.length - 1 ? '1px solid var(--border-subtle)' : 0, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-muted)', color: e.color, display: 'grid', placeItems: 'center' }}>
              <Icon name={e.icon} size={14} />
            </div>
            <div>
              <div className="text-sm text-strong">{lang === 'ar' ? e.action_ar : e.action_en}</div>
              <div className="text-xs text-muted">{lang === 'ar' ? e.actor_ar : e.actor_en}</div>
            </div>
            <div className="text-xs text-muted tabular" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(e.time, lang)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SummaryRail({ assignment, emp, fromEnt, toEnt, dur, daysLeft }) {
  const { t, lang } = useI18n();
  return (
    <Card title={lang === 'ar' ? 'ملخص' : 'Summary'}>
      <div className="flex-col" style={{ gap: 'var(--space-3)' }}>
        {[
          { label: lang === 'ar' ? 'من' : 'From', value: lang === 'ar' ? fromEnt.ar : fromEnt.en },
          { label: lang === 'ar' ? 'إلى' : 'To', value: lang === 'ar' ? toEnt.ar : toEnt.en, highlight: true },
          { label: t('duration'), value: `${dur} ${t('days')}` },
          { label: t('grade'), value: assignment.grade, mono: true },
          { label: lang === 'ar' ? 'إجمالي شهري' : 'Monthly comp.', value: formatAED(assignment.salaryBasic + (assignment.allowance || 0), lang) },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span className="text-xs text-muted" style={{ flexShrink: 0 }}>{item.label}</span>
            <span style={{ textAlign: 'end', fontSize: 'var(--text-sm)', fontWeight: item.highlight ? 600 : 500, color: item.highlight ? 'var(--color-gold-800)' : 'var(--color-ink-900)', fontVariantNumeric: item.mono ? 'tabular-nums' : 'normal' }}>{item.value}</span>
          </div>
        ))}
        {assignment.status === 'active' && (
          <div style={{ marginTop: 8, padding: 12, background: daysLeft <= 45 ? 'var(--color-warning-50)' : 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: `1px solid ${daysLeft <= 45 ? 'var(--color-warning-100)' : 'var(--border-subtle)'}` }}>
            <div className="text-xs text-muted" style={{ marginBottom: 4 }}>{lang === 'ar' ? 'الوقت المتبقي' : 'Time remaining'}</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: daysLeft <= 45 ? 'var(--color-warning-700)' : 'var(--color-ink-900)', fontVariantNumeric: 'tabular-nums' }}>
              {daysLeft} {t('days')}
            </div>
            <div style={{ height: 4, background: 'var(--color-ink-200)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(0, Math.min(100, (daysLeft / dur) * 100))}%`, height: '100%', background: daysLeft <= 45 ? 'var(--color-warning-500)' : 'var(--color-success-500)', borderRadius: 2 }} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function NextActionsRail({ assignment, isPending, isActive, canAct, role, onNavigate, onApprove, onReject }) {
  const { t, lang } = useI18n();
  if (isPending && canAct) {
    const pa = primaryAction(assignment.awaitingApprover, lang);
    return (
      <Card title={lang === 'ar' ? 'إجراءاتك' : 'Your actions'}>
        <Alert type="warning" icon="clock">
          {lang === 'ar' ? `هذا الطلب بانتظار ${t(`approver_${assignment.awaitingApprover}`)}. اتخذ قراراً للمتابعة.` : `This request is waiting on ${t(`approver_${assignment.awaitingApprover}`)}. Take action to keep it moving.`}
        </Alert>
        <div className="flex-col mt-3" style={{ gap: 8 }}>
          <Button variant="primary" icon={pa.icon} onClick={onApprove} style={{ width: '100%' }}>{pa.label}</Button>
          <Button icon="message" style={{ width: '100%' }}>{t('request_changes')}</Button>
          <Button variant="danger-secondary" icon="x-circle" onClick={onReject} style={{ width: '100%' }}>{t('reject')}</Button>
        </div>
      </Card>
    );
  }
  if (isPending && !canAct) {
    return (
      <Card title={lang === 'ar' ? 'حالة الاعتماد' : 'Approval status'}>
        <Alert type="info" icon="clock">
          {lang === 'ar'
            ? `هذا الطلب بانتظار ${t(`approver_${assignment.awaitingApprover}`)}. لا يمكنك اتخاذ قرار من جلستك الحالية.`
            : `This request is waiting on ${t(`approver_${assignment.awaitingApprover}`)}. You cannot act on it from your current session.`}
        </Alert>
        <div className="text-xs text-muted mt-3" style={{ lineHeight: 1.6 }}>
          {lang === 'ar'
            ? 'سيتم إشعارك تلقائياً عندما يصبح الطلب على دورك في سلسلة الاعتماد.'
            : "You'll be notified automatically when the request reaches your step in the approval chain."}
        </div>
      </Card>
    );
  }
  if (isActive) {
    return (
      <Card title={lang === 'ar' ? 'إجراءات المهمة' : 'Assignment actions'}>
        <div className="flex-col" style={{ gap: 8 }}>
          <Button variant="primary" icon="refresh" onClick={() => onNavigate('extension', assignment.id)} style={{ width: '100%' }}>{t('extend')}</Button>
          <Button icon="download" style={{ width: '100%' }}>{lang === 'ar' ? 'تنزيل خطاب المهمة' : 'Download assignment letter'}</Button>
          <Button variant="danger-secondary" icon="x-circle" style={{ width: '100%' }}>{t('terminate')}</Button>
        </div>
      </Card>
    );
  }
  return null;
}
