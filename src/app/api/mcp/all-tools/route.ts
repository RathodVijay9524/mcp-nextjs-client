import { NextResponse } from 'next/server';
import { ServerSideMCPManager } from '@/lib/mcp/server-manager';

const mcpManager = ServerSideMCPManager.getInstance();

export async function GET() {
  try {
    const allTools = await mcpManager.getAllTools();
    
    // Flatten the tools into a single array with server information
    const flattenedTools = allTools.flatMap(({ serverId, tools }) => 
      tools.map(tool => ({
        ...tool,
        serverId,
        fullName: `${serverId}:${tool.name}`
      }))
    );

    return NextResponse.json({ 
      tools: flattenedTools,
      servers: allTools
    });
  } catch (error) {
    console.error('Failed to get all tools:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tools' }, 
      { status: 500 }
    );
  }
}
