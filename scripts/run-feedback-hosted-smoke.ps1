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
        # Validate the credential BEFORE npm installation/build to avoid wasted time.
        $secureInput = Read-Host 'Paste the VALUE of the dedicated Supabase secret API key (hidden)' -AsSecureString
        if (-not $secureInput -or $secureInput.Length -lt 30) {
            throw 'Missing or too-short key. No request sent. Copy the value from Supabase Settings > API Keys > Secret API keys.'
        }
        $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureInput)
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        # Only normalize copy/paste wrappers. Do not print any part of the key.
        $plain = $plain.Trim().Trim([char]0xFEFF).Trim([char[]]@([char]0x0022, [char]0x0027))
        if (-not $plain.StartsWith('sb_secret_', [StringComparison]::Ordinal)) {
            $kind = 'Unrecognized key format'
            if ($plain.StartsWith('sb_publishable_', [StringComparison]::Ordinal)) {
                $kind = 'This is a PUBLISHABLE key, not a Secret API key'
            } elseif ($plain.StartsWith('eyJ', [StringComparison]::Ordinal)) {
                $kind = 'This looks like a LEGACY JWT key, not a new Secret API key'
            } elseif ($plain.StartsWith('sbp_', [StringComparison]::Ordinal)) {
                $kind = 'This is a Supabase personal access token, not a project Secret API key'
            } elseif ($plain -match '^[*\u2022]+        & node $runner
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
) {
                $kind = 'You copied a MASKED placeholder rather than the key value'
            } elseif ($plain -match '^(FEEDBACK_SUPABASE_SECRET_KEY|SUPABASE_SECRET_KEY)\s*=') {
                $kind = 'You copied an environment variable assignment rather than the key value'
            }
            $plain = $null
            throw "$kind. No request was sent. Open Brand Brain > Settings > API Keys > Publishable and secret API keys, select the named SECRET key, and copy its VALUE. Do not paste it into chat."
        }

        if (-not (Test-Path (Join-Path $repo 'node_modules\next\dist\bin\next'))) {
            Write-Host 'Installing project dependencies using existing lockfile...' -ForegroundColor Cyan
            & npm.cmd ci
            if ($LASTEXITCODE -ne 0) { throw 'npm ci failed. No database request sent.' }
        }
        Write-Host 'Building local application with public collection disabled...' -ForegroundColor Cyan
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Local build failed. No database request sent.' }
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
