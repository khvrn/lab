#!/usr/bin/env pwsh
# validate-copilot-ecosystem.ps1
#
# Checks that all Copilot CLI ecosystem files follow the principles in
# .github/COPILOT_ECOSYSTEM.md. Exits 0 if all pass, N if N checks fail.
#
# Usage:
#   pwsh .github/scripts/validate-copilot-ecosystem.ps1
#   pwsh .github/scripts/validate-copilot-ecosystem.ps1 -Root C:\other-repo

param([string]$Root = (Get-Location).Path)

$failures = 0

function Ok($msg)         { Write-Host "  PASS  $msg" -ForegroundColor Green }
function Fail($msg, $fix) { Write-Host "  FAIL  $msg`n        → $fix" -ForegroundColor Red; $script:failures++ }
function Warn($msg)       { Write-Host "  WARN  $msg" -ForegroundColor Yellow }
function Head($msg)       { Write-Host "`n── $msg" -ForegroundColor Cyan }

# 1 token ≈ 4 English characters — standard approximation used across the industry
function Tokens([string]$s) { [int]($s.Length / 4) }

Write-Host "`n  Copilot Ecosystem Validator  |  $Root`n" -ForegroundColor Cyan


# ── 1. .github/copilot-instructions.md ───────────────────────────────────────
# Injected on EVERY prompt, so it must stay ≤400 tokens and contain no code blocks.
# Its job is identity + non-negotiables + a TOC pointing to the detail files.

Head ".github/copilot-instructions.md  [always-on, ≤400 tokens]"

$ciFile = Join-Path $Root ".github\copilot-instructions.md"

if (-not (Test-Path $ciFile)) {
    Fail "File missing" "Create .github/copilot-instructions.md — it is injected on every prompt"
} else {
    $ci = Get-Content $ciFile -Raw
    $t  = Tokens $ci

    if ($t -le 400)                       { Ok "Token budget ≤400 (est. $t)" }  else { Fail "Token budget exceeded ($t tokens)" "Trim to ≤400 — move detail into .instructions.md files" }
    if ($ci -notmatch '(?m)^```')         { Ok "No code blocks" }               else { Fail "Contains code blocks"              "Code examples belong in .instructions.md files, not here" }
    if ($ci -match '\.instructions\.md')  { Ok "Has .instructions.md TOC" }     else { Fail "Missing .instructions.md TOC"      "Add a table linking to each .github/instructions/ file" }
    if ($ci -match 'AGENTS\.md')          { Ok "References AGENTS.md" }         else { Fail "Missing AGENTS.md reference"       "Add a link to AGENTS.md" }
    if ($ci -match 'CONVENTIONS\.md')     { Ok "References CONVENTIONS.md" }    else { Fail "Missing CONVENTIONS.md reference"  "Add a link to .github/CONVENTIONS.md" }
}


# ── 2. AGENTS.md ─────────────────────────────────────────────────────────────
# Also injected on every prompt as the primary project context.
# Must be lean (≤6000 chars) and contain a directory map and workflow steps.

Head "AGENTS.md  [always-on primary, ≤6000 chars]"

$agFile = Join-Path $Root "AGENTS.md"

if (-not (Test-Path $agFile)) {
    Fail "File missing" "Create AGENTS.md at repo root — it is injected on every prompt"
} else {
    $ag = Get-Content $agFile -Raw

    if ($ag.Length -le 6000)                           { Ok "Size ≤6000 chars ($($ag.Length))" } else { Fail "Too large ($($ag.Length) chars)"   "Trim to ≤6000 — move extras to .github/CONVENTIONS.md" }
    if ($ag -match 'src/' -and $ag -match 'apps/')     { Ok "Has directory map" }                 else { Fail "Missing directory map"             "Add the src/ directory tree with co-location rules" }
    if ($ag -match '(?i)step [123]|### step')          { Ok "Has workflow steps" }                else { Fail "Missing numbered workflow steps"   "Add Step 1/2/3 for adding a new app" }
    if ($ag -match 'CONVENTIONS\.md')                  { Ok "References CONVENTIONS.md" }        else { Fail "Missing CONVENTIONS.md reference"  "Add a link to .github/CONVENTIONS.md" }
}


# ── 3. .github/instructions/*.instructions.md ────────────────────────────────
# Only injected when the applyTo glob matches files currently in context.
# Every file must have valid YAML frontmatter with an applyTo field.

Head ".github/instructions/*.instructions.md  [conditional on applyTo glob]"

$instrFiles = Get-ChildItem (Join-Path $Root ".github\instructions") -Filter "*.instructions.md" -Recurse -ErrorAction SilentlyContinue

