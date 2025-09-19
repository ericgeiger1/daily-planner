# Daily Planner Usage Guide

This project includes PowerShell generators, an Express API server with validation, and a React Native mobile app for cross-platform daily planning.

## Prerequisites
- PowerShell execution policy for current user should be `RemoteSigned` or more permissive.
  - If needed:
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    ```
- Node.js (for API server and mobile development)
- Expo CLI (for React Native mobile app)

## API Server

### Starting the Server
```bash
npm install
npm start
```
The API server runs on http://localhost:3000 by default.

### Accepted Date Formats
The API supports multiple date formats for maximum flexibility:

| Format | Example | Description |
|--------|---------|-------------|
| ISO | `2025-09-14` | Standard ISO format (recommended) |
| ISO DateTime | `2025-09-14 14:30:00` | ISO with time |
| US Format | `09/14/2025` | Month/Day/Year |
| EU Format | `14/09/2025` | Day/Month/Year |
| Short | `09/14/25` | Two-digit year |
| Natural | `September 14, 2025` | Human-readable format |

**Month-only formats:**
- `2025-09` (Year-Month)
- Any of the above date formats (month will be extracted)

### API Endpoints
- `GET /api/health` - Server health check
- `GET /api/formats` - List supported date formats with examples
- `POST /api/validate/date` - Validate a date string
- `POST /api/validate/month` - Validate a month string
- `POST /api/validate/range` - Validate a date range
- `GET /api/pages/:year/:month/:day` - Get daily planner page
- `GET /api/pages/:year/:month` - Get monthly overview

### Example API Usage
```bash
# Test date validation
curl -X POST http://localhost:3000/api/validate/date \
  -H "Content-Type: application/json" \
  -d '{"date": "September 14, 2025"}'

# Test month validation  
curl -X POST http://localhost:3000/api/validate/month \
  -H "Content-Type: application/json" \
  -d '{"month": "2025-09"}'
```

## Mobile App

### Setup
```bash
npm install
npx expo install
```

### Running the App
```bash
# Start Expo development server
npm run mobile

# Run on specific platform
npm run mobile:android
npm run mobile:ios
```

### Features
- **Dark Mode Support**: Automatically detects system theme preference
- **Input Validation**: Real-time validation for date inputs with friendly error messages
- **Settings Screen**: Configure API URL, recovery date, timezone, and theme preferences
- **API Integration**: Test connection to the Express API server

## Privacy & Local Config
- This project is privacy-first. No central database; everything stays on your machine.
- Personal config is stored in `.planner/` (gitignored) so it is never committed.

### Set your Recovery Date (optional)
```powershell
.\scripts\Set-RecoveryDate.ps1 -Date '2020-01-01'
```
Generated pages will display a sobriety snapshot (days • hours • months) at the top.

## PowerShell Scripts
The scripts now include improved repository root resolution and work from any directory within the repository.

### Scripts
- `scripts/New-DailyPlannerPage.ps1`
  - Args:
    - `-Date [DateTime]` (optional; default: today)
    - `-OutputRoot [string]` (optional; default: `pages`)
  - Output: `pages/YYYY/MM/YYYY-MM-DD.md`
- `scripts/New-MonthlyOverview.ps1`
  - Args:
    - `-MonthText [string]` (optional; default: current month)
    - `-OutputRoot [string]` (optional; default: `pages`)
  - Output: `pages/YYYY/MM/YYYY-MM-overview.md`
  - Step mapping: month number → Step (1–12), cycling yearly.

### Examples
```powershell
# From repo root or any subdirectory
.\scripts\New-DailyPlannerPage.ps1              # today's page
.\scripts\New-MonthlyOverview.ps1               # this month's overview

# Specific date (supports all formats listed above)
.\scripts\New-DailyPlannerPage.ps1 -Date '2025-09-14'
.\scripts\New-DailyPlannerPage.ps1 -Date 'September 14, 2025'
.\scripts\New-MonthlyOverview.ps1 -MonthText '2025-10-01'

# Custom output root
.\scripts\New-DailyPlannerPage.ps1 -OutputRoot 'notes'
```

## Date Handling
All date processing is **timezone-agnostic** by default:
- API server normalizes all dates to UTC for consistent storage and processing
- Display formatting can be adjusted per timezone in API requests
- Mobile app includes timezone configuration in settings
- PowerShell scripts work with local system time

## Next Steps
- **Web UI**: A web interface wired to the API is planned for the next milestone
- **Enhanced Validation**: Friendly validation messages and improved error handling
- **Express Serving**: The Express server will serve the built web UI

Generated files are plain Markdown—commit or archive as you wish.