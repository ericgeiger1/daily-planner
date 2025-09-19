Param(
    [Parameter(Mandatory=$true)][string]$Date
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
