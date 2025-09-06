'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { LLMConfig, MCPServerConfig } from '@/types';
import { LLMProviderFactory } from '@/lib/llm/providers';
import { X, Key, Server, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Colors {
  main: string;
  text: string;
  border: string;
  input: string;
}

interface ConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: { colors: Colors };
}

const LLMConfigurationSection: React.FC<{ colors?: Colors }> = ({ colors }) => {
  const { updateLLMConfig, isLLMConfigured, config } = useAppStore();
  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000
  });
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);

  const providers = LLMProviderFactory.getAvailableProviders();

  useEffect(() => {
    if (config?.llm) {
      setLLMConfig(config.llm);
    }
  }, [config]);

  const handleProviderChange = (provider: 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'groq' | 'together' | 'huggingface') => {
    const providerData = providers.find(p => p.id === provider);
    setLLMConfig(prev => ({
      ...prev,
      provider,
      model: providerData?.models[0] || '',
      apiKey: ''
    }));
    setKeyValid(null);
  };

  const handleApiKeyChange = (apiKey: string) => {
    setLLMConfig(prev => ({ ...prev, apiKey }));
    setKeyValid(null);
  };

  const testApiKey = async () => {
    if (!llmConfig.apiKey.trim()) return;

    setIsTestingKey(true);
    try {
      await updateLLMConfig(llmConfig);
      setKeyValid(true);
    } catch (error) {
      setKeyValid(false);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = async () => {
    if (!llmConfig.apiKey.trim()) return;
    
    try {
      await updateLLMConfig(llmConfig);
      setKeyValid(true);
    } catch (error) {
      setKeyValid(false);
    }
  };

  const currentProvider = providers.find(p => p.id === llmConfig.provider);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: colors?.text || '#000000' }}>
        <Key size={20} />
        LLM Configuration
      </h3>

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors?.text || '#000000' }}>
          Provider
        </label>
        <select
          value={llmConfig.provider}
          onChange={(e) => handleProviderChange(e.target.value as 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'groq' | 'together' | 'huggingface')}
          className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            background: colors?.input || '#f9fafb',
            color: colors?.text || '#000000',
            border: `1px solid ${colors?.border || '#e5e7eb'}`
          }}
        >
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors?.text || '#000000' }}>
          Model
        </label>
        <select
          value={llmConfig.model}
          onChange={(e) => setLLMConfig(prev => ({ ...prev, model: e.target.value }))}
          className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            background: colors?.input || '#f9fafb',
            color: colors?.text || '#000000',
            border: `1px solid ${colors?.border || '#e5e7eb'}`
          }}
        >
          {currentProvider?.models.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors?.text || '#000000' }}>
          API Key
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="password"
              value={llmConfig.apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder={`Enter your ${currentProvider?.name} API key`}
              className="w-full rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: colors?.input || '#f9fafb',
                color: colors?.text || '#000000',
                border: `1px solid ${colors?.border || '#e5e7eb'}`
              }}
            />
            {keyValid === true && (
              <Check size={16} className="absolute right-3 top-3 text-green-500" />
            )}
            {keyValid === false && (
              <AlertCircle size={16} className="absolute right-3 top-3 text-red-500" />
            )}
          </div>
          <button
            onClick={testApiKey}
            disabled={!llmConfig.apiKey.trim() || isTestingKey}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px]"
          >
            {isTestingKey ? 'Testing...' : 'Test'}
          </button>
        </div>
        {keyValid === false && (
          <p className="text-red-600 text-sm mt-1">Invalid API key or connection failed</p>
        )}
        {keyValid === true && (
          <p className="text-green-600 text-sm mt-1">API key is valid!</p>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature
          </label>
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={llmConfig.temperature}
            onChange={(e) => setLLMConfig(prev => ({ 
              ...prev, 
              temperature: parseFloat(e.target.value) || 0.7 
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Tokens
          </label>
          <input
            type="number"
            min="1"
            max="8000"
            value={llmConfig.maxTokens}
            onChange={(e) => setLLMConfig(prev => ({ 
              ...prev, 
              maxTokens: parseInt(e.target.value) || 2000 
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!llmConfig.apiKey.trim()}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px]"
        >
          Save Configuration
        </button>
      </div>

      {isLLMConfigured && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Check size={16} />
          LLM is configured and ready
        </div>
      )}
    </div>
  );
};

const MCPServerSection: React.FC<{ colors?: Colors }> = ({ colors }) => {
  const { mcpServers, addMCPServer, removeMCPServer } = useAppStore();
  const [newServer, setNewServer] = useState<Omit<MCPServerConfig, 'id' | 'isConnected'>>({
    name: '',
    command: 'python',
    args: [],
    env: {}
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAddServer = async () => {
    if (!newServer.name.trim() || !newServer.command.trim()) return;

    const serverConfig: MCPServerConfig = {
      ...newServer,
      id: uuidv4(),
      isConnected: false
    };

    setIsConnecting(true);
    try {
      await addMCPServer(serverConfig);
      setNewServer({
        name: '',
        command: 'python',
        args: [],
        env: {}
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add MCP server:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemoveServer = async (serverId: string) => {
    try {
      await removeMCPServer(serverId);
    } catch (error) {
      console.error('Failed to remove MCP server:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Server size={20} />
          MCP Servers
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Server
        </button>
      </div>

      {/* Add Server Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Name
              </label>
              <input
                type="text"
                value={newServer.name}
                onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Python MCP Server"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Command
              </label>
              <input
                type="text"
                value={newServer.command}
                onChange={(e) => setNewServer(prev => ({ ...prev, command: e.target.value }))}
                placeholder="python"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arguments (one per line)
              </label>
              <textarea
                value={(newServer.args || []).join('\n')}
                onChange={(e) => setNewServer(prev => ({ 
                  ...prev, 
                  args: e.target.value.split('\n').filter(arg => arg.trim()) 
                }))}
                placeholder="/path/to/your/mcp_server.py"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddServer}
                disabled={!newServer.name.trim() || !newServer.command.trim() || isConnecting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Add Server'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Server List */}
      <div className="space-y-2">
        {mcpServers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Server size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No MCP servers configured</p>
            <p className="text-sm">Add your first server to enable tool functionality</p>
          </div>
        ) : (
          mcpServers.map(server => (
            <div key={server.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{server.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    server.isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {server.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {server.command} {(server.args || []).join(' ')}
                </p>
              </div>
              
              <button
                onClick={() => handleRemoveServer(server.id)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({ 
  isOpen, 
  onClose, 
  theme 
}) => {
  if (!isOpen) return null;

  const colors = theme?.colors || {
    main: "#ffffff",
    text: "#000000",
    border: "#e5e7eb",
    input: "#f9fafb"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className="rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: colors.main }}
      >
        <div 
          className="flex items-center justify-between p-4 sm:p-6"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80"
            style={{ color: colors.text }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <div className="space-y-6 sm:space-y-8">
            <LLMConfigurationSection colors={colors} />
            <div style={{ borderTop: `1px solid ${colors.border}` }} className="pt-6 sm:pt-8">
              <MCPServerSection colors={colors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationDialog;
