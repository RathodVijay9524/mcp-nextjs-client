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
        throw new Error(error.error || 'Failed to connect to MCP server');
      }

      this.isConnected = true;
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
      return data.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema
      }));
    } catch (error) {
      console.error('Failed to list tools:', error);
      throw error;
    }
  }

  async callTool(name: string, arguments_: Record<string, any>): Promise<any> {
    try {
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
    } catch (error) {
      console.error(`Failed to call tool ${name}:`, error);
      throw error;
    }
  }

  async listResources(): Promise<MCPResource[]> {
    // For now, return empty array - resources can be implemented similarly to tools
    return [];
  }

  async readResource(uri: string): Promise<string> {
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
