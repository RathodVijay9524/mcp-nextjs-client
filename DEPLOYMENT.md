# 🚀 MCP Next.js Client - Deployment Guide

## Live Demo
🔗 **Deployed App**: https://mcp-nextjs-client-xxx.vercel.app (Your actual URL here)

## 🎯 Features
- ✅ 42+ MCP Tools Integration
- ✅ Multi-LLM Support (OpenAI, Anthropic, Google)
- ✅ Real-time Project Analysis
- ✅ ChatGPT-like UI with Enhanced Formatting
- ✅ 3 Beautiful Themes (Dark, Green, Light)
- ✅ Responsive Design

## 🚀 Free Deployment Options

### 1. Vercel (Recommended) ⭐
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import this repository
5. Deploy automatically!

### 2. Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. "New site from Git"
4. Connect this repository
5. Build command: `npm run build`
6. Publish directory: `.next`

### 3. Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Auto-deploys on push

## 🔧 Environment Variables
For full functionality, set these in your deployment platform:

```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
```

## 📱 Usage
1. Configure your LLM provider (OpenAI/Anthropic/Google)
2. Enable "Use MCP Tools" for enhanced responses
3. Try: "Analyze this project: /path/to/your/project"

## 🛠️ Local Development
```bash
npm install
npm run dev
```

## 📝 Notes
- App works without API keys (demo mode)
- MCP tools provide real file system access
- Best experience with enabled MCP tools
