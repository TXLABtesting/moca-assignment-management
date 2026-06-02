// Create Assignment Wizard — 5 steps with live policy validation,
// type-aware approval chain, and a sticky policy summary rail.

const { useState: useStateW, useMemo: useMemoW, useEffect: useEffectW } = React;

const STEPS = ['type', 'employee', 'details', 'compensation', 'review'];

function Wizard({ onNavigate, onSubmit }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [step, setStep] = useStateW(0);
  const [form, setForm] = useStateW({
    type: 'secondment',
    employeeId: 'E-204815',
    toEntity: 'mohre',
    targetPosition_en: '',
    targetPosition_ar: '',
    targetGrade: '3.2',
    reportingTo_en: '',
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    reason: '',
    salaryDuring: '',
    payingEntity: 'home',
    allowanceEligible: true,
    allowanceAmount: '',
    otherBenefits: '',
    decreeAttached: false,
    attachments: [
      { name: 'Employee_Consent_Letter.pdf', size: '184 KB' },
      { name: 'MoHRE_Request_Memo.pdf', size: '312 KB' },
    ],
  });

  const update = (patch) => setForm(f => ({ ...f, ...patch }));
  const employee = useMemoW(() => window.GET_EMPLOYEE(form.employeeId), [form.employeeId]);
  const targetGradeObj = useMemoW(() => window.GET_GRADE(form.targetGrade), [form.targetGrade]);

  // Live policy checks
  const validation = useMemoW(() => validateForm(form, employee), [form, employee]);

  // Auto-set salary + allowance based on grade when grade changes
  useEffectW(() => {
    if (targetGradeObj) {
      const dur = form.startDate && form.endDate ? window.daysBetween(form.startDate, form.endDate) : 0;
      // Allowance: ONLY acting earns one (25% of the grade minimum when > 60 days), paid by the home entity.
      // Secondment & loan earn no allowance. Borrowing has a separate editable compensation (capped at 10k).
      const allowance = form.type === 'acting' ? (dur > 60 ? Math.round(targetGradeObj.min * 0.25) : 0) : 0;
      setForm(f => ({
        ...f,
        // Salary during the assignment is fixed to the grade minimum and not editable.
        salaryDuring: String(targetGradeObj.min),
        allowanceAmount: f.type === 'borrowing' ? f.allowanceAmount : String(allowance),
        payingEntity: f.type === 'acting' ? 'home' : f.payingEntity,
      }));
    }
  // eslint-disable-next-line
  }, [form.targetGrade, form.type, form.startDate, form.endDate]);

  // Only acting chooses a target grade; every other type keeps the employee's current grade.
  useEffectW(() => {
    if (form.type !== 'acting' && employee && form.targetGrade !== employee.grade) {
      setForm(f => ({ ...f, targetGrade: employee.grade }));
    }
  // eslint-disable-next-line
  }, [form.type, employee]);

  const canContinue = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return !!form.employeeId;
    if (step === 2) {
      return !!form.toEntity && !!form.targetPosition_en && !!form.targetPosition_ar && !!form.targetGrade && !!form.startDate && !!form.endDate && !validation.gradeError && !validation.durationError && !validation.dateOrderError;
    }
    if (step === 3) return !validation.borrowingAmountError;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const handleBack = () => step > 0 ? setStep(step - 1) : onNavigate('dashboard');
  const handleSaveDraft = () => { toast.push(t('toast_draft_saved'), 'success'); };
  const handleSubmit = () => {
    toast.push(t('toast_submitted'), 'success');
    onSubmit?.(form);
    onNavigate('detail', 'ASG-2025-00211');
  };

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}>{t('dashboard_title')}</a>
          <span className="sep">/</span>
          <span>{t('wizard_title')}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t('wizard_title')}</h1>
            <div className="page-subtitle">{t('wizard_sub')}</div>
          </div>
          <div className="page-actions">
            <Button variant="ghost" onClick={() => onNavigate('dashboard')}>{t('cancel')}</Button>
            <Button onClick={handleSaveDraft} icon="file">{t('save_draft')}</Button>
          </div>
        </div>
      </div>

      <Stepper step={step} setStep={setStep} />

      <div className="with-rail" style={{ marginTop: 'var(--space-5)' }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-6)' }}>
            {step === 0 && <StepType form={form} update={update} />}
            {step === 1 && <StepEmployee form={form} update={update} employee={employee} />}
            {step === 2 && <StepDetails form={form} update={update} employee={employee} validation={validation} />}
            {step === 3 && <StepCompensation form={form} update={update} employee={employee} targetGradeObj={targetGradeObj} validation={validation} />}
            {step === 4 && <StepReview form={form} update={update} employee={employee} setStep={setStep} />}
          </div>

          <div className="card-footer">
            <Button variant="ghost" onClick={handleBack} icon={step > 0 ? 'arrow-left' : 'x'} className="icon-flip">
              {step > 0 ? t('back') : t('cancel')}
            </Button>
            <div className="text-sm text-muted">
              {lang === 'ar' ? `الخطوة ${step + 1} من ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`}
            </div>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={handleNext} iconAfter="arrow-right" disabled={!canContinue()}>{t('next')}</Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} icon="send" disabled={!form.decreeAttached}>{t('submit')}</Button>
            )}
          </div>
        </div>

        {/* Right rail — policy summary + approval path */}
        <div className="rail flex-col" style={{ gap: 'var(--space-4)' }}>
          <PolicyRail form={form} employee={employee} targetGradeObj={targetGradeObj} validation={validation} />
          <ApprovalPathRail type={form.type} />
        </div>
      </div>
    </>
  );
}

