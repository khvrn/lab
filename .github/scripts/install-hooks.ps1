#!/usr/bin/env pwsh
# install-hooks.ps1
#
# Installs git hooks from .github/scripts/ into .git/hooks/.
# Run once on every fresh clone:
#   pwsh .github/scripts/install-hooks.ps1

$scriptDir = $PSScriptRoot
$repoRoot  = Split-Path (Split-Path $scriptDir -Parent) -Parent
$hooksDir  = Join-Path $repoRoot '.git' 'hooks'

# pre-commit → delegates to .github/scripts/pre-commit.ps1
$preCommitScript = Join-Path $scriptDir 'pre-commit.ps1'
$hookTarget      = Join-Path $hooksDir  'pre-commit'

$hookContent = @"
#!/bin/sh
# Installed by .github/scripts/install-hooks.ps1
pwsh "$preCommitScript"
"@

Set-Content -Path $hookTarget -Value $hookContent -Encoding utf8 -NoNewline

# Make it executable on Unix-like systems (no-op on Windows)
if ($IsLinux -or $IsMacOS) {
    chmod +x $hookTarget
}

Write-Host "[install-hooks] pre-commit hook installed at $hookTarget" -ForegroundColor Green
Write-Host "                It will run 'npm run test:e2e' before every commit." -ForegroundColor Green
