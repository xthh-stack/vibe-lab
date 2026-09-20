[CmdletBinding()]
param(
    [string]$ProjectRoot,
    [string]$Article,
    [string]$Cover,
    [string]$Assets,
    [string]$Out,
    [string]$Theme,
    [string]$ConfigRoot,
    [switch]$Confirmed
)

$ErrorActionPreference = 'Stop'
if (-not $Confirmed) { throw 'Explicit per-article confirmation is required; pass -Confirmed only after the user approves the preview.' }
foreach ($required in @('ProjectRoot', 'Article', 'Cover', 'Assets', 'Out', 'Theme')) {
    if (-not (Get-Variable -Name $required -ValueOnly)) { throw "$required is required." }
}
. (Join-Path $PSScriptRoot 'relay-credentials.ps1')

$projectPath = (Resolve-Path -LiteralPath $ProjectRoot).Path
$articlePath = (Resolve-Path -LiteralPath $Article).Path
$coverPath = (Resolve-Path -LiteralPath $Cover).Path
$assetsPath = (Resolve-Path -LiteralPath $Assets).Path
$cliPath = Join-Path $projectPath 'src\cli.js'
if (-not (Test-Path -LiteralPath $cliPath -PathType Leaf)) { throw 'ProjectRoot does not contain src/cli.js.' }
$outputPath = [System.IO.Path]::GetFullPath($Out)
$nodePath = (Get-Command node -ErrorAction Stop).Source
$relay = Get-RelayConfiguration -ConfigRoot $ConfigRoot

function Invoke-RelayNode {
    param(
        [Parameter(Mandatory)][string[]]$Arguments,
        [Parameter(Mandatory)][string]$PlainSecret,
        [switch]$EnableWrite
    )
    $start = [System.Diagnostics.ProcessStartInfo]::new()
    $start.FileName = $nodePath
    $start.WorkingDirectory = $projectPath
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    foreach ($argument in $Arguments) { [void]$start.ArgumentList.Add($argument) }
    $start.Environment['WECHAT_RELAY_URL'] = $relay.FunctionUrl
    $start.Environment['WECHAT_RELAY_SECRET'] = $PlainSecret
    if ($EnableWrite) { $start.Environment['WECHAT_DRAFT_ENABLED'] = '1' }
    else { [void]$start.Environment.Remove('WECHAT_DRAFT_ENABLED') }
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $start
    [void]$process.Start()
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $process.WaitForExit()
    $stdout = $stdoutTask.GetAwaiter().GetResult()
    $stderr = $stderrTask.GetAwaiter().GetResult()
    if ($stdout) { Write-Output $stdout.TrimEnd() }
    if ($process.ExitCode -ne 0) {
        if ($stderr) { Write-Error $stderr.TrimEnd() }
        throw "Relay command failed with exit code $($process.ExitCode)."
    }
}

$secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($relay.Secret)
$plainSecret = $null
try {
    $plainSecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
    Invoke-RelayNode -Arguments @('src/cli.js', 'wechat-diagnose', '--adapter', 'relay') -PlainSecret $plainSecret
    Invoke-RelayNode -Arguments @(
        'src/cli.js', 'draft', $articlePath,
        '--adapter', 'relay', '--draft-enabled',
        '--cover', $coverPath, '--assets', $assetsPath,
        '--out', $outputPath, '--theme', $Theme
    ) -PlainSecret $plainSecret -EnableWrite
} finally {
    $plainSecret = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
}
