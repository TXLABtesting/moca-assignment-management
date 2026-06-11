# Implementation notes — MOCA Assignment Management

This document tracks the feedback received from the MOCA review team
(June 2026), what was changed in the demo, and what needs to be
implemented by the platform team — whether the production build runs on
Oracle APEX or as a standalone application backed by Oracle HCM /
Payroll / Active Directory.

---

## 1. Remove Air Ticket & Education Allowances from all assignment types

**Status in demo:** Done.

The "Current entitlements" panel shown in the wizard (Step 3 —
Compensation) no longer lists Education allowance or Air Ticket
allowance. Both lines were removed from the entitlement set
(`src/data.js` → `GET_ENTITLEMENTS`). The placeholder text in the
"Other benefits" textarea was also updated so it no longer suggests an
annual travel ticket.

**Implementation guidance:**

- **Oracle HCM source filter.** The "current entitlements" panel is
  intended to display elements that the employee currently receives,
  read from Oracle Payroll/HCM. The integration layer must filter out
  the following element classifications before they reach the front-end:
  - `Education Allowance` (element name to be confirmed with payroll
    config — e.g. `Education_Allowance_M` or `EDU_ALLOWANCE`)
  - `Air Ticket Allowance` (e.g. `Air_Ticket_Allowance_Y` or
    `AIR_TKT_ALLOWANCE`)
- **APEX:** in the report/region SQL that drives the entitlements
  card, add a `WHERE element_name NOT IN ('EDUCATION_ALLOWANCE',
  'AIR_TICKET_ALLOWANCE')` predicate, or maintain a configuration
  table (`MOCA_ENTITLEMENT_DISPLAY_CONFIG`) so future hides do not
  require code change.
- **Standalone backend:** the entitlement DTO returned by the
  HCM-bridge service should drop the above keys before serialisation.

**Verify by:** opening the wizard with any employee — the entitlements
list must not contain education or air ticket lines.

---

## 2. Link Proposed job title in Oracle with the Active Directory Title (auto-revert at end)

**Status in demo:** Not applicable — pure backend / directory integration.

**Implementation guidance:**

When an acting assignment or secondment is approved, the system must:

1. **On approval (assignment start):**
   - Update the Oracle HCM `PER_ALL_ASSIGNMENTS_M.JOB_ID` (or the
     equivalent custom DFF holding the "proposed job title") with the
     new role.
   - Propagate the new title to Active Directory by setting the AD
     attribute `title` on the user object. This is done via the
     `Set-ADUser -Title "<NEW_TITLE>"` cmdlet from the integration
     service, or — if you prefer event-driven — by writing the change
     into Oracle Internet Directory (OID) which is wired to AD through
     DIP (Directory Integration Platform).

2. **On termination (assignment end or early termination):**
   - Restore the previous `JOB_ID` from a snapshot taken at start.
     Store the snapshot in `MOCA_ASSIGNMENT_TITLE_HISTORY` (assignment
     id, previous title, captured at, restored at).
   - Push the old title back to AD with the same mechanism above.
   - Trigger the restore from one of:
     - **Oracle Scheduler job** (`DBMS_SCHEDULER`) that runs nightly,
       picks up assignments whose `END_DATE < SYSDATE` and have not yet
       been reverted, and fires the restore procedure.
     - **HCM workflow trigger** on the "Assignment ended" lifecycle
       event.

3. **Failure handling:** if AD is unreachable, retry with
   exponential backoff (e.g. 1m / 5m / 30m / 4h) and raise an alert to
   the HR Operations queue after the third failure.

**Suggested data model addition:**

```sql
CREATE TABLE MOCA_ASSIGNMENT_TITLE_HISTORY (
  HISTORY_ID         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ASSIGNMENT_ID      VARCHAR2(32)  NOT NULL,
  EMPLOYEE_NUMBER    VARCHAR2(32)  NOT NULL,
  ORIGINAL_TITLE_EN  VARCHAR2(255),
  ORIGINAL_TITLE_AR  VARCHAR2(255),
  ACTING_TITLE_EN    VARCHAR2(255),
  ACTING_TITLE_AR    VARCHAR2(255),
  ASSIGNED_AT        TIMESTAMP     NOT NULL,
  REVERTED_AT        TIMESTAMP,
  AD_SYNC_STATUS     VARCHAR2(16)  DEFAULT 'PENDING',
  AD_SYNC_ERROR      VARCHAR2(1000),
  CONSTRAINT FK_TITLE_HIST_ASG FOREIGN KEY (ASSIGNMENT_ID)
    REFERENCES MOCA_ASSIGNMENTS(ASSIGNMENT_ID)
);
```

