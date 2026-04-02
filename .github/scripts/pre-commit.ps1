#!/usr/bin/env pwsh
# pre-commit.ps1
#
# Git pre-commit hook — runs E2E tests before every commit.
# Blocks the commit (exit 1) if any E2E test fails.
#
# Install via: pwsh .github/scripts/install-hooks.ps1

$scriptDir = $PSScriptRoot
$repoRoot  = Split-Path (Split-Path $scriptDir -Parent) -Parent
Set-Location $repoRoot

Write-Host "[pre-commit] Running Playwright E2E tests..." -ForegroundColor Cyan
npm run test:e2e

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[pre-commit] E2E tests failed — commit blocked." -ForegroundColor Red
    Write-Host "             Fix the failures above, then try again." -ForegroundColor Red
    exit 1
}

Write-Host "[pre-commit] E2E tests passed." -ForegroundColor Green
exit 0
