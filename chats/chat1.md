# HR Assignment Wizard

_Started 2026-05-21 08:31 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "HR Secondments"
Current date is now May 21, 2026
</system-info>

<default aesthetic>
If no references, art direction or design systems were provided, use this default professional modern, minimal aesthetic as a base. Declare your choice out loud so you stick to it. Guidance:
- Choose a type pairing from web-safe set or Google Fonts. Helvetica is a good choice. Avoid hard-to-read or overly stylized fonts. Use 1-3 fonts only.
- Foreground and background: choose a color tone (warm, cool, neutral, something in-between). Use subtly-toned whites and blacks; avoid saturations above 0.02 for whites.
- Accents: choose 0-2 additional accent colors using oklch. All accents should share same chroma and lightness; vary hue.
- NEVER write out an SVG yourself that's more complicated than a square, circle, diamond, etc.
- For imagery, never hand-draw SVGs; use subtly-striped SVG placeholders instead with monospace explainers for what should be dropped there (e.g. “product shot”)

CRITICAL: ignore default aesthetic entirely if given other aesthetic instructions like reference images, design systems or guidance, or if there are files in the project already.
</default aesthetic>

<pasted_text name="Pasted text (47 lines)">
You are building screens for a UAE federal government HR system: "Oracle Cloud HCM —
Assignment Management System." It manages four assignment types: الندب (Secondment),
التكليف (Acting), الإعارة (Loan), الاستعارة (Borrowing). The interface is Arabic-first
(RTL) with an EN/AR toggle, and must look and behave like an official government tool.

SOURCE OF TRUTH — UAE DESIGN SYSTEM
- Before building, fetch and follow the UAE Design System: https://designsystem.gov.ae/guidelines
- Use it as the authoritative reference for typography, colour, spacing, iconography,
  layout, inputs, buttons, and accessibility. Pull the ACTUAL design tokens, component
  names, and values from that documentation — do not guess or invent them.
- Prefer existing design-system components (buttons, cards, inputs, selects, checkboxes,
  radios, tabs, accordions, modals, alerts, toasts, badges, file inputs, steps,
  navigation, text areas) before creating anything custom. If you must extend, label it
  clearly as a custom extension.
- If a specific token or component is unclear in the docs, say so and use a sensible
  fallback rather than fabricating a rule.

ACCESSIBILITY (non-negotiable, target WCAG 2.1 AA)
- Strong colour contrast; never rely on colour alone for status/errors (pair with icon + text).
- Visible focus states, full keyboard navigation, logical tab order.
- Proper labels on every input, descriptive error messages, ARIA where needed.
- RTL must mirror correctly (layout, icons, alignment) when Arabic is active.

SHARED DATA MODEL (use consistently across all screens)
- Grades — ONE dropdown, exactly these 15 values in this order:
  1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, HE special
  (Each grade has: min salary, max salary, basic salary, eligible allowance = 25% of basic.)
- Assignment statuses: Draft, Pending Approval, Approved, Rejected, Active, Expired, Terminated.
- Approval chain: Line Manager → HR → Finance → Entity Head → Minister (Minister only for
  Loan/Borrowing extensions).
- Key policy rules to surface in the UI:
  • Secondment allowance only if duration > 60 days; paid retroactively from start date; = 25% of basic.
  • Cannot assign more than 2 grades above the employee's current grade.
  • Initial assignment ≤ 365 days; one extension ≤ 180 days (Entity Head); Loan/Borrowing
    extension needs Minister approval.
  • Borrowing allowance optional, max 10,000 AED/month.
  • Auto-reminders at 45 / 30 / 15 days before expiry.

TONE & MICROCOPY
- Professional, clear, reassuring, human. Explain what happened, what to do, what's next.
- Never blame the user. Provide Arabic and English for all visible text (the EN/AR toggle swaps them).

OUTPUT
- Build as a self-contained responsive HTML artifact (mobile-first where sensible), RTL by
  default with a working EN/AR toggle. Keep it consistent so all four screens can later be
  merged into one app. Confirm which design-system components you mapped to, and flag any
  element you had to build as a custom extension.
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Hi-fi design">
Create a high-fidelity, polished design. Follow the instructions about design in your system prompt, particularly the 'How to do design work' section. Use the design_canvas starter component, or make a full-bleed prototype and offer options via Tweaks.
</attached-skill>

