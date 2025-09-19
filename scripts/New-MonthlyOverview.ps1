Param(
    [Parameter(Mandatory=$false)][string]$MonthText,
    [Parameter(Mandatory=$false)][string]$OutputRoot = "pages"
)

$ErrorActionPreference = "Stop"

# Function to find repository root by looking for .git directory
function Get-RepoRoot {
    param([string]$StartPath = $PSCommandPath)
    
    $currentPath = Split-Path -Parent $StartPath
    while ($currentPath -and $currentPath -ne (Split-Path -Parent $currentPath)) {
        if (Test-Path (Join-Path $currentPath ".git")) {
            return $currentPath
        }
        $currentPath = Split-Path -Parent $currentPath
    }
    
    # Fallback to script parent directory if .git not found
    return Split-Path -Parent $PSCommandPath | Split-Path -Parent
}

$root = Get-RepoRoot
$templatePath = Join-Path $root "docs\templates\monthly-overview.md"
if (!(Test-Path $templatePath)) { throw "Template not found: $templatePath" }

if ([string]::IsNullOrWhiteSpace($MonthText)) {
    $dt = Get-Date
}
else {
    try {
        $dt = [datetime]::Parse($MonthText, [System.Globalization.CultureInfo]::InvariantCulture)
    }
    catch {
        if ($MonthText -match '^(0?[1-9]|1[0-2])$') {
            $dt = Get-Date
            $dt = Get-Date -Year $dt.Year -Month ([int]$MonthText) -Day 1
        }
        else {
            throw "Could not parse -MonthText '$MonthText' as a date. Try formats like '2025-09-01', '2025-09', 'September 2025', or '09/2025'."
        }
    }
}

$year = $dt.ToString('yyyy')
$month = $dt.ToString('MM')
$monthName = $dt.ToString('MMMM')

# Map month number to AA Step (1-12 cycle)
$step = (([int]$dt.ToString('MM') - 1) % 12) + 1

$dir = Join-Path $root (Join-Path $OutputRoot (Join-Path $year $month))
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$outFile = Join-Path $dir ("${year}-${month}-overview.md")

$content = Get-Content $templatePath -Raw
$content = $content -replace 'Month: ____________   Year: ____________   Step: ____ \/ 12', ("Month: {0}   Year: {1}   Step: {2} / 12" -f $monthName, $year, $step)

# Insert sobriety counters if config exists
$configPath = Join-Path $root ".planner\config.json"
if (Test-Path $configPath) {
    try {
        $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($cfg.RecoveryDate) {
            $rd = [datetime]::Parse($cfg.RecoveryDate, [System.Globalization.CultureInfo]::InvariantCulture)
            $span = $dt - $rd
            $days = [math]::Floor($span.TotalDays)
            $hours = [math]::Floor($span.TotalHours)
            $months = [math]::Floor($span.TotalDays / 30.44)
            $badge = "`n> Sobriety: ${days} days | ${hours} hours | ${months} months`n"
            $nlIndex = $content.IndexOf("`n")
            if ($nlIndex -ge 0) {
                $content = $content.Insert($nlIndex + 1, $badge)
            } else {
                $content = $badge + $content
            }
        }
    } catch { }
}

Set-Content -Path $outFile -Value $content -Encoding utf8
Write-Host "Created: $outFile"
