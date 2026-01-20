# Antigravity Proxy

**OpenAI-compatible proxy server for Google Antigravity API**

Enables [Zed IDE](https://zed.dev) and other OpenAI-compatible clients to use Google's Antigravity API, which provides access to:
- **Claude Opus 4.5 & Sonnet 4.5** (including thinking models)
- **Gemini 3 Pro & Flash** (with extended thinking)
- **Gemini 2.5 Pro & Flash** (via Gemini CLI quota)

---

## ✨ Features

- **OpenAI-Compatible API**: Works with any client that supports OpenAI's chat completions API
- **Multi-Account Support**: Automatic rotation across multiple Google accounts
- **Rate Limit Handling**: Intelligent account switching when limits are hit
- **OAuth Token Management**: Automatic token refresh
- **Admin Dashboard**: Web UI for monitoring usage, accounts, and metrics
- **Multiple Deployment Options**: Local service, Docker, or standalone
- **Zero Configuration**: Uses existing `~/.config/opencode/antigravity-accounts.json` from opencode-antigravity-auth

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- Authenticated Google account via [opencode-antigravity-auth](https://github.com/NoeFabris/opencode-antigravity-auth)

### Option 1: Local Installation (macOS Service)

```bash
# Install dependencies and build
npm install
npm run build

# Install as macOS LaunchAgent (auto-starts on boot)
npm run install-service

# Verify it's running
curl http://localhost:3000/health
```

### Option 2: Docker

```bash
# Build and run with docker-compose
npm run docker:up

# Or build manually
docker build -f docker/Dockerfile -t antigravity-proxy .
docker run -d -p 3000:3000 \
  -v ~/.config/opencode:/app/config:ro \
  antigravity-proxy
```

### Option 3: Development Mode

```bash
npm install
npm run dev
```

---

## 🔧 Configuration for Zed IDE

Generate Zed configuration:

```bash
npm run generate-zed-config
```

This outputs a JSON configuration. Add it to your Zed settings (`~/.config/zed/settings.json`):

```json
{
  "language_models": {
    "openai_compatible": {
      "Antigravity": {
        "api_url": "http://localhost:3000/v1",
        "available_models": [
          {
            "name": "antigravity-claude-sonnet-4-5-thinking",
            "display_name": "Claude Sonnet 4.5 Thinking (Antigravity)",
            "max_tokens": 200000,
            "max_output_tokens": 64000,
            "supports_tools": true,
            "supports_images": true
          },
          {
            "name": "antigravity-gemini-3-pro",
            "display_name": "Gemini 3 Pro (Antigravity)",
            "max_tokens": 1048576,
            "max_output_tokens": 65535,
            "supports_tools": true,
            "supports_images": true
          }
          // ... more models
        ]
      }
    }
  }
}
```

Then in Zed:
1. Open Agent Panel
2. Select model from "Antigravity" provider
3. Start using!

---

## 📊 Admin Dashboard

Access the web dashboard at: **http://localhost:3000/admin**

Features:
- Real-time server status
- Account monitoring and rate limit status
- Usage metrics and statistics
- Request logs

---

## 🔐 Authentication

This proxy reuses authentication from `opencode-antigravity-auth`. 

If you haven't authenticated yet:

```bash
# In the opencode-antigravity-auth directory
cd ../opencode-antigravity-auth
opencode auth login
```

The proxy will automatically find accounts at `~/.config/opencode/antigravity-accounts.json`.

---

## 📡 API Endpoints

### POST /v1/chat/completions
OpenAI-compatible chat completions endpoint.

**Example:**
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "antigravity-claude-sonnet-4-5-thinking",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": false
  }'
```

### GET /v1/models
List available models.

```bash
curl http://localhost:3000/v1/models
```

### GET /health
Health check endpoint.

```bash
curl http://localhost:3000/health
```

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop
docker-compose -f docker/docker-compose.yml down
```

### Manual Docker

```bash
# Build
docker build -f docker/Dockerfile -t antigravity-proxy .

# Run
docker run -d \
  -p 3000:3000 \
  -v ~/.config/opencode:/app/config:ro \
  --name antigravity-proxy \
  antigravity-proxy

# Logs
docker logs -f antigravity-proxy
```

---

## 🍎 macOS Service Management

### Install Service

```bash
./scripts/install-macos-service.sh
```

The service will:
- Auto-start on system boot
- Restart automatically if it crashes
- Log to `~/Library/Logs/AntigravityProxy/`

### Manage Service

```bash
# Check status
launchctl list | grep antigravity

# View logs
tail -f ~/Library/Logs/AntigravityProxy/antigravity-proxy.log

# Stop service
launchctl stop com.antigravity.proxy

# Start service
launchctl start com.antigravity.proxy

# Uninstall completely
./scripts/uninstall-macos-service.sh
```

---

## 🔍 Troubleshooting

### "No accounts configured" error

Make sure you've authenticated with opencode-antigravity-auth:

```bash
cd ../opencode-antigravity-auth
opencode auth login
```

The proxy looks for accounts at: `~/.config/opencode/antigravity-accounts.json`

### "All accounts rate-limited" error

All your Google accounts have hit rate limits. You can:
- Wait for limits to reset (check dashboard for reset times)
- Add more accounts: `opencode auth login` (in opencode-antigravity-auth)

### Connection errors in Zed

1. Verify proxy is running: `curl http://localhost:3000/health`
2. Check Zed settings have correct `api_url`: `http://localhost:3000/v1`
3. Check logs: `tail -f ~/Library/Logs/AntigravityProxy/antigravity-proxy.log`

### Port 3000 already in use

Change the port:

```bash
PORT=3001 npm start
```

Or in Docker:

```bash
docker run -d -p 3001:3000 ...
```

Update Zed config to use the new port.

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Zed IDE   │ ──────▶ │  Proxy Server    │ ──────▶ │  Antigravity    │
│             │  OpenAI │  (localhost:3000)│  OAuth  │  API (Google)   │
│  settings   │  format │  - OAuth refresh │  Bearer │                 │
│  .json      │         │  - Request xform │  Token  │  Claude/Gemini  │
└─────────────┘         └──────────────────┘         └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Accounts   │
                        │ (shared with │
                        │  OpenCode)   │
                        └──────────────┘
```

**Key Components:**
- **OpenAI Adapter**: Converts OpenAI format ↔ Antigravity format
- **Account Manager**: Handles multi-account rotation and rate limiting
- **OAuth Handler**: Automatic token refresh
- **Admin Dashboard**: Real-time monitoring UI

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Type checking only
npm run typecheck

# Build for production
npm run build

# Run production build
npm start
```

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `NODE_ENV` | `production` | Environment |
| `LOG_LEVEL` | `info` | Logging level (`debug`, `info`, `warn`, `error`) |
| `CONFIG_DIR` | `~/.config/opencode` | Config directory |
| `ADMIN_ENABLED` | `true` | Enable admin dashboard |

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

Based on [opencode-antigravity-auth](https://github.com/NoeFabris/opencode-antigravity-auth) by [@NoeFabris](https://github.com/NoeFabris).

---

## ⚠️ Legal Disclaimer

This proxy may violate Google's Terms of Service. Use at your own risk for personal/internal development only.

- **Not affiliated with Google**
- **No guarantees** - APIs may change without notice
- **Account risk** - Google may suspend accounts using this
- **Assumption of risk** - You assume all legal and technical risks

---

## 🔗 Related Projects

- [opencode-antigravity-auth](https://github.com/NoeFabris/opencode-antigravity-auth) - OpenCode plugin for Antigravity OAuth
- [Zed IDE](https://zed.dev) - High-performance code editor

---

**Made with ❤️ for the coding community**
