Write-Host "Testing Railway API..." -ForegroundColor Green

# Test 1: Health
try {
     = Invoke-WebRequest -Uri "https://skillkwiz-production.up.railway.app/health" -UseBasicParsing
    Write-Host "Health check:" .StatusCode -ForegroundColor Yellow
    Write-Host .Content -ForegroundColor Gray
} catch {
    Write-Host "Health check failed:" .Exception.Message -ForegroundColor Red
}

# Test 2: API Health
try {
     = Invoke-WebRequest -Uri "https://skillkwiz-production.up.railway.app/api/health" -UseBasicParsing
    Write-Host "
API Health check:" .StatusCode -ForegroundColor Green
    Write-Host .Content -ForegroundColor Gray
} catch {
    Write-Host "API Health check failed:" .Exception.Message -ForegroundColor Red
}

# Test 3: OTP endpoint
try {
    {
    "identifier":  "test@example.com",
    "type":  "email"
} = @{identifier="test@example.com"; type="email"} | ConvertTo-Json
     = Invoke-WebRequest -Uri "https://skillkwiz-production.up.railway.app/api/otp/send" -Method POST -Body {
    "identifier":  "test@example.com",
    "type":  "email"
} -ContentType "application/json" -UseBasicParsing
    Write-Host "
OTP endpoint:" .StatusCode -ForegroundColor Green
    Write-Host .Content -ForegroundColor Gray
} catch {
    Write-Host "OTP endpoint failed:" .Exception.Message -ForegroundColor Red
}
