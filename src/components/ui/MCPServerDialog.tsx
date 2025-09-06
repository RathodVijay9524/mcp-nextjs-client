'use client';

import React, { useState } from 'react';
import { MCPServerConfig, MCPTransportType } from '@/types';

interface MCPServerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MCPServerConfig) => void;
  editingServer?: MCPServerConfig | null;
}

const MCPServerDialog: React.FC<MCPServerDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingServer
}) => {
  const [config, setConfig] = useState<Partial<MCPServerConfig>>({
    id: editingServer?.id || '',
    name: editingServer?.name || '',
    transport: editingServer?.transport || 'stdio',
    description: editingServer?.description || '',
    command: editingServer?.command || '',
    args: editingServer?.args || [],
    url: editingServer?.url || '',
    headers: editingServer?.headers || {},
    env: editingServer?.env || {},
    isConnected: false
  });

  const [argsText, setArgsText] = useState(
    editingServer?.args?.join(' ') || ''
  );

  const handleSave = () => {
    if (!config.name || !config.id) {
      alert('Please provide server ID and name');
      return;
    }

    // Validation based on transport type
    if (config.transport === 'stdio' && !config.command) {
      alert('Command is required for stdio transport');
      return;
    }

    if ((config.transport === 'sse' || config.transport === 'websocket') && !config.url) {
      alert('URL is required for SSE/WebSocket transport');
      return;
    }

    const finalConfig: MCPServerConfig = {
      ...config,
      args: argsText ? argsText.split(' ').filter(arg => arg.trim()) : [],
      isConnected: false
    } as MCPServerConfig;

    onSave(finalConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {editingServer ? 'Edit MCP Server' : 'Add MCP Server'}
        </h2>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Server ID *
              </label>
              <input
                type="text"
                value={config.id}
                onChange={(e) => setConfig({...config, id: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 min-h-[44px]"
                placeholder="e.g., filesystem-server"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({...config, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 min-h-[44px]"
                placeholder="e.g., File System Tools"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={config.description}
              onChange={(e) => setConfig({...config, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 min-h-[44px]"
              placeholder="Brief description of this MCP server"
            />
          </div>

          {/* Transport Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Transport Type *
            </label>
            <select
              value={config.transport}
              onChange={(e) => setConfig({...config, transport: e.target.value as MCPTransportType})}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 min-h-[44px]"
            >
              <option value="stdio">📟 Stdio (Command Line)</option>
              <option value="sse">🌐 SSE (HTTP Server-Sent Events)</option>
              <option value="websocket">🔌 WebSocket</option>
            </select>
          </div>

          {/* Transport-specific fields */}
          {config.transport === 'stdio' && (
            <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
              <h3 className="text-lg font-medium text-blue-300">📟 Stdio Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Command *
                </label>
                <input
                  type="text"
                  value={config.command}
                  onChange={(e) => setConfig({...config, command: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 min-h-[44px]"
                  placeholder="e.g., python, node, ./mcp-server"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Arguments
                </label>
                <input
                  type="text"
                  value={argsText}
                  onChange={(e) => setArgsText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 min-h-[44px]"
                  placeholder="e.g., mcp_server.py --port 8080"
                />
                <p className="text-xs text-gray-400 mt-1">Space-separated arguments</p>
              </div>
            </div>
          )}

          {(config.transport === 'sse' || config.transport === 'websocket') && (
            <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
              <h3 className="text-lg font-medium text-green-300">
                {config.transport === 'sse' ? '🌐 SSE Configuration' : '🔌 WebSocket Configuration'}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Server URL *
                </label>
                <input
                  type="url"
                  value={config.url}
                  onChange={(e) => setConfig({...config, url: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 min-h-[44px]"
                  placeholder={config.transport === 'sse' ? 'http://localhost:8080/sse' : 'ws://localhost:8080/ws'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Headers (JSON format)
                </label>
                <textarea
                  value={JSON.stringify(config.headers, null, 2)}
                  onChange={(e) => {
                    try {
                      const headers = JSON.parse(e.target.value);
                      setConfig({...config, headers});
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 font-mono text-sm"
                  rows={3}
                  placeholder='{\n  "Authorization": "Bearer token",\n  "Content-Type": "application/json"\n}'
                />
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="p-4 bg-blue-900 bg-opacity-30 rounded-lg">
            <h4 className="font-medium text-blue-300 mb-2">💡 Examples:</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <strong>Stdio:</strong> Command: <code>python</code>, Args: <code>filesystem_server.py</code>
              </div>
              <div>
                <strong>SSE:</strong> URL: <code>http://localhost:8080/mcp/events</code>
              </div>
              <div>
                <strong>WebSocket:</strong> URL: <code>ws://localhost:8080/mcp</code>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors w-full sm:w-auto min-h-[44px] rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full sm:w-auto min-h-[44px]"
          >
            {editingServer ? 'Update Server' : 'Add Server'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCPServerDialog;
