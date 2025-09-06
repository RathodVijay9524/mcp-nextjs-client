import { NextRequest, NextResponse } from 'next/server';
import { ServerSideMCPManager } from '@/lib/mcp/server-manager';

const mcpManager = ServerSideMCPManager.getInstance();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const serverId = url.searchParams.get('serverId');
    
    if (serverId) {
      // Get tools for a specific server
      const tools = await mcpManager.listTools(serverId);
      return NextResponse.json({ tools });
    } else {
      // Get all tools from all servers
      const allTools = await mcpManager.getAllTools();
      return NextResponse.json({ servers: allTools });
    }
  } catch (error) {
    console.error('Failed to get tools:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tools' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { serverId, toolName, arguments: args } = await request.json();
    
    if (!serverId || !toolName) {
      return NextResponse.json(
        { error: 'Missing required fields: serverId, toolName' }, 
        { status: 400 }
      );
    }

    const result = await mcpManager.callTool(serverId, toolName, args || {});
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Failed to call tool:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to call tool' }, 
      { status: 500 }
    );
  }
}