if (-not $instrFiles) {
    Warn "No .instructions.md files found"
} else {
    foreach ($f in $instrFiles) {
        $text = Get-Content $f.FullName -Raw
        # Frontmatter must be the very first thing in the file: ---\n...\n---
        if ($text -match '(?s)^---\s*\r?\n.+?\r?\n---') { Ok "$($f.Name) — has frontmatter" } else { Fail "$($f.Name) — missing frontmatter" "Add ---`napplyTo: `"glob`"`n--- at the top of the file" }
        if ($text -match 'applyTo\s*:')                  { Ok "$($f.Name) — has applyTo"     } else { Fail "$($f.Name) — missing applyTo"     "applyTo: is required — without it this file is never injected" }
    }
}


# ── 4. .github/agents/*.agent.md ─────────────────────────────────────────────
# Only loaded when explicitly invoked. Must have a description so Copilot knows
# when to auto-select the agent.

Head ".github/agents/*.agent.md  [on-demand, description required for auto-select]"

$agentFiles = Get-ChildItem (Join-Path $Root ".github\agents") -Filter "*.agent.md" -Recurse -ErrorAction SilentlyContinue

if (-not $agentFiles) {
    Warn "No .agent.md files found"
} else {
    foreach ($f in $agentFiles) {
        $text = Get-Content $f.FullName -Raw
        if ($text -match '(?s)^---\s*\r?\n.+?\r?\n---') { Ok "$($f.Name) — has frontmatter"  } else { Fail "$($f.Name) — missing frontmatter"  "Add YAML frontmatter at the top of the file" }
        if ($text -match '(?m)^description\s*:')         { Ok "$($f.Name) — has description"  } else { Fail "$($f.Name) — missing description"  "description: tells Copilot when to auto-select this agent" }
    }
}


# ── 5. .github/hooks/hooks.json ──────────────────────────────────────────────
# Runs shell commands at lifecycle events. Never injected into the model.
# Schema: version must be 1, each event must be an array, each entry needs a type key.

Head ".github/hooks/hooks.json  [lifecycle side-effects, not in model context]"

$hooksFile = Join-Path $Root ".github\hooks\hooks.json"

if (-not (Test-Path $hooksFile)) {
    Warn "hooks.json not found"
} else {
    $raw = Get-Content $hooksFile -Raw
    try {
        $json = $raw | ConvertFrom-Json
        Ok "Valid JSON"

        if ($json.version -eq 1) { Ok "version: 1" } else { Fail "version must be 1" "Set top-level 'version' to 1" }

        foreach ($evt in ($json.hooks | Get-Member -MemberType NoteProperty).Name) {
            $entries = $json.hooks.$evt
            if ($entries -is [array]) { Ok "'$evt' is an array" } else { Fail "'$evt' is not an array" "Wrap in []: `"$evt`": [{ ... }]" }
            if ($entries -is [array]) {
                for ($i = 0; $i -lt $entries.Count; $i++) {
                    if ($null -ne $entries[$i].type) { Ok "'$evt'[$i] has type key" } else { Fail "'$evt'[$i] missing type key" "Add `"type`": `"command`" to this entry" }
                }
            }
        }

        # Copilot passes hook context via stdin JSON — $env: vars are never set
        if ($raw -notmatch '\$env:COPILOT_TOOL') { Ok 'No $env:COPILOT_TOOL_* usage' } else { Fail 'Uses $env:COPILOT_TOOL_*' 'Read context with $Input | ConvertFrom-Json instead' }
    } catch {
        Fail "Invalid JSON" $_.Exception.Message
    }
}


# ── 6. COPILOT_ECOSYSTEM.md §6 inventory ─────────────────────────────────────
# Every file listed in the §6 table must exist on disk.
# Only the §6 section is scanned to avoid false positives from prose mentions elsewhere.

Head ".github/COPILOT_ECOSYSTEM.md  [§6 inventory must match disk]"

$ecoFile = Join-Path $Root ".github\COPILOT_ECOSYSTEM.md"

if (-not (Test-Path $ecoFile)) {
    Fail "COPILOT_ECOSYSTEM.md missing" "The principles document is gone — restore it from git"
} else {
    Ok "Exists"
    $eco = Get-Content $ecoFile -Raw

    # Pull out just the §6 section so prose in other sections doesn't trigger false positives
    $section6 = if ($eco -match '(?s)(## 6\..+?)(?=## 7\.)') { $Matches[1] } else { "" }

    $seen = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($m in [regex]::Matches($section6, '`(\.github/[^`]+|AGENTS\.md)`')) {
        $ref = $m.Groups[1].Value
        if ($ref -match '\*|<') { continue }        # skip globs and placeholders like <name>
        if (-not $seen.Add($ref)) { continue }      # skip duplicates
        $disk = Join-Path $Root ($ref -replace '/', '\')
        if (Test-Path $disk) { Ok "Exists on disk: $ref" } else { Fail "Missing: $ref" "Create the file or remove it from the §6 inventory table" }
    }
}


# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "`n  ─────────────────────────────────────────────────" -ForegroundColor DarkGray
if ($failures -eq 0) {
    Write-Host "  PASS  All checks passed`n" -ForegroundColor Green
} else {
    Write-Host "  FAIL  $failures check(s) failed — see above" -ForegroundColor Red
    Write-Host "  Ref:  .github/COPILOT_ECOSYSTEM.md`n" -ForegroundColor DarkGray
}
exit $failures