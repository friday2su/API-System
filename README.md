# 🚀 Premium API Testing Tool

A high-performance, aesthetically pleasing API Testing Tool built for speed and precision. This tool provides a professional interface for executing requests, spoofing headers, and analyzing beautiful response outputs.

## Demo
https://github.com/user-attachments/assets/1b35e32f-41b9-4f12-898c-8523fd182532

## ✨ Key Features
- **Dynamic Request Bar**: Minimalist URL input with custom method selector (GET, POST, PUT, DELETE, etc.).
- **Advanced Request Spoofing**: Built-in support for `Origin` and `Referer` spoofing to bypass simple security layers.
- **Cinematic Transitions**: Professional high-fidelity animations with blur effects and smooth layout shifts.
- **Intelligent Prettifier**: Automatic indentation and formatting for JSON and raw HTML responses.
- **Multi-Tab Insights**: Separate views for Response Preview, Request Headers, and Debug Traces.
- **Dark Mode First**: Carefully curated charcoal grey color palette designed for high-density debugging sessions.

## 🛠️ Project Structure
- **/client**: Vite + React frontend with a custom Vanilla CSS design system.
- **/server**: Node.js + Express proxy backend to handle CORS and sensitive header forwarding.

## 🚀 Setup Instructions

### 1. Backend Proxy
```bash
cd server
npm install
npm start
```
*Runs on http://localhost:5000*

### 3. Vercel Deployment (Monorepo)
- Framework Preset: **Vite** or **Other**
- Root Directory: `./` (root)
- Build Command: `npm run build`
- Output Directory: `client/dist`
- Environment Variable: Set `VITE_API_URL` to your full Vercel URL + `/api/request` (e.g., `https://your-app.vercel.app/api/request`)

---

## ⚖️ License
This project is licensed under the [MIT License](LICENSE).

## 🎨 Design Philosophy
The system follows a "Hidden by Default" configuration approach, keeping the UI focused on the URL bar while providing a one-click cinematic reveal of advanced configuration panels.

---
*Created by [Friday](https://github.com/friday2su) for developers who value both functionality and aesthetics.*
