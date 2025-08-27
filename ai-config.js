// تكوين نماذج الذكاء الاصطناعي
const AI_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env?.OPENAI_API_KEY || null,
    baseURL: 'https://api.openai.com/v1',
    models: {
      gpt4: 'gpt-4-turbo-preview',
      gpt35: 'gpt-3.5-turbo',
      embedding: 'text-embedding-ada-002'
    }
  },

  // Anthropic Claude Configuration
  anthropic: {
    apiKey: process.env?.ANTHROPIC_API_KEY || null,
    baseURL: 'https://api.anthropic.com/v1',
    models: {
      claude3: 'claude-3-opus-20240229',
      claude3Sonnet: 'claude-3-sonnet-20240229',
      claude3Haiku: 'claude-3-haiku-20240307'
    }
  },

  // Google AI Configuration
  google: {
    apiKey: process.env?.GOOGLE_API_KEY || null,
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    models: {
      gemini: 'gemini-pro',
      geminiVision: 'gemini-pro-vision'
    }
  },

  // Hugging Face Configuration (أفضل النماذج المجانية)
  huggingface: {
    token: process.env?.HUGGINGFACE_API_TOKEN || null,
    baseURL: 'https://api-inference.huggingface.co/models',
    models: {
      // نماذج النصوص المجانية الأفضل
      llama3: 'meta-llama/Meta-Llama-3-8B-Instruct',
      mistral: 'mistralai/Mistral-7B-Instruct-v0.1',
      phi3: 'microsoft/Phi-3-mini-4k-instruct',
      gemma: 'google/gemma-7b-it',

      // نماذج الدردشة والمحادثة
      chatglm: 'THUDM/chatglm3-6b',
      baichuan: 'baichuan-inc/Baichuan2-7B-Chat',
      qwen: 'Qwen/Qwen1.5-7B-Chat',

      // نماذج متخصصة
      codellama: 'codellama/CodeLlama-7b-Instruct-hf',
      zephyr: 'HuggingFaceH4/zephyr-7b-beta',
      vicuna: 'lmsys/vicuna-7b-v1.5',

      // نماذج صغيرة وسريعة
      tinyllama: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
      stablelm: 'stabilityai/stablelm-2-zephyr-1_6b'
    }
  },

  // OpenRouter Configuration (نماذج مجانية)
  openrouter: {
    apiKey: process.env?.OPENROUTER_API_KEY || null,
    baseURL: 'https://openrouter.ai/api/v1',
    models: {
      // نماذج مجانية من OpenRouter
      llama3Free: 'meta-llama/llama-3.1-8b-instruct:free',
      qwen2Free: 'qwen/qwen-2-7b-instruct:free',
      mistralFree: 'mistralai/mistral-7b-instruct:free',
      phi3Free: 'microsoft/phi-3-mini-128k-instruct:free'
    }
  },

  // Blackbox AI Configuration
  blackbox: {
    apiKey: process.env.BLACKBOX_API_KEY,
    baseURL: 'https://api.blackbox.ai/v1',
    models: {
      blackboxCode: 'blackbox-code',
      blackboxChat: 'blackbox'
    }
  },

  // Local Models Configuration
  local: {
    baseURL: process.env?.LOCAL_MODEL_URL || 'http://localhost:1234/v1',
    models: {
      llama: 'llama-2-7b-chat',
      mistral: 'mistral-7b-instruct'
    }
  }
};

// دالة للتحقق من توفر المفاتيح
function validateAPIKeys() {
  const missing = [];
  const available = [];

  if (!AI_CONFIG.openai.apiKey) missing.push('OPENAI_API_KEY');
  else available.push('OpenAI');

  if (!AI_CONFIG.anthropic.apiKey) missing.push('ANTHROPIC_API_KEY');
  else available.push('Anthropic');

  if (!AI_CONFIG.google.apiKey) missing.push('GOOGLE_API_KEY');
  else available.push('Google');

  if (!AI_CONFIG.huggingface.token) missing.push('HUGGINGFACE_API_TOKEN');
  else available.push('Hugging Face (FREE)');

  if (AI_CONFIG.openrouter?.apiKey) {
    available.push('OpenRouter (FREE)');
  } else {
    missing.push('OPENROUTER_API_KEY');
  }

  if (AI_CONFIG.blackbox?.apiKey) {
    available.push('Blackbox AI (CODE)');
  } else {
    missing.push('BLACKBOX_API_KEY');
  }

  console.log('🤖 النماذج المتاحة:');
  if (available.length > 0) {
    console.log('✅ متوفر:', available.join(', '));
  }

  if (missing.length > 0) {
    console.warn('⚠️  المفاتيح المفقودة:', missing.join(', '));
    console.warn('📝 يرجى إضافة هذه المفاتيح في قسم Secrets للوصول لمزيد من النماذج');
  }

  if (available.includes('Hugging Face (FREE)') || available.includes('OpenRouter (FREE)')) {
    console.log('🎉 لديك وصول للنماذج المجانية القوية!');
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
        baseURL: AI_CONFIG.huggingface.baseURL,
        models: AI_CONFIG.huggingface.models
      };
    case 'openrouter':
      return {
        apiKey: AI_CONFIG.openrouter.apiKey,
        baseURL: AI_CONFIG.openrouter.baseURL,
        models: AI_CONFIG.openrouter.models
      };
    case 'blackbox':
      return {
        apiKey: AI_CONFIG.blackbox.apiKey,
        baseURL: AI_CONFIG.blackbox.baseURL,
        models: AI_CONFIG.blackbox.models
      };
    default:
      throw new Error(`مزود غير مدعوم: ${provider}`);
  }
}

// الحصول على أفضل نموذج مجاني متاح
function getBestFreeModel() {
  if (AI_CONFIG.huggingface.token) {
    return {
      provider: 'huggingface',
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      name: 'Llama 3 8B (مجاني)'
    };
  }

  if (AI_CONFIG.openrouter.apiKey) {
    return {
      provider: 'openrouter',
      model: 'meta-llama/llama-3-8b-instruct:free',
      name: 'Llama 3 8B OpenRouter (مجاني)'
    };
  }

  return null;
}

module.exports = {
  AI_CONFIG,
  validateAPIKeys,
  createAIClient
};