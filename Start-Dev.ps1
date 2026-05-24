$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

function Stop-PortProcess {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    $pids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    $currentProcessId = $PID

    foreach ($processId in $pids) {
        if ($processId -and $processId -ne $currentProcessId) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

function Stop-ProcessByCommandLineMatch {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match $Pattern } |
        ForEach-Object {
            if ($_.ProcessId -and $_.ProcessId -ne $PID) {
                Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            }
        }
}

function Clear-DirectoryIfExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (Test-Path $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Wait-ForDocker {
    param(
        [int]$TimeoutSeconds = 60
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        & docker version *> $null
        if ($LASTEXITCODE -eq 0) {
            return
        }

        Start-Sleep -Seconds 2
    }

    throw 'Docker Desktop did not become ready in time.'
}

Write-Host 'Stopping anything already using ports 3000 and 4000...'
Stop-PortProcess -Port 3000
Stop-PortProcess -Port 4000

Write-Host 'Stopping lingering web dev processes and clearing cached Next artifacts...'
Stop-ProcessByCommandLineMatch -Pattern 'apps\\web'
Clear-DirectoryIfExists -Path (Join-Path $PSScriptRoot 'apps\web\.next')

if (-not (Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue)) {
    $dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    if (Test-Path $dockerDesktop) {
        Write-Host 'Starting Docker Desktop...'
        Start-Process -FilePath $dockerDesktop | Out-Null
    }
}

Write-Host 'Waiting for Docker to be ready...'
Wait-ForDocker

$env:DEVFLOW_POSTGRES_PORT = '5433'
$env:DEVFLOW_REDIS_PORT = '6380'

Write-Host 'Starting PostgreSQL and Redis...'
docker compose -f infra/docker-compose.yml up -d postgres redis

Write-Host 'Starting API and web dev servers...'

$apiPath = Join-Path $PSScriptRoot 'apps\api'
$webPath = Join-Path $PSScriptRoot 'apps\web'

Start-Process powershell.exe -ArgumentList @(
    '-NoLogo',
    '-NoExit',
    '-Command',
    "Set-Location '$apiPath'; npm run dev"
) | Out-Null

Start-Process powershell.exe -ArgumentList @(
    '-NoLogo',
    '-NoExit',
    '-Command',
    "Set-Location '$webPath'; npm run dev"
) | Out-Null

Write-Host 'API will run on http://localhost:4000'
Write-Host 'Web will run on http://localhost:3000'