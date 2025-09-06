'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { MCPServerConfig, ChatSession } from '@/types';
import MCPServerDialog from './MCPServerDialog';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Trash2, 
  Edit3,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react';

const themes = {
  dark: {
    sidebar: "#0a0f1c",
    main: "#0f172a",
    bubble: "#1e293b",
    input: "#1e293b",
    text: "#e5e7eb",
    border: "#1f2937",
  },
  green: {
    sidebar: "#000000",
    main: "#0f2a20",
    bubble: "#1e3d32",
    input: "#1e3d32",
    text: "#ffffff",
    border: "#1f2937",
  },
  light: {
    sidebar: "#f8f9fa",
    main: "#ffffff",
    bubble: "#f1f3f5",
    input: "#f9fafb",
    text: "#212529",
    border: "#e5e7eb",
  },
};

interface SidebarProps {
  theme?: 'dark' | 'green' | 'light';
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenSettings: () => void;
}

interface Colors {
  sidebar: string;
  main: string;
  bubble: string;
  input: string;
  text: string;
  border: string;
}

const SessionItem: React.FC<{ 
  session: ChatSession; 
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  colors: Colors;
}> = ({ session, isActive, onSelect, onDelete, colors }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div
      className="group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors"
      style={{
        backgroundColor: isActive ? colors.bubble : 'transparent',
        borderColor: isActive ? colors.border : 'transparent'
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onSelect}
    >
      <MessageSquare size={16} className="flex-shrink-0" style={{
        color: isActive ? colors.text : `${colors.text}80`
      }} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
          {session.title}
        </p>
        <p className="text-xs truncate" style={{ color: `${colors.text}70`, opacity: 0.7 }}>
          {session.messages.length} messages • {session.updatedAt.toLocaleDateString()}
        </p>
      </div>
      
      {(isHovering || isActive) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: `${colors.text}60` }}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  theme = 'dark', 
  sidebarCollapsed = false, 
  onToggleSidebar = () => {}, 
  onOpenSettings 
}) => {
  const { 
    sessions, 
    currentSession, 
    createNewSession, 
    setCurrentSession, 
    deleteSession,
    loadSessions,
    isLLMConfigured,
    mcpServers,
    availableTools,
    toggleMCPServer,
    refreshMCPTools,
    addMCPServer
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecent, setShowRecent] = useState(true);
  const [showOlder, setShowOlder] = useState(false);
  const [showMCPDialog, setShowMCPDialog] = useState(false);
  const [editingMCPServer, setEditingMCPServer] = useState<MCPServerConfig | null>(null);
  
  const colors = themes[theme];

  React.useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentSessions = filteredSessions.filter(session => 
    session.updatedAt >= sevenDaysAgo
  );
  
  const olderSessions = filteredSessions.filter(session => 
    session.updatedAt < sevenDaysAgo
  );

  const handleNewChat = () => {
    createNewSession();
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
  };

  const handleSessionDelete = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteSession(sessionId);
    }
  };

  return (
    <aside
      className={`${sidebarCollapsed ? "w-16 lg:w-16" : "w-80"} flex flex-col p-4 transition-all duration-300 h-full flex-shrink-0 
        ${sidebarCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"} 
        fixed lg:relative z-50 lg:z-auto`}
      style={{ background: colors.sidebar, borderRight: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center justify-between mb-6">
        {!sidebarCollapsed && (
          <h1 className="text-green-500 font-bold text-lg flex items-center space-x-2">
            <span>💡</span> <span>AI Assistant</span>
          </h1>
        )}
        <button
          onClick={onToggleSidebar}
          className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
      </div>

      {!sidebarCollapsed && (
        <>
          <button
            onClick={handleNewChat}
            disabled={!isLLMConfigured}
            className="bg-green-500 text-black py-2 rounded-lg mb-2 hover:bg-green-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            + New Chat
          </button>
          
          {/* Quick Stats */}
          <div className="mb-4 p-2 rounded-lg" style={{ backgroundColor: `${colors.bubble}40`, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2" style={{ color: colors.text }}>
                🔧 <span>MCP Tools</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refreshMCPTools()}
                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                  title="Refresh tools"
                >
                  🔄
                </button>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  availableTools.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'
                }`}>
                  {availableTools.length}
                </span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ 
                  background: colors.input, 
                  color: colors.text, 
                  borderColor: colors.border,
                  border: `1px solid ${colors.border}`
                }}
              />
            </div>
          </div>
          
          {/* MCP Servers Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm font-medium mb-2" style={{ color: colors.text }}>
              <span>MCP Servers ({mcpServers.filter(s => s.isConnected).length}/{mcpServers.length})</span>
              <button
                onClick={() => setShowMCPDialog(true)}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                title="Add MCP Server"
              >
                + Add
              </button>
            </div>
            {mcpServers.length > 0 ? (
              <div className="space-y-2">
                {mcpServers.map((server) => {
                  const transport = server.transport || 'unknown';
                  const transportIcon = transport === 'stdio' ? '📟' : 
                                       transport === 'sse' ? '🌐' : 
                                       transport === 'websocket' ? '🔌' : '❓';
                  
                  return (
                    <div key={server.id} className="p-2 rounded-lg" 
                         style={{ backgroundColor: `${colors.bubble}30`, border: `1px solid ${colors.border}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            server.isConnected ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm font-medium truncate" style={{ color: colors.text }}>
                            {server.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingMCPServer(server);
                              setShowMCPDialog(true);
                            }}
                            className="p-1 hover:bg-gray-600 rounded transition-colors text-xs"
                            title="Edit server"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => toggleMCPServer(server.id)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              server.isConnected 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                            }`}
                          >
                            {server.isConnected ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: `${colors.text}70`, opacity: 0.7 }}>
                        <span className="flex items-center gap-1">
                          {transportIcon} {(server.transport || 'UNKNOWN').toUpperCase()}
                        </span>
                        {server.description && (
                          <span className="truncate max-w-[120px]" title={server.description}>
                            {server.description}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center text-sm rounded-lg" style={{ 
                backgroundColor: `${colors.bubble}20`, 
                color: `${colors.text}70`, 
                border: `1px dashed ${colors.border}` 
              }}>
                <div className="mb-2">🔧</div>
                <div>No MCP servers configured</div>
                <div className="text-xs mt-1">Click "+ Add" to get started</div>
              </div>
            )}
          </div>

          {/* Sessions List */}
          <div className={`flex-1 overflow-y-auto scrollbar-thin ${
            theme === 'green' ? 'scrollbar-green' : theme === 'light' ? 'scrollbar-light' : ''
          }`}>
            {filteredSessions.length === 0 ? (
              <div className="p-4 text-center" style={{ color: colors.text, opacity: 0.7 }}>
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Recent Sessions */}
                {recentSessions.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowRecent(!showRecent)}
                      className="flex items-center gap-2 text-sm font-medium mb-2 hover:opacity-80"
                      style={{ color: colors.text }}
                    >
                      {showRecent ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      Recent ({recentSessions.length})
                    </button>
                    
                    {showRecent && (
                      <div className="space-y-1">
                        {recentSessions.map(session => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            isActive={currentSession?.id === session.id}
                            onSelect={() => handleSessionSelect(session.id)}
                            onDelete={() => handleSessionDelete(session.id)}
                            colors={colors}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Older Sessions */}
                {olderSessions.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowOlder(!showOlder)}
                      className="flex items-center gap-2 text-sm font-medium mb-2 hover:opacity-80"
                      style={{ color: colors.text }}
                    >
                      {showOlder ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      Older ({olderSessions.length})
                    </button>
                    
                    {showOlder && (
                      <div className="space-y-1">
                        {olderSessions.map(session => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            isActive={currentSession?.id === session.id}
                            onSelect={() => handleSessionSelect(session.id)}
                            onDelete={() => handleSessionDelete(session.id)}
                            colors={colors}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer - Settings and Status */}
      <div className="mt-auto space-y-3">
        {!sidebarCollapsed && (
          <>
            {/* LLM Status */}
            <div className={`flex items-center gap-2 text-sm ${
              isLLMConfigured ? 'text-green-400' : 'text-red-400'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isLLMConfigured ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="font-medium">LLM {isLLMConfigured ? 'Ready' : 'Not Configured'}</span>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.bubble}60` }}>
                <div className="text-lg font-bold" style={{ color: colors.text }}>{sessions.length}</div>
                <div className="text-xs opacity-70" style={{ color: colors.text }}>Sessions</div>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.bubble}60` }}>
                <div className="text-lg font-bold" style={{ color: colors.text }}>{mcpServers.length}</div>
                <div className="text-xs opacity-70" style={{ color: colors.text }}>Servers</div>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.bubble}60` }}>
                <div className="text-lg font-bold text-green-400">{availableTools.length}</div>
                <div className="text-xs opacity-70" style={{ color: colors.text }}>Tools</div>
              </div>
            </div>
          </>
        )}
        
        {/* Settings Button */}
        <div className="flex justify-center">
          <button 
            onClick={onOpenSettings} 
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* MCP Server Dialog */}
      <MCPServerDialog
        isOpen={showMCPDialog}
        onClose={() => {
          setShowMCPDialog(false);
          setEditingMCPServer(null);
        }}
        onSave={async (config) => {
          try {
            await addMCPServer(config);
            setShowMCPDialog(false);
            setEditingMCPServer(null);
          } catch (error) {
            console.error('Failed to add MCP server:', error);
            alert(`Failed to add server: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }}
        editingServer={editingMCPServer}
      />
    </aside>
  );
};

export default Sidebar;
