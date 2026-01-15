# Manual API Test Commands for PowerShell
# Copy and paste these commands one by one

$baseUrl = "http://localhost:3000"
$adminKey = (Get-Content .env.local | Select-String "ADMIN_KEY").ToString().Split("=")[1].Trim()

Write-Host "=== Manual API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get Event (already works!)
Write-Host "1. Getting event TEST001..." -ForegroundColor Yellow
$event = Invoke-RestMethod -Uri "$baseUrl/api/events/TEST001" -Method GET
Write-Host "✅ Event found!" -ForegroundColor Green
Write-Host "   Title: $($event.title)" -ForegroundColor Gray
Write-Host "   Price: $($event.price_nok) NOK" -ForegroundColor Gray
Write-Host "   Status: $($event.status)" -ForegroundColor Gray
Write-Host ""

# Test 2: Buy Tickets
Write-Host "2. Buying tickets..." -ForegroundColor Yellow
$buyTicketsBody = @{
    event_code = "TEST001"
    buyer_display_name = "Test Buyer"
    qty = 2
} | ConvertTo-Json

try {
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
    
    Write-Host "=== Success! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Yellow
    Write-Host "- View tickets in Supabase dashboard" -ForegroundColor White
    Write-Host "- Test draw endpoint with order ID: $($order.order.id)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
