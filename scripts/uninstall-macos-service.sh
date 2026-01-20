#!/bin/bash
set -e

echo "🗑️  Uninstalling Antigravity Proxy service..."
echo ""

PLIST_DEST="$HOME/Library/LaunchAgents/com.antigravity.proxy.plist"
LOG_DIR="$HOME/Library/Logs/AntigravityProxy"

# Stop and unload the service
if launchctl list | grep -q "com.antigravity.proxy"; then
    echo "⏹️  Stopping service..."
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    echo "✅ Service stopped"
fi

# Remove plist
if [ -f "$PLIST_DEST" ]; then
    rm "$PLIST_DEST"
    echo "✅ Configuration removed"
fi

echo ""
echo "Service uninstalled successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Note: Logs are still available at:"
echo "  $LOG_DIR/"
echo ""
echo "To remove logs:"
echo "  rm -rf \"$LOG_DIR\""
echo ""
echo "To remove the project entirely:"
echo "  cd .. && rm -rf antigravity-proxy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
