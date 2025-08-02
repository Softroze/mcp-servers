
const { AI_CONFIG, validateAPIKeys, createAIClient } = require('./ai-config');

class AIService {
  constructor() {
    // التحقق من المفاتيح عند بدء الخدمة
    validateAPIKeys();
  }

  // دالة عامة لإرسال طلب للذكاء الاصطناعي
  async sendRequest(provider, message, options = {}) {
    try {
      const client = createAIClient(provider);
      
      switch(provider) {
        case 'openai':
          return await this.callOpenAI(client, message, options);
        case 'anthropic':
          return await this.callAnthropic(client, message, options);
        case 'google':
          return await this.callGoogle(client, message, options);
        case 'huggingface':
          return await this.callHuggingFace(client, message, options);
        default:
          throw new Error(`مزود غير مدعوم: ${provider}`);
      }
    } catch (error) {
      console.error(`خطأ في ${provider}:`, error.message);
      throw error;
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

  // استدعاء Hugging Face
  async callHuggingFace(client, message, options) {
    const model = options.model || 'microsoft/DialoGPT-medium';
    const response = await fetch(`${client.baseURL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_length: options.maxTokens || 100,
          temperature: options.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API Error: ${response.status}`);
    }

    const data = await response.json();
    return data[0].generated_text || data.generated_text;
  }
}

module.exports = AIService;
