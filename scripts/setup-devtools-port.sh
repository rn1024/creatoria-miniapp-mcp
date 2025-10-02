#!/bin/bash
#
# Setup WeChat DevTools Automation Port
# This script helps configure the automation port for WeChat Developer Tools
#
# Usage:
#   ./scripts/setup-devtools-port.sh [port]
#
# Default port: 9420

set -e

PORT="${1:-9420}"
CONFIG_FILE="$HOME/Library/Application Support/微信开发者工具/Default/.ide"

echo "════════════════════════════════════════════════════════════"
echo "  WeChat DevTools Automation Port Setup"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if WeChat DevTools is installed (macOS)
DEVTOOLS_APP="/Applications/wechatwebdevtools.app"
if [ ! -d "$DEVTOOLS_APP" ]; then
  echo "❌ WeChat Developer Tools not found at: $DEVTOOLS_APP"
  echo ""
  echo "Please install WeChat Developer Tools first:"
  echo "  https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
  echo ""
  exit 1
fi

echo "✅ WeChat Developer Tools found"
echo ""

# Check if config directory exists
CONFIG_DIR=$(dirname "$CONFIG_FILE")
if [ ! -d "$CONFIG_DIR" ]; then
  echo "⚠️  Config directory not found: $CONFIG_DIR"
  echo ""
  echo "Please launch WeChat Developer Tools at least once to create the config directory."
  echo ""
  exit 1
fi

echo "✅ Config directory found"
echo ""

# Create or update .ide config file
echo "Configuring automation port: $PORT"
echo ""

# Create config content
cat > "$CONFIG_FILE" <<EOF
{
  "setting": {
    "compileType": "miniprogram",
    "autoAudits": false,
    "autoPreview": false,
    "autoCompile": false,
    "autoNpm": false,
    "autoAudit": false,
    "checkSiteMap": false,
    "miniprogramRoot": "./",
    "condition": {}
  },
  "libVersion": "latest",
  "projectname": "",
  "description": "",
  "appid": "",
  "scripts": {},
  "automationPort": $PORT,
  "automationEnabled": true
}
EOF

echo "✅ Configuration file updated: $CONFIG_FILE"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Configuration Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Launch WeChat Developer Tools"
echo "2. Enable HTTP debugging:"
echo "   Settings → Security → Service Port: ON"
echo "   Port: $PORT"
echo ""
echo "3. Test the connection:"
echo "   node -e \"const automator = require('miniprogram-automator'); automator.connect({wsEndpoint: 'ws://localhost:$PORT'}).then(() => console.log('✅ Connected')).catch(console.error)\""
echo ""
echo "4. Use with MCP server:"
echo "   miniprogram_connect tool with port: $PORT"
echo ""
