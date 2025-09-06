# ProductivU - LAN Deployment Script
# This script deploys the app permanently on your local network

Write-Host "🚀 ProductivU LAN Deployment Starting..." -ForegroundColor Cyan

# Get network IP
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"}).IPAddress | Select-Object -First 1
$port = 3000

Write-Host "📡 Network IP: $ipAddress" -ForegroundColor Green
Write-Host "🔌 Port: $port" -ForegroundColor Green

# Check if build exists
if (!(Test-Path "dist")) {
    Write-Host "⚠️  No build found. Building production version..." -ForegroundColor Yellow
    npm run build
}

# Check Windows Firewall
Write-Host "🔥 Checking Windows Firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "ProductivU-$port" -ErrorAction SilentlyContinue

if (!$firewallRule) {
    Write-Host "🔥 Adding firewall rule for port $port..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "ProductivU-$port" -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow
    Write-Host "✅ Firewall rule added" -ForegroundColor Green
} else {
    Write-Host "✅ Firewall rule already exists" -ForegroundColor Green
}

# Start the server
Write-Host "`n🌐 Starting ProductivU Server..." -ForegroundColor Cyan
Write-Host "📱 Access from any device on your network:" -ForegroundColor Green
Write-Host "   • Local: http://localhost:$port" -ForegroundColor White
Write-Host "   • Network: http://$ipAddress`:$port" -ForegroundColor White
Write-Host "   • Mobile: http://$ipAddress`:$port" -ForegroundColor White
Write-Host "`n🛑 Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Serve the app
serve -s dist -l $port
