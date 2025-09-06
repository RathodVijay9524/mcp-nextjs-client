import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HfInference } from '@huggingface/inference';
import { LLMConfig, Message } from '@/types';

export abstract class LLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generateResponse(messages: Message[], systemPrompt?: string): Promise<string>;
  abstract validateApiKey(): Promise<boolean>;
}

export class OpenAIProvider extends LLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        openAIMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.forEach(msg => {
        if (msg.role !== 'system') {
          openAIMessages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          });
        }
      });

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: openAIMessages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI API key validation failed:', error);
      return false;
    }
  }
}

export class AnthropicProvider extends LLMProvider {
  private client: Anthropic;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      const anthropicMessages: Anthropic.MessageParam[] = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.7,
        system: systemPrompt,
        messages: anthropicMessages
      });

      return response.content[0]?.type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Anthropic API error: ${error}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Make a small test request to validate the API key
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error) {
      console.error('Anthropic API key validation failed:', error);
      return false;
    }
  }
}

export class GeminiProvider extends LLMProvider {
  private client: GoogleGenerativeAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      
      // Convert messages to Gemini format
      let prompt = '';
      if (systemPrompt) {
        prompt += `System: ${systemPrompt}\n\n`;
      }
      
      messages.forEach(msg => {
        const role = msg.role === 'user' ? 'Human' : 'Assistant';
        prompt += `${role}: ${msg.content}\n\n`;
      });
      
      prompt += 'Assistant: ';
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('Gemini API key validation failed:', error);
      return false;
    }
  }
}

export class OpenRouterProvider extends LLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true
    });
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        openAIMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.forEach(msg => {
        if (msg.role !== 'system') {
          openAIMessages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          });
        }
      });

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: openAIMessages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${error}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenRouter API key validation failed:', error);
      return false;
    }
  }
}

// Groq (Fast inference) - different from Grok
export class GroqProvider extends LLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true
    });
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        openAIMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.forEach(msg => {
        if (msg.role !== 'system') {
          openAIMessages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          });
        }
      });

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: openAIMessages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error(`Groq API error: ${error}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    // Skip validation for now - will validate during actual API call
    return this.config.apiKey && this.config.apiKey.length > 10;
  }
}

// Together AI - Reliable free inference
export class TogetherProvider extends LLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.together.xyz/v1',
      dangerouslyAllowBrowser: true
    });
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        openAIMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.forEach(msg => {
        if (msg.role !== 'system') {
          openAIMessages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          });
        }
      });

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: openAIMessages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Together API error:', error);
      throw new Error(`Together API error: ${error}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    // Skip validation for now - will validate during actual API call
    return this.config.apiKey && this.config.apiKey.length > 10;
  }
}

export class HuggingFaceProvider extends LLMProvider {
  private client: HfInference;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new HfInference(config.apiKey);
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      // Convert messages to a single prompt
      let prompt = '';
      if (systemPrompt) {
        prompt += `System: ${systemPrompt}\n\n`;
      }
      
      messages.forEach(msg => {
        const role = msg.role === 'user' ? 'Human' : 'Assistant';
        prompt += `${role}: ${msg.content}\n\n`;
      });
      
      prompt += 'Assistant: ';
      
