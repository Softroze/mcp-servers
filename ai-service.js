const { AI_CONFIG, validateAPIKeys, createAIClient } = require('./ai-config');

class AIService {
  constructor() {
    console.log('🔧 بدء تهيئة AIService...');

    this.isInitialized = false;
    this.availableProviders = [];

    try {
      // التحقق من المفاتيح عند بدء الخدمة
      const missingKeys = validateAPIKeys();
      this.availableProviders = this.getAvailableProviders();
      this.isInitialized = true;

      console.log('✅ تم تهيئة AIService بنجاح');
      console.log('🔑 المزودين المتاحين:', this.availableProviders.join(', '));

    } catch (error) {
      console.warn('⚠️ تحذير في تحميل AI Config:', error.message);
      this.isInitialized = false;
    }
  }

  getAvailableProviders() {
    const providers = [];

    if (AI_CONFIG.openai?.apiKey) providers.push('openai');
    if (AI_CONFIG.anthropic?.apiKey) providers.push('anthropic'); 
    if (AI_CONFIG.google?.apiKey) providers.push('google');
    if (AI_CONFIG.huggingface?.token) providers.push('huggingface');
    if (AI_CONFIG.openrouter?.apiKey) providers.push('openrouter');
    if (AI_CONFIG.blackbox?.apiKey) providers.push('blackbox');

    return providers;
  }

  // دالة عامة لإرسال طلب للذكاء الاصطناعي
  async sendRequest(provider, message, options = {}) {
    console.log(`📤 إرسال طلب للمزود: ${provider}`);

    // التحقق من البيانات المدخلة
    if (!provider || typeof provider !== 'string') {
      throw new Error('المزود غير صحيح أو غير محدد');
    }

    if (!message || typeof message !== 'string') {
      throw new Error('الرسالة غير صحيحة أو غير محددة');
    }

    if (!this.isInitialized) {
      console.warn('⚠️ AIService غير مهيأ بشكل كامل، محاولة المتابعة...');
    }

    try {
      // التحقق من توفر المزود
      if (this.availableProviders.length > 0 && !this.availableProviders.includes(provider)) {
        throw new Error(`المزود ${provider} غير متاح. المزودين المتاحين: ${this.availableProviders.join(', ')}`);
      }

      const client = createAIClient(provider);

      if (!client) {
        throw new Error(`فشل في إنشاء عميل للمزود: ${provider}`);
      }

      let result;
      switch(provider) {
        case 'openai':
          result = await this.callOpenAI(client, message, options);
          break;
        case 'anthropic':
          result = await this.callAnthropic(client, message, options);
          break;
        case 'google':
          result = await this.callGoogle(client, message, options);
          break;
        case 'huggingface':
          result = await this.callHuggingFace(client, message, options);
          break;
        case 'openrouter':
          result = await this.callOpenRouter(client, message, options);
          break;
        case 'blackbox':
          result = await this.callBlackbox(client, message, options);
          break;
        default:
          throw new Error(`مزود غير مدعوم: ${provider}`);
      }

      console.log(`✅ تم الحصول على استجابة من ${provider}`);
      return result;

    } catch (error) {
      console.error(`❌ خطأ في ${provider}:`, error.message);

      // إرجاع استجابة بديلة في حالة الفشل
      return `عذراً، حدث خطأ مع ${provider}: ${error.message}. يرجى المحاولة مرة أخرى أو استخدام مزود آخر.`;
    }
  }

  // استدعاء OpenAI
  async callOpenAI(client, message, options) {
    const response = await fetch(`${client.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || client.models.gpt35,
        messages: [{ role: 'user', content: message }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.choices || !data.choices[0]) {
      throw new Error('استجابة غير صحيحة من OpenAI');
    }
    return data.choices[0].message.content;
  }

  // استدعاء Anthropic Claude
  async callAnthropic(client, message, options) {
    const response = await fetch(`${client.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': client.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model || client.models.claude3Haiku,
        max_tokens: options.maxTokens || 1000,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.content || !data.content[0]) {
        throw new Error('استجابة غير صحيحة من Anthropic');
    }
    return data.content[0].text;
  }

  // استدعاء Google AI
  async callGoogle(client, message, options) {
    const response = await fetch(
      `${client.baseURL}/models/${options.model || client.models.gemini}:generateContent?key=${client.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Google AI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // استدعاء Hugging Face (النماذج المجانية)
  async callHuggingFace(client, message, options) {
    const model = options.model || client.models.llama3;
    const response = await fetch(`${client.baseURL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_new_tokens: options.maxTokens || 512,
          temperature: options.temperature || 0.7,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data[0]?.generated_text || data[0]?.text || 'لا توجد استجابة';
    }

    return data.generated_text || data.text || 'لا توجد استجابة';
  }

  // استدعاء OpenRouter (النماذج المجانية)
  async callOpenRouter(client, message, options) {
    const response = await fetch(`${client.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://replit.com',
        'X-Title': 'AI Agents System'
      },
      body: JSON.stringify({
        model: options.model || client.models.llama3Free,
        messages: [{ role: 'user', content: message }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data || !data.choices || !data.choices[0]) {
      throw new Error('استجابة غير صحيحة من OpenAI');
    }
    return data.choices[0].message.content;
  }

  // استدعاء Blackbox AI (متخصص في البرمجة)
  async callBlackbox(client, message, options) {
    const isCodeRequest = options.type === 'code' || 
                         message.includes('code') || 
                         message.includes('function') ||
                         message.includes('script') ||
                         message.includes('program');

    const model = isCodeRequest ? client.models.blackboxCode : client.models.blackboxChat;

    const response = await fetch(`${client.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || (isCodeRequest ? 0.1 : 0.7),
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Blackbox AI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data || !data.choices || !data.choices[0]) {
      throw new Error('استجابة غير صحيحة من Blackbox AI');
    }
    
    return data.choices[0].message.content;
  }
}

module.exports = AIService;
module.exports.AIService = AIService;