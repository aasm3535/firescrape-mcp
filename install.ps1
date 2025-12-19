Write-Host "🔥 Setting up FireScrape MCP..." -ForegroundColor Cyan

# Check for Bun
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Bun is not installed. Please install Bun first: powershell -c 'irm bun.sh/install.ps1 | iex'" -ForegroundColor Red
    exit 1
}

# Install Deps
Write-Host "📦 Installing dependencies..."
bun install

# Output Config
$currentPath = Get-Location
$scriptPath = Join-Path -Path $currentPath -ChildPath "index.ts"
$scriptPath = $scriptPath -replace "\\", "/"

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Add this to your Claude Desktop config (claude_desktop_config.json):" -ForegroundColor Yellow    
Write-Host "{
  `"mcpServers`": {
    `"firescrape`": {
      `"command`": `"bun`",
      `"args`": [`"run`", `"$scriptPath`"]
    }
  }
}" -ForegroundColor Gray
Write-Host "`nPress Enter to exit..."
Read-Host
