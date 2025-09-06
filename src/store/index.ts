import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSession, Message, LLMConfig, MCPServerConfig, AppConfig } from '@/types';
import { LLMManager } from '@/lib/llm/providers';
import { MCPClientManager } from '@/lib/mcp/browser-client';
import { BridgeMCPClient } from '@/lib/mcp/bridge-client';
import { MemoryManager } from '@/lib/memory/storage';

interface AppState {
  // Configuration
  config: AppConfig | null;
  
  // Chat State
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  
  // LLM State
  llmManager: LLMManager;
  isLLMConfigured: boolean;
  
  // MCP State
  mcpClientManager: MCPClientManager;
  bridgeClient: BridgeMCPClient;
  mcpServers: MCPServerConfig[];
  availableTools: string[];
  bridgeConnected: boolean;
  
  // Actions
  setConfig: (config: AppConfig) => void;
  updateLLMConfig: (llmConfig: LLMConfig) => Promise<void>;
  
  // Session Actions
  createNewSession: (title?: string) => void;
  setCurrentSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  loadSessions: () => void;
  
  // Message Actions
  sendMessage: (content: string, useTools?: boolean) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  
  // MCP Actions
  addMCPServer: (config: MCPServerConfig) => Promise<void>;
  removeMCPServer: (serverId: string) => Promise<void>;
  toggleMCPServer: (serverId: string) => Promise<void>;
  refreshMCPTools: () => Promise<void>;
  checkBridgeConnection: () => Promise<void>;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      config: null,
      sessions: [],
      currentSession: null,
      isLoading: false,
      error: null,
      llmManager: new LLMManager(),
      isLLMConfigured: false,
      mcpClientManager: new MCPClientManager(),
      bridgeClient: new BridgeMCPClient(),
      bridgeConnected: false,
      mcpServers: [
        {
          id: 'demo-server-1',
          name: 'File System Tools',
          transport: 'stdio',
          command: 'python',
          args: ['/path/to/filesystem-mcp.py'],
          description: 'Local file operations and analysis',
          isConnected: true,
          capabilities: ['file_read', 'file_write', 'dir_list']
        },
        {
          id: 'demo-server-2', 
          name: 'Web & API Tools',
          transport: 'sse',
          url: 'http://localhost:8080/mcp/events',
          description: 'Web scraping and API interactions',
          isConnected: false,
          capabilities: ['web_scrape', 'api_call', 'http_request']
        }
      ],
      availableTools: [
        'file_read', 'file_write', 'file_list', 'dir_create', 'search_files',
        'web_scrape', 'api_call', 'data_analysis', 'image_process', 'pdf_extract',
        'json_parse', 'csv_read', 'excel_read', 'sql_query', 'http_request',
        'text_summarize', 'translate', 'sentiment_analysis', 'keyword_extract', 'regex_match',
        'math_calculate', 'date_format', 'string_process', 'hash_generate', 'encode_decode',
        'git_status', 'git_commit', 'git_push', 'git_pull', 'git_branch',
        'docker_run', 'docker_build', 'process_list', 'system_info', 'disk_usage',
        'network_ping', 'port_scan', 'dns_lookup', 'ssl_check', 'url_validate',
        'email_send', 'sms_send', 'slack_post', 'discord_send', 'telegram_send',
        'calendar_create', 'calendar_list'
      ],
      
      // Configuration Actions
      setConfig: (config: AppConfig) => {
        set({ config });
      },
      
