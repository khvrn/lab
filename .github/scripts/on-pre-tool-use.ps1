#!/usr/bin/env pwsh
# on-pre-tool-use.ps1
#
# Runs before every tool call.
# 1. Warns if a write tool is about to touch a file outside expected project paths.
# 2. Reminds the agent to summarize changes and get user approval before git commit/push.
# 3. Reminds the agent to use the §3.0 decision tree before creating ecosystem files.
#
# Receives hook context as a JSON string in $ctx, passed by hooks.json.

param([string]$ctx)

if (-not $ctx) { exit 0 }

$data  = $ctx  | ConvertFrom-Json -ErrorAction SilentlyContinue
$tArgs = $data.toolArgs | ConvertFrom-Json -ErrorAction SilentlyContinue

$tool    = $data.toolName
$target  = $tArgs.path ?? $tArgs.file_path ?? ''
$command = $tArgs.command ?? ''

# ── Git commit/push guard ──────────────────────────────────────────────────────
if ($command -match '\bgit\s+(commit|push)\b') {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  COMMIT / PUSH GATE                                          ║" -ForegroundColor Yellow
    Write-Host "║                                                              ║" -ForegroundColor Yellow
    Write-Host "║  Before proceeding, ensure you have:                        ║" -ForegroundColor Yellow
    Write-Host "║    1. Summarized all changes in plain language to the user   ║" -ForegroundColor Yellow
    Write-Host "║    2. Received explicit user approval                        ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
}

# ── Ecosystem file decision-tree reminder ──────────────────────────────────────
$writeTools = @('create_file', 'write_file', 'edit_file', 'delete_file', 'str_replace')
if ($tool -in $writeTools -and $target) {
    $isEcosystemFile = $target -match '\.github/(agents|skills|instructions)/'
    if ($isEcosystemFile) {
        Write-Host ""
        Write-Host "┌──────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
        Write-Host "│  ECOSYSTEM FILE DETECTED                                     │" -ForegroundColor Cyan
        Write-Host "│  '$target'"                                                    -ForegroundColor Cyan
        Write-Host "│  Have you walked through the §3.0 Decision Tree?             │" -ForegroundColor Cyan
        Write-Host "│  → .github/COPILOT_ECOSYSTEM.md §3.0                        │" -ForegroundColor Cyan
        Write-Host "│  → agents = WHO (reasoning persona / judgment)               │" -ForegroundColor Cyan
        Write-Host "│  → skills = HOW (procedure / steps / templates)              │" -ForegroundColor Cyan
        Write-Host "└──────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
        Write-Host ""
    }
}

# ── Out-of-bounds write guard ──────────────────────────────────────────────────
if ($tool -notin $writeTools -or -not $target) { exit 0 }

$expected = $target -match '^(src/|public/|\.github/|[^/]+\.(json|ts|js|md|config\.))'
if (-not $expected) {
    Write-Warning "[Copilot] Writing to '$target' — is this intentional? Expected: src/, public/, .github/"
}