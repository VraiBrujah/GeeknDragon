$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path $PSScriptRoot -Parent
$hooksDir = Join-Path $repoRoot '.git/hooks'
if (!(Test-Path $hooksDir)) {
  throw "Hooks directory not found: $hooksDir (initialize Git or run from repo)"
}

$hookPath = Join-Path $hooksDir 'pre-commit'
$content = @"
#!/usr/bin/env bash
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/run_tests.ps1"
code=$?
if [ $code -ne 0 ]; then
  echo "Pre-commit: tests failed; aborting commit." >&2
  exit $code
fi
exit 0
"@

Set-Content -Path $hookPath -Value $content -Encoding ascii

Write-Host "Pre-commit hook installed at: $hookPath"
Write-Host "It runs scripts/run_tests.ps1 and blocks commit on test failure."
