# 🚀 API Keys Setup Guide

Your MCP Next.js client now supports 6 different LLM providers! Here's how to get API keys for each:

## 📱 **Available Providers**

### 1. **Google Gemini (Free)** 🆓
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Free Tier**: Yes! Generous free usage
- **Models**: 
  - `gemini-1.5-flash` (Fast, efficient)
  - `gemini-1.5-pro` (Most capable)
  - `gemini-pro` (Stable)
  - `gemini-pro-vision` (Multimodal)

### 2. **OpenRouter** 🔄
- **Get API Key**: https://openrouter.ai/keys
- **Free Models**: Several models available for free
- **Models**:
  - `meta-llama/llama-3.2-3b-instruct:free` 🆓
  - `google/gemma-2-9b-it:free` 🆓
  - `mistralai/mistral-7b-instruct:free` 🆓
  - `huggingfaceh4/zephyr-7b-beta:free` 🆓
  - Plus premium models

### 3. **Grok (X.AI)** ❌
- **Get API Key**: https://console.x.ai/ 
- **Key Format**: Must start with `xai-` or `sk-`
- **Models**:
  - `grok-beta` (Main model)
  - `grok-vision-beta` (Vision capable)

### 4. **Hugging Face** 🤗
- **Get API Key**: https://huggingface.co/settings/tokens
- **Key Format**: Must start with `hf_`
- **Free Tier**: Yes, generous free usage
- **Models**:
  - `gpt2` (Reliable, always available)
  - `distilgpt2` (Smaller, faster)
  - `microsoft/DialoGPT-small`
  - `google/flan-t5-base`
  - `EleutherAI/gpt-neo-1.3B`

### 5. **OpenAI** (Already supported)
- **Get API Key**: https://platform.openai.com/api-keys
- **Models**: GPT-4o, GPT-4o-mini, etc.

### 6. **Anthropic** (Already supported)
- **Get API Key**: https://console.anthropic.com/
- **Models**: Claude-3.5-Sonnet, Claude-3-Opus, etc.

## 🔧 **How to Configure**

1. **Go to your MCP client** → http://localhost:3000
2. **Click Settings (⚙️)**
3. **In LLM Configuration:**
   - Select your preferred provider
   - Choose a model
   - Enter your API key
   - Click "Test" to validate
   - Click "Save Configuration"

## 💰 **Cost Comparison**

### Free Options:
- ✅ **Gemini**: Free tier with good limits
- ✅ **OpenRouter**: Several free models available
- ✅ **Hugging Face**: Free inference API
- ✅ **OpenAI**: $5 free credit for new users

### Paid Options:
- 💵 **OpenAI**: Pay per token
- 💵 **Anthropic**: Pay per token
- 💵 **Grok**: Pay per token
- 💵 **OpenRouter**: Pay per token (premium models)

## 🎯 **Recommendations**

### For Free Usage:
1. **Gemini 1.5-Flash** - Fast and free
2. **OpenRouter free models** - Good variety
3. **Hugging Face models** - Open source

### For Best Quality:
1. **Claude 3.5 Sonnet** (Anthropic)
2. **GPT-4o** (OpenAI)
3. **Gemini 1.5 Pro** (Google)

### For Coding Tasks:
1. **Claude 3.5 Sonnet** - Excellent for code
2. **GPT-4o** - Great for coding
3. **Grok** - Good performance

## 🔐 **Security Tips**

- Never share your API keys
- Use environment variables in production
- Rotate keys regularly
- Monitor your usage and costs
- Set up billing alerts

## ❗ **Troubleshooting**

- **Invalid API Key**: Double-check the key and provider
- **Rate Limits**: Wait and try again, or upgrade plan
- **Model Not Found**: Ensure the model name is correct
- **Network Issues**: Check your internet connection

---

**Ready to test?** Pick a provider, get your API key, and start chatting with your MCP tools! 🚀
