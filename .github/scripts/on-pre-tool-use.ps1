#!/usr/bin/env pwsh
# on-pre-tool-use.ps1
#
# Runs before every tool call. Warns if a write tool is about to touch a file
# outside the expected project paths (src/, public/, .github/, root configs).
#
# Receives hook context as a JSON string in $ctx, passed by hooks.json.

param([string]$ctx)

if (-not $ctx) { exit 0 }

$data  = $ctx  | ConvertFrom-Json -ErrorAction SilentlyContinue
$tArgs = $data.toolArgs | ConvertFrom-Json -ErrorAction SilentlyContinue

$tool   = $data.toolName
$target = $tArgs.path ?? $tArgs.file_path ?? ''

$writeTools = @('create_file', 'write_file', 'edit_file', 'delete_file', 'str_replace')
if ($tool -notin $writeTools -or -not $target) { exit 0 }

$expected = $target -match '^(src/|public/|\.github/|[^/]+\.(json|ts|js|md|config\.))'
if (-not $expected) {
    Write-Warning "[Copilot] Writing to '$target' — is this intentional? Expected: src/, public/, .github/"
}