[CmdletBinding()]
param(
    [switch]$Remove,
    [string]$ConfigRoot
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'relay-credentials.ps1')

if ($Remove) {
    Remove-RelayConfiguration -ConfigRoot $ConfigRoot
    Write-Host 'Local encrypted relay configuration removed.'
    exit 0
}

$functionUrl = Read-Host 'SCF Function URL'
$secret = Read-Host 'WECHAT_RELAY_SECRET (input is hidden)' -AsSecureString
Save-RelayConfiguration -FunctionUrl $functionUrl -Secret $secret -ConfigRoot $ConfigRoot
Write-Host 'Relay configuration saved with Windows current-user encryption.'
