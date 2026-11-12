# Run only in a Windows PowerShell terminal on the owner's computer.
# This is NOT a chat prompt. Never enter the key into Codex or ChatGPT.
# It launches a loopback-only Next.js process, makes ONE synthetic HTTP POST,
# then prints a marker for authorized admin readback and exact cleanup.
#
# The deployed website and all Vercel feedback collection flags remain OFF.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $repo 'scripts\feedback-hosted-http-smoke.mjs'
if (-not (Test-Path $runner)) { throw 'Expected smoke runner missing from this feature branch.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is not installed on this computer.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is not installed on this computer.' }

Write-Host 'FrameLeads isolated feedback test' -ForegroundColor Cyan
Write-Host 'No key will be shown or stored in a file.'
Write-Host 'No public website deployment or feedback activation will occur.'
Write-Host ''
Write-Host 'Use the dedicated sb_secret key from the Brand Brain Supabase API Keys page.' 
Write-Host 'This needs to run in a real local Windows PowerShell terminal, not a cloud Codex chat.'
Write-Host ''

# Ensure nothing from the caller's shell can enable collection in the bundle.
$previousUiFlag = [Environment]::GetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED','Process')
$previousPreviewFlag = [Environment]::GetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_PREVIEW','Process')
$previousKey = [Environment]::GetEnvironmentVariable('FEEDBACK_SUPABASE_SECRET_KEY','Process')
$previousOptIn = [Environment]::GetEnvironmentVariable('FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB','Process')
$previousHmac = [Environment]::GetEnvironmentVariable('FEEDBACK_RATE_HMAC_SECRET','Process')
$secureInput = $null
$ptr = [IntPtr]::Zero
try {
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED','false','Process')
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_PREVIEW','false','Process')
    # Use a fresh, automatically generated local HMAC for this one-shot test.
    [Environment]::SetEnvironmentVariable('FEEDBACK_RATE_HMAC_SECRET',$null,'Process')

    Push-Location $repo
    try {
        if (-not (Test-Path (Join-Path $repo 'node_modules\next\dist\bin\next'))) {
            Write-Host 'Installing project dependencies using existing lockfile...' -ForegroundColor Cyan
            & npm.cmd ci
            if ($LASTEXITCODE -ne 0) { throw 'npm ci failed. No database request sent.' }
        }
        Write-Host 'Building local application with public collection disabled...' -ForegroundColor Cyan
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Local build failed. No database request sent.' }

        $secureInput = Read-Host 'Paste the dedicated Supabase sb_secret key (hidden)' -AsSecureString
        if (-not $secureInput -or $secureInput.Length -lt 30) {
            throw 'No valid secret was provided. No request sent.'
        }
        $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureInput)
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        if (-not $plain.StartsWith('sb_secret_')) {
            $plain = $null
            throw 'Use a dedicated Supabase sb_secret key, not a publishable or legacy key.'
        }
        [Environment]::SetEnvironmentVariable('FEEDBACK_SUPABASE_SECRET_KEY',$plain,'Process')
        $plain = $null
        [Environment]::SetEnvironmentVariable('FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB','YES','Process')
        Write-Host 'Running exactly one synthetic feedback submission...' -ForegroundColor Cyan
        & node $runner
        if ($LASTEXITCODE -ne 0) { throw 'Smoke test failed. Retain the printed marker for exact cleanup.' }
        Write-Host 'HTTP test completed. Share only the SYNTHETIC marker and rate fingerprint, never the key.' -ForegroundColor Green
    } finally {
        Pop-Location
    }
} finally {
    [Environment]::SetEnvironmentVariable('FEEDBACK_SUPABASE_SECRET_KEY',$previousKey,'Process')
    [Environment]::SetEnvironmentVariable('FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB',$previousOptIn,'Process')
    [Environment]::SetEnvironmentVariable('FEEDBACK_RATE_HMAC_SECRET',$previousHmac,'Process')
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED',$previousUiFlag,'Process')
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_PREVIEW',$previousPreviewFlag,'Process')
    if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    $secureInput = $null
}
