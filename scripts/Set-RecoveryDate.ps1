Param(
    [Parameter(Mandatory=$true)][string]$Date
)
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSCommandPath
$root = Resolve-Path (Join-Path $repoRoot "..")
$configDir = Join-Path $root ".planner"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$configFile = Join-Path $configDir "config.json"

try {
    $dt = [datetime]::Parse($Date, [System.Globalization.CultureInfo]::InvariantCulture)
}
catch {
    throw "Could not parse recovery date '$Date'. Try formats like '2020-01-01' or 'January 1, 2020'."
}

$config = @{ RecoveryDate = $dt.ToString('o') } | ConvertTo-Json -Depth 3
Set-Content -Path $configFile -Value $config -Encoding utf8
Write-Host "Saved recovery date to $configFile"
