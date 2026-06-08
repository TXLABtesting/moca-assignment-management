import React, {
  useState, useEffect, useRef, useMemo, useContext, createContext,
} from 'react';

// ============================================================
// i18n context
// ============================================================
export const I18nContext = createContext({ lang: 'en', t: (k) => k, setLang: () => {} });
export const useI18n = () => useContext(I18nContext);

// ============================================================
// Icons — minimal feather-style strokes
// ============================================================
export function Icon({ name, size = 16, className = '', ...rest }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', className: `icon ${className}`, ...rest };
  const paths = {
    'dashboard': <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
    'list': <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    'plus': <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    'clock': <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>,
    'alert': <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    'archive': <><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></>,
    'users': <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    'book': <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    'chart': <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    'settings': <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    'search': <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    'bell': <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    'help': <><circle cx="12" cy="12" r="9" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    'chevron-down': <polyline points="6 9 12 15 18 9" />,
    'chevron-right': <polyline points="9 6 15 12 9 18" />,
    'chevron-left': <polyline points="15 6 9 12 15 18" />,
    'arrow-right': <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    'arrow-left': <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    'check': <polyline points="20 6 9 17 4 12" />,
    'check-circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    'x': <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    'x-circle': <><circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
    'info': <><circle cx="12" cy="12" r="9" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    'calendar': <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    'download': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    'upload': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    'paperclip': <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />,
    'edit': <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    'eye': <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    'more': <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
    'trash': <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></>,
    'filter': <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    'briefcase': <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
    'building': <><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><line x1="9" y1="9" x2="9" y2="9.01" /><line x1="9" y1="12" x2="9" y2="12.01" /><line x1="9" y1="15" x2="9" y2="15.01" /><line x1="9" y1="18" x2="9" y2="18.01" /></>,
    'file': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
    'send': <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    'shield': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    'message': <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    'flag': <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
    'arrow-up': <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
    'arrow-down': <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
    'arrow-right-circle': <><circle cx="12" cy="12" r="9" /><polyline points="12 8 16 12 12 16" /><line x1="8" y1="12" x2="16" y2="12" /></>,
    'globe': <><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18z" /></>,
    'refresh': <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>,
    'minus': <line x1="5" y1="12" x2="19" y2="12" />,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
}

// ============================================================
// Button
// ============================================================
export function Button({ variant = 'secondary', size, icon, iconAfter, children, className = '', ...rest }) {
  const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={size === 'sm' ? 14 : 16} className="icon-flip" />}
    </button>
  );
}

// ============================================================
// Field wrappers
// ============================================================
export function Field({ label, hint, error, required, optional, children, className = '' }) {
  const { t } = useI18n();
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label &&
        <label className="field-label">
          {label}
          {required && <span className="required">*</span>}
          {optional && <span className="optional">· {t('optional')}</span>}
        </label>
      }
      {children}
      {error && <div className="field-error"><Icon name="alert" size={12} /> {error}</div>}
      {hint && !error && <div className="field-hint">{hint}</div>}
    </div>
  );
}

export function Input(props) { return <input className="input" {...props} />; }
export function Textarea(props) { return <textarea className="textarea" {...props} />; }
export function Select({ children, ...rest }) { return <select className="select" {...rest}>{children}</select>; }

export function InputWithIcon({ icon, suffix, ...rest }) {
  return (
    <div className="input-with-icon">
      {icon && <Icon name={icon} size={16} className="leading-icon" />}
      <input className="input" {...rest} />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </div>
  );
}

export function Combobox({ options, value, onChange, placeholder, disabled }) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected ? selected.label : value || '';
  const q = query.trim().toLowerCase();
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q));
  const showCustom = query.trim() && !options.some((o) => o.label.toLowerCase() === q);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const choose = (v) => { onChange(v); setOpen(false); setQuery(''); };

  return (
    <div className="combobox" ref={ref} style={{ position: 'relative' }}>
      <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.6 : 1 }}
        onClick={() => !disabled && setOpen(true)}>
        <input
          style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: 'inherit', minWidth: 0 }}
          value={open ? query : selectedLabel}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => !disabled && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled} />
        <Icon name="chevron-down" size={14} style={{ color: 'var(--color-ink-500)', flexShrink: 0 }} />
      </div>
      {open && !disabled &&
        <div className="combobox-menu" style={{ position: 'absolute', insetInlineStart: 0, insetInlineEnd: 0, top: 'calc(100% + 4px)', zIndex: 60, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto', padding: 4 }}>
          {filtered.map((o) =>
            <div key={o.value} onMouseDown={(e) => { e.preventDefault(); choose(o.value); }}
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--text-sm)', background: o.value === value ? 'var(--color-gold-50)' : 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.background = o.value === value ? 'var(--color-gold-50)' : 'transparent'}>
              {o.label}
            </div>
          )}
          {filtered.length === 0 && !showCustom &&
            <div style={{ padding: '8px 10px', fontSize: 'var(--text-sm)', color: 'var(--color-ink-500)' }}>{lang === 'ar' ? 'لا نتائج' : 'No matches'}</div>
          }
          {showCustom &&
            <div onMouseDown={(e) => { e.preventDefault(); choose(query.trim()); }}
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--text-sm)', borderTop: filtered.length ? '1px solid var(--border-subtle)' : 0, marginTop: filtered.length ? 4 : 0, display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Icon name="plus" size={13} style={{ color: 'var(--color-gold-600)' }} />
              {lang === 'ar' ? `استخدام "${query.trim()}"` : `Use "${query.trim()}"`}
            </div>
          }
        </div>
      }
    </div>
  );
}

