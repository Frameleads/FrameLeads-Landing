# Windows helper: NO secret key typing, copying, or pasting.
# Uses Supabase CLI 3.1.0's authenticated API key reveal IN MEMORY only.
# Public feedback remains disabled. No production deployment is created.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $repo 'scripts\feedback-hosted-no-copy.mjs'
if (-not (Test-Path $runner)) { throw 'Update PR #42 locally with git pull --ff-only first.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is required.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is required.' }
Push-Location $repo
try {
    Write-Host 'FrameLeads no-copy feedback verification' -ForegroundColor Cyan
    Write-Host 'You will NOT be asked to paste any secret API key.' -ForegroundColor Green
    & node $runner
    if ($LASTEXITCODE -ne 0) {
        throw 'The test was stopped safely. If asked, sign in once with Supabase CLI and rerun. Do not paste keys into chat.'
    }
} finally {
    Pop-Location
}
