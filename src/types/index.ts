export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMProvider {
  id: 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'groq' | 'together' | 'huggingface';
  name: string;
  models: string[];
  requiresApiKey: boolean;
  baseUrl?: string;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'groq' | 'together' | 'huggingface';
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  isConnected: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface AppConfig {
  llm: LLMConfig;
  mcpServers: MCPServerConfig[];
  activeSessionId?: string;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface MCPClientState {
  servers: MCPServerConfig[];
  tools: MCPTool[];
  resources: MCPResource[];
  isConnected: boolean;
  error: string | null;
}
