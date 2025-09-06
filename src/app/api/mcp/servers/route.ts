import { NextRequest, NextResponse } from 'next/server';
import { ServerSideMCPManager } from '@/lib/mcp/server-manager';

const mcpManager = ServerSideMCPManager.getInstance();

export async function GET() {
  try {
    const servers = mcpManager.getAllServers();
    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Failed to get servers:', error);
    return NextResponse.json({ error: 'Failed to get servers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, name, command, args, env } = await request.json();
    
    if (!id || !name || !command) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, command' }, 
        { status: 400 }
      );
    }

    await mcpManager.addServer({
      id,
      name,
      command,
      args: args || [],
      env: env || {}
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add server:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add server' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const serverId = url.searchParams.get('id');
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
    }

    await mcpManager.removeServer(serverId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove server:', error);
    return NextResponse.json({ error: 'Failed to remove server' }, { status: 500 });
  }
}
