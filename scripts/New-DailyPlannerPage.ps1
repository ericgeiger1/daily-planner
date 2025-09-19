Param(
    [Parameter(Mandatory=$false)][DateTime]$Date = (Get-Date),
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
             $badge = "`n> Sobriety: ${days} days | ${hours} hours | ${months} months`n"
             # Insert badge after the first line without relying on Unicode or regex
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
