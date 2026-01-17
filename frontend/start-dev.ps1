# Start DevApply Frontend Development Server
Write-Host "Starting DevApply Frontend..." -ForegroundColor Green
Write-Host "Make sure your backend is running on http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
cd $PSScriptRoot
npm run dev
