# Run SmartEato with .NET Aspire
# This script starts the Aspire AppHost which orchestrates the API service

Write-Host "Starting SmartEato with .NET Aspire..." -ForegroundColor Green
Write-Host ""

# Navigate to AppHost directory
Set-Location -Path "src\SmartEato.AppHost"

# Run the AppHost
Write-Host "Launching Aspire Dashboard and API..." -ForegroundColor Cyan
dotnet run

# Return to original directory
Set-Location -Path "..\..\"

