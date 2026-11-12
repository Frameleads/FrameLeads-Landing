# Run in a Windows PowerShell terminal on the owner's PC, NOT in cloud Codex chat.
# Only one synthetic HTTP POST is attempted after a valid sb_secret_* key is supplied.
# The local server binds to 127.0.0.1 and Vercel public feedback remains OFF.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runner = Join-Path $repo 'scripts\feedback-hosted-http-smoke.mjs'
if (-not (Test-Path $runner)) { throw 'Test runner missing from the feature branch.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js was not found.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm was not found.' }

Write-Host 'FrameLeads isolated feedback test' -ForegroundColor Cyan
Write-Host 'No key is displayed or written to a file. Public feedback remains OFF.'
Write-Host 'Use the VALUE of the named sb_secret key from Brand Brain > Settings > API Keys.'
Write-Host ''

$previousUiFlag = [Environment]::GetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED','Process')
$previousPreviewFlag = [Environment]::GetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_PREVIEW','Process')
$previousKey = [Environment]::GetEnvironmentVariable('FEEDBACK_SUPABASE_SECRET_KEY','Process')
$previousOptIn = [Environment]::GetEnvironmentVariable('FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB','Process')
$previousHmac = [Environment]::GetEnvironmentVariable('FEEDBACK_RATE_HMAC_SECRET','Process')
$secureInput = $null
$ptr = [IntPtr]::Zero
$plain = $null

try {
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED','false','Process')
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_PREVIEW','false','Process')
    [Environment]::SetEnvironmentVariable('FEEDBACK_RATE_HMAC_SECRET',$null,'Process')

    Push-Location $repo
    try {
        # Check the input first so incorrect keys cannot trigger another npm install/build.
        $secureInput = Read-Host 'Paste the VALUE of the dedicated Supabase SECRET API key (hidden)' -AsSecureString
        if ($null -eq $secureInput -or $secureInput.Length -lt 30) {
            throw 'Key missing or too short. No request sent.'
        }

        $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureInput)
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        # Allow harmless surrounding whitespace/quotes from copying.
        $plain = $plain.Trim().Trim([char]0xFEFF).Trim([char[]]@([char]34, [char]39))

        if (-not $plain.StartsWith('sb_secret_', [StringComparison]::Ordinal)) {
            $kind = 'Unrecognized key format'
            if ($plain.StartsWith('sb_publishable_', [StringComparison]::Ordinal)) {
                $kind = 'PUBLISHABLE key supplied (not the secret key)'
            } elseif ($plain.StartsWith('eyJ', [StringComparison]::Ordinal)) {
                $kind = 'LEGACY JWT key supplied (not the named secret key)'
            } elseif ($plain.StartsWith('sbp_', [StringComparison]::Ordinal)) {
                $kind = 'PERSONAL ACCESS TOKEN supplied (not a project secret key)'
            } elseif ($plain -match '^[*]+$') {
                $kind = 'Masked asterisk placeholder copied instead of the value'
            } elseif ($plain -match '^(FEEDBACK_SUPABASE_SECRET_KEY|SUPABASE_SECRET_KEY)\s*=') {
                $kind = 'Environment variable assignment copied instead of its value'
            }
            $plain = $null
            throw "$kind. No request sent. Copy the VALUE of your named secret API key from Supabase Brand Brain > Settings > API Keys. Do not paste a key in chat."
        }
        Write-Host 'Key format recognized. The remote API will validate actual authorization.' -ForegroundColor Green

        if (-not (Test-Path (Join-Path $repo 'node_modules\next\dist\bin\next'))) {
            Write-Host 'Installing dependencies with lockfile...' -ForegroundColor Cyan
            & npm.cmd ci
            if ($LASTEXITCODE -ne 0) { throw 'Dependency install failed. No request sent.' }
        }
        Write-Host 'Building local app with public collection disabled...' -ForegroundColor Cyan
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Local build failed. No request sent.' }

        [Environment]::SetEnvironmentVariable('FEEDBACK_SUPABASE_SECRET_KEY',$plain,'Process')
        $plain = $null
        [Environment]::SetEnvironmentVariable('FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB','YES','Process')
        Write-Host 'Running exactly one local-to-hosted synthetic submission...' -ForegroundColor Cyan
        & node $runner
        if ($LASTEXITCODE -ne 0) {
            throw 'Smoke test failed. Keep the printed synthetic marker/fingerprint for exact test cleanup.'
        }
        Write-Host 'PASS: HTTP smoke runner succeeded. Share ONLY marker and rate fingerprint, NEVER the key.' -ForegroundColor Green
    } finally {
        Pop-Location
    }
} finally {
    $plain = $null
    [Environment]::SetEnvironmentVariable('FEEDBACK_SUPABASE_SECRET_KEY',$previousKey,'Process')
    [Environment]::SetEnvironmentVariable('FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB',$previousOptIn,'Process')
    [Environment]::SetEnvironmentVariable('FEEDBACK_RATE_HMAC_SECRET',$previousHmac,'Process')
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED',$previousUiFlag,'Process')
    [Environment]::SetEnvironmentVariable('NEXT_PUBLIC_FEEDBACK_PREVIEW',$previousPreviewFlag,'Process')
    if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    $secureInput = $null
}
