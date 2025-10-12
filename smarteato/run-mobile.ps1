# Run SmartEato Mobile App
# This script starts the Expo development server

Write-Host "Starting SmartEato Mobile App..." -ForegroundColor Green
Write-Host ""

# Navigate to Mobile directory
Set-Location -Path "src\SmartEato.Mobile"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start Expo
Write-Host "Starting Expo development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press 'a' for Android emulator" -ForegroundColor Yellow
Write-Host "Press 'i' for iOS simulator (macOS only)" -ForegroundColor Yellow
Write-Host "Press 'w' for web browser" -ForegroundColor Yellow
Write-Host "Scan QR code with Expo Go app for physical device" -ForegroundColor Yellow
Write-Host ""

npm start

# Return to original directory
Set-Location -Path "..\..\"


