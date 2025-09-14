# Recovery-Themed Daily Planner — Product Spec

## Vision
A supportive, recovery-aligned daily planner grounded in the 12 Steps of Alcoholics Anonymous (AA). It helps users set intentions in the morning, reflect in the evening, and stay connected to principles one day at a time.

## Scope (MVP)
- Daily page with Morning Plan and Nightly Review.
- Monthly overview themed to a specific AA Step (1–12) with brief guidance and a focus prompt.
- Printable and digital-friendly Markdown templates.
 - Privacy-first: no central database; all data remains local.
 - Optional sobriety counters: display days/hours/months since recovery date.

## Personas
- Person in recovery seeking structure, gratitude, and step-based focus.
- Supporter/ally wanting a values-driven productivity framework.

## Daily Page Structure
- Morning Plan
  - Daily Prayers (e.g., Serenity Prayer; user-entered text area)
  - Goals (3–5)
  - Priorities (Top 3)
  - To-Do List (checkboxes)
  - Gratitude List (3–10)
  - Excited About List (3–5)
  - Today Will Be Great Because… (3–5)
  - Positive Affirmations (3–10)
  - Workout Plan (movement + time)
  - What’s on My Mind
  - Daily Challenge
    - Challenge Items (1–3)
    - Results (paired outcome notes)
- Nightly Review
  - Today’s Wins (3–5)
  - How I Will Improve (1–3 learnings → actions)
  - Did I Accomplish My Goals? (Y/N + notes)
  - Most Memorable Moment
  - Something I Learned Today
  - One Act of Kindness I Performed Today
  - How Did I Connect with My Loved Ones?
  - Journal Space (free-form)

## Monthly Overview Structure
- Monthly AA Step Theme (Step N of 12)
  - Step Description (brief)
  - Focus Prompt aligned to that Step
  - Slogans/Principles (e.g., One Day at a Time)
- Habit/Consistency Trackers (e.g., meetings, prayer/meditation, exercise)
- Monthly Goals (3–5) and Priorities (Top 3)
- Notes & Intentions

## 12-Step Monthly Theme Mapping (default)
1. Step 1 — Powerlessness & Unmanageability: Honesty and acceptance
2. Step 2 — Hope & Sanity: Willingness to believe in restoration
3. Step 3 — Surrender: Turning will and life over to care
4. Step 4 — Moral Inventory: Courageous self-examination
5. Step 5 — Admission: Owning truth with self and another
6. Step 6 — Readiness: Willing to have defects removed
7. Step 7 — Humility: Humbly asking for removal of shortcomings
8. Step 8 — Amends List: Willingness and compassion
9. Step 9 — Amends: Making direct amends where possible
10. Step 10 — Daily Inventory: Continued personal inventory and prompt admission
11. Step 11 — Prayer & Meditation: Conscious contact and guidance
12. Step 12 — Service: Carrying the message and practicing principles

## Acceptance Criteria
- Daily template includes all Morning Plan and Nightly Review sections with clear headings and bullet/checkbox lists ready for use.
- Monthly template includes Step theme and trackers, and can be reused for any month.
- Files render cleanly in GitHub/Markdown viewers and are printable to PDF.
 - A local-only configuration holds the recovery date; sobriety counters (days, hours, months) can be injected into generated pages.

## Non-Goals (for now)
- Mobile/desktop app UI
- Sync or data persistence beyond files
- Analytics
 - Cloud databases or remote storage of personal entries

## Future Enhancements
- Optional tooling to auto-generate daily/monthly pages.
- Simple static site rendering for printing/export.
- Internationalization.
 - Optional encryption-at-rest for local files (e.g., OS-native secure storage).

## Privacy & Local-First
- No central servers or shared databases; user retains full control.
- Configuration (e.g., recovery date) stored under `.planner/` and excluded from git.
- Users opt-in to sobriety counters; values are computed locally at generation time.

## Sobriety Counters
- Recovery Date: user-provided local date.
- Counters displayed in pages: days sober, hours sober (approximate), months sober (calendar or 30-day average configurable later).
- Placement:
  - Daily Page: top of Morning Plan (affirmation block)
  - Monthly Overview: beneath Step theme header
