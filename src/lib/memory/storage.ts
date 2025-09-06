import { ChatSession, Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class MemoryManager {
  private static instance: MemoryManager;
  private readonly STORAGE_KEY = 'mcp-chat-sessions';
  private readonly MAX_SESSIONS = 50;
  private readonly MAX_MESSAGES_PER_SESSION = 1000;

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Session Management
  createSession(title?: string): ChatSession {
    const session: ChatSession = {
      id: uuidv4(),
      title: title || `Chat ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveSession(session);
    return session;
  }

  saveSession(session: ChatSession): void {
    const sessions = this.getAllSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    session.updatedAt = new Date();

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
      
      // Limit the number of sessions
      if (sessions.length > this.MAX_SESSIONS) {
        sessions.splice(this.MAX_SESSIONS);
      }
    }

    this.saveSessions(sessions);
  }

  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsedSessions = JSON.parse(stored) as Array<{
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        messages: Array<{
          id: string;
          role: string;
          content: string;
          timestamp: string;
          provider?: string;
          model?: string;
        }>;
      }>;
      // Convert date strings back to Date objects
      return parsedSessions.map((session) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading sessions from storage:', error);
      return [];
    }
  }

  deleteSession(sessionId: string): void {
    const sessions = this.getAllSessions().filter(s => s.id !== sessionId);
    this.saveSessions(sessions);
  }

  clearAllSessions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Message Management
  addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };

    session.messages.push(newMessage);

    // Limit messages per session
    if (session.messages.length > this.MAX_MESSAGES_PER_SESSION) {
      session.messages = session.messages.slice(-this.MAX_MESSAGES_PER_SESSION);
    }

    this.saveSession(session);
    return newMessage;
  }

  updateMessage(sessionId: string, messageId: string, updates: Partial<Message>): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex >= 0) {
      session.messages[messageIndex] = {
        ...session.messages[messageIndex],
        ...updates
      };
      this.saveSession(session);
    }
  }

  deleteMessage(sessionId: string, messageId: string): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.messages = session.messages.filter(m => m.id !== messageId);
    this.saveSession(session);
  }

  getMessages(sessionId: string, limit?: number): Message[] {
    const session = this.getSession(sessionId);
    if (!session) {
      return [];
    }

    if (limit) {
      return session.messages.slice(-limit);
    }

    return session.messages;
  }

  // Search and Filter
  searchSessions(query: string): ChatSession[] {
    const sessions = this.getAllSessions();
    const lowercaseQuery = query.toLowerCase();

    return sessions.filter(session => {
      // Search in title
      if (session.title.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }

      // Search in messages
      return session.messages.some(message => 
        message.content.toLowerCase().includes(lowercaseQuery)
      );
    });
  }

  getSessionsByDateRange(startDate: Date, endDate: Date): ChatSession[] {
    const sessions = this.getAllSessions();
    return sessions.filter(session => 
      session.createdAt >= startDate && session.createdAt <= endDate
    );
  }

  // Statistics
  getStats() {
    const sessions = this.getAllSessions();
    const totalMessages = sessions.reduce((total, session) => 
      total + session.messages.length, 0
    );

    return {
      totalSessions: sessions.length,
      totalMessages,
      oldestSession: sessions.length > 0 ? 
        Math.min(...sessions.map(s => s.createdAt.getTime())) : null,
      newestSession: sessions.length > 0 ? 
        Math.max(...sessions.map(s => s.updatedAt.getTime())) : null
    };
  }

  // Export/Import
  exportSessions(): string {
    const sessions = this.getAllSessions();
    return JSON.stringify(sessions, null, 2);
  }

  importSessions(jsonData: string): void {
    try {
      const importedSessions = JSON.parse(jsonData) as unknown;
      
      // Validate the data structure
      if (!Array.isArray(importedSessions)) {
        throw new Error('Invalid data format');
      }

      const typedSessions = importedSessions as Array<{
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        messages: Array<{
          id: string;
          role: string;
          content: string;
          timestamp: string;
          provider?: string;
          model?: string;
        }>;
      }>;

      const sessions = typedSessions.map((session) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));

      this.saveSessions(sessions);
    } catch (error) {
      console.error('Error importing sessions:', error);
      throw new Error('Failed to import sessions');
    }
  }

  // Context Management for LLM
  getContextMessages(sessionId: string, maxTokens: number = 4000): Message[] {
    const session = this.getSession(sessionId);
    if (!session) {
      return [];
    }

    // Rough estimation: 1 token ≈ 4 characters
    const avgCharsPerToken = 4;
    const maxChars = maxTokens * avgCharsPerToken;
    
    let totalChars = 0;
    const contextMessages: Message[] = [];

    // Start from the most recent messages and work backwards
    for (let i = session.messages.length - 1; i >= 0; i--) {
      const message = session.messages[i];
      const messageChars = message.content.length;
      
      if (totalChars + messageChars > maxChars && contextMessages.length > 0) {
        break;
      }
      
      contextMessages.unshift(message);
      totalChars += messageChars;
    }

    return contextMessages;
  }

  private saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions to storage:', error);
    }
  }
}