      try {
        const response = await this.client.textGeneration({
          model: this.config.model,
          inputs: prompt,
          parameters: {
            max_new_tokens: this.config.maxTokens || 500,
            temperature: this.config.temperature || 0.7,
            return_full_text: false,
            do_sample: true
          }
        });
        
        return response.generated_text || '';
      } catch (modelError) {
        // If the specific model fails, try with a reliable default one
        console.warn(`Model ${this.config.model} failed, trying default model:`, modelError);
        const response = await this.client.textGeneration({
          model: 'gpt2',
          inputs: prompt,
          parameters: {
            max_new_tokens: this.config.maxTokens || 200,
            temperature: this.config.temperature || 0.7,
            return_full_text: false
          }
        });
        
        return response.generated_text || '';
      }
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw new Error(`HuggingFace API error: ${error}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    // Skip validation for now - will validate during actual API call
    return this.config.apiKey && this.config.apiKey.length > 10;
  }
}

export class LLMProviderFactory {
  static createProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'openrouter':
        return new OpenRouterProvider(config);
      case 'groq':
        return new GroqProvider(config);
      case 'together':
        return new TogetherProvider(config);
      case 'huggingface':
        return new HuggingFaceProvider(config);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  static getAvailableProviders() {
    return [
      {
        id: 'openai' as const,
        name: 'OpenAI',
        models: [
          'gpt-4o',
          'gpt-4o-mini',
          'gpt-4-turbo',
          'gpt-4',
          'gpt-3.5-turbo'
        ],
        requiresApiKey: true
      },
      {
        id: 'anthropic' as const,
        name: 'Anthropic',
        models: [
          'claude-3-5-sonnet-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ],
        requiresApiKey: true
      },
      {
        id: 'gemini' as const,
        name: 'Google Gemini (Free)',
        models: [
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro',
          'gemini-pro-vision'
        ],
        requiresApiKey: true
      },
      {
        id: 'openrouter' as const,
        name: 'OpenRouter',
        models: [
          'meta-llama/llama-3.2-3b-instruct:free',
          'microsoft/wizardlm-2-8x22b:free',
          'google/gemma-2-9b-it:free',
          'mistralai/mistral-7b-instruct:free',
          'huggingfaceh4/zephyr-7b-beta:free',
          'openchat/openchat-7b:free',
          'gryphe/mythomist-7b:free',
          'undi95/toppy-m-7b:free',
          'openai/gpt-3.5-turbo',
          'anthropic/claude-3-haiku',
          'google/gemini-pro',
          'cohere/command-r',
          'meta-llama/llama-3.1-8b-instruct',
          'microsoft/phi-3-medium-4k-instruct',
          'qwen/qwen-2-7b-instruct'
        ],
        requiresApiKey: true
      },
      {
        id: 'groq' as const,
        name: 'Groq (Fast Inference)',
        models: [
          'llama3-8b-8192',
          'llama3-70b-8192',
          'mixtral-8x7b-32768',
          'gemma-7b-it'
        ],
        requiresApiKey: true
      },
      {
        id: 'together' as const,
        name: 'Together AI (Free)',
        models: [
          'meta-llama/Llama-2-7b-chat-hf',
          'meta-llama/Llama-2-13b-chat-hf',
          'mistralai/Mistral-7B-Instruct-v0.1',
          'NousResearch/Nous-Hermes-2-Yi-34B',
          'teknium/OpenHermes-2.5-Mistral-7B'
        ],
        requiresApiKey: true
      },
      {
        id: 'huggingface' as const,
        name: 'Hugging Face',
        models: [
          'gpt2',
          'distilgpt2',
          'microsoft/DialoGPT-small',
          'facebook/blenderbot_small-90M',
          'google/flan-t5-small',
          'google/flan-t5-base',
          'EleutherAI/gpt-neo-1.3B',
          'bigscience/bloom-560m'
        ],
        requiresApiKey: true
      }
    ];
  }
}

export class LLMManager {
  private currentProvider: LLMProvider | null = null;
  private config: LLMConfig | null = null;

  async setProvider(config: LLMConfig): Promise<void> {
    try {
      const provider = LLMProviderFactory.createProvider(config);
      
      // Validate the API key
      const isValid = await provider.validateApiKey();
      if (!isValid) {
        throw new Error('Invalid API key');
      }

      this.currentProvider = provider;
      this.config = config;
    } catch (error) {
      console.error('Failed to set LLM provider:', error);
      throw error;
    }
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    if (!this.currentProvider) {
      throw new Error('No LLM provider configured');
    }

    return await this.currentProvider.generateResponse(messages, systemPrompt);
  }

  getCurrentConfig(): LLMConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return this.currentProvider !== null && this.config !== null;
  }
}
