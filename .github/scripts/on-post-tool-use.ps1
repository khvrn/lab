#!/usr/bin/env pwsh
# on-post-tool-use.ps1
#
# Runs after every tool call:
#   - Ecosystem file (.github/** or AGENTS.md) → runs the ecosystem validator
#   - Source file (src/**) → runs lint + build to catch errors immediately
#
# Receives hook context as a JSON string in $ctx, passed by hooks.json.

param([string]$ctx)

if (-not $ctx) { exit 0 }

$data  = $ctx | ConvertFrom-Json -ErrorAction SilentlyContinue
$tArgs = $data.toolArgs | ConvertFrom-Json -ErrorAction SilentlyContinue

$target = $tArgs.path ?? $tArgs.file_path ?? ''

if ($target -match '\.github/' -or $target -eq 'AGENTS.md') {
    Write-Host '[Copilot] Ecosystem file modified — running validator...'
    pwsh -NonInteractive -File '.github/scripts/validate-copilot-ecosystem.ps1'
}

if ($target -match '^src/') {
    Write-Host '[Copilot] Source file modified — running lint + build...'
    npm run lint
    if ($LASTEXITCODE -ne 0) { Write-Warning '[Copilot] Lint failed — fix errors before committing'; exit 1 }
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Warning '[Copilot] Build failed — fix errors before committing'; exit 1 }
    Write-Host '[Copilot] Lint + build passed' -ForegroundColor Green
}