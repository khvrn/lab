#!/usr/bin/env pwsh
# on-session-start.ps1
#
# Runs at the start of every Copilot CLI session.
# Appends a timestamped entry to .copilot-session.log and prints a quick
# reminder of where the project's conventions and instructions live.

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Add-Content -Path '.copilot-session.log' -Value "[$timestamp] Session started"
Write-Host '[Copilot] Standards: .github/CONVENTIONS.md | Rules: .github/instructions/ | Map: AGENTS.md'