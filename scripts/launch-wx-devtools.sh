#!/bin/bash
#
# Launch WeChat DevTools with Automation Port
# This script launches WeChat Developer Tools and ensures automation port is enabled
#
# Usage:
#   ./scripts/launch-wx-devtools.sh [project_path] [port]
#
# Arguments:
#   project_path: Path to mini program project (optional, opens empty IDE if not provided)
#   port: Automation port (default: 9420)

set -e

PROJECT_PATH="${1:-}"
PORT="${2:-9420}"
CLI_PATH="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
CONFIG_FILE="$HOME/Library/Application Support/微信开发者工具/Default/.ide"

echo "════════════════════════════════════════════════════════════"
echo "  WeChat DevTools Launcher"
echo "════════════════════════════════════════════════════════════"

# Check if WeChat DevTools is installed (macOS)
DEVTOOLS_APP="/Applications/wechatwebdevtools.app"
if [ ! -d "$DEVTOOLS_APP" ]; then
  echo "❌ WeChat Developer Tools not found at: $DEVTOOLS_APP"
  echo ""
  echo "Please install WeChat Developer Tools first:"
  echo "  https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
  exit 1
fi

echo "✅ WeChat DevTools found"
echo ""

# Check if CLI exists
if [ ! -f "$CLI_PATH" ]; then
  echo "❌ CLI not found at: $CLI_PATH"
  exit 1
fi

echo "✅ CLI found: $CLI_PATH"
echo ""

# Configure automation port if config file doesn't exist or port differs
if [ ! -f "$CONFIG_FILE" ] || ! grep -q "\"automationPort\": $PORT" "$CONFIG_FILE" 2>/dev/null; then
  echo "📝 Configuring automation port: $PORT"

  # Create config directory if it doesn't exist
  CONFIG_DIR=$(dirname "$CONFIG_FILE")
  mkdir -p "$CONFIG_DIR"

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

  echo "✅ Automation port configured"
else
  echo "✅ Automation port already configured: $PORT"
fi

echo ""

# Check if DevTools is already running
if pgrep -f "wechatwebdevtools" > /dev/null; then
  echo "⚠️  WeChat DevTools is already running"
  echo ""
  echo "Options:"
  echo "  1. Close existing instance and restart with new config"
  echo "  2. Keep existing instance (may not use new port config)"
  echo ""
  read -p "Enter choice (1 or 2): " choice

  if [ "$choice" = "1" ]; then
    echo "🔄 Closing existing DevTools instance..."
    pkill -f "wechatwebdevtools" || true
    sleep 2
  else
    echo "ℹ️  Keeping existing instance"
    echo ""
    echo "Note: Automation port $PORT may not be active if instance was"
    echo "      started with different configuration."
    exit 0
  fi
fi

# Launch WeChat DevTools
echo "🚀 Launching WeChat DevTools..."

if [ -n "$PROJECT_PATH" ]; then
  # Launch with project
  if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Project path not found: $PROJECT_PATH"
    exit 1
  fi

  echo "   Project: $PROJECT_PATH"
  echo "   Port: $PORT"
  echo ""

  "$CLI_PATH" open --project "$PROJECT_PATH" &
else
  # Launch without project
  echo "   Port: $PORT"
  echo "   (No project specified, opening empty IDE)"
  echo ""

  open -a wechatwebdevtools &
fi

# Wait for DevTools to start
echo "⏳ Waiting for DevTools to initialize..."
sleep 3

# Check if process started
if pgrep -f "wechatwebdevtools" > /dev/null; then
  echo "✅ WeChat DevTools launched successfully"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Automation Port: $PORT"
  echo "  WebSocket: ws://localhost:$PORT"
  echo ""
  echo "  To verify automation is enabled, check:"
  echo "  Settings → Security → Service Port (should be enabled)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "❌ Failed to launch WeChat DevTools"
  exit 1
fi