// ============================================================
// Badge
// ============================================================
export function StatusBadge({ status }) {
  const { t } = useI18n();
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot" />
      {t(`status_${status}`)}
    </span>
  );
}

export function TypeBadge({ type }) {
  const { t } = useI18n();
  return <span className={`badge badge-type-${type}`}>{t(`type_${type}`)}</span>;
}

// ============================================================
// Avatar
// ============================================================
export function Avatar({ name, size = 'md' }) {
  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.replace(/^د\.\s*/, '').split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  }, [name]);
  const palette = ['#F5ECCF', '#EBD8A0', '#DCBE6A', '#C8DCEF', '#C7E4D1', '#EFE6F7', '#FCE9DC'];
  const hash = useMemo(() => {
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) h = (h << 5) - h + name.charCodeAt(i);
    return Math.abs(h);
  }, [name]);
  const bg = palette[hash % palette.length];
  return <div className={`avatar avatar-${size}`} style={{ background: bg }}>{initials.toUpperCase()}</div>;
}

// ============================================================
// Alert
// ============================================================
export function Alert({ type = 'info', title, children, icon }) {
  const defaultIcons = { success: 'check-circle', warning: 'alert', danger: 'x-circle', info: 'info', policy: 'shield' };
  return (
    <div className={`alert alert-${type}`}>
      <Icon name={icon || defaultIcons[type] || 'info'} />
      <div className="alert-body">
        {title && <div className="alert-title">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// Card
// ============================================================
export function Card({ title, subtitle, actions, children, footer, className = '', noBody = false }) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) &&
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="flex gap-2 items-center">{actions}</div>}
        </div>
      }
      {!noBody ? <div className="card-body">{children}</div> : children}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// ============================================================
// Modal
// ============================================================
export function Modal({ open, onClose, title, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={width ? { width } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <Button variant="ghost" size="sm" icon="x" onClick={onClose} aria-label="Close" />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================================
// Toast manager
// ============================================================
const ToastContext = createContext({ push: () => {} });
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (msg, type = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) =>
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <Icon name="check-circle" />}
            {t.type === 'danger' && <Icon name="x-circle" />}
            {t.msg}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

// ============================================================
// Datum — definition-list item used in wizard, detail, extension
// ============================================================
export function Datum({ label, value, mono }) {
  return (
    <div className="dl-item">
      <div className="dl-label">{label}</div>
      <div className="dl-value" style={mono ? { fontVariantNumeric: 'tabular-nums' } : undefined}>{value}</div>
    </div>
  );
}

// ============================================================
// StatCard — KPI tile used in dashboard and reports
// ============================================================
export function StatCard({ label, value, meta, dir, accent, onClick, active }) {
  const baseBorder = active ? 'var(--color-gold-500)' : accent ? 'var(--color-gold-300)' : 'var(--border-default)';
  const tinted = accent || active;
  return (
    <div className="stat-card" onClick={onClick}
      style={{ ...(tinted ? { borderColor: baseBorder, background: 'var(--color-gold-50)' } : {}), boxShadow: active ? 'var(--shadow-sm)' : undefined, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 120ms, box-shadow 120ms' }}
      onMouseEnter={onClick ? (e) => { e.currentTarget.style.borderColor = 'var(--color-gold-400)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } : undefined}
      onMouseLeave={onClick ? (e) => { e.currentTarget.style.borderColor = baseBorder; e.currentTarget.style.boxShadow = active ? 'var(--shadow-sm)' : 'var(--shadow-xs)'; } : undefined}>
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
    </div>
  );
}
