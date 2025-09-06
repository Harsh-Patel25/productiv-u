# ProductivU Windows Deployment Script
# Run as Administrator

param(
    [string]$Port = "8080",
    [string]$AppName = "ProductivU",
    [switch]$SetupFirewall,
    [switch]$InstallService,
    [switch]$StartApp
)

Write-Host "🚀 ProductivU Windows Deployment Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin -and ($SetupFirewall -or $InstallService)) {
    Write-Error "Please run this script as Administrator for firewall and service configuration."
    exit 1
}

# Function to setup Windows Firewall
function Setup-Firewall {
    param([string]$Port)
    
    Write-Host "⚡ Configuring Windows Firewall..." -ForegroundColor Yellow
    
    try {
        # Remove existing rules (if any)
        netsh advfirewall firewall delete rule name="$AppName HTTP" protocol=TCP localport=$Port 2>$null
        
        # Add inbound rule for the port
        netsh advfirewall firewall add rule name="$AppName HTTP" dir=in action=allow protocol=TCP localport=$Port
        
        # Add outbound rule (optional but recommended)
        netsh advfirewall firewall add rule name="$AppName HTTP Out" dir=out action=allow protocol=TCP localport=$Port
        
        Write-Host "✅ Firewall rules added for port $Port" -ForegroundColor Green
        
        # Show current firewall status
        $firewallStatus = netsh advfirewall show allprofiles state
        Write-Host "Current Firewall Status:" -ForegroundColor Cyan
        Write-Host $firewallStatus -ForegroundColor Gray
        
    } catch {
        Write-Error "Failed to configure firewall: $_"
    }
}\n\n# Function to install as Windows Service\nfunction Install-WindowsService {\n    Write-Host \"⚙️ Installing as Windows Service...\" -ForegroundColor Yellow\n    \n    try {\n        # Install node-windows if not present\n        if (-not (Get-Command \"node-windows\" -ErrorAction SilentlyContinue)) {\n            Write-Host \"Installing node-windows...\" -ForegroundColor Cyan\n            npm install -g node-windows\n        }\n        \n        # Create service installation script\n        $serviceScript = @\"\nconst Service = require('node-windows').Service;\nconst path = require('path');\n\n// Create a new service object\nconst svc = new Service({\n  name: '$AppName Service',\n  description: '$AppName - Productivity App Server',\n  script: path.join(__dirname, 'serve-app.js'),\n  nodeOptions: [\n    '--max_old_space_size=2048'\n  ],\n  env: {\n    name: 'NODE_ENV',\n    value: 'production'\n  }\n});\n\n// Listen for install event\nsvc.on('install', function() {\n  console.log('$AppName service installed successfully!');\n  svc.start();\n});\n\n// Listen for start event\nsvc.on('start', function() {\n  console.log('$AppName service started successfully!');\n});\n\n// Install the service\nsvc.install();\n\"@\n        \n        $serviceScript | Out-File -FilePath \"install-service.js\" -Encoding UTF8\n        \n        # Create serve script\n        $serveScript = @\"\nconst { spawn } = require('child_process');\nconst path = require('path');\n\n// Start the serve command\nconst serve = spawn('serve', ['-s', 'dist', '-p', '$Port', '--host', '0.0.0.0'], {\n  cwd: __dirname,\n  stdio: 'inherit'\n});\n\nserve.on('error', (error) => {\n  console.error('Error starting serve:', error);\n});\n\nserve.on('close', (code) => {\n  console.log('Serve process exited with code:', code);\n  process.exit(code);\n});\n\n// Handle process termination\nprocess.on('SIGINT', () => {\n  serve.kill('SIGINT');\n});\n\nprocess.on('SIGTERM', () => {\n  serve.kill('SIGTERM');\n});\n\"@\n        \n        $serveScript | Out-File -FilePath \"serve-app.js\" -Encoding UTF8\n        \n        # Run service installation\n        node install-service.js\n        \n        Write-Host \"✅ Service installed successfully!\" -ForegroundColor Green\n        \n    } catch {\n        Write-Error \"Failed to install service: $_\"\n    }\n}\n\n# Function to start the application\nfunction Start-Application {\n    Write-Host \"🚀 Starting ProductivU Application...\" -ForegroundColor Yellow\n    \n    # Check if build exists\n    if (-not (Test-Path \"dist\")) {\n        Write-Host \"Building application first...\" -ForegroundColor Cyan\n        npm run build\n    }\n    \n    # Check if PM2 is available\n    if (Get-Command \"pm2\" -ErrorAction SilentlyContinue) {\n        Write-Host \"Starting with PM2...\" -ForegroundColor Cyan\n        pm2 start pm2.config.js\n        pm2 save\n        \n        # Show PM2 status\n        pm2 status\n    } else {\n        Write-Host \"Starting with serve (install PM2 for better process management)...\" -ForegroundColor Cyan\n        Write-Host \"To install PM2: npm install -g pm2\" -ForegroundColor Gray\n        \n        # Start with serve\n        Start-Process -NoNewWindow -FilePath \"serve\" -ArgumentList \"-s\", \"dist\", \"-p\", $Port, \"--host\", \"0.0.0.0\"\n    }\n    \n    Write-Host \"✅ Application started on port $Port\" -ForegroundColor Green\n    Write-Host \"🌐 Access URL: http://localhost:$Port\" -ForegroundColor Cyan\n    Write-Host \"📱 LAN Access: http://$(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like \"192.168.*\" -or $_.IPAddress -like \"10.*\"} | Select-Object -First 1 -ExpandProperty IPAddress):$Port\" -ForegroundColor Cyan\n}\n\n# Function to show network information\nfunction Show-NetworkInfo {\n    Write-Host \"📡 Network Configuration\" -ForegroundColor Yellow\n    Write-Host \"========================\" -ForegroundColor Yellow\n    \n    # Get local IP addresses\n    $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike \"127.*\" -and $_.IPAddress -notlike \"169.254.*\"}\n    \n    foreach ($ip in $ipAddresses) {\n        Write-Host \"Interface: $($ip.InterfaceAlias)\" -ForegroundColor Cyan\n        Write-Host \"IP Address: $($ip.IPAddress)\" -ForegroundColor Green\n        Write-Host \"Access URL: http://$($ip.IPAddress):$Port\" -ForegroundColor White\n        Write-Host \"\" \n    }\n    \n    # Test port accessibility\n    Write-Host \"Testing port $Port accessibility...\" -ForegroundColor Yellow\n    $portTest = Test-NetConnection -ComputerName \"localhost\" -Port $Port -InformationLevel Quiet\n    if ($portTest) {\n        Write-Host \"✅ Port $Port is accessible\" -ForegroundColor Green\n    } else {\n        Write-Host \"❌ Port $Port is not accessible\" -ForegroundColor Red\n    }\n}\n\n# Main execution\nWrite-Host \"Starting deployment process...\" -ForegroundColor Cyan\n\n# Setup firewall if requested\nif ($SetupFirewall) {\n    Setup-Firewall -Port $Port\n}\n\n# Install as service if requested\nif ($InstallService) {\n    Install-WindowsService\n}\n\n# Start application if requested\nif ($StartApp) {\n    Start-Application\n}\n\n# Always show network info\nShow-NetworkInfo\n\nWrite-Host \"\" \nWrite-Host \"🎉 Deployment completed!\" -ForegroundColor Green\nWrite-Host \"\" \nWrite-Host \"Next Steps:\" -ForegroundColor Yellow\nWrite-Host \"- Access your app at the URLs shown above\" -ForegroundColor Gray\nWrite-Host \"- Share the LAN URL with other devices on your network\" -ForegroundColor Gray\nWrite-Host \"- Use PM2 for better process management: 'npm install -g pm2'\" -ForegroundColor Gray\nWrite-Host \"- Monitor logs with: 'pm2 logs productiv-u'\" -ForegroundColor Gray
