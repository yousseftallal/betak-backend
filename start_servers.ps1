
Write-Host "Starting BeTak Servers..." -ForegroundColor Green

# Start Backend
$backendPath = "c:\Users\Moustafa\Desktop\BeTak"
Write-Host "Launching Backend from: $backendPath"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev > server_error.log 2>&1" -WorkingDirectory $backendPath

Start-Sleep -Seconds 2

# Start Frontend
$frontendPath = "c:\Users\Moustafa\Desktop\BeTak\client"
Write-Host "Launching Frontend from: $frontendPath"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "npm run dev -- --force" -WorkingDirectory $frontendPath

Write-Host "Servers launched! Check server_error.log for backend errors." -ForegroundColor Green
