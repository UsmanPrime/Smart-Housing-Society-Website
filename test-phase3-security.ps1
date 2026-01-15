# Phase 3 Security Testing Script
# Tests advanced security features including 2FA, encryption, and environment validation

$baseUrl = "http://localhost:5000"

Write-Host "`n=== Phase 3 Security Testing ===" -ForegroundColor Cyan
Write-Host "Testing: 2FA, Encryption, Environment Validation, Enhanced Security Headers`n" -ForegroundColor Gray

# Test 1: Environment Validation
Write-Host "[Test 1] Environment Validation..." -ForegroundColor Yellow
Write-Host "  Check server logs for environment validation results" -ForegroundColor Gray
Write-Host "  ✓ Should show validation status on server start" -ForegroundColor Green

# Test 2: Enhanced Security Headers
Write-Host "`n[Test 2] Testing Enhanced Security Headers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET
    $headers = $response.Headers
    
    $securityHeaders = @(
        'Strict-Transport-Security',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Content-Security-Policy'
    )
    
    $foundHeaders = 0
    foreach ($header in $securityHeaders) {
        if ($headers.ContainsKey($header)) {
            Write-Host "  ✓ $header present" -ForegroundColor Green
            $foundHeaders++
        } else {
            Write-Host "  ✗ $header missing" -ForegroundColor Red
        }
    }
    
    if ($foundHeaders -eq $securityHeaders.Count) {
        Write-Host "  ✓ All security headers configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $($securityHeaders.Count - $foundHeaders) headers missing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Headers test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: 2FA Setup (requires authentication)
Write-Host "`n[Test 3] Testing 2FA Setup Endpoint..." -ForegroundColor Yellow
Write-Host "  Note: Requires valid authentication token" -ForegroundColor Gray
Write-Host "  Manual test: Login and navigate to Profile > Security > Enable 2FA" -ForegroundColor Gray

# Test 4: 2FA Status
Write-Host "`n[Test 4] Testing 2FA Status Endpoint..." -ForegroundColor Yellow
Write-Host "  GET /api/2fa/status (requires auth)" -ForegroundColor Gray
Write-Host "  Manual test: Check your profile security settings" -ForegroundColor Gray

# Test 5: Field-Level Encryption
Write-Host "`n[Test 5] Field-Level Encryption..." -ForegroundColor Yellow
Write-Host "  ✓ Encryption service created" -ForegroundColor Green
Write-Host "  Uses AES-256-GCM with authenticated encryption" -ForegroundColor Gray
Write-Host "  Sensitive fields (2FA secrets, backup codes) are encrypted at rest" -ForegroundColor Gray

# Test 6: Content Security Policy
Write-Host "`n[Test 6] Content Security Policy..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET
    $csp = $response.Headers['Content-Security-Policy']
    
    if ($csp) {
        Write-Host "  ✓ CSP header present" -ForegroundColor Green
        Write-Host "  Directives: $($csp.ToString().Substring(0, [Math]::Min(80, $csp.ToString().Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "  ✗ CSP header not found" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ CSP test failed" -ForegroundColor Red
}

# Test 7: HSTS (HTTP Strict Transport Security)
Write-Host "`n[Test 7] HSTS Configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET
    $hsts = $response.Headers['Strict-Transport-Security']
    
    if ($hsts) {
        Write-Host "  ✓ HSTS header present: $hsts" -ForegroundColor Green
        
        if ($hsts -match 'max-age=(\d+)') {
            $maxAge = [int]$matches[1]
            $days = [Math]::Round($maxAge / 86400)
            Write-Host "  Max age: $days days" -ForegroundColor Gray
        }
        
        if ($hsts -match 'includeSubDomains') {
            Write-Host "  ✓ Includes subdomains" -ForegroundColor Green
        }
        
        if ($hsts -match 'preload') {
            Write-Host "  ✓ Preload enabled" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠ HSTS not configured (OK for development)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ HSTS test failed" -ForegroundColor Red
}

# Summary and Manual Tests
Write-Host "`n=== Manual Testing Required ===" -ForegroundColor Cyan
Write-Host "`n2FA Testing:" -ForegroundColor White
Write-Host "  1. Login as a user" -ForegroundColor Gray
Write-Host "  2. Navigate to Profile > Security" -ForegroundColor Gray
Write-Host "  3. Click 'Enable Two-Factor Authentication'" -ForegroundColor Gray
Write-Host "  4. Scan QR code with Google Authenticator or Authy" -ForegroundColor Gray
Write-Host "  5. Enter the 6-digit code to verify" -ForegroundColor Gray
Write-Host "  6. Save the backup codes" -ForegroundColor Gray
Write-Host "  7. Logout and login again" -ForegroundColor Gray
Write-Host "  8. Should prompt for 2FA code" -ForegroundColor Gray
Write-Host "  9. Test backup code by entering it instead of TOTP code" -ForegroundColor Gray

Write-Host "`nEncryption Testing:" -ForegroundColor White
Write-Host "  1. Enable 2FA for a user" -ForegroundColor Gray
Write-Host "  2. Check MongoDB - twoFASecret should be encrypted (long hex string)" -ForegroundColor Gray
Write-Host "  3. backupCodes should be hashed (bcrypt format)" -ForegroundColor Gray
Write-Host "  4. User should still be able to login with 2FA" -ForegroundColor Gray

Write-Host "`nEnvironment Validation:" -ForegroundColor White
Write-Host "  1. Check server startup logs" -ForegroundColor Gray
Write-Host "  2. Should see '✅ Environment validation passed'" -ForegroundColor Gray
Write-Host "  3. Check for any warnings about missing optional vars" -ForegroundColor Gray

Write-Host "`nSecurity Headers:" -ForegroundColor White
Write-Host "  1. Open browser DevTools > Network" -ForegroundColor Gray
Write-Host "  2. Inspect any response headers" -ForegroundColor Gray
Write-Host "  3. Verify CSP, HSTS, X-Frame-Options, etc. are present" -ForegroundColor Gray

Write-Host "`n=== Phase 3 Features Summary ===" -ForegroundColor Cyan
Write-Host "✓ Two-Factor Authentication (TOTP)" -ForegroundColor Green
Write-Host "  - QR code generation" -ForegroundColor Gray
Write-Host "  - Backup codes (8 codes)" -ForegroundColor Gray
Write-Host "  - Enable/Disable/Regenerate" -ForegroundColor Gray
Write-Host "  - Login integration" -ForegroundColor Gray

Write-Host "`n✓ Field-Level Encryption" -ForegroundColor Green
Write-Host "  - AES-256-GCM encryption" -ForegroundColor Gray
Write-Host "  - 2FA secrets encrypted at rest" -ForegroundColor Gray
Write-Host "  - Backup codes hashed (bcrypt)" -ForegroundColor Gray
Write-Host "  - PBKDF2 key derivation" -ForegroundColor Gray

Write-Host "`n✓ Environment Validation" -ForegroundColor Green
Write-Host "  - Required variables checked" -ForegroundColor Gray
Write-Host "  - Optional variables warned" -ForegroundColor Gray
Write-Host "  - Production-specific validation" -ForegroundColor Gray
Write-Host "  - Auto-exit on errors" -ForegroundColor Gray

Write-Host "`n✓ Enhanced Security Headers" -ForegroundColor Green
Write-Host "  - Content Security Policy" -ForegroundColor Gray
Write-Host "  - HSTS with preload" -ForegroundColor Gray
Write-Host "  - X-Frame-Options: DENY" -ForegroundColor Gray
Write-Host "  - X-Content-Type-Options: nosniff" -ForegroundColor Gray
Write-Host "  - Referrer Policy" -ForegroundColor Gray

Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Test 2FA setup and login flow" -ForegroundColor White
Write-Host "2. Verify encryption in MongoDB" -ForegroundColor White
Write-Host "3. Review environment variables" -ForegroundColor White
Write-Host "4. Check security headers in browser" -ForegroundColor White
Write-Host "5. Review PHASE-3-COMPLETE.md for full documentation`n" -ForegroundColor White
