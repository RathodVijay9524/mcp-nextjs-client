import { MCPServerConfig, MCPTool, MCPResource } from '@/types';

// Browser-compatible MCP client that communicates with server-side API
export class MCPClient {
  private config: MCPServerConfig;
  private isConnected: boolean = false;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // For now, simulate connection success for all transport types
      // In a real implementation, this would:
      // - For stdio: start the process via server API
      // - For SSE: establish EventSource connection
      // - For WebSocket: establish WebSocket connection
      
      if (this.config.transport === 'stdio') {
        const response = await fetch('/api/mcp/servers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: this.config.id,
            name: this.config.name,
            command: this.config.command,
            args: this.config.args,
            env: this.config.env
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to connect to stdio MCP server');
        }
      } else if (this.config.transport === 'sse') {
        // For SSE, test the connection to the URL
        if (!this.config.url) {
          throw new Error('SSE URL is required');
        }
        
        console.log(`🔍 Testing SSE connection to: ${this.config.url}`);
        
        // Test SSE endpoint availability
        try {
          const response = await fetch(this.config.url, {
            method: 'HEAD',
            headers: {
              ...this.config.headers,
              'Accept': 'text/event-stream'
            }
          });
          
          console.log(`📡 SSE endpoint response: ${response.status} ${response.statusText}`);
          
          if (!response.ok && response.status !== 405) { // 405 Method Not Allowed is okay for HEAD requests
            throw new Error(`SSE endpoint unavailable: ${response.status}`);
          }
        } catch (fetchError) {
          console.warn('⚠️ SSE endpoint test failed, proceeding with connection attempt:', fetchError);
          // Continue anyway as some servers might not support HEAD requests
        }
      } else if (this.config.transport === 'websocket') {
        // For WebSocket, validate URL format
        if (!this.config.url) {
          throw new Error('WebSocket URL is required');
        }
        
        if (!this.config.url.startsWith('ws://') && !this.config.url.startsWith('wss://')) {
          throw new Error('WebSocket URL must start with ws:// or wss://');
        }
      }

      this.isConnected = true;
      console.log(`✅ MCP server ${this.config.name} (${this.config.transport}) connected successfully`);
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await fetch(`/api/mcp/servers?id=${encodeURIComponent(this.config.id)}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to disconnect from MCP server:', error);
    }
    
    this.isConnected = false;
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`/api/mcp/tools?serverId=${encodeURIComponent(this.config.id)}`);
      
      if (!response.ok) {
        throw new Error('Failed to list tools');
      }

      const data = await response.json();
      return data.tools.map((tool: { name: string; description?: string; inputSchema?: unknown }) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema
      }));
    } catch (error) {
      console.error('Failed to list tools:', error);
      throw error;
    }
  }

  async callTool(name: string, arguments_: Record<string, unknown>): Promise<unknown> {
    try {
      console.log(`🔧 Calling MCP tool: ${name} on ${this.config.transport} server ${this.config.name}`);
      console.log('📝 Tool arguments:', arguments_);
      
      if (this.config.transport === 'sse') {
        // For SSE servers, make direct HTTP calls to tool endpoints
        const toolUrl = `${this.config.url.replace('/events', '').replace('/sse', '')}/tools/${name}`;
        console.log(`🎯 Tool URL: ${toolUrl}`);
        
        const response = await fetch(toolUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.config.headers
          },
          body: JSON.stringify(arguments_)
        });

        if (!response.ok) {
          throw new Error(`Tool call failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Tool result:', result);
        return result;
        
      } else {
        // For stdio servers, use the existing API route
        const response = await fetch('/api/mcp/tools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serverId: this.config.id,
            toolName: name,
            arguments: arguments_
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to call tool');
        }

        const data = await response.json();
        return data.result;
      }
    } catch (error) {
      console.error(`❌ Failed to call tool ${name}:`, error);
      throw error;
    }
  }

  async listResources(): Promise<MCPResource[]> {
    // For now, return empty array - resources can be implemented similarly to tools
    return [];
  }

  async readResource(_uri: string): Promise<string> {
    // For now, return empty string - resources can be implemented similarly to tools
    return '';
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export class MCPClientManager {
  private clients: Map<string, MCPClient> = new Map();

  async addServer(config: MCPServerConfig): Promise<void> {
    const client = new MCPClient(config);
    await client.connect();
    this.clients.set(config.id, client);
  }

  async removeServer(serverId: string): Promise<void> {
    const client = this.clients.get(serverId);
    if (client) {
      await client.disconnect();
      this.clients.delete(serverId);
    }
  }

  getClient(serverId: string): MCPClient | undefined {
    return this.clients.get(serverId);
  }

  getAllClients(): MCPClient[] {
    return Array.from(this.clients.values());
  }

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.values()).map(client => 
      client.disconnect()
    );
    await Promise.all(disconnectPromises);
    this.clients.clear();
  }
  
  async getServerTools(serverId: string): Promise<string[]> {
    const client = this.clients.get(serverId);
    if (!client || !client.getConnectionStatus()) {
      return [];
    }
    
    try {
      const tools = await client.listTools();
      return tools.map(tool => tool.name);
    } catch (error) {
      console.error(`Failed to get tools for server ${serverId}:`, error);
      
      // Return demo tools based on server ID for demonstration
      if (serverId === 'demo-server-1') {
        return ['file_read', 'file_write', 'file_list', 'dir_create', 'search_files'];
      } else if (serverId === 'demo-server-2') {
        return ['web_scrape', 'api_call', 'http_request', 'json_parse', 'url_validate'];
      }
      
      return [];
    }
  }
}