---

## 3. Add a second type of acting without any financial impact

**Status in demo:** Done.

A new assignment type `acting_admin` (label: **Acting (no allowance)**,
Arabic: **الندب الإداري (بدون بدل)**) has been added next to the
existing **Acting (with allowance)** option in the wizard. The new
type:

- Reuses the grade-selection logic of acting (capped at +2 grades, no
  senior grades).
- Locks the paying entity to "home entity" as acting does.
- Shows **None** in the allowance card and does not display the
  "60-day allowance unlock" banner.
- Carries a distinct policy reminder: *"Administrative acting has no
  financial impact — no allowance, no change to base salary."*
- Is filterable from the dashboard type dropdown and counted
  separately in the analytics chart.
- Has its own badge colour (muted green).

**Implementation guidance:**

- **Oracle Payroll element setup.** Create the new assignment subtype
  as a value in the lookup `MOCA_ASSIGNMENT_TYPE` (or add a column
  `IS_PAID_VARIANT BOOLEAN`). For the no-allowance variant, do not
  attach the `Acting_Allowance_25_Pct` payroll element to the
  employee's element entries when the assignment is approved.
- **Reporting.** All existing dashboards that group by assignment type
  should be widened to recognise the new value. If your APEX classic
  reports use hard-coded type lists, update them.
- **Lookup definition (Arabic / English).** The labels in the demo are
  starting points. Confirm the final wording with HR Policy team
  before launch — they may prefer (e.g.) *"Acting in addition to
  original work"* / *"الندب بالإضافة إلى المهام الأصلية"*.

---

## 4. Allow secondment duration to exceed one year

**Status in demo:** Done.

The 365-day cap on the initial assignment was lifted **only for the
secondment type** (`src/wizard.jsx` validation). Acting and the
external types still enforce their existing caps. The wizard side-rail
"Policy summary" no longer shows the "within 365-day limit" message for
secondments — it now displays "specified duration" instead.

**Implementation guidance:**

- **Validation rule.** If your APEX page or backend service enforces
  a hard `END_DATE - START_DATE <= 365` rule, change it to be
  type-aware:
  ```sql
  CASE
    WHEN :P_TYPE = 'SECONDMENT' THEN /* no cap */
    ELSE LEAST(:P_END_DATE - :P_START_DATE, 365)
  END
  ```
- **Reminder to HR Policy:** the federal HR policy text only requires
  that the secondment have a *specified* duration — there is no upper
  limit. Surface this in the policy summary panel so the user is not
  misled.
- **Renewals & extensions** are governed separately (see Section 5)
  and still cap at 180 days per extension.

---

## 5. Extension dates picked from a calendar, not from a month dropdown

**Status in demo:** Done.

The "Extension period" field for acting / acting_admin / secondment
assignments has been changed from a 1–6 month dropdown to a native
date picker (`<input type="date">`). The companion field now shows the
**added duration in days** and the resulting end date. Validation
still enforces a 180-day cap for these types (matching the federal
policy ceiling on extensions), with an inline error if exceeded; the
date picker also sets `min` to the current assignment end date so the
user cannot pick a date earlier than today's end.

**Implementation guidance:**

- **APEX item type.** Replace the `Select List` item for
  `P_EXTENSION_PERIOD_MONTHS` with a `Date Picker` item
  `P_EXTENSION_NEW_END_DATE`. Set `Minimum Date` to
  `&P_CURRENT_END_DATE.` to block invalid selections client-side.
- **Server-side validation:** keep the existing 180-day cap rule,
  but compute it from `(NEW_END_DATE - CURRENT_END_DATE)` rather than
  from a count of months. Reject and message the user if `> 180`.
