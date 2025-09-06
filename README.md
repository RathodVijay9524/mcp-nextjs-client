# MCP Next.js Client

A modern, web-based client for Model Context Protocol (MCP) servers with multi-modal LLM chat capabilities.

## Features

- **Multi-LLM Support**: Dynamic switching between OpenAI and Anthropic models
- **MCP Integration**: Connect to your Python STDIO MCP tools
- **Memory Management**: Persistent conversation history with localStorage
- **Real-time Chat**: Interactive chat interface with tool integration
- **Session Management**: Create, manage, and search through chat sessions
- **Configuration UI**: Easy setup for API keys and MCP server connections

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Your existing Python MCP server/tool
- API keys for OpenAI and/or Anthropic

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Configuration

#### 1. Configure LLM Provider

1. Click the **Settings** button in the sidebar
2. In the **LLM Configuration** section:
   - Select your preferred provider (OpenAI or Anthropic)
   - Choose a model
   - Enter your API key
   - Click **Test** to validate
   - Click **Save Configuration**

#### 2. Add MCP Server

1. In the **MCP Servers** section:
   - Click **Add Server**
   - Enter a descriptive name
   - Set the command (e.g., `python`)
   - Add arguments (e.g., `/path/to/your/mcp_server.py`)
   - Click **Add Server**

### Usage

#### Starting a Chat

1. Ensure your LLM is configured (green status indicator)
2. Click **New Chat** in the sidebar
3. Type your message and press Enter
4. Check **Use MCP Tools** to enable tool functionality

#### Managing Sessions

- **New Chat**: Create a fresh conversation
- **Search**: Find conversations by title or content
- **Delete**: Remove conversations (hover over session and click trash icon)
- **Switch**: Click any session to switch to it

#### MCP Tools

When MCP servers are connected and tools are available:
- Enable **Use MCP Tools** checkbox before sending messages
- The AI can access and use your connected tools
- Tool responses are integrated into the conversation

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   └── page.tsx           # Main application page
├── components/
│   ├── chat/              # Chat interface components
│   │   └── ChatInterface.tsx
│   └── ui/                # UI components
│       ├── Sidebar.tsx
│       └── ConfigurationDialog.tsx
├── lib/
│   ├── llm/               # LLM provider integrations
│   │   └── providers.ts
│   ├── mcp/               # MCP client implementation
│   │   └── client.ts
│   └── memory/            # Memory management
│       └── storage.ts
├── store/                 # Zustand state management
│   └── index.ts
└── types/                 # TypeScript definitions
    └── index.ts
```

## Configuration Examples

### OpenAI Configuration
- Provider: OpenAI
- Model: gpt-4o, gpt-4o-mini, gpt-4-turbo, etc.
- API Key: Your OpenAI API key

### Anthropic Configuration
- Provider: Anthropic
- Model: claude-3-5-sonnet-20241022, claude-3-opus-20240229, etc.
- API Key: Your Anthropic API key

### MCP Server Examples

#### Basic Python MCP Server
- Server Name: "My Python Tools"
- Command: `python`
- Arguments: `/path/to/your/mcp_server.py`

#### Python with Virtual Environment
- Server Name: "Venv Tools"
- Command: `/path/to/venv/bin/python`
- Arguments: `/path/to/your/mcp_server.py`

## Troubleshooting

### LLM Configuration Issues
- Verify API keys are correct
- Check API key permissions
- Ensure sufficient API credits/quota

### MCP Connection Issues
- Verify Python script path is correct
- Check that your MCP server implements the STDIO protocol
- Ensure all dependencies are installed
- Check console logs for connection errors

### Browser Compatibility
- Modern browsers required (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript must be enabled
- LocalStorage access required for session persistence

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **MCP SDK** - Model Context Protocol client
- **OpenAI SDK** - OpenAI API integration
- **Anthropic SDK** - Anthropic API integration
