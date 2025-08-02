
// تكوين نماذج الذكاء الاصطناعي
const AI_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
    models: {
      gpt4: 'gpt-4-turbo-preview',
      gpt35: 'gpt-3.5-turbo',
      embedding: 'text-embedding-ada-002'
    }
  },

  // Anthropic Claude Configuration
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: 'https://api.anthropic.com/v1',
    models: {
      claude3: 'claude-3-opus-20240229',
      claude3Sonnet: 'claude-3-sonnet-20240229',
      claude3Haiku: 'claude-3-haiku-20240307'
    }
  },

  // Google AI Configuration
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    models: {
      gemini: 'gemini-pro',
      geminiVision: 'gemini-pro-vision'
    }
  },

  // Hugging Face Configuration
  huggingface: {
    token: process.env.HUGGINGFACE_API_TOKEN,
    baseURL: 'https://api-inference.huggingface.co/models'
  },

  // Local Models Configuration
  local: {
    baseURL: process.env.LOCAL_MODEL_URL || 'http://localhost:1234/v1',
    models: {
      llama: 'llama-2-7b-chat',
      mistral: 'mistral-7b-instruct'
    }
  }
};

// دالة للتحقق من توفر المفاتيح
function validateAPIKeys() {
  const missing = [];
  
  if (!AI_CONFIG.openai.apiKey) missing.push('OPENAI_API_KEY');
  if (!AI_CONFIG.anthropic.apiKey) missing.push('ANTHROPIC_API_KEY');
  if (!AI_CONFIG.google.apiKey) missing.push('GOOGLE_API_KEY');
  if (!AI_CONFIG.huggingface.token) missing.push('HUGGINGFACE_API_TOKEN');
  
  if (missing.length > 0) {
    console.warn('⚠️  المفاتيح المفقودة:', missing.join(', '));
    console.warn('يرجى إضافة هذه المفاتيح في قسم Secrets');
  } else {
    console.log('✅ جميع مفاتيح API متوفرة');
  }
  
  return missing;
}

// دالة مساعدة لإنشاء عميل API
function createAIClient(provider) {
  switch(provider) {
    case 'openai':
      return {
        apiKey: AI_CONFIG.openai.apiKey,
        baseURL: AI_CONFIG.openai.baseURL,
        models: AI_CONFIG.openai.models
      };
    case 'anthropic':
      return {
        apiKey: AI_CONFIG.anthropic.apiKey,
        baseURL: AI_CONFIG.anthropic.baseURL,
        models: AI_CONFIG.anthropic.models
      };
    case 'google':
      return {
        apiKey: AI_CONFIG.google.apiKey,
        baseURL: AI_CONFIG.google.baseURL,
        models: AI_CONFIG.google.models
      };
    case 'huggingface':
      return {
        token: AI_CONFIG.huggingface.token,
        baseURL: AI_CONFIG.huggingface.baseURL
      };
    default:
      throw new Error(`مزود غير مدعوم: ${provider}`);
  }
}

module.exports = {
  AI_CONFIG,
  validateAPIKeys,
  createAIClient
};
