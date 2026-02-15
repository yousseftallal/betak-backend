# API Base URL
$baseUrl = "http://localhost:3000/api/v1/admin"

# 1. Login
Write-Host "🔐 Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "superadmin@betak.com"
        password = "SuperAdmin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    # DEBUG: Print full response
    Write-Host "Response received:" -ForegroundColor Gray
    $loginResponse | ConvertTo-Json -Depth 5 | Write-Host

    $token = $loginResponse.data.access_token
    
    if (-not $token) {
        Write-Error "Token is null!"
        exit
    }

    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 15))..." -ForegroundColor Gray
} catch {
    Write-Error "Login Failed: $_"
    # Print error details if available
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errBody" -ForegroundColor Red
    }
    exit
}

# Headers
$headers = @{
    Authorization = "Bearer $token"
}

# 2. Get Dashboard Stats
Write-Host "`n📊 Fetching Dashboard Overview..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/stats/overview" -Method GET -Headers $headers
    
    Write-Host "-------------------------------------" -ForegroundColor Cyan
    if ($stats.data.counters) {
        Write-Host "Users:    " $stats.data.counters.users
        Write-Host "Creators: " $stats.data.counters.creators
        Write-Host "Videos:   " $stats.data.counters.videos
        Write-Host "Views:    " $stats.data.counters.total_views
        Write-Host "Active:   " $stats.data.counters.active_creators_today
    } else {
        Write-Host "No counters found in response."
        $stats | ConvertTo-Json -Depth 5 | Write-Host
    }
    Write-Host "-------------------------------------" -ForegroundColor Cyan
} catch {
    Write-Error "Stats Failed: $_"
    if ($_.Exception.Response) {
         $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
         Write-Host "Error Body: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}

# 3. Get Creators List
Write-Host "`n🌟 Fetching Top Creators..." -ForegroundColor Yellow
try {
    $creators = Invoke-RestMethod -Uri "$baseUrl/creators" -Method GET -Headers $headers
    
    foreach ($c in $creators.data.creators) {
        Write-Host "[$($c.id)] $($c.username) - Followers: $($c.followers_count) - Revenue: $$($c.revenue_earned)"
    }
} catch {
    Write-Error "Creators Failed: $_"
}

# 4. Get Reports
Write-Host "`n🛡️ Fetching Reports..." -ForegroundColor Yellow
try {
    $reports = Invoke-RestMethod -Uri "$baseUrl/reports" -Method GET -Headers $headers
    Write-Host "Total Reports: $($reports.data.pagination.total)"
} catch {
    Write-Error "Reports Failed: $_"
}
