$ErrorActionPreference = 'Stop'

$pythonCandidates = @(
  @('py','-3'),
  @('python'),
  @('python3'),
  @('py')
)

function Invoke-Python {
    param([string[]]$argsList)
    foreach ($cand in $pythonCandidates) {
        try {
            if ($cand.Count -gt 1) {
                & $cand[0] $cand[1..($cand.Count-1)] @argsList
            } else {
                & $cand[0] @argsList
            }
            if ($LASTEXITCODE -eq 0) { return $true }
        } catch {}
    }
    return $false
}

Write-Host 'Exécution: tests/smoke_test.py'
if (-not (Invoke-Python @('tests/smoke_test.py'))) { throw 'Échec: tests/smoke_test.py' }

Write-Host 'Exécution: tests/validate_links.py'
if (-not (Invoke-Python @('tests/validate_links.py'))) { throw 'Échec: tests/validate_links.py' }

Write-Host 'Tous les tests ont réussi.'
exit 0
