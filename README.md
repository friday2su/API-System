# 🚀 Premium API Testing Tool

A high-performance, aesthetically pleasing API Testing Tool built for speed and precision. This tool provides a professional interface for executing requests, spoofing headers, and analyzing beautiful response outputs.

## Demo
https://github.com/user-attachments/assets/1b35e32f-41b9-4f12-898c-8523fd182532

## ✨ Key Features
- **Intelligent URL Auto-Protocol**: Smarter than a browser—detects and fixes missing protocols (supports `https` auto-fill and `localhost` detection).
- **Advanced Request Spoofing**: Built-in support for `Origin` and `Referer` spoofing to bypass security blocks during testing.
- **Cinematic Workspace**: Professional 1.2s high-fidelity animations with gaussian blur and smooth vertical layout shifts.
- **Intelligent Prettifier**: Multi-tenant engine for automatic indentation and syntax-preservation of JSON and raw HTML responses.
- **Ultra-Premium UI**: Fully custom-built interaction components (dropdowns, toggles, buttons) with zero browser-default styles.
- **Zero-Breach Scroll Engine**: Battle-tested container architecture that handles massive payloads without UI layout breakage.
- **Integrated Performance Metrics**: Real-time monitoring of status codes, payload size, and millisecond-accurate response timing.
- **Multi-Tab Insights**: Specialized views for high-density Response Previews, Request Headers, and Debug Traces.
- **Request History**: Persistent local storage of your last 20 requests—instant one-click re-run capability.
- **One-Click Code Snippets**: Generate production-ready integration code for JavaScript (Axios) and cURL instantly.
- **Intelligent cURL Import**: Paste any standard cURL command directly into the URL bar to auto-populate the entire workspace.
- **Dedicated Auth Engine**: Securely configure Bearer Tokens, Basic Auth, and API Keys through a dedicated UI.
- **Global Environment Variables**: Define dynamic variables like `{{host}}` or `{{token}}` to manage multi-environment workflows effortlessly.
- **TypeScript Interface Generator**: One-click conversion of JSON responses into production-ready TypeScript interfaces.
- **One-Click Payload Download**: Instantly save API responses as local `.json` or `.html` files.
- **Response Search**: Built-in filter engine to navigate and find specific data within massive JSON/HTML payloads.
- **CORS-Bypass Proxy**: Built-in backend engine to execute requests that typically fail due to Cross-Origin browser security.
- **Serverless Ready**: Native support for Vercel Serverless Functions—low-latency, zero-server-management needed.
- **One-Click Clipboard**: Instant state-aware copying for both headers and pretty-formatted payloads.
- **Dark Mode First**: Carefully curated charcoal grey color palette designed for high-density debugging sessions.

## 🛠️ Project Structure
- **/client**: Vite + React frontend with a custom Vanilla CSS design system.
- **/server**: Node.js + Express proxy backend to handle CORS and sensitive header forwarding.

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed

### Option A: Full Setup (Recommended for CORS Proxy)

Run both the backend proxy and frontend client together.

**1. Install Dependencies**
```bash
# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

**2. Start Backend Proxy**
```bash
cd server
npm run dev   # Development mode with hot-reload (http://localhost:5000)
# OR
npm start     # Production mode
```

**3. Start Frontend (in a new terminal)**
```bash
cd client
npm run dev   # Development server (http://localhost:5173)
```

### Option B: Frontend Only (No CORS Proxy)

If you don't need the CORS bypass proxy, you can run just the frontend:

```bash
cd client
npm install
npm run dev
```

### Option C: Vercel Deployment (Monorepo)
- Framework Preset: **Vite** or **Other**
- Root Directory: `./` (root)
- Build Command: `npm run build`
- Output Directory: `client/dist`
- Environment Variable: Set `VITE_API_URL` to your full Vercel URL + `/api/request` (e.g., `https://your-app.vercel.app/api/request`)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend proxy URL for CORS bypass | `http://localhost:5000` (dev) |

### Ports

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5000 |

---

## ⚖️ License
This project is licensed under the [MIT License](LICENSE).

## 🎨 Design Philosophy
The system follows a "Hidden by Default" configuration approach, keeping the UI focused on the URL bar while providing a one-click cinematic reveal of advanced configuration panels.

---
*Created by [Friday](https://github.com/friday2su) for developers who value both functionality and aesthetics.*
