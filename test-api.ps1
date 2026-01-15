# LODDGO API Test Script
# Run this after starting the dev server: npm run dev

$baseUrl = "http://localhost:3000"
$adminKey = (Get-Content .env.local | Select-String "ADMIN_KEY").ToString().Split("=")[1].Trim()

Write-Host "=== LODDGO API Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Event
Write-Host "1. Creating test event..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$eventCode = "TEST$timestamp"
$createEventBody = @{
    code = $eventCode
    title = "Test Raffle Event"
    price_nok = 50
    status = "live"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/events" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-admin-key" = $adminKey
        } `
        -Body $createEventBody
    
    Write-Host "✅ Event created successfully!" -ForegroundColor Green
    Write-Host "   Event ID: $($response.id)" -ForegroundColor Gray
    Write-Host "   Code: $($response.code)" -ForegroundColor Gray
    Write-Host ""
    
    # Test 2: Get Event
    Write-Host "2. Getting event by code..." -ForegroundColor Yellow
    $event = Invoke-RestMethod -Uri "$baseUrl/api/events/$eventCode" -Method GET
    Write-Host "✅ Event retrieved!" -ForegroundColor Green
    Write-Host "   Title: $($event.title)" -ForegroundColor Gray
    Write-Host "   Price: $($event.price_nok) NOK" -ForegroundColor Gray
    Write-Host ""
    
    # Test 3: Buy Tickets
    Write-Host "3. Buying tickets..." -ForegroundColor Yellow
    $buyTicketsBody = @{
        event_code = $eventCode
        buyer_display_name = "Test Buyer"
        qty = 3
        idempotency_key = "test-key-$timestamp"
    } | ConvertTo-Json
    
    $order = Invoke-RestMethod -Uri "$baseUrl/api/orders" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $buyTicketsBody
    
    Write-Host "✅ Tickets purchased!" -ForegroundColor Green
    Write-Host "   Order ID: $($order.order.id)" -ForegroundColor Gray
    Write-Host "   Tickets: $($order.tickets.Count)" -ForegroundColor Gray
    Write-Host "   Ticket Numbers: $($order.tickets.ticket_number -join ', ')" -ForegroundColor Gray
    Write-Host "   Total: $($order.order.amount_nok) NOK" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "- Test draw: POST /api/admin/draws" -ForegroundColor White
    Write-Host "- View result: GET /api/events/$eventCode/result" -ForegroundColor White
    Write-Host "- Event Code used: $eventCode" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
