Param(
    [Parameter(Mandatory=$false)][string]$MonthText,
    [Parameter(Mandatory=$false)][string]$OutputRoot = "pages"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSCommandPath
$root = Resolve-Path (Join-Path $repoRoot "..")
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

Set-Content -Path $outFile -Value $content -Encoding utf8
Write-Host "Created: $outFile"
