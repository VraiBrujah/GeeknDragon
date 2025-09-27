$ErrorActionPreference = 'Stop'

& "$PSScriptRoot\run_tests.ps1"
$code = $LASTEXITCODE
if ($code -ne 0) {
  Write-Error "Tests échoués (code $code). Commit annulé."
  exit $code
}

exit 0

