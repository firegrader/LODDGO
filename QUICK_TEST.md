# Quick API Test Guide

## Your server is running! ✅
- URL: http://localhost:3000
- Status: Ready

## Test the API (use a NEW terminal window)

### Option 1: Use PowerShell (New Terminal)

Open a **new PowerShell terminal** (keep the dev server running in the first one), then run:

```powershell
cd C:\dev\LODDGO
.\test-api.ps1
```

### Option 2: Manual Test with curl

In a **new terminal**, run these commands one by one:

**1. Create Event:**
```powershell
curl -X POST http://localhost:3000/api/admin/events `
  -H "Content-Type: application/json" `
  -H "x-admin-key: sb_secret_DKMXC15FRGzEfB8MJYg1xQ_YCp5D376" `
  -d '{\"code\":\"TEST001\",\"title\":\"Test Event\",\"price_nok\":50}'
```

**2. Get Event:**
```powershell
curl http://localhost:3000/api/events/TEST001
```

**3. Buy Tickets:**
```powershell
curl -X POST http://localhost:3000/api/orders `
  -H "Content-Type: application/json" `
  -d '{\"event_code\":\"TEST001\",\"qty\":3,\"buyer_display_name\":\"John Doe\"}'
```

### Option 3: Test in Browser

Just open these URLs in your browser:

- **Get Event:** http://localhost:3000/api/events/TEST001
  (Will show 404 until you create an event first)

- **Homepage:** http://localhost:3000
  (Should show "LODDGO" page)

## Important Notes

- **Keep the dev server running** in the first terminal
- **Use a NEW terminal** for running test commands
- To stop the dev server: Press `Ctrl+C` in the terminal where it's running
- The server will auto-reload when you change code files
