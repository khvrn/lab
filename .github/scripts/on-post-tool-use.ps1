#!/usr/bin/env pwsh
# on-post-tool-use.ps1
#
# Runs after every tool call:
#   - Ecosystem file (.github/** or AGENTS.md) → runs the ecosystem validator
#   - Source file (src/**) → runs lint + build + tests; warns if test file is missing
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
    # Warn if a component was written without a co-located test file
    if ($target -match '^src/.*\.tsx$' -and $target -notmatch '\.test\.tsx$') {
        $testFile = $target -replace '\.tsx$', '.test.tsx'
        if (-not (Test-Path $testFile)) {
            Write-Warning "[Copilot] No test file found for '$target' — expected '$testFile'"
            Write-Warning "          Add a co-located test file before committing."
        }
    }

    Write-Host '[Copilot] Source file modified — running lint + build + tests...'
    npm run lint
    if ($LASTEXITCODE -ne 0) { Write-Warning '[Copilot] Lint failed — fix errors before committing'; exit 1 }
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Warning '[Copilot] Build failed — fix errors before committing'; exit 1 }
    npm test
    if ($LASTEXITCODE -ne 0) { Write-Warning '[Copilot] Tests failed — fix before committing'; exit 1 }
    Write-Host '[Copilot] Lint + build + tests passed' -ForegroundColor Green
}