function validateForm(form, employee) {
  const errs = {};
  if (employee && form.targetGrade) {
    const cur = window.GRADE_INDEX(employee.grade);
    const tgt = window.GRADE_INDEX(form.targetGrade);
    if (cur >= 0 && tgt >= 0 && tgt - cur > 2) errs.gradeError = true;
  }
  const dur = form.startDate && form.endDate ? window.daysBetween(form.startDate, form.endDate) : 0;
  errs.duration = dur;
  if (dur > 365) errs.durationError = true;
  if (dur < 0) errs.dateOrderError = true;
  if (form.type === 'borrowing' && Number(form.allowanceAmount) > 10000) errs.borrowingAmountError = true;
  errs.requiresAllowance = dur > 60;
  return errs;
}

// ============================================================
// Stepper
// ============================================================
function Stepper({ step, setStep }) {
  const { t } = useI18n();
  return (
    <div className="stepper">
      {STEPS.map((key, i) => (
        <React.Fragment key={key}>
          <button
            type="button"
            className={`stepper-item ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}
            onClick={() => step > i && setStep(i)}
            disabled={step < i}>
            <span className="stepper-num">{step > i ? <Icon name="check" size={14} /> : i + 1}</span>
            <span className="stepper-label">{t(`step_${key}`)}</span>
          </button>
          {i < STEPS.length - 1 && <div className="stepper-divider" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================
// Step 1 — Type
// ============================================================
function StepType({ form, update }) {
  const { t, lang } = useI18n();
  const employee = window.GET_EMPLOYEE(form.employeeId);
  const senior = employee && window.IS_SENIOR_GRADE(employee.grade);
  // Grade 5 and above: only secondment is permitted.
  React.useEffect(() => {
    if (senior && form.type !== 'secondment') update({ type: 'secondment' });
  }, [senior, form.type]);
  const types = [
    { id: 'secondment', icon: 'arrow-right-circle', name_en: 'Secondment', name_ar: 'التكليف' },
    { id: 'acting',     icon: 'briefcase',          name_en: 'Acting',     name_ar: 'الندب' },
    { id: 'loan',       icon: 'send',               name_en: 'Loan',       name_ar: 'الإعارة' },
    { id: 'borrowing',  icon: 'download',           name_en: 'Borrowing',  name_ar: 'الاستعارة' },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, margin: '0 0 6px' }}>{t('select_type_title')}</h2>
      <div className="text-muted mb-5">{t('select_type_sub')}</div>
      <div className="grid-2">
        {types.map(typ => {
          const active = form.type === typ.id;
          const disabled = senior && typ.id !== 'secondment';
          return (
            <button key={typ.id}
              onClick={() => !disabled && update({ type: typ.id })}
              type="button"
              disabled={disabled}
              title={disabled ? (lang === 'ar' ? 'متاح فقط الندب للدرجة 5 فما فوق' : 'Only secondment is available for grade 5 and above') : undefined}
              style={{
                textAlign: 'start', padding: 'var(--space-4)',
                border: `1.5px solid ${active ? 'var(--color-gold-500)' : 'var(--border-default)'}`,
                background: active ? 'var(--color-gold-50)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.45 : 1,
                display: 'flex', gap: 'var(--space-3)',
                transition: 'all 120ms',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: active ? 'var(--color-gold-200)' : 'var(--color-ink-50)',
                color: active ? 'var(--color-gold-800)' : 'var(--color-ink-700)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Icon name={typ.icon} size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-ink-900)' }}>
                    {lang === 'ar' ? typ.name_ar : typ.name_en}
                  </span>
                  {active && <span style={{ marginInlineStart: 'auto' }}><Icon name="check-circle" size={18} style={{ color: 'var(--color-gold-600)' }}/></span>}
                </div>
                <div className="text-sm text-muted" style={{ lineHeight: 1.5 }}>{t(`type_${typ.id}_desc`)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Alert type="policy" icon="shield">
          <strong>{lang === 'ar' ? 'تذكير سياسي:' : 'Policy reminder:'} </strong>
          {form.type === 'acting' && t('rule_allowance')}
          {form.type === 'secondment' && (lang === 'ar' ? 'التكليف لا يمنح بدلاً منفصلاً؛ يُصرف راتب مربوط الدرجة فقط.' : 'Secondment grants no separate allowance — only the grade salary applies.')}
          {form.type === 'loan' && (lang === 'ar' ? 'الإعارة بلا بدل، وتتطلب اعتماد الوزير لأي تمديد.' : 'Loan carries no allowance and requires Minister approval for any extension.')}
          {form.type === 'borrowing' && t('rule_borrowing_cap')}
        </Alert>
      </div>
    </div>
  );
}

// ============================================================
// Step 2 — Employee selector
// ============================================================
function StepEmployee({ form, update, employee }) {
  const { t, lang } = useI18n();
  const [search, setSearch] = useStateW('');
  const results = useMemoW(() => {
    if (!search) return window.EMPLOYEES.slice(0, 6);
    const s = search.toLowerCase();
    return window.EMPLOYEES.filter(e =>
      e.en.toLowerCase().includes(s) || e.ar.includes(search) || e.id.toLowerCase().includes(s) || e.eid.includes(search)
    );
  }, [search]);

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, margin: '0 0 6px' }}>{t('select_employee_title')}</h2>
      <div className="text-muted mb-4">{t('select_employee_sub')}</div>

      <Field label={lang === 'ar' ? 'بحث' : 'Search'} className="mb-4">
        <InputWithIcon icon="search" placeholder={t('search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
      </Field>

      {/* Selected card */}
      {employee && (
        <div className="card mb-4" style={{ background: 'var(--color-gold-50)', borderColor: 'var(--color-gold-300)' }}>
          <div className="card-body" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <Avatar name={lang === 'ar' ? employee.ar : employee.en} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{lang === 'ar' ? employee.ar : employee.en}</span>
                <span className="badge" style={{ background: 'var(--color-gold-200)', color: 'var(--color-gold-800)' }}><Icon name="check" size={12}/> {lang === 'ar' ? 'محدد' : 'Selected'}</span>
              </div>
              <div className="dl-grid" style={{ gap: '10px var(--space-5)' }}>
                <Datum label={t('current_position')} value={lang === 'ar' ? employee.position_ar : employee.position_en} />
                <Datum label={t('current_entity')}  value={lang === 'ar' ? window.GET_ENTITY(employee.entity).ar : window.GET_ENTITY(employee.entity).en} />
                <Datum label={t('current_grade')}    value={employee.grade} mono />
                <Datum label={t('basic_salary')}     value={window.formatAED(window.GET_GRADE(employee.grade).basic, lang)} />
                <Datum label={lang === 'ar' ? 'الرقم الوظيفي' : 'Employee #'} value={employee.id} mono />
                <Datum label={t('join_date')} value={window.formatDate(employee.joined, lang)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="section-heading">{lang === 'ar' ? 'اختر موظفاً آخر' : 'Choose a different employee'}</div>
      <div className="flex-col" style={{ gap: 6 }}>
        {results.map(emp => {
          const selected = emp.id === form.employeeId;
          return (
            <button key={emp.id} type="button"
              onClick={() => update({ employeeId: emp.id })}
              style={{
                textAlign: 'start', padding: '10px 14px',
                border: `1px solid ${selected ? 'var(--color-gold-400)' : 'var(--border-default)'}`,
                background: selected ? 'var(--color-gold-50)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              }}>
              <Avatar name={lang === 'ar' ? emp.ar : emp.en} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm text-strong">{lang === 'ar' ? emp.ar : emp.en}</div>
                <div className="text-xs text-muted">
                  {lang === 'ar' ? emp.position_ar : emp.position_en} · {lang === 'ar' ? window.GET_ENTITY(emp.entity).ar : window.GET_ENTITY(emp.entity).en}
                </div>
              </div>
              <span className="text-xs text-muted tabular">{t('grade')} {emp.grade}</span>
              {selected && <Icon name="check-circle" size={18} style={{ color: 'var(--color-gold-600)' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Datum({ label, value, mono }) {
  return (
    <div className="dl-item">
      <div className="dl-label">{label}</div>
      <div className="dl-value" style={mono ? { fontVariantNumeric: 'tabular-nums' } : undefined}>{value}</div>
    </div>
  );
}

// ============================================================
// Step 3 — Position & dates
// ============================================================
function StepDetails({ form, update, employee, validation }) {
  const { t, lang } = useI18n();
  const isActing = form.type === 'acting';
  const showGrade = form.type === 'acting';
  const entityLabel = form.type === 'loan'
    ? (lang === 'ar' ? 'الجهة المستقبلة (المُعارة إليها)' : 'Receiving entity (loaned to)')
    : form.type === 'borrowing'
    ? (lang === 'ar' ? 'الجهة المعيرة (المُستعار منها)' : 'Lending entity (borrowed from)')
    : t('target_entity');
  const entityHint = isActing
    ? (lang === 'ar' ? 'الندب داخل نفس الجهة' : 'Acting stays within the same entity')
    : form.type === 'loan'
    ? (lang === 'ar' ? 'الجهة التي يُعار إليها الموظف من جهته الأم' : 'The entity the employee is loaned out to')
    : form.type === 'borrowing'
    ? (lang === 'ar' ? 'الجهة التي يُستعار منها الموظف للعمل لدينا' : 'The entity the employee is borrowed from')
    : null;
  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, margin: '0 0 6px' }}>{t('details_title')}</h2>
      <div className="text-muted mb-5">{lang === 'ar' ? 'حدد المنصب الجديد والإطار الزمني.' : 'Specify the destination role and the assignment window.'}</div>

      <div className={showGrade ? 'grid-2 mb-4' : 'mb-4'}>
        <Field label={entityLabel} required hint={entityHint}>
          {!isActing ? (
            <Combobox
              options={window.ENTITIES.map(ent => ({ value: ent.id, label: lang === 'ar' ? ent.ar : ent.en }))}
              value={form.toEntity}
              onChange={v => update({ toEntity: v })}
              placeholder={lang === 'ar' ? 'ابحث أو اكتب اسم الجهة…' : 'Search or type an entity…'} />
          ) : (
            <Select value={form.toEntity} onChange={e => update({ toEntity: e.target.value })} disabled>
              {window.ENTITIES.map(ent => (
                <option key={ent.id} value={ent.id}>{lang === 'ar' ? ent.ar : ent.en}</option>
              ))}
            </Select>
          )}
        </Field>

        {showGrade && (
          <Field label={t('target_grade')} required
            error={validation.gradeError ? t('err_grade_cap') : null}
            hint={!validation.gradeError ? (lang === 'ar' ? `الحد الأقصى: درجتان فوق الدرجة الحالية (${employee?.grade})` : `Max: 2 grades above current (${employee?.grade})`) : null}>
            <Select value={form.targetGrade} onChange={e => update({ targetGrade: e.target.value })}>
              {window.GRADES.map(g => {
                const cur = window.GRADE_INDEX(employee?.grade);
                const idx = window.GRADE_INDEX(g.id);
                const exceeds = cur >= 0 && idx >= 0 && idx - cur > 2;
                const seniorBlocked = form.type === 'acting' && window.IS_SENIOR_GRADE(g.id);
                const blocked = exceeds || seniorBlocked;
                return <option key={g.id} value={g.id} disabled={blocked}>{g.id}{seniorBlocked ? (lang === 'ar' ? ' (الندب غير متاح)' : ' (acting not allowed)') : exceeds ? (lang === 'ar' ? ' (يتجاوز الحد)' : ' (exceeds limit)') : ''}</option>;
              })}
            </Select>
          </Field>
        )}
      </div>

      <div className="grid-2 mb-4">
        <Field label={t('target_position') + (lang === 'ar' ? ' (إنجليزي)' : ' (English)')} required>
          <Input value={form.targetPosition_en} onChange={e => update({ targetPosition_en: e.target.value })} placeholder="Senior HR Strategy Advisor" />
        </Field>
        <Field label={t('target_position') + (lang === 'ar' ? ' (عربي)' : ' (Arabic)')} required>
          <Input value={form.targetPosition_ar} onChange={e => update({ targetPosition_ar: e.target.value.replace(/[A-Za-z]/g, '') })} placeholder="مستشار أول استراتيجيات الموارد البشرية" dir="rtl" />
        </Field>
      </div>

      {form.type !== 'loan' && (
        <Field label={t('reporting_to')} optional className="mb-4">
          <Combobox
            options={window.EMPLOYEES.map(e => ({ value: lang === 'ar' ? e.ar : e.en, label: lang === 'ar' ? e.ar : e.en }))}
            value={form.reportingTo_en}
            onChange={v => update({ reportingTo_en: v })}
            placeholder={lang === 'ar' ? 'ابحث عن الموظف أو اكتب الاسم…' : 'Search an employee or type a name…'} />
        </Field>
      )}

      <div className="grid-3 mb-4">
        <Field label={t('start_date')} required>
          <Input type="date" value={form.startDate} onChange={e => update({ startDate: e.target.value })} />
        </Field>
        <Field label={t('end_date')} required
          error={validation.dateOrderError ? t('err_end_before_start') : validation.durationError ? t('err_duration_max') : null}>
          <Input type="date" value={form.endDate} onChange={e => update({ endDate: e.target.value })} />
        </Field>
        <Field label={t('duration')}>
          <div style={{ position: 'relative' }}>
            <Input value={validation.duration > 0 ? validation.duration : ''} readOnly style={{ background: 'var(--bg-muted)' }} />
            <span className="input-suffix">{t('days')}</span>
          </div>
        </Field>
      </div>

      <Field label={t('reason')} optional hint={lang === 'ar' ? 'وضح الحاجة العملية وأثرها على الجهة الأم.' : 'Explain the business need and impact on the home entity.'}>
        <Textarea rows="4" value={form.reason} onChange={e => update({ reason: e.target.value })} placeholder={t('reason_ph')} />
      </Field>

      {validation.duration > 60 && form.type === 'acting' && (
        <div className="mt-4">
          <Alert type="success" icon="info">
            <strong>{lang === 'ar' ? 'بدل الندب مفعّل.' : 'Acting allowance unlocked.'} </strong>
            {lang === 'ar' ? 'المدة تتجاوز 60 يوماً، لذا يستحق الموظف بدل ندب بنسبة 25٪ من الحد الأدنى لراتب الدرجة بأثر رجعي من تاريخ البداية، وتتحمله الجهة الأم.' : 'Duration exceeds 60 days, so the employee earns a 25% allowance on the grade\'s minimum salary, paid retroactively from the start date by the home entity.'}
          </Alert>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Step 4 — Compensation
// ============================================================
function StepCompensation({ form, update, employee, targetGradeObj, validation }) {
  const { t, lang } = useI18n();
  const isActing = form.type === 'acting';
  const isExternal = form.type === 'loan' || form.type === 'borrowing';
  const dur = validation.duration;
  const allowanceAmt = Number(form.allowanceAmount) || 0;
  const entitlements = window.GET_ENTITLEMENTS(employee, dur, lang);
  const allowanceNote =
    form.type === 'acting'
      ? (dur > 60
        ? (lang === 'ar' ? '25٪ من الحد الأدنى للدرجة — تتحمله الجهة الأم' : '25% of the grade minimum — paid by the home entity')
        : (lang === 'ar' ? 'المدة أقل من 60 يوماً — لا يُصرف بدل' : 'Under 60 days — no allowance applies'))
      : (lang === 'ar' ? 'التكليف لا يشمل بدلاً منفصلاً' : 'Secondment does not include a separate allowance');
  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, margin: '0 0 6px' }}>{t('compensation_title')}</h2>
      <div className="text-muted mb-5">{form.type === 'borrowing'
        ? (lang === 'ar' ? 'الموظف مُستعار من جهته — تُدار مستحقاته هناك لا لدينا. يمكن تسجيل تعويض استعارة اختياري للعلم فقط.' : 'The employee is borrowed from their entity — their entitlements are managed there, not here. You may record an optional borrowing compensation for our information only.')
        : isExternal
        ? (lang === 'ar' ? 'لا تُحدَّد الدرجة أو الراتب هنا — تُدار من الجهة المعنية. المستحقات الحالية مزامَنة من أوراكل.' : 'Grade and salary are not set here — they are handled by the relevant entity. Existing entitlements are synced from Oracle.')
        : (lang === 'ar' ? 'الراتب والبدل محددان تلقائياً وفقاً لسياسة الموارد البشرية الاتحادية.' : 'Salary and allowance are set automatically per federal HR policy.')}</div>

      {!isExternal && (
        <React.Fragment>
          {isActing && (
            <div className="card mb-5" style={{ background: 'var(--bg-muted)' }}>
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                <Datum label={t('grade')} value={form.targetGrade} mono />
                <Datum label={t('salary_min')} value={window.formatAED(targetGradeObj?.min, lang)} />
                <Datum label={t('salary_max')} value={window.formatAED(targetGradeObj?.max, lang)} />
                <Datum label={t('salary_basic')} value={window.formatAED(targetGradeObj?.basic, lang)} />
              </div>
            </div>
          )}

          <Field label={t('paying_entity')} required className="mb-4" hint={isActing ? (lang === 'ar' ? 'في الندب تتحمل الجهة الأم الراتب والبدل دائماً' : 'For acting, the home entity always covers salary and allowance') : null}>
            <Select value={isActing ? 'home' : form.payingEntity} onChange={e => update({ payingEntity: e.target.value })} disabled={isActing}>
              <option value="home">{lang === 'ar' ? 'الجهة الأم' : 'Home entity'} — {lang === 'ar' ? window.GET_ENTITY(employee?.entity).ar : window.GET_ENTITY(employee?.entity).en}</option>
              <option value="target">{lang === 'ar' ? 'الجهة المستقبلة' : 'Receiving entity'} — {window.ENTITY_LABEL(form.toEntity, lang)}</option>
              <option value="split">{lang === 'ar' ? 'مشترك بين الجهتين' : 'Split between entities'}</option>
            </Select>
          </Field>

          <div className="card mb-4" style={{ borderColor: allowanceAmt > 0 ? 'var(--color-gold-300)' : 'var(--border-default)' }}>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{t('allowance_eligible')}</div>
                  <div className="text-sm text-muted" style={{ marginTop: 2 }}>{allowanceNote}</div>
                </div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: allowanceAmt > 0 ? 'var(--color-gold-800)' : 'var(--color-ink-500)' }}>
                  {allowanceAmt > 0 ? window.formatAED(allowanceAmt, lang) : (lang === 'ar' ? 'لا يوجد' : 'None')}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}

      {form.type === 'loan' && (
        <Field label={lang === 'ar' ? 'الجهة المسؤولة عن الراتب' : 'Entity responsible for salary'} required className="mb-4">
          <Select value={form.payingEntity} onChange={e => update({ payingEntity: e.target.value })}>
            <option value="home">{lang === 'ar' ? 'الجهة الأم' : 'Home entity'} — {lang === 'ar' ? window.GET_ENTITY(employee?.entity).ar : window.GET_ENTITY(employee?.entity).en}</option>
            <option value="target">{lang === 'ar' ? 'الجهة المستقبلة' : 'Receiving entity'} — {window.ENTITY_LABEL(form.toEntity, lang)}</option>
            <option value="split">{lang === 'ar' ? 'مشترك بين الجهتين' : 'Split between entities'}</option>
          </Select>
        </Field>
      )}
      {form.type === 'borrowing' && (
        <Field label={lang === 'ar' ? 'تعويض الاستعارة' : 'Borrowing compensation'} optional className="mb-4"
          error={validation.borrowingAmountError ? t('err_borrowing_amount') : null}
          hint={lang === 'ar' ? 'للعلم فقط — بحد أقصى 10,000 درهم شهرياً' : 'For our records only — capped at AED 10,000 / month'}>
          <div style={{ position: 'relative' }}>
            <Input type="number" max="10000" value={form.allowanceAmount} onChange={e => update({ allowanceAmount: e.target.value })} placeholder={lang === 'ar' ? 'اختياري' : 'Optional'} />
            <span className="input-suffix">{lang === 'ar' ? 'د.إ / شهر' : 'AED / month'}</span>
          </div>
        </Field>
      )}

      {/* Existing entitlements — synced from Oracle (not shown for borrowed staff) */}
      {form.type !== 'borrowing' && (
      <Card
        title={<React.Fragment><Icon name="refresh" size={15} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 6, color: 'var(--color-info-600)' }} />{lang === 'ar' ? 'المستحقات الحالية' : 'Current entitlements'}</React.Fragment>}
        subtitle={lang === 'ar' ? 'مزامنة من أوراكل — تستمر خلال فترة المهمة' : 'Synced from Oracle — they continue during the assignment'}
        className="mb-4">
        <div className="dl-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px var(--space-5)' }}>
          {entitlements.map(en => (
            <div key={en.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-sm text-muted">{lang === 'ar' ? en.label_ar : en.label_en}</span>
              <span className="text-sm text-strong" style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{en.value}</span>
            </div>
          ))}
        </div>
      </Card>
      )}

      {form.type !== 'borrowing' && (
      <Field label={t('other_benefits')} optional>
        <Textarea rows="3" value={form.otherBenefits} onChange={e => update({ otherBenefits: e.target.value })}
          placeholder={lang === 'ar' ? 'تذكرة سفر سنوية، تأمين صحي ممتد، إلخ.' : 'Annual travel ticket, extended health insurance, etc.'} />
      </Field>
      )}
    </div>
  );
}

// ============================================================
// Step 5 — Review
// ============================================================
function StepReview({ form, update, employee, setStep }) {
  const { t, lang } = useI18n();
  const ent = window.GET_ENTITY(form.toEntity);
  const fromEnt = window.GET_ENTITY(employee?.entity);
  const dur = window.daysBetween(form.startDate, form.endDate);
  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, margin: '0 0 6px' }}>{t('review_title')}</h2>
      <div className="text-muted mb-5">{t('review_sub')}</div>

      <ReviewSection title={t('step_type')} onEdit={() => setStep(0)}>
        <div className="flex items-center gap-3">
          <TypeBadge type={form.type} />
          <span className="text-sm text-muted">{t(`type_${form.type}_desc`)}</span>
        </div>
      </ReviewSection>

      <ReviewSection title={t('step_employee')} onEdit={() => setStep(1)}>
        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
          <Avatar name={lang === 'ar' ? employee.ar : employee.en} />
          <div>
            <div className="text-strong">{lang === 'ar' ? employee.ar : employee.en}</div>
            <div className="text-sm text-muted">{lang === 'ar' ? employee.position_ar : employee.position_en} · {lang === 'ar' ? fromEnt.ar : fromEnt.en} · {t('grade')} {employee.grade}</div>
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title={t('step_details')} onEdit={() => setStep(2)}>
        <div className="dl-grid">
          <Datum label={form.type === 'loan' ? (lang === 'ar' ? 'الجهة المستقبلة (المُعارة إليها)' : 'Receiving entity (loaned to)') : form.type === 'borrowing' ? (lang === 'ar' ? 'الجهة المعيرة (المُستعار منها)' : 'Lending entity (borrowed from)') : t('target_entity')} value={window.ENTITY_LABEL(form.toEntity, lang)} />
          <Datum label={t('target_position')} value={lang === 'ar' ? (form.targetPosition_ar || '—') : (form.targetPosition_en || '—')} />
          {form.type === 'acting' && <Datum label={t('target_grade')} value={form.targetGrade} mono />}
          <Datum label={t('duration')} value={`${dur} ${t('days')}`} mono />
          <Datum label={t('start_date')} value={window.formatDate(form.startDate, lang)} />
          <Datum label={t('end_date')} value={window.formatDate(form.endDate, lang)} />
        </div>
        {form.reason && <div className="mt-3 text-sm" style={{ padding: '10px 12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>{form.reason}</div>}
      </ReviewSection>

      <ReviewSection title={t('compensation_title')} onEdit={() => setStep(3)}>
        <div className="dl-grid">
          {form.type !== 'borrowing' && <Datum label={form.type === 'loan' ? (lang === 'ar' ? 'الجهة المسؤولة عن الراتب' : 'Entity responsible for salary') : t('paying_entity')} value={form.payingEntity === 'home' ? (lang === 'ar' ? fromEnt.ar : fromEnt.en) : form.payingEntity === 'target' ? window.ENTITY_LABEL(form.toEntity, lang) : (lang === 'ar' ? 'مشترك' : 'Split')} />}
          {(form.type === 'acting' || form.type === 'borrowing') && <Datum label={form.type === 'borrowing' ? (lang === 'ar' ? 'تعويض الاستعارة' : 'Borrowing compensation') : t('allowance_amount')}
            value={Number(form.allowanceAmount) > 0 ? window.formatAED(form.allowanceAmount, lang) : (lang === 'ar' ? 'لا يوجد' : 'None')} />}
        </div>
      </ReviewSection>

      <ReviewSection title={t('attachments')}>
        <div className="flex-col" style={{ gap: 8 }}>
          {/* Mandatory decree — required for every assignment before submission */}
          {form.decreeAttached ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--color-success-50)', border: '1px solid var(--color-success-100)', borderRadius: 'var(--radius-md)' }}>
              <Icon name="file" size={16} style={{ color: 'var(--color-success-600)' }} />
              <div style={{ flex: 1 }}>
                <div className="text-sm text-strong">{(form.type === 'loan' || form.type === 'borrowing') ? (lang === 'ar' ? 'مرسوم الوزير الموقّع.pdf' : 'Minister_Decree_Signed.pdf') : (lang === 'ar' ? 'قرار التكليف الموقّع.pdf' : 'Signed_Decree.pdf')}</div>
                <div className="text-xs text-muted">{lang === 'ar' ? 'مرفق — إلزامي' : 'Attached — required'}</div>
              </div>
              <Icon name="check-circle" size={16} style={{ color: 'var(--color-success-600)' }} />
              <Button size="sm" variant="ghost" icon="x" aria-label={lang === 'ar' ? 'إزالة' : 'Remove'} onClick={() => update({ decreeAttached: false })} />
            </div>
          ) : (
            <div onClick={() => update({ decreeAttached: true })} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1.5px dashed var(--color-gold-400)', background: 'var(--color-gold-50)', borderRadius: 'var(--radius-md)' }}>
              <Icon name="upload" size={16} style={{ color: 'var(--color-gold-700)' }} />
              <div style={{ flex: 1 }}>
                <div className="text-sm text-strong">
                  {(form.type === 'loan' || form.type === 'borrowing') ? (lang === 'ar' ? 'إرفاق مرسوم الوزير الموقّع' : 'Attach the Minister\'s signed decree') : (lang === 'ar' ? 'إرفاق قرار التكليف الموقّع' : 'Attach the signed assignment decree')}
                  <span style={{ color: 'var(--color-danger-600)' }}> *</span>
                </div>
                <div className="text-xs text-muted">{lang === 'ar' ? 'إلزامي لكل المهام قبل الإرسال' : 'Required for every assignment before submission'}</div>
              </div>
              <Button size="sm" onClick={e => { e.stopPropagation(); update({ decreeAttached: true }); }}>{lang === 'ar' ? 'تصفح' : 'Browse'}</Button>
            </div>
          )}

          {form.attachments.map((att, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <Icon name="file" size={16} style={{ color: 'var(--color-info-600)' }} />
              <span className="text-sm text-strong" style={{ flex: 1 }}>{att.name}</span>
              <span className="text-xs text-muted">{att.size}</span>
              <Button size="sm" variant="ghost" icon="eye" aria-label={t('view')} />
            </div>
          ))}
          <button type="button" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-md)',
            background: 'transparent', color: 'var(--color-ink-600)', cursor: 'pointer',
            fontSize: 'var(--text-sm)', fontFamily: 'inherit',
          }}>
            <Icon name="upload" size={14} />
            {t('add_attachment')}
          </button>
          <div className="text-xs text-muted">{t('attachments_hint')}</div>
        </div>
      </ReviewSection>

      <Alert type="info" icon="info">
        <strong>{lang === 'ar' ? 'ماذا يحدث بعد ذلك؟ ' : 'What happens next? '}</strong>
        {lang === 'ar' ? 'بالنقر على "إرسال للاعتماد"، سيتم إرسال الطلب إلى المدير المباشر للموظف. ستتلقى إشعاراً عند كل خطوة.' : 'Clicking "Submit for approval" sends this to the employee\'s line manager. You\'ll receive a notification at every step.'}
      </Alert>
    </div>
  );
}

function ReviewSection({ title, children, onEdit }) {
  const { t } = useI18n();
  return (
    <div style={{ paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
        <h3 className="section-heading" style={{ margin: 0, border: 0, padding: 0 }}>{title}</h3>
        {onEdit && <Button variant="ghost" size="sm" icon="edit" onClick={onEdit}>{t('edit')}</Button>}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Right rail — Policy summary (live)
// ============================================================
function PolicyRail({ form, employee, targetGradeObj, validation }) {
  const { t, lang } = useI18n();
  const dur = validation.duration;
  const checks = [
    {
      id: 'grade',
      pass: !validation.gradeError,
      title: lang === 'ar' ? 'حد الدرجات' : 'Grade ceiling',
      body: validation.gradeError
        ? t('err_grade_cap')
        : (lang === 'ar' ? `الدرجة ${form.targetGrade} ضمن الحدود المسموحة` : `${form.targetGrade} is within the +2 limit`),
    },
    {
      id: 'duration',
      pass: !validation.durationError && !validation.dateOrderError && dur > 0,
      title: lang === 'ar' ? 'المدة' : 'Duration',
      body: validation.dateOrderError
        ? t('err_end_before_start')
        : validation.durationError
        ? t('err_duration_max')
        : dur > 0
        ? (lang === 'ar' ? `${dur} يوم — ضمن الحد 365` : `${dur} days — within the 365-day limit`)
        : (lang === 'ar' ? 'لم يتم تحديد التواريخ' : 'Dates not set'),
    },
    {
      id: 'allowance',
      pass: true,
      info: true,
      title: lang === 'ar' ? 'استحقاق البدل' : 'Allowance eligibility',
      body: form.type === 'acting'
        ? (dur > 60
          ? (lang === 'ar' ? `25٪ × ${window.formatAED(targetGradeObj?.min, lang)} = ${window.formatAED(Math.round((targetGradeObj?.min || 0) * 0.25), lang)}/شهر — الجهة الأم` : `25% × ${window.formatAED(targetGradeObj?.min, lang)} = ${window.formatAED(Math.round((targetGradeObj?.min || 0) * 0.25), lang)}/mo — home entity`)
          : (lang === 'ar' ? 'تتجاوز 60 يوماً لتفعيل البدل' : 'Exceed 60 days to unlock the allowance'))
        : form.type === 'borrowing'
        ? (lang === 'ar' ? 'تعويض اختياري — حد أقصى 10,000 د.إ/شهر' : 'Optional compensation — capped at AED 10,000/mo')
        : form.type === 'secondment'
        ? (lang === 'ar' ? 'لا يُصرف بدل منفصل' : 'No separate allowance')
        : (lang === 'ar' ? 'الإعارة بلا بدل' : 'No allowance for loans'),
    },
    {
      id: 'reminders',
      pass: true, info: true,
      title: lang === 'ar' ? 'التذكيرات' : 'Reminders',
      body: t('rule_reminders'),
    },
  ];

  return (
    <Card title={<><Icon name="shield" size={16} style={{ display: 'inline', marginInlineEnd: 6, verticalAlign: 'middle', color: 'var(--color-gold-600)' }}/>{t('policy_summary')}</>}
      subtitle={lang === 'ar' ? 'تتحقق هذه القواعد تلقائياً عند ملء النموذج' : 'These rules validate live as you fill the form'}>
      <div className="flex-col" style={{ gap: 'var(--space-3)' }}>
        {checks.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10 }}>
            <div style={{ paddingTop: 1 }}>
              {c.info
                ? <Icon name="info" size={16} style={{ color: 'var(--color-info-600)' }} />
                : c.pass
                ? <Icon name="check-circle" size={16} style={{ color: 'var(--color-success-600)' }} />
                : <Icon name="alert" size={16} style={{ color: 'var(--color-danger-600)' }} />}
            </div>
            <div>
              <div className="text-sm text-strong" style={{ marginBottom: 2 }}>{c.title}</div>
              <div className="text-xs text-muted" style={{ lineHeight: 1.5 }}>{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// Right rail — Approval path
// ============================================================
function ApprovalPathRail({ type }) {
  const { t, lang } = useI18n();
  const needsMinister = type === 'loan' || type === 'borrowing';
  const steps = [
    { key: 'lm', label: t('approver_lm') },
    { key: 'hr', label: t('approver_hr') },
    { key: 'entity_head', label: t('approver_entity_head') },
    ...(needsMinister ? [{ key: 'minister', label: lang === 'ar' ? 'مرسوم الوزير' : 'Minister\'s decree', special: true }] : []),
  ];
  return (
    <Card title={t('approval_path')} subtitle={lang === 'ar' ? `${steps.length} مستويات` : `${steps.length} levels`}>
      <div className="flex-col" style={{ gap: 'var(--space-2)' }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: s.special ? 'var(--color-gold-500)' : 'var(--color-ink-100)',
              color: s.special ? 'var(--color-ink-900)' : 'var(--color-ink-700)',
              display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0,
            }}>{i + 1}</div>
            <div className="flex-1">
              <div className="text-sm text-strong">{s.label}</div>
              {s.special && <div className="text-xs" style={{ color: 'var(--color-gold-700)' }}>{lang === 'ar' ? 'تُرفقه الموارد البشرية — لا اعتماد على النظام' : 'Attached by HR — no in-system approval'}</div>}
            </div>
            {i === 0 && <span className="badge badge-pending" style={{ fontSize: 10 }}>{t('awaiting_you')}</span>}
          </div>
        ))}
      </div>
    </Card>
  );
}

Object.assign(window, { Wizard });
