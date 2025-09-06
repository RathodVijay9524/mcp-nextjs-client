# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development Tasks
```bash
# Install dependencies
npm install

# Start development server with Turbopack (recommended)
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

### Testing and Validation
```bash
# Test LLM API connection via browser
# Navigate to http://localhost:3000, go to Settings, configure provider and click "Test"

# Test MCP server connection
# Add MCP server in Settings UI, check console for connection status
```

## Project Architecture

### High-Level Structure
This is a Next.js 15 application that provides a web-based client for Model Context Protocol (MCP) servers with multi-LLM chat capabilities. The architecture follows these key patterns:

**Multi-Provider LLM Architecture**: 
- Abstract LLM provider system supporting 6+ providers (OpenAI, Anthropic, Gemini, OpenRouter, Groq, Together AI, HuggingFace)
- Provider factory pattern with unified interface for different LLM APIs
- Dynamic provider switching at runtime with API key validation

**MCP Integration Layer**:
- Browser-based MCP client for connecting to Python STDIO MCP servers
- Server manager handling multiple concurrent MCP server connections
- Tool discovery and integration with LLM conversations

**Persistent Memory System**:
- Local storage-based chat session persistence with 50 session limit
- Message history with 1000 message limit per session
- Context-aware message retrieval for LLM conversations (4000 token sliding window)

**State Management Architecture**:
- Zustand store with persistence middleware
- Separation between UI state, chat state, LLM state, and MCP state
- Memory manager singleton for localStorage operations

### Key Components

**Core Directories**:
- `src/lib/llm/`: LLM provider implementations and management
- `src/lib/mcp/`: MCP client and server management
- `src/lib/memory/`: Chat session persistence and memory management
- `src/store/`: Zustand state management
- `src/components/chat/`: Chat interface components
- `src/components/ui/`: Reusable UI components

**Critical Files**:
- `src/lib/llm/providers.ts`: Contains all LLM provider implementations and factory
- `src/store/index.ts`: Main application state with all actions and state management
- `src/lib/memory/storage.ts`: MemoryManager singleton for chat persistence
- `src/types/index.ts`: TypeScript definitions for all data structures

### LLM Provider System
The application uses a provider pattern where each LLM service implements the same `LLMProvider` interface. Providers are dynamically instantiated through `LLMProviderFactory.createProvider()`. Each provider handles its own API authentication, request formatting, and response parsing.

**Free/Recommended Providers** (based on WORKING_PROVIDERS.md):
1. Google Gemini (`gemini-1.5-flash` for speed, `gemini-1.5-pro` for capability)
2. Groq (`llama3-8b-8192` for fastest inference)
3. OpenRouter (various free models with `:free` suffix)
4. Together AI (good free tier)

### MCP Integration
The MCP system allows connecting to external Python-based MCP servers via STDIO protocol. The `MCPClientManager` handles server connections and tool discovery. When "Use MCP Tools" is enabled, available tools are passed to the LLM via system prompts.

### Memory Management
The `MemoryManager` singleton handles all chat persistence using localStorage. It provides:
- Session CRUD operations with automatic cleanup
- Message management with token-aware context retrieval
- Search functionality across sessions and messages
- Export/import capabilities for chat data

### State Architecture
Zustand manages global application state with persistence for configuration data. The store separates concerns:
- Configuration (LLM config, MCP servers)
- Chat state (sessions, current session, messages)
- UI state (loading, errors)
- Actions for each domain

Critical state management happens in `useAppStore` which coordinates between the LLM manager, MCP client manager, and memory manager.

### Development Notes
- Uses Next.js 15 with Turbopack for fast development builds
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling
- Path aliases configured (`@/*` maps to `./src/*`)
- Browser-based architecture (no server-side MCP client code)

When working with this codebase:
- LLM provider changes require updating both the factory and available providers list
- MCP functionality requires running external Python servers
- Chat persistence relies on localStorage - clearing browser data loses chat history
- All API keys are stored in browser localStorage (not server-side)
