# tCopilotAPP/tools/start_expo.ps1
param([switch]$Clear)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location (Split-Path $MyInvocation.MyCommand.Path -Parent)
Set-Location ..

if ($Clear) {
  if (Test-Path ".expo")  { Remove-Item ".expo"  -Recurse -Force }
  if (Test-Path ".cache") { Remove-Item ".cache" -Recurse -Force }
}

if (Test-Path "package-lock.json") {
  npm ci
} else {
  npm install
}

if ($Clear) {
  npx expo start -c
} else {
  npx expo start
}