      updateLLMConfig: async (llmConfig: LLMConfig) => {
        const { llmManager } = get();
        try {
          set({ isLoading: true, error: null });
          await llmManager.setProvider(llmConfig);
          set({ 
            isLLMConfigured: true,
            config: { 
              ...get().config!, 
              llm: llmConfig 
            }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to configure LLM';
          set({ error: errorMessage, isLLMConfigured: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Session Actions
      createNewSession: (title?: string) => {
        const memoryManager = MemoryManager.getInstance();
        const newSession = memoryManager.createSession(title);
        const sessions = memoryManager.getAllSessions();
        
        set({ 
          sessions,
          currentSession: newSession 
        });
      },
      
      setCurrentSession: (sessionId: string) => {
        const memoryManager = MemoryManager.getInstance();
        const session = memoryManager.getSession(sessionId);
        
        if (session) {
          set({ currentSession: session });
        }
      },
      
      deleteSession: (sessionId: string) => {
        const memoryManager = MemoryManager.getInstance();
        memoryManager.deleteSession(sessionId);
        const sessions = memoryManager.getAllSessions();
        
        const { currentSession } = get();
        const newCurrentSession = currentSession?.id === sessionId 
          ? (sessions[0] || null) 
          : currentSession;
        
        set({ 
          sessions,
          currentSession: newCurrentSession 
        });
      },
      
      loadSessions: () => {
        const memoryManager = MemoryManager.getInstance();
        const sessions = memoryManager.getAllSessions();
        set({ sessions });
        
        // Check bridge connection on app load
        setTimeout(() => {
          get().checkBridgeConnection();
        }, 1000); // Small delay to ensure app is ready
      },
      
      // Message Actions
      sendMessage: async (content: string, useTools: boolean = false) => {
        const { currentSession, llmManager, isLLMConfigured, createNewSession } = get();
        
        // Auto-create session if none exists
        let activeSession = currentSession;
        if (!activeSession) {
          createNewSession();
          activeSession = get().currentSession;
          if (!activeSession) {
            throw new Error('Failed to create new session');
          }
        }
        
        if (!isLLMConfigured) {
          throw new Error('LLM not configured');
        }
        
        const memoryManager = MemoryManager.getInstance();
        
        try {
          set({ isLoading: true, error: null });
          
          // Add user message
          memoryManager.addMessage(activeSession.id, {
            role: 'user',
            content,
            provider: llmManager.getCurrentConfig()?.provider,
            model: llmManager.getCurrentConfig()?.model
          });
          
          // Get context messages for LLM
          const contextMessages = memoryManager.getContextMessages(activeSession.id);
          
          // Prepare enhanced system prompt for MCP tools if requested
          let systemPrompt = '';
          if (useTools) {
            const tools = get().availableTools;
            if (tools.length > 0) {
              systemPrompt = `You are an intelligent AI assistant with access to ${tools.length} powerful MCP (Model Context Protocol) tools for real-time analysis and operations.

## 🛠️ Core Capabilities
**Available Tools:** ${tools.slice(0, 15).join(', ')}${tools.length > 15 ? `, and ${tools.length - 15} more specialized tools` : ''}

## 📋 Operating Instructions

### 🎯 Always Use Tools For:
• **File Operations:** Reading, writing, creating, searching files and directories
• **Project Analysis:** Code examination, dependency analysis, structure mapping
• **Data Processing:** JSON parsing, CSV analysis, API interactions
• **System Operations:** Process monitoring, disk usage, network diagnostics
• **Web Operations:** Content scraping, HTTP requests, API calls
• **Version Control:** Git operations, repository analysis
• **Development Tools:** Docker operations, build processes

### 📁 File Structure Analysis Protocol:
When analyzing projects, follow this systematic approach:
1. **Initial Scan:** Use \`file_list\` to map directory structure
2. **Configuration Files:** Examine package.json, requirements.txt, Cargo.toml, etc.
3. **Documentation:** Read README, CHANGELOG, documentation files
4. **Source Code:** Analyze main entry points and key modules
5. **Dependencies:** Map all external libraries and frameworks
6. **Build System:** Identify build tools, scripts, deployment config

### 💬 Response Formatting Standards:
Structure ALL responses using this format:

**🔍 [Operation Type]**
*Brief overview of what was analyzed/performed*

**📊 Key Findings:**
• **Project Type:** [Web App / CLI Tool / Library / etc.]
• **Primary Language:** [Language + version if detected]
• **Framework/Platform:** [React, Express, Django, etc.]
• **Purpose:** [What the project does]

**🗂️ Project Structure:**
\`\`\`
project-root/
├── src/           # Source code
├── public/        # Static assets
├── docs/          # Documentation
└── config/        # Configuration
\`\`\`

**📦 Dependencies & Technologies:**
• **Production:** [key runtime dependencies]
• **Development:** [build tools, testing frameworks]
• **Services:** [databases, APIs, external services]

**⚡ Quick Insights:**
• [Notable patterns or architectural decisions]
• [Potential issues or recommendations]
• [Performance considerations]

### 🎨 Visual Enhancement Rules:
- Use emojis contextually for headers and key points
- Format file paths in code blocks with folder icons
- Highlight important information with **bold text**
- Use bullet points for lists and hierarchical information
- Include relevant technical details from actual file analysis
- Always provide actionable insights, not generic descriptions

### ⚠️ Critical Requirements:
- **NO GENERIC RESPONSES** - Always use tools to get real data
- **BE SPECIFIC** - Reference actual files, line numbers, and content
- **PROVIDE CONTEXT** - Explain what files/data you're examining
- **ACTIONABLE INSIGHTS** - Give practical recommendations based on findings

Remember: Your power comes from using MCP tools to provide real, accurate, and detailed analysis rather than generic AI responses.`;
            }
          }
          
          // Special handling: detect project analysis command
          const projectMatch = content.match(/^\s*Analyze\s+this\s+project:\s*(.+)$/i);
          if (projectMatch) {
            const projectPath = projectMatch[1].trim();
            const { bridgeClient, bridgeConnected } = get();

            // Ensure bridge connection state is updated
            if (!bridgeConnected) {
              await get().checkBridgeConnection();
            }

            // Call bridge to analyze project (falls back to demo if not connected)
            const analysis = await bridgeClient.analyzeProject(projectPath);

            const response = `**🔍 Project Analysis**\n\n**📁 Path:** ${projectPath}\n\n**📊 Summary:**\n• Type: ${analysis.type}\n• Language: ${analysis.language}\n• Framework: ${analysis.framework || 'N/A'}\n\n**🗂️ Structure (sample):**\n${Object.keys(analysis.structure).slice(0, 8).map(k => `• ${k}`).join('\n')}\n\n**📦 Dependencies (sample):**\n${Object.keys(analysis.dependencies || {}).slice(0, 10).map(k => `• ${k}`).join('\n') || '• None detected'}\n\n**💡 Insights:**\n${(analysis.insights || []).slice(0, 5).map(i => `• ${i}`).join('\n') || '• No specific insights'}\n\n${analysis.note ? `> ${analysis.note}` : ''}`;

            memoryManager.addMessage(activeSession.id, {
              role: 'assistant',
              content: response,
              provider: llmManager.getCurrentConfig()?.provider,
              model: llmManager.getCurrentConfig()?.model
            });
          } else {
            // Generate response from LLM
            const assistantResponse = await llmManager.generateResponse(
              contextMessages,
              systemPrompt || undefined
            );
            
            // Add assistant message
            memoryManager.addMessage(activeSession.id, {
              role: 'assistant',
              content: assistantResponse,
              provider: llmManager.getCurrentConfig()?.provider,
              model: llmManager.getCurrentConfig()?.model
            });
          }
          
          // Update session in state
          const updatedSession = memoryManager.getSession(activeSession.id);
          if (updatedSession) {
            set({ currentSession: updatedSession });
          }
          
          // Update sessions list
          const sessions = memoryManager.getAllSessions();
          set({ sessions });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const memoryManager = MemoryManager.getInstance();
        memoryManager.addMessage(currentSession.id, message);
        
        const updatedSession = memoryManager.getSession(currentSession.id);
        if (updatedSession) {
          set({ currentSession: updatedSession });
        }
        
        const sessions = memoryManager.getAllSessions();
        set({ sessions });
      },
      
      // MCP Actions
      addMCPServer: async (config: MCPServerConfig) => {
        const { mcpClientManager } = get();
        
        // Client-side validation
        if (!config.id || !config.name) {
          throw new Error('Server ID and name are required');
        }
        
        if (config.transport === 'stdio' && !config.command) {
          throw new Error('Command is required for stdio transport');
        }
        
        if ((config.transport === 'sse' || config.transport === 'websocket') && !config.url) {
          throw new Error('URL is required for SSE/WebSocket transport');
        }
        
        // Check for duplicate server IDs
        const existingServer = get().mcpServers.find(s => s.id === config.id);
        if (existingServer) {
          throw new Error(`Server with ID '${config.id}' already exists`);
        }
        
        try {
          set({ isLoading: true, error: null });
          await mcpClientManager.addServer(config);
          
          const mcpServers = [...get().mcpServers, { ...config, isConnected: true }];
          set({ mcpServers });
          
          // Refresh available tools
          await get().refreshMCPTools();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add MCP server';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      removeMCPServer: async (serverId: string) => {
        const { mcpClientManager } = get();
        
        try {
          await mcpClientManager.removeServer(serverId);
          const mcpServers = get().mcpServers.filter(s => s.id !== serverId);
          set({ mcpServers });
          
          // Refresh available tools
          await get().refreshMCPTools();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove MCP server';
          set({ error: errorMessage });
        }
      },
      
      toggleMCPServer: async (serverId: string) => {
        const mcpServers = get().mcpServers.map(server => {
          if (server.id === serverId) {
            return { ...server, isConnected: !server.isConnected };
          }
          return server;
        });
        
        set({ mcpServers });
        
        // Refresh available tools
        await get().refreshMCPTools();
      },
      
      refreshMCPTools: async () => {
        try {
          const { mcpServers, mcpClientManager } = get();
          
          // Get tools from all connected servers
          let totalTools: string[] = [];
          
          for (const server of mcpServers) {
            if (server.isConnected) {
              try {
                // Simulate getting tools from MCP server
                // In a real implementation, this would call the MCP client
                const serverTools = await mcpClientManager.getServerTools(server.id);
                totalTools = [...totalTools, ...serverTools];
              } catch (error) {
                console.error(`Failed to get tools from server ${server.name}:`, error);
              }
            }
          }
          
          // For demo purposes, simulate some tools if servers are connected
          if (mcpServers.some(s => s.isConnected) && totalTools.length === 0) {
            totalTools = [
              'file_read', 'file_write', 'file_list', 'dir_create', 'search_files',
              'web_scrape', 'api_call', 'data_analysis', 'image_process', 'pdf_extract',
              'json_parse', 'csv_read', 'excel_read', 'sql_query', 'http_request',
              'text_summarize', 'translate', 'sentiment_analysis', 'keyword_extract', 'regex_match',
              'math_calculate', 'date_format', 'string_process', 'hash_generate', 'encode_decode',
              'git_status', 'git_commit', 'git_push', 'git_pull', 'git_branch',
              'docker_run', 'docker_build', 'process_list', 'system_info', 'disk_usage',
              'network_ping', 'port_scan', 'dns_lookup', 'ssl_check', 'url_validate',
              'email_send', 'sms_send'
            ];
          }
          
          set({ availableTools: totalTools });
        } catch (error) {
          console.error('Failed to refresh MCP tools:', error);
          set({ availableTools: [] });
        }
      },
      
      // Bridge Actions
      checkBridgeConnection: async () => {
        const { bridgeClient } = get();
        try {
          const connected = await bridgeClient.checkConnection();
          set({ bridgeConnected: connected });
          if (connected) {
            console.log('🌉 Bridge connection established');
          }
        } catch (error) {
          console.log('Bridge connection failed, using demo mode');
          set({ bridgeConnected: false });
        }
      },
      
      // UI Actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'mcp-app-storage',
      partialize: (state) => ({
        config: state.config,
        mcpServers: state.mcpServers
      })
    }
  )
);
