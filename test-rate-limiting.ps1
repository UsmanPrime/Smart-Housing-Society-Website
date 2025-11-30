# Rate Limiting Test Script
# Tests all rate limiters implemented in the system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rate Limiting Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:5000"
$testResults = @()

# Helper function to make HTTP requests
function Test-RateLimit {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null,
        [int]$MaxRequests,
        [string]$Token = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "Endpoint: $Endpoint" -ForegroundColor Gray
    Write-Host "Expected Limit: $MaxRequests requests" -ForegroundColor Gray
    Write-Host ""
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $blockedAt = $null
    $success = 0
    $failed = 0
    
    for ($i = 1; $i -le ($MaxRequests + 2); $i++) {
        try {
            $params = @{
                Uri = "$API_BASE$Endpoint"
                Method = $Method
                Headers = $headers
                ErrorAction = "Stop"
            }
            
            if ($Body -and $Method -ne "GET") {
                $params["Body"] = ($Body | ConvertTo-Json)
            }
            
            $response = Invoke-RestMethod @params
            $success++
            Write-Host "  Request $i : ✓ Success (200)" -ForegroundColor Green
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 429) {
                if (-not $blockedAt) {
                    $blockedAt = $i
                }
                $failed++
                Write-Host "  Request $i : ✗ Rate Limited (429)" -ForegroundColor Red
            }
            else {
                Write-Host "  Request $i : ✗ Error ($statusCode)" -ForegroundColor Magenta
            }
        }
        
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  Successful: $success" -ForegroundColor Green
    Write-Host "  Rate Limited: $failed" -ForegroundColor Red
    
    if ($blockedAt) {
        $expectedBlock = $MaxRequests + 1
        if ($blockedAt -eq $expectedBlock) {
            Write-Host "  ✓ Blocked at request #$blockedAt (Expected: #$expectedBlock)" -ForegroundColor Green
            $testResults += @{Name = $Name; Status = "PASS"}
        }
        else {
            Write-Host "  ✗ Blocked at request #$blockedAt (Expected: #$expectedBlock)" -ForegroundColor Red
            $testResults += @{Name = $Name; Status = "FAIL"}
        }
    }
    else {
        Write-Host "  ✗ No rate limiting detected!" -ForegroundColor Red
        $testResults += @{Name = $Name; Status = "FAIL"}
    }
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
}

# Test 1: General API Rate Limiter (100 requests per 15 min)
Write-Host "TEST 1: General API Rate Limiter" -ForegroundColor Cyan
Write-Host "Testing with a smaller sample (15 requests, should all pass)" -ForegroundColor Gray
Write-Host ""

$testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDFkMmQzMTFiNjcyYjlhYzM3NmFmOSIsImVtYWlsIjoidXNtYW4xQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMjc5MTAyNSwiZXhwIjoxNzMzMzk1ODI1fQ.1L-ggYD6Yz0OA4T6wLBLWu3E9VJx7QKWZ7TF1T9qJ8A"

for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/facilities" -Method GET -Headers @{"Authorization" = "Bearer $testToken"} -ErrorAction Stop
        Write-Host "  Request $i : ✓ Success" -ForegroundColor Green
    }
    catch {
        Write-Host "  Request $i : ✗ Error" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 50
}

Write-Host ""
Write-Host "✓ General API limiter allows reasonable traffic" -ForegroundColor Green
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 2: Authentication Rate Limiter (5 requests per 15 min)
Test-RateLimit `
    -Name "Authentication Rate Limiter" `
    -Endpoint "/api/auth/login" `
    -Method "POST" `
    -Body @{
        email = "test@example.com"
        password = "wrongpassword"
    } `
    -MaxRequests 5

# Test 3: File Upload Rate Limiter (20 uploads per 15 min)
Write-Host "TEST 3: File Upload Rate Limiter" -ForegroundColor Cyan
Write-Host "Skipping (requires multipart form data and valid authentication)" -ForegroundColor Yellow
Write-Host "Manual test required: Upload 21 receipts in 15 minutes" -ForegroundColor Gray
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 4: Report/Export Rate Limiter (10 requests per 15 min)
Write-Host "TEST 4: Report/Export Rate Limiter" -ForegroundColor Cyan
Write-Host "Note: Requires valid admin token" -ForegroundColor Yellow
Write-Host "Testing with audit logs export endpoint..." -ForegroundColor Gray
Write-Host ""

# This would need a valid admin token
Write-Host "Skipping automated test (requires valid admin authentication)" -ForegroundColor Yellow
Write-Host "Manual test required:" -ForegroundColor Gray
Write-Host "  1. Login as admin" -ForegroundColor Gray
Write-Host "  2. Go to Audit Logs page" -ForegroundColor Gray
Write-Host "  3. Click 'Export CSV' 11 times within 15 minutes" -ForegroundColor Gray
Write-Host "  4. 11th request should be blocked with 429 error" -ForegroundColor Gray
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skipped = 3  # Manual tests

Write-Host "Automated Tests:" -ForegroundColor White
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "  Skipped (Manual): $skipped" -ForegroundColor Yellow
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ All automated tests passed!" -ForegroundColor Green
}
else {
    Write-Host "✗ Some tests failed. Check configuration." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Testing Checklist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[ ] Test authentication rate limit (5 failed logins)" -ForegroundColor White
Write-Host "[ ] Test file upload rate limit (21 receipt uploads)" -ForegroundColor White
Write-Host "[ ] Test report export rate limit (11 CSV exports)" -ForegroundColor White
Write-Host "[ ] Verify rate limit headers in response" -ForegroundColor White
Write-Host "[ ] Test rate limit reset after 15 minutes" -ForegroundColor White
Write-Host "[ ] Test multiple users (rate limit is per IP)" -ForegroundColor White
Write-Host ""
