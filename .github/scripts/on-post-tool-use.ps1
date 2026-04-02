#!/usr/bin/env pwsh
# on-post-tool-use.ps1
#
# Runs after every tool call. When a Copilot ecosystem file is modified
# (.github/** or AGENTS.md), runs the ecosystem validator automatically.
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