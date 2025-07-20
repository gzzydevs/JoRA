# test-windows.ps1
# Windows-specific binary testing script
#
# Tests the Windows binary with platform-specific checks and validations.
# Part of task-037-binary-testing-suite
#
# Usage: powershell -ExecutionPolicy Bypass -File test-windows.ps1

param(
    [switch]$Verbose,
    [switch]$Quick
)

Write-Host "🪟 JoRA Windows Binary Testing" -ForegroundColor Blue
Write-Host "==============================" -ForegroundColor Blue

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BinaryPath = Join-Path $ProjectRoot "dist\jora-win.exe"

function Log-Info($Message) {
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Log-Success($Message) {
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Log-Warning($Message) {
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Log-Error($Message) {
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if binary exists
if (-not (Test-Path $BinaryPath)) {
    Log-Error "Windows binary not found: $BinaryPath"
    Log-Info "Run 'npm run build:win' to create the binary"
    exit 1
}

Log-Info "Testing binary: $BinaryPath"

# Check binary info
$BinaryInfo = Get-Item $BinaryPath
$BinarySizeMB = [math]::Round($BinaryInfo.Length / 1MB, 1)
Log-Info "Binary size: $BinarySizeMB MB"
Log-Info "Created: $($BinaryInfo.CreationTime)"
Log-Info "Modified: $($BinaryInfo.LastWriteTime)"

# Platform-specific checks
Log-Info "Platform: $([System.Environment]::OSVersion.VersionString)"
Log-Info "Architecture: $env:PROCESSOR_ARCHITECTURE"
Log-Info "PowerShell Version: $($PSVersionTable.PSVersion)"

# Check if it's a valid PE executable
try {
    $FileHeader = Get-Content $BinaryPath -Encoding Byte -TotalCount 64
    if ($FileHeader[0] -eq 77 -and $FileHeader[1] -eq 90) {
        Log-Success "Valid PE executable header found"
    } else {
        Log-Warning "File does not appear to be a valid PE executable"
    }
} catch {
    Log-Warning "Could not read executable header: $($_.Exception.Message)"
}

# Check Windows Defender / Antivirus status
Log-Info "Checking Windows security status..."
try {
    $DefenderStatus = Get-MpComputerStatus -ErrorAction SilentlyContinue
    if ($DefenderStatus) {
        if ($DefenderStatus.AntivirusEnabled) {
            Log-Info "Windows Defender is active - binary may be scanned"
        }
        if ($DefenderStatus.RealTimeProtectionEnabled) {
            Log-Info "Real-time protection enabled"
        }
    }
} catch {
    Log-Info "Could not check Windows Defender status (may not have permissions)"
}

# Check execution policy
$ExecutionPolicy = Get-ExecutionPolicy
Log-Info "PowerShell Execution Policy: $ExecutionPolicy"

# Check dependencies
Log-Info "Checking system dependencies..."

# Check if curl is available (Windows 10+)
if (Get-Command curl -ErrorAction SilentlyContinue) {
    Log-Success "curl is available"
} elseif (Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue) {
    Log-Info "curl not found, but Invoke-WebRequest is available"
} else {
    Log-Warning "No HTTP client found - some tests may fail"
}

# Check if Node.js is in PATH (shouldn't be needed for binary)
if (Get-Command node -ErrorAction SilentlyContinue) {
    Log-Info "Node.js found in PATH (not required for binary)"
} else {
    Log-Info "Node.js not in PATH (good - binary should be standalone)"
}

# Test binary execution
Log-Info "Testing binary execution..."

Write-Host ""
Write-Host "🧪 Running comprehensive tests..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Build test command
$TestArgs = @("scripts\testing\test-binaries.js", "--binary=jora-win.exe")
if ($Verbose) { $TestArgs += "--verbose" }
if ($Quick) { $TestArgs += "--quick" }

# Run the comprehensive test suite
try {
    $TestProcess = Start-Process -FilePath "node" -ArgumentList $TestArgs -WorkingDirectory $ProjectRoot -Wait -PassThru -NoNewWindow
    $TestExitCode = $TestProcess.ExitCode
} catch {
    Log-Error "Failed to run test suite: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "📋 Windows-Specific Summary:" -ForegroundColor Blue
Write-Host "===========================" -ForegroundColor Blue

if ($TestExitCode -eq 0) {
    Log-Success "Windows binary passed all tests!"
    Log-Info "Binary is ready for Windows distribution"
    Log-Info "Users can run: jora-win.exe"
    
    # Additional Windows-specific notes
    if ($DefenderStatus -and $DefenderStatus.AntivirusEnabled) {
        Log-Info "Note: Users may see Windows Defender warnings on first run"
        Log-Info "This is normal for unsigned executables"
    }
    
    exit 0
} else {
    Log-Error "Windows binary failed some tests"
    Log-Info "Check the test output above for details"
    exit 1
}
