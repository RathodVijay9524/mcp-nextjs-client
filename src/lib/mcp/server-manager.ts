// This file will run on the server side only
import { spawn, ChildProcess } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface MCPServerProcess {
  id: string;
  name: string;
  command: string;
  args: string[];
  process: ChildProcess | null;
  client: Client | null;
  transport: StdioClientTransport | null;
  isConnected: boolean;
}

export class ServerSideMCPManager {
  private static instance: ServerSideMCPManager;
  private servers: Map<string, MCPServerProcess> = new Map();

  private constructor() {}

  static getInstance(): ServerSideMCPManager {
    if (!ServerSideMCPManager.instance) {
      ServerSideMCPManager.instance = new ServerSideMCPManager();
    }
    return ServerSideMCPManager.instance;
  }

  async addServer(config: {
    id: string;
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
  }): Promise<void> {
    const serverProcess: MCPServerProcess = {
      id: config.id,
      name: config.name,
      command: config.command,
      args: config.args,
      process: null,
      client: null,
      transport: null,
      isConnected: false
    };

    try {
      // Create the transport first
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: { ...process.env, ...config.env }
      });

      serverProcess.transport = transport;

      // Create client with proper capabilities
      const client = new Client({
        name: 'mcp-nextjs-server',
        version: '1.0.0'
      }, {
        capabilities: {
          sampling: {},
          tools: {},
          resources: {}
        }
      });

      // Connect client to transport
      await client.connect(transport);
      serverProcess.client = client;
      serverProcess.isConnected = true;

      console.log(`Successfully connected to MCP server: ${config.name}`);
      this.servers.set(config.id, serverProcess);

    } catch (error) {
      console.error(`Failed to start MCP server ${config.name}:`, error);
      throw error;
    }
  }

  async removeServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;

    try {
      if (server.client) {
        await server.client.close();
      }
      if (server.process) {
        server.process.kill();
      }
    } catch (error) {
      console.error(`Error removing server ${serverId}:`, error);
    }

    this.servers.delete(serverId);
  }

  async listTools(serverId: string): Promise<any[]> {
    const server = this.servers.get(serverId);
    if (!server || !server.client || !server.isConnected) {
      throw new Error('Server not found or not connected');
    }

    try {
      const response = await server.client.listTools();
      return response.tools || [];
    } catch (error) {
      console.error(`Failed to list tools for server ${serverId}:`, error);
      throw error;
    }
  }

  async callTool(serverId: string, toolName: string, args: Record<string, any>): Promise<any> {
    const server = this.servers.get(serverId);
    if (!server || !server.client || !server.isConnected) {
      throw new Error('Server not found or not connected');
    }

    try {
      const response = await server.client.callTool({
        name: toolName,
        arguments: args
      });
      return response;
    } catch (error) {
      console.error(`Failed to call tool ${toolName} on server ${serverId}:`, error);
      throw error;
    }
  }

  async listResources(serverId: string): Promise<any[]> {
    const server = this.servers.get(serverId);
    if (!server || !server.client || !server.isConnected) {
      throw new Error('Server not found or not connected');
    }

    try {
      const response = await server.client.listResources();
      return response.resources || [];
    } catch (error) {
      console.error(`Failed to list resources for server ${serverId}:`, error);
      throw error;
    }
  }

  getServerStatus(serverId: string): boolean {
    const server = this.servers.get(serverId);
    return server?.isConnected || false;
  }

  getAllServers(): Array<{ id: string; name: string; isConnected: boolean }> {
    return Array.from(this.servers.values()).map(server => ({
      id: server.id,
      name: server.name,
      isConnected: server.isConnected
    }));
  }

  async getAllTools(): Promise<Array<{ serverId: string; tools: any[] }>> {
    const results = [];
    
    for (const [serverId, server] of this.servers) {
      if (server.isConnected && server.client) {
        try {
          const tools = await this.listTools(serverId);
          results.push({ serverId, tools });
        } catch (error) {
          console.warn(`Failed to get tools from server ${serverId}:`, error);
        }
      }
    }

    return results;
  }
}
