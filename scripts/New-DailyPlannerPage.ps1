Param(
    [Parameter(Mandatory=$false)][DateTime]$Date = (Get-Date),
    [Parameter(Mandatory=$false)][string]$OutputRoot = "pages"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSCommandPath
$root = Resolve-Path (Join-Path $repoRoot "..")
$templatePath = Join-Path $root "docs\templates\daily-page.md"
if (!(Test-Path $templatePath)) { throw "Template not found: $templatePath" }

$year = $Date.ToString('yyyy')
$month = $Date.ToString('MM')
$day = $Date.ToString('dd')
$weekday = $Date.ToString('dddd')

$dir = Join-Path $root (Join-Path $OutputRoot (Join-Path $year $month))
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$outFile = Join-Path $dir ("${year}-${month}-${day}.md")

$content = Get-Content $templatePath -Raw
$content = $content -replace 'Date: ____________   Day: ____________', ("Date: {0}   Day: {1}" -f $Date.ToString('yyyy-MM-dd'), $weekday)

# Insert sobriety counters if config exists
$configPath = Join-Path $root ".planner\config.json"
if (Test-Path $configPath) {
    try {
        $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($cfg.RecoveryDate) {
            $rd = [datetime]::Parse($cfg.RecoveryDate, [System.Globalization.CultureInfo]::InvariantCulture)
            $span = $Date - $rd
            $days = [math]::Floor($span.TotalDays)
            $hours = [math]::Floor($span.TotalHours)
            # Months (approximate by 30.44 days, average month length)
            $months = [math]::Floor($span.TotalDays / 30.44)
            $badge = "\n> Sobriety: ${days} days • ${hours} hours • ${months} months\n"
            $content = $content -replace "^# Daily Planner — Recovery Theme\n", ("# Daily Planner — Recovery Theme$badge" )
        }
    } catch { }
}

Set-Content -Path $outFile -Value $content -Encoding utf8
Write-Host "Created: $outFile"
