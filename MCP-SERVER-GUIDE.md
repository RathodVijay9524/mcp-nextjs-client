# 🔧 MCP Server Types & Configuration Guide

## 🎯 Overview
Your MCP Next.js Client now supports **3 types** of MCP servers with different transport protocols. Each type has its own use cases and configuration requirements.

---

## 📟 1. Stdio MCP Servers (Command Line)

### **What it is:**
- Traditional command-line based MCP servers
- Communication via stdin/stdout
- Most common type for local tools

### **Use Cases:**
- File system operations
- Local development tools  
- Git repositories
- Command line utilities
- Python/Node.js scripts

### **Configuration Example:**
```json
{
  "id": "filesystem-server",
  "name": "File System Tools",
  "transport": "stdio",
  "command": "python",
  "args": ["mcp_filesystem.py"],
  "description": "Local file operations"
}
```

### **Real Examples:**
- **File System Server:**
  - Command: `python`
  - Args: `filesystem_server.py`
  - Tools: file_read, file_write, dir_list

- **Git Server:**
  - Command: `node`  
  - Args: `git-mcp-server.js`
  - Tools: git_status, git_commit, git_push

---

## 🌐 2. SSE MCP Servers (Server-Sent Events)

### **What it is:**
- HTTP-based servers using Server-Sent Events
- Real-time communication over HTTP
- Great for web APIs and cloud services

### **Use Cases:**
- Web API integrations
- Cloud service connectors
- Real-time data feeds
- Webhook handlers
- Third-party service bridges

### **Configuration Example:**
```json
{
  "id": "api-server",
  "name": "Web API Tools", 
  "transport": "sse",
  "url": "http://localhost:8080/mcp/events",
  "headers": {
    "Authorization": "Bearer token123",
    "Content-Type": "application/json"
  },
  "description": "Web API operations"
}
```

### **Real Examples:**
- **GitHub API Server:**
  - URL: `http://localhost:8080/github/sse`
  - Headers: `{"Authorization": "token ghp_xxx"}`
  - Tools: create_issue, list_repos, get_commits

- **Weather API Server:**
  - URL: `http://api.weather.com/mcp/stream`
  - Headers: `{"X-API-Key": "weather_key"}`
  - Tools: get_weather, forecast, alerts

---

## 🔌 3. WebSocket MCP Servers (Real-time)

### **What it is:**
- Bi-directional real-time communication
- WebSocket protocol for instant updates
- Best for collaborative and real-time tools

### **Use Cases:**
- Real-time collaboration
- Live data streams
- Chat integrations
- Live monitoring
- Interactive dashboards

### **Configuration Example:**
```json
{
  "id": "realtime-server",
  "name": "Live Data Stream",
  "transport": "websocket", 
  "url": "ws://localhost:8080/mcp/live",
  "headers": {
    "Sec-WebSocket-Protocol": "mcp-v1"
  },
  "description": "Real-time data operations"
}
```

### **Real Examples:**
- **Slack Bot Server:**
  - URL: `ws://localhost:8080/slack/ws`
  - Tools: send_message, list_channels, get_users

- **Database Monitor:**
  - URL: `ws://localhost:8080/db/monitor`
  - Tools: query_stats, live_metrics, alert_status

---

## 🚀 How to Add Servers in Your App

### **1. Click "Add MCP Server"**
In the sidebar, find "MCP Servers" section and click **"+ Add"**

### **2. Fill Basic Info**
- **Server ID**: Unique identifier (e.g., `my-file-server`)
- **Display Name**: Human-readable name (e.g., `My File Tools`)
- **Description**: Brief description of what it does

### **3. Choose Transport Type**
Select from dropdown:
- 📟 **Stdio** - For command line servers
- 🌐 **SSE** - For HTTP/web servers  
- 🔌 **WebSocket** - For real-time servers

### **4. Configure Transport**
Fill in the specific fields based on transport type:

**For Stdio:**
- Command: `python`, `node`, `./my-server`
- Arguments: `server.py --port 8080`

**For SSE/WebSocket:**
- Server URL: `http://localhost:8080/mcp/events`
- Headers: JSON format with auth tokens, etc.

---

## 📋 Popular MCP Server Examples

### **🗂️ File & System Servers (Stdio)**
```bash
# File System MCP Server
python -m mcp_server_filesystem

# Git MCP Server  
node git-mcp-server.js

# System Info Server
./system-info-mcp --verbose
```

### **🌍 API & Web Servers (SSE)**
```bash
# GitHub MCP Server
curl http://localhost:8080/github/mcp/events

# Weather API Server
curl http://api.weather.com/mcp/stream

# News API Server
curl http://localhost:8080/news/mcp/events
```

### **⚡ Real-time Servers (WebSocket)**
```bash
# Slack Integration
wscat -c ws://localhost:8080/slack/mcp

# Live Analytics
wscat -c ws://analytics.local/mcp/live

# Chat Bot Server
wscat -c ws://localhost:8080/chat/mcp
```

---

## 🔍 Testing Your Servers

### **1. Server Status Check**
Look for the colored dot next to server name:
- 🟢 **Green**: Connected and working
- 🔴 **Red**: Disconnected or failed

### **2. Tools Count**
Check if tools are detected:
- Sidebar shows tool count
- Should increase when servers connect

### **3. Test Commands**
Try these in chat with "Use MCP Tools" enabled:

```
# For file servers
"List files in C:\Projects"
"Read file package.json"

# For API servers  
"Get weather for New York"
"List my GitHub repositories"

# For real-time servers
"Show live server metrics"
"Send Slack message to #general"
```

---

## 🛠️ Troubleshooting

### **Common Issues:**

**Stdio Server Won't Start:**
- Check if command exists: `python --version`
- Verify file paths are correct
- Check server script permissions

**SSE Server Connection Failed:**
- Verify URL is accessible: `curl http://localhost:8080/health`
- Check headers format (valid JSON)
- Ensure server supports CORS

**WebSocket Connection Dropped:**
- Test WebSocket URL: `wscat -c ws://localhost:8080/test`
- Check firewall/network settings
- Verify WebSocket protocol version

### **Debug Steps:**
1. Check browser console for errors
2. Verify server is running externally
3. Test connection without the app first
4. Check server logs for errors

---

## 🎉 Next Steps

1. **Start Simple**: Begin with a stdio file server
2. **Add Web APIs**: Try SSE for external services  
3. **Go Real-time**: Experiment with WebSocket for live data
4. **Mix & Match**: Use multiple server types together

Your MCP client now supports the full spectrum of MCP server types! 🚀
