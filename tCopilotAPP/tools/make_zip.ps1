# tCopilotAPP/tools/make_zip.ps1
$ErrorActionPreference = "Stop"

Set-Location (Split-Path $MyInvocation.MyCommand.Path -Parent)
Set-Location ..

$ROOT  = Get-Location
$STAGE = Join-Path $ROOT "_release_app"

if (Test-Path $STAGE) {
  Remove-Item $STAGE -Recurse -Force
}

robocopy "$ROOT" $STAGE /E /XD "node_modules" ".expo" ".cache" "_release_app" ".git" | Out-Null

$OUT = Join-Path $ROOT ("TraderCopilot_APP_{0}.zip" -f (Get-Date -Format "yyyyMMdd_HHmm"))
if (Test-Path $OUT) { Remove-Item $OUT -Force }

Compress-Archive -Path (Join-Path $STAGE "*") -DestinationPath $OUT
"ZIP app listo: $OUT"