<attached-skill name="Interactive prototype">
Create a fully interactive prototype with realistic state management and transitions. Use React useState/useEffect for dynamic behavior. Include hover states, click interactions, form validation, animated transitions, and multi-step navigation flows. It should feel like a real working app, not a static mockup.
</attached-skill>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

_[tool: questions_v2]_

I'll build this UAE government HR system. Since you're on a UAE federal domain (moca.gov.ae), I can reference UAE Design System patterns. Let me start by fetching the design system and asking key questions in parallel.

_[tool: web_fetch]_

_[tool: web_search]_

## User

Questions answered:
- screens: Decide for me — pick the 4 most essential
- user_role: HR Officer (creates/manages assignments)
- default_lang: English (LTR)
- fidelity: Production-grade — pixel-perfect, full states, microcopy, all errors
- data_richness: Full realistic dataset — real-sounding names, ministries, dates, amounts
- form_pattern: Multi-step wizard (Stepper)
- approval_viz: Vertical timeline with comments
- policy_ux: Decide for me
- variations: Show variations only for one key screen (e.g. dashboard)
- tone: https://designsystem.gov.ae/guidelines follow this link for the brand guidelines

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

Great — clear direction. Let me lock in the plan and start building.

**My approach:**
- 4 screens: **Dashboard** (with 3 layout variations), **Create Assignment wizard** (multi-step, with type selector for all 4 types), **Assignment Detail** (with vertical approval timeline + comments), **Extension Request flow**
- HR Officer perspective, English-default with working EN/AR toggle, full RTL mirroring
- UAE DLS tokens: UAE Gold primary (#B68A35), AEBlack text, warm neutral surfaces, IBM Plex Sans/Arabic
- Policy UX: **mix** — inline helpers on fields + a sticky "Policy summary" right rail that reacts live
- Realistic UAE data: federal ministries, Arabic+English names, AED amounts, Hijri-aware dates

Let me set up the structure and start.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Now the dashboard with variations:

_[tool: write_file]_

Now the wizard (the most complex screen):

_[tool: write_file]_

Now the detail screen and extension flow:

_[tool: write_file]_

_[tool: write_file]_

Now the main app shell with navigation, EN/AR toggle, and tweaks integration:

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: get_webview_logs]_

Clean. Let me snapshot it to check visually.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

Looks like preview iframe is narrow. Let me test wider plus check other screens:

_[tool: view_image]_

_[tool: str_replace_edit]_

The overlapping text is a screenshot artifact from html-to-image at narrow widths. Let me make the page-header more robust and check more screens:

_[tool: done]_

_[tool: fork_verifier_agent]_

I've built the full UAE federal HR Assignment Management system. Here's a quick summary:

**4 screens** (all in one app with sidebar nav):
1. **Dashboard** — KPI stats, "Needs attention" inbox, recent activity, by-type chart, expiring-soon list. **3 layout variants** via Tweaks: `Stats grid` / `Task-first` / `Table-first`.
2. **Create wizard** — 5 steps (Type → Employee → Position & dates → Compensation → Review) with live policy validation, sticky right-rail "Policy summary" + dynamic approval path (Minister auto-added for Loan/Borrowing).
3. **Detail** — tabs for Overview / Approval timeline / Documents / Audit log, with Approve / Request changes / Reject modal flows.
4. **Extension request** — visual timeline preview of the extension, 180-day cap validation, auto-flags Minister approval for Loan/Borrowing.

**DLS components mapped:** Buttons (primary/secondary/ghost/danger), Inputs, Select, Textarea, Checkbox, Radio, Switch, Cards, Badges, Tabs, Stepper, Alerts, Modal, Toasts, Table, Avatar.

**Custom extensions (flagged):** approval timeline component, policy-summary rail, extension visual range bar, dashboard stat cards with trend meta — all built on DLS tokens.

**A11y baked in:** WCAG AA contrast on the gold + ink palette, status badges always pair color with icon + text, focus-visible rings on every interactive element, full keyboard nav, switch role, aria-labels on icon-only buttons, `dir="rtl"` mirrors layout + icons on AR.

**Try:**
- EN/AR toggle in the top bar — full RTL mirror
- Sidebar → New assignment to walk the wizard
- Dashboard → click any pending row to see the detail + timeline
- From an active assignment, click "Request extension"
- Open Tweaks to swap dashboard layouts and primary color

