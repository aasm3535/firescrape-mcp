#!/bin/bash

echo "🔥 Setting up FireScrape MCP..."

# Check for Bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Install Deps
echo "📦 Installing dependencies..."
bun install

# Output Config
CURRENT_PATH=$(pwd)
SCRIPT_PATH="$CURRENT_PATH/index.ts"

echo "✅ Setup complete!"
echo ""
echo "📝 Add this to your Claude Desktop config:"
echo "{"
echo "  \"mcpServers\": {"
echo "    \"firescrape\": {"
echo "      \"command\": \"bun\","
echo "      \"args\": [\"run\", \"$SCRIPT_PATH\"]"
echo "    }"
echo "  }"
echo "}"
