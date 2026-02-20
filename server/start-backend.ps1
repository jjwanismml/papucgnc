Write-Host "Backend başlatılıyor..." -ForegroundColor Green
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Mevcut dizin: $scriptPath" -ForegroundColor Yellow

if (-not (Test-Path "node_modules\express")) {
    Write-Host "Bağımlılıklar kuruluyor..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nBackend başlatılıyor..." -ForegroundColor Green
Write-Host "MongoDB bağlantısı kuruluyor..." -ForegroundColor Cyan
Write-Host ""

npm run dev

