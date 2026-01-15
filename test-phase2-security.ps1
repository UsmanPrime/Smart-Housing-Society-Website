# Phase 2 Security Testing Script
# Run this after starting the server to test Phase 2 features

$baseUrl = "http://localhost:5000"

Write-Host "`n=== Phase 2 Security Testing ===" -ForegroundColor Cyan

# Test 1: CSRF Token Endpoint
Write-Host "`n[Test 1] Testing CSRF token endpoint..." -ForegroundColor Yellow
try {
    $csrfResponse = Invoke-WebRequest -Uri "$baseUrl/api/csrf-token" -Method GET -SessionVariable session
    $csrfToken = ($csrfResponse.Content | ConvertFrom-Json).csrfToken
    Write-Host "✓ CSRF token retrieved: $($csrfToken.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "✗ CSRF token test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: CSRF Protection (should fail without token)
Write-Host "`n[Test 2] Testing CSRF protection (should fail)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/complaints" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"title":"Test","description":"Test"}' -ErrorAction Stop
    Write-Host "✗ CSRF protection not working (request should have failed)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✓ CSRF protection working (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Login with new token structure
Write-Host "`n[Test 3] Testing login with new token structure..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@test.com"
        password = "Admin@123"
        recaptchaToken = "test_token_bypass"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody -WebSession $session
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.accessToken -and $loginData.refreshToken) {
        Write-Host "✓ Login returns both accessToken and refreshToken" -ForegroundColor Green
        $accessToken = $loginData.accessToken
        $refreshToken = $loginData.refreshToken
        Write-Host "  Access Token: $($accessToken.Substring(0,20))..." -ForegroundColor Gray
        Write-Host "  Refresh Token: $($refreshToken.Substring(0,20))..." -ForegroundColor Gray
    } else {
        Write-Host "✗ Login response missing tokens" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Login test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Note: Make sure test user exists and reCAPTCHA is configured" -ForegroundColor Yellow
}

# Test 4: Token Refresh Endpoint
Write-Host "`n[Test 4] Testing token refresh endpoint..." -ForegroundColor Yellow
if ($refreshToken) {
    try {
        $refreshBody = @{
            refreshToken = $refreshToken
        } | ConvertTo-Json

        $refreshResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/refresh-token" -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $refreshBody
        
        $refreshData = $refreshResponse.Content | ConvertFrom-Json
        
        if ($refreshData.accessToken) {
            Write-Host "✓ Token refresh successful" -ForegroundColor Green
            Write-Host "  New Access Token: $($refreshData.accessToken.Substring(0,20))..." -ForegroundColor Gray
        } else {
            Write-Host "✗ Token refresh failed - no new token returned" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Token refresh test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⊘ Skipped (login failed)" -ForegroundColor Yellow
}

# Test 5: Logout Endpoint
Write-Host "`n[Test 5] Testing logout endpoint..." -ForegroundColor Yellow
if ($refreshToken) {
    try {
        $logoutBody = @{
            refreshToken = $refreshToken
        } | ConvertTo-Json

        $logoutResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/logout" -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $logoutBody
        
        Write-Host "✓ Logout successful" -ForegroundColor Green
    } catch {
        Write-Host "✗ Logout test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⊘ Skipped (login failed)" -ForegroundColor Yellow
}

# Test 6: Security Logs
Write-Host "`n[Test 6] Checking security logs..." -ForegroundColor Yellow
$logPath = "logs\security.log"
if (Test-Path $logPath) {
    $recentLogs = Get-Content $logPath -Tail 5
    Write-Host "✓ Security log file exists" -ForegroundColor Green
    Write-Host "  Recent entries:" -ForegroundColor Gray
    $recentLogs | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "✗ Security log file not found at $logPath" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Phase 2 security features tested:" -ForegroundColor White
Write-Host "  - CSRF token generation" -ForegroundColor White
Write-Host "  - CSRF protection validation" -ForegroundColor White
Write-Host "  - Login with dual token structure" -ForegroundColor White
Write-Host "  - Token refresh mechanism" -ForegroundColor White
Write-Host "  - Logout with token invalidation" -ForegroundColor White
Write-Host "  - Security logging" -ForegroundColor White

Write-Host "`nNotes:" -ForegroundColor Yellow
Write-Host "  - Make sure the server is running on $baseUrl" -ForegroundColor Yellow
Write-Host "  - Create test user if login fails: admin@test.com / Admin@123" -ForegroundColor Yellow
Write-Host "  - Check logs/security.log for detailed security events" -ForegroundColor Yellow
Write-Host "  - Review PHASE-2-IMPLEMENTATION-GUIDE.md for full documentation" -ForegroundColor Yellow
Write-Host ""
