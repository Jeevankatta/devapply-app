# Refresh PATH environment variable to include Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "PATH refreshed! Node.js and npm should now be available." -ForegroundColor Green
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Cyan
node --version
npm --version
