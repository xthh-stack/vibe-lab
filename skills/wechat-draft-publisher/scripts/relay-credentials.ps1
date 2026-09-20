Set-StrictMode -Version Latest

function Get-RelayConfigRoot {
    param([string]$ConfigRoot)
    if ($ConfigRoot) { return [System.IO.Path]::GetFullPath($ConfigRoot) }
    return Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'wechat-draft-publisher'
}

function Test-RelayFunctionUrl {
    param([Parameter(Mandatory)][string]$FunctionUrl)
    $uri = $null
    if (-not [Uri]::TryCreate($FunctionUrl, [UriKind]::Absolute, [ref]$uri) -or
        $uri.Scheme -ne 'https' -or $uri.UserInfo) {
        throw 'SCF Function URL must be an absolute HTTPS URL without embedded credentials.'
    }
    return $uri.AbsoluteUri
}

function Protect-RelayConfigDirectory {
    param([Parameter(Mandatory)][string]$Path)
    if (-not $IsWindows) { throw 'Windows DPAPI is required for relay credential storage.' }
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
    $acl = [System.Security.AccessControl.DirectorySecurity]::new()
    $acl.SetOwner($identity)
    $acl.SetAccessRuleProtection($true, $false)
    $rule = [System.Security.AccessControl.FileSystemAccessRule]::new(
        $identity,
        [System.Security.AccessControl.FileSystemRights]::FullControl,
        [System.Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit',
        [System.Security.AccessControl.PropagationFlags]::None,
        [System.Security.AccessControl.AccessControlType]::Allow
    )
    $acl.AddAccessRule($rule)
    Set-Acl -LiteralPath $Path -AclObject $acl
}

function Save-RelayConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$FunctionUrl,
        [Parameter(Mandatory)][Security.SecureString]$Secret,
        [string]$ConfigRoot
    )
    $root = Get-RelayConfigRoot $ConfigRoot
    $url = Test-RelayFunctionUrl $FunctionUrl
    $probe = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secret)
    try {
        if ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($probe).Length -eq 0) { throw 'Relay secret cannot be empty.' }
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($probe)
    }
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Protect-RelayConfigDirectory $root
    $configTemp = Join-Path $root 'relay.json.tmp'
    $secretTemp = Join-Path $root 'relay-secret.dpapi.tmp'
    @{ version = 1; functionUrl = $url } | ConvertTo-Json | Set-Content -LiteralPath $configTemp -Encoding utf8NoBOM
    $Secret | ConvertFrom-SecureString | Set-Content -LiteralPath $secretTemp -Encoding utf8NoBOM
    Move-Item -LiteralPath $configTemp -Destination (Join-Path $root 'relay.json') -Force
    Move-Item -LiteralPath $secretTemp -Destination (Join-Path $root 'relay-secret.dpapi') -Force
}

function Get-RelayConfiguration {
    [CmdletBinding()]
    param([string]$ConfigRoot)
    $root = Get-RelayConfigRoot $ConfigRoot
    $configPath = Join-Path $root 'relay.json'
    $secretPath = Join-Path $root 'relay-secret.dpapi'
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf) -or
        -not (Test-Path -LiteralPath $secretPath -PathType Leaf)) {
        throw 'Encrypted relay configuration is missing. Run configure-relay.ps1 once.'
    }
    try {
        $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
        if ($config.version -ne 1) { throw 'unsupported version' }
        $url = Test-RelayFunctionUrl ([string]$config.functionUrl)
        $secret = (Get-Content -LiteralPath $secretPath -Raw).Trim() | ConvertTo-SecureString
        return [pscustomobject]@{ FunctionUrl = $url; Secret = $secret; ConfigRoot = $root }
    } catch {
        throw 'Encrypted relay configuration is invalid for this Windows account. Run configure-relay.ps1 again.'
    }
}

function Remove-RelayConfiguration {
    [CmdletBinding()]
    param([string]$ConfigRoot)
    $root = Get-RelayConfigRoot $ConfigRoot
    foreach ($name in @('relay.json', 'relay-secret.dpapi', 'relay.json.tmp', 'relay-secret.dpapi.tmp')) {
        $path = Join-Path $root $name
        if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
    }
    if ((Test-Path -LiteralPath $root -PathType Container) -and -not (Get-ChildItem -LiteralPath $root -Force)) {
        Remove-Item -LiteralPath $root -Force
    }
}
