export const ROLES = [
  {
    id: 'hr_specialist',
    label: { en: 'HR Specialist', ar: 'أخصائي موارد بشرية' },
    description: { en: 'Initiates assignment requests on behalf of MOCA.', ar: 'يُنشئ طلبات المهام نيابةً عن الوزارة.' },
    canCreate: true,
  },
  {
    id: 'hr_decree',
    label: { en: 'HR Decree Officer', ar: 'موظف المراسيم — موارد بشرية' },
    description: { en: 'Drafts and attaches the official decree for each request.', ar: 'يُعد المرسوم الرسمي ويرفقه بكل طلب.' },
    canCreate: true,
  },
  {
    id: 'hr_director',
    label: { en: 'HR Director', ar: 'مدير الموارد البشرية' },
    description: { en: 'Approves the request after the decree is attached.', ar: 'يعتمد الطلب بعد إرفاق المرسوم.' },
    canCreate: true,
  },
  {
    id: 'css_sector_head',
    label: { en: 'CSS Sector Head', ar: 'رئيس قطاع الخدمات المشتركة' },
    description: { en: 'Final approver & signatory for acting and secondment requests.', ar: 'المعتمد الأخير والموقّع على طلبات التكليف والندب.' },
  },
  {
    id: 'entity_head',
    label: { en: 'Entity Head', ar: 'رئيس الجهة' },
    description: { en: 'Final signatory for loan and borrowing requests.', ar: 'الموقّع الأخير على طلبات الإعارة والاستعارة.' },
  },
  {
    id: 'minister',
    label: { en: 'Minister', ar: 'الوزير' },
    description: { en: 'Signs the decree required to extend a loan or borrowing (out-of-system).', ar: 'يوقع المرسوم اللازم لتمديد الإعارة والاستعارة (خارج النظام).' },
  },
];

export const ROLE_MAP = Object.fromEntries(ROLES.map(r => [r.id, r]));

export const HR_ROLES = ['hr_specialist', 'hr_decree', 'hr_director'];

export const DEMO_PEOPLE = {
  hr_specialist: { en: 'Mariam Al Mansoori', ar: 'مريم المنصوري' },
  hr_decree: { en: 'Aisha Al Hosani', ar: 'عائشة الحوسني' },
  hr_director: { en: 'Dr. Saeed Al Tayer', ar: 'د. سعيد الطاير' },
  css_sector_head: { en: 'Khalifa Al Falasi', ar: 'خليفة الفلاسي' },
  entity_head: { en: 'H.E. Mohammed Al Hashimi', ar: 'سعادة محمد الهاشمي' },
  minister: { en: 'H.E. The Minister of Culture', ar: 'معالي وزير الثقافة' },
};

export function getFirstName(role, lang) {
  const p = DEMO_PEOPLE[role];
  if (!p) return '';
  const full = lang === 'ar' ? p.ar : p.en;
  const cleaned = full.replace(/^(H\.E\.|Dr\.|سعادة|معالي|د\.)\s+/, '');
  return cleaned.split(' ')[0];
}

export function getApprovalChain(type) {
  const final = (type === 'loan' || type === 'borrowing') ? 'entity_head' : 'css_sector_head';
  return ['hr_specialist', 'hr_decree', 'hr_director', final];
}

function shiftDays(iso, deltaDays) {
  const d = new Date(iso);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

function decreeNumber(assignment) {
  const yearMatch = assignment.id.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : '2026';
  const num = assignment.id.split('-').pop();
  return `MOCA/${year}/${num}`;
}

const SUBMIT_COMMENT = {
  en: 'Submitted following coordination with both entities. Employee consent attached.',
  ar: 'قُدّم بعد التنسيق مع الجهتين. مرفق خطاب موافقة الموظف.',
};

const DECREE_COMMENT = (assignment) => ({
  en: `Drafted Decree No. ${decreeNumber(assignment)} and attached. Cross-referenced with Federal HR Law.`,
  ar: `تم إعداد المرسوم رقم ${decreeNumber(assignment)} وإرفاقه. تمت المطابقة مع قانون الموارد البشرية الاتحادي.`,
});

const DIRECTOR_APPROVE_COMMENT = {
  en: 'Reviewed and approved. Forwarded for final signature.',
  ar: 'تمت المراجعة والاعتماد. أُحيل للتوقيع النهائي.',
};

export function buildTimeline(assignment) {
  const chain = getApprovalChain(assignment.type);
  const progress = getChainProgress(assignment);
  const doneCount = progress.filter(p => p.status === 'done').length;
  const anchor = assignment.updatedAt;

  return chain.map((roleId, i) => {
    const status = progress[i].status;
    const person = DEMO_PEOPLE[roleId] || { en: '—', ar: '—' };
    const role = ROLE_MAP[roleId];
    const isFinal = i === chain.length - 1;

    let timestamp = null;
    if (status === 'done') {
      const daysBack = (doneCount - 1 - i);
      timestamp = shiftDays(anchor, -daysBack);
    } else if (status === 'rejected') {
      timestamp = anchor;
    }

    let comment_en = null;
    let comment_ar = null;
    if (status === 'done' && roleId === 'hr_specialist') {
      comment_en = SUBMIT_COMMENT.en;
      comment_ar = SUBMIT_COMMENT.ar;
    } else if (status === 'done' && roleId === 'hr_decree') {
      const c = DECREE_COMMENT(assignment);
      comment_en = c.en;
      comment_ar = c.ar;
    } else if (status === 'done' && roleId === 'hr_director') {
      comment_en = DIRECTOR_APPROVE_COMMENT.en;
      comment_ar = DIRECTOR_APPROVE_COMMENT.ar;
    } else if (status === 'rejected') {
      comment_en = assignment.rejection_en || null;
      comment_ar = assignment.rejection_ar || null;
    }

    const roleSuffixEn = isFinal ? ' — Final approval & signature' : '';
    const roleSuffixAr = isFinal ? ' — الاعتماد والتوقيع النهائي' : '';

    return {
      role: roleId,
      name_en: person.en,
      name_ar: person.ar,
      role_en: role.label.en + roleSuffixEn,
      role_ar: role.label.ar + roleSuffixAr,
      status,
      timestamp,
      comment_en,
      comment_ar,
    };
  });
}

export function getChainProgress(assignment) {
  const chain = getApprovalChain(assignment.type);
  if (assignment.status === 'active' || assignment.status === 'expired') {
    return chain.map(r => ({ role: r, status: 'done' }));
  }
  if (assignment.status === 'rejected') {
    const idx = chain.indexOf(assignment.awaitingApprover);
    return chain.map((r, i) => ({
      role: r,
      status: idx === -1 || i < idx ? 'done' : i === idx ? 'rejected' : 'pending',
    }));
  }
  if (assignment.status === 'pending') {
    const idx = chain.indexOf(assignment.awaitingApprover);
    return chain.map((r, i) => ({
      role: r,
      status: idx === -1 ? 'pending' : i < idx ? 'done' : i === idx ? 'active' : 'pending',
    }));
  }
  return chain.map(r => ({ role: r, status: 'pending' }));
}