- **Data model:** if your `MOCA_EXTENSIONS` table currently stores
  `EXTENSION_MONTHS NUMBER`, retire the column in favour of
  `NEW_END_DATE DATE`. Compute additional days on read.
- **Backwards compatibility:** for historical extensions stored with
  months, migrate via `NEW_END_DATE = ORIGINAL_END_DATE + (MONTHS * 30)`
  (approximation), or `ADD_MONTHS(ORIGINAL_END_DATE, MONTHS)` if you
  prefer calendar months.

---

## 6. Send extension notifications to the employee after Sector Head approval

**Status in demo:** Indicator only — the extension policy panel now
shows a confirmation line stating *"The employee receives an automated
email notification once the Sector Head approves the extension."* The
actual sending is a backend responsibility.

**Implementation guidance:**

The notification flow should be triggered by the **approval-completion
event** of the Sector Head step, not by extension submission. This
ensures the employee is only notified once a real approval has landed.

**Recommended approach (Oracle stack):**

1. **Workflow hook.** In Oracle BPM Workflow (or your APEX-driven
   approval table), on the row update where
   `SECTOR_HEAD_DECISION IN ('APPROVED', 'APPROVED_WITH_NOTE')`,
   enqueue a message into an Advanced Queue `MOCA_NOTIFICATION_Q`
   with payload:
   ```json
   {
     "type": "EXTENSION_APPROVED",
     "assignment_id": "ASG-2026-00123",
     "employee_number": "E-123456",
     "new_end_date": "2026-09-30",
     "approved_by": "Sector Head — CSS",
     "language_pref": "ar"
   }
   ```
2. **Notification service.** A small consumer (PL/SQL package or a
   Node service) reads `MOCA_NOTIFICATION_Q`, fetches the employee's
   email & language preference from HCM, renders a template (Oracle BI
   Publisher works well for bilingual templates), and sends via the
   federal mail relay (or `UTL_SMTP` with an SMTP gateway).
3. **Audit trail.** Insert a row into `MOCA_NOTIFICATIONS_SENT`
   recording template id, channel (email/SMS), sent timestamp, and
   delivery status — surface this in the assignment activity timeline.
4. **Failure handling.** Retry on transient SMTP errors (max 3
   attempts, 5-minute backoff). Permanent failures should be visible
   to HR Ops via a small dashboard / report (do not silently swallow).
5. **Suppression list.** Honour an opt-out preference (`HR_NOTIFY_OPT_OUT`)
   on the employee profile, even for transactional emails, because some
   senior officials maintain quiet inboxes. Confirm the policy on this
   with HR Communications before going live.

**Template content suggestion (bilingual):**

> *Dear {{first_name}},*
>
> *Your acting / secondment assignment ({{assignment_id}}) at
> {{to_entity}} has been extended until {{new_end_date}}, following
> the approval of the Sector Head on {{approval_date}}.*
>
> *Updated assignment details are available in the MOCA Assignment
> Management portal.*
>
> *— Human Resources, MOCA*

---

## Cross-cutting notes for the implementation team

- **Demo as a UX reference, not the source of truth.** The single-file
  HTML at `dist/index.html` is a static prototype intended to show
  desired behaviour. Forms, validation, approvals — they all simulate
  results client-side. Re-implement the business logic on the
  authoritative Oracle / APEX side.
- **i18n keys.** The Arabic and English labels used in the prototype
  (in `src/i18n.js`) can be reused verbatim for the APEX page item
  labels and lookup display values. The translations have been
  reviewed for federal HR register.
- **Naming conventions.** New code references for the second acting
  type use the identifier `acting_admin`. Pick a stable name in
  Oracle lookups before propagating across reports and DDL.
- **Open questions for the review team:**
  1. Confirm the exact Oracle Payroll element names to be hidden from
     the entitlements panel (Section 1) and from any acting calculation
     (Section 3).
  2. Confirm the AD attribute used for the role title — most federal
     setups use `title`, but some use `description` or a custom
     `extensionAttribute*`. (Section 2.)
  3. Confirm whether the no-allowance acting variant requires a
     separate approval path or shares the same Sector Head workflow as
     paid acting. The demo assumes the same path.
  4. Confirm the notification channel(s) for Section 6: email only, or
     also SMS / push to the federal employee app?
