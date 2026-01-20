# Antigravity Proxy - Quick Start

## 🚀 Setup in 3 Steps

### 1. Install Dependencies
```bash
npm install
npm run build
```

### 2. Authenticate
This proxy uses accounts from `opencode-antigravity-auth`. If you haven't authenticated yet:

```bash
cd ../opencode-antigravity-auth
opencode auth login
```

The proxy will automatically find accounts at `~/.config/opencode/antigravity-accounts.json`.

### 3. Start the Proxy

**Option A: Development Mode**
```bash
npm run dev
```

**Option B: Production Mode**
```bash
npm start
```

**Option C: Install as macOS Service** (auto-starts on boot)
```bash
npm run install-service
```

**Option D: Docker**
```bash
npm run docker:up
```

## ✅ Verify It's Working

```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "accounts": {
    "total": 1,
    "available": 1
  }
}
```

## 📊 Admin Dashboard

Open in your browser: **http://localhost:3000/admin**

## 🔧 Configure Zed IDE

Generate configuration:
```bash
npm run generate-zed-config
```

Add the output to `~/.config/zed/settings.json`, then restart Zed and select models from the "Antigravity" provider.

## 📖 Full Documentation

See [README.md](README.md) for complete documentation.
