# Daily Planner Generators (PowerShell)

These scripts materialize Markdown pages from the templates in `docs/templates`.

## Prerequisites
- PowerShell execution policy for current user should be `RemoteSigned` or more permissive.
  - If needed:
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    ```

## Privacy & Local Config
- This project is privacy-first. No central database; everything stays on your machine.
- Personal config is stored in `.planner/` (gitignored) so it is never committed.

### Set your Recovery Date (optional)
```powershell
./scripts/Set-RecoveryDate.ps1 -Date '2020-01-01'
```
Generated pages will display a sobriety snapshot (days • hours • months) at the top.

## Scripts
- `scripts/New-DailyPlannerPage.ps1`
  - Args:
    - `-Date [DateTime]` (optional; default: today)
    - `-OutputRoot [string]` (optional; default: `pages`)
  - Output: `pages/YYYY/MM/YYYY-MM-DD.md`
- `scripts/New-MonthlyOverview.ps1`
  - Args:
    - `-Month [DateTime]` (optional; default: current month)
    - `-OutputRoot [string]` (optional; default: `pages`)
  - Output: `pages/YYYY/MM/YYYY-MM-overview.md`
  - Step mapping: month number → Step (1–12), cycling yearly.

## Examples
```powershell
# From repo root
.\scripts\New-DailyPlannerPage.ps1              # today’s page
.\scripts\New-MonthlyOverview.ps1               # this month’s overview

# Specific date
.\scripts\New-DailyPlannerPage.ps1 -Date '2025-09-14'
.\scripts\New-MonthlyOverview.ps1 -Month '2025-10-01'

# Custom output root
.\scripts\New-DailyPlannerPage.ps1 -OutputRoot 'notes'
```

Generated files are plain Markdown—commit or archive as you wish.
