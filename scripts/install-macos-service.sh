#!/bin/bash
set -e

echo "🚀 Installing OpenAI Proxy for Antigravity as macOS LaunchAgent..."
echo ""

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$HOME/Library/Logs/OpenAIProxyAntigravity"
PLIST_SRC="$INSTALL_DIR/templates/com.openai.proxy.antigravity.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.openai.proxy.antigravity.plist"

# Ensure we're in the project directory
cd "$INSTALL_DIR"

# Build the project
echo "📦 Building project..."
npm install
npm run build

# Create log directory
mkdir -p "$LOG_DIR"

# Check if plist template exists
if [ ! -f "$PLIST_SRC" ]; then
  echo "❌ Error: Template file not found at $PLIST_SRC"
  exit 1
fi

# Ensure LaunchAgents directory exists
mkdir -p "$HOME/Library/LaunchAgents"

# Replace placeholders in plist template
echo "📝 Creating LaunchAgent configuration..."
sed -e "s|__INSTALL_DIR__|$INSTALL_DIR|g" \
    -e "s|__LOG_DIR__|$LOG_DIR|g" \
    "$PLIST_SRC" > "$PLIST_DEST"

# Load the service
echo "🔄 Loading service..."
launchctl unload "$PLIST_DEST" 2>/dev/null || true
launchctl load "$PLIST_DEST"

echo ""
echo "✅ Antigravity Proxy installed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Service Information:"
echo "  Name:     com.antigravity.proxy"
echo "  Port:     3000"
echo "  URL:      http://localhost:3000"
echo "  Dashboard: http://localhost:3000/admin"
echo ""
echo "Logs:"
echo "  Output:   $LOG_DIR/antigravity-proxy.log"
echo "  Errors:   $LOG_DIR/antigravity-proxy-error.log"
echo ""
echo "Management Commands:"
echo "  Check status:   launchctl list | grep antigravity"
echo "  View logs:      tail -f $LOG_DIR/antigravity-proxy.log"
echo "  Stop service:   launchctl stop com.antigravity.proxy"
echo "  Start service:  launchctl start com.antigravity.proxy"
echo "  Uninstall:      ./scripts/uninstall-macos-service.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The service will start automatically on system boot."
echo "It should be running now. Check status with:"
echo "  curl http://localhost:3000/health"
echo ""
