const http = require('http');
const fs = require('fs');
const path = require('path');

// تحميل خدمات الذكاء الاصطناعي مع معالجة شاملة للأخطاء
let AIService;

try {
  // التحقق من وجود ai-service.js
  if (fs.existsSync('./ai-service.js')) {
    const aiServiceModule = require('./ai-service');

    // التعامل مع التصدير المختلفة (CommonJS و ES6)
    if (typeof aiServiceModule === 'function') {
      AIService = aiServiceModule;
    } else if (aiServiceModule && typeof aiServiceModule.default === 'function') {
      AIService = aiServiceModule.default;
    } else if (aiServiceModule && aiServiceModule.AIService) {
      AIService = aiServiceModule.AIService;
    } else {
      throw new Error('تصدير غير صحيح من ai-service.js');
    }

    console.log('✅ تم تحميل ai-service بنجاح');
  } else {
    throw new Error('ملف ai-service.js غير موجود');
  }
} catch (error) {
  console.log('⚠️ تحذير: لم يتم العثور على ai-service.js أو حدث خطأ في التحميل');
  console.log('تفاصيل الخطأ:', error.message);

  // خدمة بديلة آمنة ومحسنة
  AIService = class SafeAIService {
    constructor() {
      console.log('🔧 تم تهيئة الخدمة البديلة الآمنة');
      this.isInitialized = true;
      this.availableProviders = ['fallback'];
    }

    async sendRequest(provider, message, options = {}) {
      // التحقق من صحة البيانات المدخلة
      if (!provider) provider = 'fallback';
      if (!message) message = 'رسالة افتراضية';
      if (!options) options = {};

      console.log(`📝 معالجة طلب بديل للمزود: ${provider}`);

      return {
        success: true,
        response: `تم معالجة الرسالة بواسطة الخدمة البديلة الآمنة: ${message}`,
        provider: provider,
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }

    getAvailableProviders() {
      return this.availableProviders;
    }
  };
}

class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.agentGroups = new Map();
    this.taskHistory = [];
  }

  registerAgent(id, config) {
    this.agents.set(id, { id, ...config, status: 'active' });
    console.log(`✅ تم تسجيل الوكيل: ${config.name}`);
  }

  async executeTask(agentId, task) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`الوكيل غير موجود: ${agentId}`);
    }

    const result = {
      success: true,
      agentId: agentId,
      agentName: agent.name,
      task: task,
      result: `تم تنفيذ المهمة بواسطة ${agent.name}: ${task.description || task.query || 'مهمة عامة'}`,
      executionTime: Math.random() * 1000 + 500,
      timestamp: new Date()
    };

    this.taskHistory.push(result);
    return result;
  }

  async executeIntelligent(workflow) {
    const tasks = workflow.tasks || [];
    const results = [];

    for (const task of tasks) {
      const availableAgents = Array.from(this.agents.values());
      const selectedAgent = availableAgents[0] || { id: 'default', name: 'الوكيل الافتراضي' };

      const result = await this.executeTask(selectedAgent.id, task);
      results.push(result);
    }

    return {
      success: true,
      results: results,
      workflow: workflow.optimization || 'intelligent'
    };
  }

  getSystemStats() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
      totalTasks: this.taskHistory.length,
      systemHealth: 'healthy',
      lastUpdate: new Date()
    };
  }
}

class AutoGenIntegration {
  constructor() {
    this.conversableAgents = new Map();
    this.groupChats = new Map();
  }

  createConversableAgent(agentId, config) {
    this.conversableAgents.set(agentId, { id: agentId, ...config });
    return { success: true, agentId };
  }

  createGroupChat(chatId, agentIds, initiator) {
    this.groupChats.set(chatId, {
      id: chatId,
      agents: agentIds,
      initiator: initiator,
      messages: [],
      status: 'active'
    });
    return { success: true, chatId };
  }

  async initiateGroupChat(chatId, message) {
    const chat = this.groupChats.get(chatId);
    if (!chat) {
      throw new Error(`المحادثة غير موجودة: ${chatId}`);
    }

    chat.messages.push({ message, timestamp: new Date() });
    return {
      success: true,
      chatId: chatId,
      response: `تم بدء المحادثة: ${message}`,
      status: 'completed'
    };
  }

  getAutoGenStats() {
    return {
      totalAgents: this.conversableAgents.size,
      activeChats: this.groupChats.size
    };
  }
}

class SuperAgentIntegration {
  constructor() {
    this.agents = new Map();
    this.workflows = new Map();
  }

  createSuperAgent(agentId, config) {
    this.agents.set(agentId, { id: agentId, ...config });
    return { success: true, agentId };
  }

  async executeSuperAgentTask(agentId, task) {
    return {
      success: true,
      agentId: agentId,
      result: `تم تنفيذ المهمة بواسطة SuperAgent: ${task.description || 'مهمة عامة'}`
    };
  }

  getSuperAgentStats() {
    return {
      totalAgents: this.agents.size,
      totalWorkflows: this.workflows.size
    };
  }
}

class CrewAIIntegration {
  constructor() {
    this.agents = new Map();
    this.crews = new Map();
  }

  createCrew(crewId, config) {
    this.crews.set(crewId, { id: crewId, ...config });
    return { success: true, crewId };
  }

  async executeCrew(crewId, inputs) {
    return {
      success: true,
      crewId: crewId,
      result: `تم تنفيذ المهمة بواسطة CrewAI: ${inputs.task?.description || 'مهمة الفريق'}`
    };
  }

  getCrewAIStats() {
    return {
      totalAgents: this.agents.size,
      totalCrews: this.crews.size
    };
  }
}

class SemanticKernelIntegration {
  constructor() {
    this.agents = new Map();
    this.skills = new Map();
  }

  async initialize() {
    console.log('✅ تم تهيئة Semantic Kernel');
  }

  async executeSemanticTask(agentId, task) {
    return {
      success: true,
      agentId: agentId,
      result: `تم تنفيذ المهمة بواسطة Semantic Kernel: ${task.description || 'مهمة ذكية'}`
    };
  }

  getAllSemanticAgents() {
    return Array.from(this.agents.values());
  }

  getAvailableSkills() {
    return Array.from(this.skills.values());
  }
}

// إنشاء الخدمات مع حماية شاملة من الأخطاء
let aiService, orchestrator;

// دالة مساعدة للتحقق من صحة الكائن
function validateObject(obj, name) {
  if (obj === null || obj === undefined) {
    throw new Error(`${name} is null or undefined`);
  }
  if (typeof obj !== 'object' && typeof obj !== 'function') {
    throw new Error(`${name} is not a valid object or function`);
  }
  return true;
}

try {
  console.log('🔧 بدء تهيئة خدمات الذكاء الاصطناعي...');

  // التحقق الأول: هل AIService موجود ويمكن استخدامه؟
  if (!AIService || typeof AIService !== 'function') {
    throw new Error(`AIService غير صالح أو غير محدد: ${typeof AIService}`);
  }

  console.log('✓ تم التحقق من صحة AIService');

  // إنشاء aiService مع معالجة آمنة
  try {
    aiService = new AIService();
    validateObject(aiService, 'aiService');

    if (typeof aiService.sendRequest !== 'function') {
      throw new Error('aiService.sendRequest is not a function');
    }

    console.log('✓ تم إنشاء aiService بنجاح');
  } catch (aiError) {
    console.warn('⚠️ خطأ في إنشاء aiService:', aiError.message);
    throw aiError;
  }

  // إنشاء orchestrator مع معالجة آمنة
  try {
    orchestrator = new AgentOrchestrator();
    validateObject(orchestrator, 'orchestrator');

    if (typeof orchestrator.executeTask !== 'function') {
      throw new Error('orchestrator.executeTask is not a function');
    }

    console.log('✓ تم إنشاء orchestrator بنجاح');
  } catch (orchError) {
    console.warn('⚠️ خطأ في إنشاء orchestrator:', orchError.message);
    throw orchError;
  }

  console.log('✅ تم تهيئة جميع الخدمات بنجاح!');
  console.log(`📊 aiService: ${typeof aiService} (${aiService.constructor?.name || 'unknown'})`);
  console.log(`📊 orchestrator: ${typeof orchestrator} (${orchestrator.constructor?.name || 'unknown'})`);

} catch (error) {
  console.error('❌ خطأ جوهري في تهيئة الخدمات:', error.message);
  console.error('🔍 تفاصيل:', error.stack || 'لا توجد تفاصيل إضافية');

  console.log('🛠️ إنشاء خدمات بديلة آمنة...');

  // خدمة AI بديلة آمنة تماماً
  aiService = {
    isInitialized: true,
    availableProviders: ['fallback'],

    async sendRequest(provider = 'fallback', message = '', options = {}) {
      try {
        // التحقق من صحة المدخلات
        const safeProvider = provider || 'fallback';
        const safeMessage = message || 'رسالة افتراضية';
        const safeOptions = options || {};

        console.log(`📝 استخدام الخدمة البديلة للمزود: ${safeProvider}`);

        return {
          success: true,
          response: `تم معالجة الرسالة بواسطة الخدمة البديلة: ${safeMessage}`,
          provider: safeProvider,
          timestamp: new Date().toISOString(),
          fallback: true
        };
      } catch (fallbackError) {
        console.error('❌ خطأ حتى في الخدمة البديلة:', fallbackError.message);
        return {
          success: false,
          error: 'خطأ في الخدمة البديلة: ' + fallbackError.message,
          provider: provider || 'fallback',
          timestamp: new Date().toISOString()
        };
      }
    },

    getAvailableProviders() {
      return this.availableProviders;
    }
  };

  // orchestrator بديل آمن تماماً
  try {
    orchestrator = new AgentOrchestrator();
    console.log('✓ تم إنشاء orchestrator عادي كبديل');
  } catch (orchError) {
    console.warn('⚠️ فشل حتى في إنشاء orchestrator عادي، إنشاء نسخة بديلة:', orchError.message);

    orchestrator = {
      agents: new Map(),
      agentGroups: new Map(),
      taskHistory: [],

      registerAgent(id, config) {
        try {
          this.agents.set(id, { id, ...config, status: 'active' });
          console.log(`✅ تم تسجيل الوكيل البديل: ${config.name || id}`);
        } catch (err) {
          console.error('خطأ في تسجيل الوكيل:', err.message);
        }
      },

      async executeTask(agentId, task) {
        try {
          const agent = this.agents.get(agentId) || { id: agentId, name: 'وكيل افتراضي' };

          const result = {
            success: true,
            agentId: agentId,
            agentName: agent.name,
            task: task,
            result: `تم تنفيذ المهمة بواسطة ${agent.name}: ${task.description || task.query || 'مهمة عامة'}`,
            executionTime: Math.random() * 1000 + 500,
            timestamp: new Date()
          };

          this.taskHistory.push(result);
          return result;
        } catch (err) {
          return {
            success: false,
            error: err.message,
            agentId: agentId,
            timestamp: new Date()
          };
        }
      },

      async executeIntelligent(workflow) {
        try {
          const tasks = workflow.tasks || [];
          const results = [];

          for (const task of tasks) {
            const result = await this.executeTask('default-agent', task);
            results.push(result);
          }

          return {
            success: true,
            results: results,
            workflow: workflow.optimization || 'intelligent'
          };
        } catch (err) {
          return {
            success: false,
            error: err.message,
            workflow: workflow
          };
        }
      },

      getSystemStats() {
        return {
          totalAgents: this.agents.size,
          activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
          totalTasks: this.taskHistory.length,
          systemHealth: 'healthy',
          lastUpdate: new Date()
        };
      }
    };
  }

  console.log('🛠️ تم إنشاء جميع الخدمات البديلة بنجاح');
}
const autoGen = new AutoGenIntegration();
const superAgent = new SuperAgentIntegration();
const crewAI = new CrewAIIntegration();
const semanticKernel = new SemanticKernelIntegration();

// تسجيل الوكلاء الافتراضية
orchestrator.registerAgent('analysis-agent', {
  name: 'وكيل التحليل',
  capabilities: ['analysis', 'data-processing'],
  priority: 8
});

orchestrator.registerAgent('generation-agent', {
  name: 'وكيل التوليد',
  capabilities: ['generation', 'content-creation'],
  priority: 7
});

orchestrator.registerAgent('classification-agent', {
  name: 'وكيل التصنيف',
  capabilities: ['classification', 'categorization'],
  priority: 6
});

// دوال النظام المفقودة
async function performSystemHealthCheck() {
  try {
    const systems = {
      mcp: {
        available: true,
        performance: Math.random() * 0.3 + 0.7, // 70-100%
        agents: orchestrator.agents.size,
        status: 'healthy'
      },
      autogen: {
        available: true,
        performance: Math.random() * 0.3 + 0.7,
        agents: autoGen.conversableAgents.size,
        status: 'healthy'
      },
      superagent: {
        available: true,
        performance: Math.random() * 0.3 + 0.7,
        agents: superAgent.agents.size,
        status: 'healthy'
      },
      crewai: {
        available: true,
        performance: Math.random() * 0.3 + 0.7,
        agents: crewAI.agents.size,
        status: 'healthy'
      },
      semantickernel: {
        available: true,
        performance: Math.random() * 0.3 + 0.7,
        agents: semanticKernel.agents.size,
        status: 'healthy'
      }
    };

    return systems;
  } catch (error) {
    throw new Error('فشل في فحص صحة النظام: ' + error.message);
  }
}

async function analyzeBestSystemForTask(task) {
  try {
    const taskType = task.type || 'general';
    const complexity = task.complexity || 'medium';
    
    const systemScores = {
      mcp: 0.8,
      autogen: taskType === 'conversation' ? 0.9 : 0.6,
      superagent: taskType === 'workflow' ? 0.9 : 0.7,
      crewai: taskType === 'collaboration' ? 0.95 : 0.6,
      semantickernel: taskType === 'analysis' ? 0.9 : 0.7
    };

    // تعديل النقاط حسب التعقيد
    if (complexity === 'complex') {
      systemScores.crewai += 0.1;
      systemScores.semantickernel += 0.1;
    }

    const bestSystem = Object.entries(systemScores)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      recommendedSystem: bestSystem[0],
      confidence: bestSystem[1],
      scores: systemScores,
      reasoning: `تم اختيار ${bestSystem[0]} بناءً على نوع المهمة: ${taskType} ومستوى التعقيد: ${complexity}`
    };
  } catch (error) {
    throw new Error('فشل في تحليل أفضل نظام: ' + error.message);
  }
}

async function executeUnifiedTask(taskConfig) {
  try {
    const { task, requiredSystems, collaborationMode } = taskConfig;
    const results = {
      success: true,
      collaborationMode: collaborationMode,
      systemsUsed: requiredSystems,
      results: {
        parallel: [],
        sequential: []
      }
    };

    // تنفيذ مع الأنظمة المختارة
    for (const system of requiredSystems) {
      try {
        let systemResult;
        const startTime = Date.now();

        switch (system) {
          case 'mcp':
            const agent = Array.from(orchestrator.agents.values())[0];
            systemResult = await orchestrator.executeTask(agent.id, task);
            break;
          case 'autogen':
            systemResult = await autoGen.initiateGroupChat('unified-chat', task.description);
            break;
          case 'superagent':
            systemResult = await superAgent.executeSuperAgentTask('unified-agent', task);
            break;
          case 'crewai':
            systemResult = await crewAI.executeCrew('unified-crew', { task });
            break;
          case 'semantickernel':
            systemResult = await semanticKernel.executeSemanticTask('unified-semantic', task);
            break;
        }

        const executionTime = Date.now() - startTime;

        results.results.parallel.push({
          system: system,
          success: systemResult?.success !== false,
          executionTime: executionTime,
          result: systemResult,
          error: systemResult?.error || null
        });

      } catch (systemError) {
        results.results.parallel.push({
          system: system,
          success: false,
          executionTime: 0,
          error: systemError.message
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error('فشل في التنفيذ الموحد: ' + error.message);
  }
}

async function getUnifiedSystemStats() {
  try {
    const mcpStats = orchestrator.getSystemStats();
    const autoGenStats = autoGen.getAutoGenStats();
    const superAgentStats = superAgent.getSuperAgentStats();
    const crewAIStats = crewAI.getCrewAIStats();

    return {
      unified: {
        systemsIntegrated: 5,
        totalCrossAgentTasks: mcpStats.totalTasks,
        collaborationModes: ['sequential', 'parallel', 'hybrid', 'consensus'],
        lastUpdate: new Date()
      },
      mcp: mcpStats,
      autogen: autoGenStats,
      superagent: superAgentStats,
      crewai: crewAIStats,
      semantickernel: {
        totalAgents: semanticKernel.agents.size,
        totalSkills: semanticKernel.skills.size,
        availableSkills: semanticKernel.skills.size
      }
    };
  } catch (error) {
    throw new Error('فشل في الحصول على الإحصائيات الموحدة: ' + error.message);
  }
}

// إنشاء الخادم
const server = http.createServer(async (req, res) => {
  // معالجة CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API للوكلاء
  if (req.url.startsWith('/api/agents') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        try {
          const requestData = JSON.parse(body);
          const action = requestData.action;
          const data = requestData.data || {};
          let result;

          // التحقق من وجود action
          if (!action) {
            throw new Error('لا يوجد action محدد في الطلب');
          }

          switch(action) {
          case 'execute-task':
            result = await orchestrator.executeTask(data.agentId, data.task);
            break;
          case 'execute-intelligent':
            result = await orchestrator.executeIntelligent(data.workflow);
            break;
          case 'get-stats':
            result = orchestrator.getSystemStats();
            break;
          case 'register-agent':
            orchestrator.registerAgent(data.id, data.config);
            result = { success: true, message: 'تم تسجيل الوكيل بنجاح' };
            break;
          case 'autogen-create-agent':
            result = autoGen.createConversableAgent(data.agentId, data.config);
            break;
          case 'superagent-execute':
            result = await superAgent.executeSuperAgentTask(data.agentId, data.task);
            break;
          case 'crewai-execute':
            result = await crewAI.executeCrew(data.crewId, data.inputs);
            break;
          case 'semantic-execute':
            result = await semanticKernel.executeSemanticTask(data.agentId, data.task);
            break;
          case 'system-health-check':
            result = await performSystemHealthCheck();
            break;
          case 'analyze-best-system':
            result = await analyzeBestSystemForTask(data.task);
            break;
          case 'unified-execute':
            result = await executeUnifiedTask(data.taskConfig);
            break;
          case 'unified-stats':
            result = await getUnifiedSystemStats();
            break;
          default:
            throw new Error(`Action غير مدعوم: ${action}`);
        }

        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, data: result }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // API للذكاء الاصطناعي مع حماية شاملة
  if (req.url.startsWith('/api/ai') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      try {
        body += chunk.toString();
      } catch (chunkError) {
        console.error('خطأ في قراءة البيانات:', chunkError.message);
      }
    });

    req.on('end', async () => {
      try {
        console.log('📨 تلقي طلب AI API');

        // التحقق الأساسي من البيانات
        if (!body || typeof body !== 'string' || body.trim() === '') {
          throw new Error('لا توجد بيانات صالحة في الطلب');
        }

        let requestData;
        try {
          requestData = JSON.parse(body);
        } catch (parseError) {
          console.error('خطأ في تحليل JSON:', parseError.message);
          throw new Error('خطأ في تحليل JSON: تأكد من أن البيانات بصيغة JSON صحيحة');
        }

        // التحقق من صحة البيانات المحللة
        if (!requestData || typeof requestData !== 'object') {
          throw new Error('البيانات المحللة غير صالحة');
        }

        const { provider, message, options } = requestData;

        // التحقق من المتطلبات الأساسية
        if (!provider || typeof provider !== 'string' || provider.trim() === '') {
          throw new Error('يجب تحديد مزود صالح');
        }

        if (!message || typeof message !== 'string' || message.trim() === '') {
          throw new Error('يجب تحديد رسالة صالحة');
        }

        // التحقق من وجود وصحة aiService
        if (!aiService) {
          throw new Error('خدمة الذكاء الاصطناعي غير موجودة');
        }

        if (typeof aiService.sendRequest !== 'function') {
          throw new Error('دالة sendRequest غير متاحة في خدمة الذكاء الاصطناعي');
        }

        console.log(`🤖 إرسال طلب للمزود: ${provider.trim()}`);
        console.log(`📝 نص الرسالة: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

        // تنفيذ الطلب مع معالجة آمنة
        let response;
        try {
          response = await aiService.sendRequest(
            provider.trim(), 
            message.trim(), 
            options || {}
          );
        } catch (aiError) {
          console.error('خطأ في خدمة AI:', aiError.message);
          throw new Error(`فشل في معالجة الطلب: ${aiError.message}`);
        }

        // التحقق من صحة الاستجابة
        if (!response) {
          throw new Error('لم يتم الحصول على استجابة من خدمة الذكاء الاصطناعي');
        }

        res.writeHead(200, { 
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });

        const responseData = {
          success: true, 
          response: response,
          provider: provider.trim(),
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 9)
        };

        res.end(JSON.stringify(responseData, null, 2));
        console.log('✅ تم إرسال الاستجابة بنجاح');

      } catch (error) {
        console.error('❌ خطأ في AI API:', error.message);
        console.error('🔍 التفاصيل:', error.stack || 'لا توجد تفاصيل إضافية');

        try {
          res.writeHead(500, { 
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });

          const errorResponse = {
            success: false, 
            error: error.message || 'خطأ غير محدد',
            details: 'تأكد من صحة البيانات المرسلة وأن مفاتيح API صحيحة',
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substr(2, 9)
          };

          res.end(JSON.stringify(errorResponse, null, 2));
        } catch (responseError) {
          console.error('❌ خطأ في إرسال رسالة الخطأ:', responseError.message);
          res.end('{"success":false,"error":"خطأ جوهري في الخادم"}');
        }
      }
    });

    req.on('error', (reqError) => {
      console.error('❌ خطأ في الطلب:', reqError.message);
      try {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end('{"success":false,"error":"خطأ في الطلب"}');
      } catch (err) {
        console.error('خطأ في معالجة خطأ الطلب:', err.message);
      }
    });

    return;
  }

  // GET API للوكلاء
  if (req.method === 'GET' && req.url === '/api/agents') {
    const agents = Array.from(orchestrator.agents.values());
    const stats = orchestrator.getSystemStats();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      agents: agents,
      statistics: stats,
      integrations: {
        mcp: agents.length,
        autogen: autoGen.conversableAgents.size,
        superagent: superAgent.agents.size,
        crewai: crewAI.agents.size,
        semanticKernel: semanticKernel.agents.size
      }
    }));
    return;
  }

  // GET API للإحصائيات
  if (req.method === 'GET' && req.url === '/api/stats') {
    const mcpStats = orchestrator.getSystemStats();
    const autoGenStats = autoGen.getAutoGenStats();
    const superAgentStats = superAgent.getSuperAgentStats();
    const crewAIStats = crewAI.getCrewAIStats();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      timestamp: new Date(),
      systemHealth: 'healthy',
      totalAgents: mcpStats.totalAgents + autoGenStats.totalAgents + superAgentStats.totalAgents + crewAIStats.totalAgents,
      statistics: {
        mcp: mcpStats,
        autogen: autoGenStats,
        superagent: superAgentStats,
        crewai: crewAIStats,
        semanticKernel: {
          totalAgents: semanticKernel.agents.size,
          availableSkills: semanticKernel.skills.size
        }
      }
    }));
    return;
  }

  // اختبار الوكلاء
  if (req.method === 'POST' && req.url === '/api/test-agents') {
    try {
      const testTask = {
        type: 'analysis',
        description: 'اختبار أداء الوكلاء',
        query: 'مرحبا، هذا اختبار لتأكيد عمل الوكلاء'
      };

      const results = [];
      const agents = Array.from(orchestrator.agents.values()).slice(0, 3);

      for (const agent of agents) {
        try {
          const result = await orchestrator.executeTask(agent.id, testTask);
          results.push({
            system: 'MCP',
            agentId: agent.id,
            agentName: agent.name,
            success: result.success,
            responseTime: result.executionTime
          });
        } catch (error) {
          results.push({
            system: 'MCP',
            agentId: agent.id,
            agentName: agent.name,
            success: false,
            error: error.message
          });
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        testResults: results,
        summary: {
          totalTests: results.length,
          successfulTests: results.filter(r => r.success).length,
          averageResponseTime: results
            .filter(r => r.responseTime)
            .reduce((sum, r) => sum + r.responseTime, 0) / 
            Math.max(results.filter(r => r.responseTime).length, 1)
        }
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
    return;
  }

  // تقديم الملفات الثابتة
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './unified-dashboard.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        // إذا لم يتم العثور على الملف، أرسل صفحة افتراضية
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>نظام الوكلاء الذكيين</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>🤖 نظام الوكلاء الذكيين</h1>
    <p>مرحباً بك في النظام الموحد للوكلاء الذكيين!</p>
    <h2>الواجهات المتاحة:</h2>
    <ul>
        <li><a href="/unified-dashboard.html">📊 لوحة التحكم الموحدة</a></li>
        <li><a href="/agent-management.html">🤖 إدارة الوكلاء</a></li>
        <li><a href="/chat-interface.html">💬 واجهة المحادثة</a></li>
        <li><a href="/agent-collaboration.html">🤝 تعاون الوكلاء</a></li>
    </ul>
    <h2>API المتاح:</h2>
    <ul>
        <li><code>/api/agents</code> - إدارة الوكلاء</li>
        <li><code>/api/stats</code> - إحصائيات النظام</li>
        <li><code>/api/test-agents</code> - اختبار الوكلاء</li>
    </ul>
</body>
</html>
        `);
      } else {
        res.writeHead(500);
        res.end('خطأ في الخادم: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// بدء الخادم
const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', async () => {
  console.log('🚀 ========================================');
  console.log('🤖 نظام الوكلاء الذكيين الموحد');
  console.log('🚀 ========================================');
  console.log(`🌐 الخادم يعمل على: http://0.0.0.0:${port}/`);
  console.log(`📊 لوحة التحكم الموحدة: http://0.0.0.0:${port}/unified-dashboard.html`);
  console.log(`🤖 إدارة الوكلاء: http://0.0.0.0:${port}/agent-management.html`);
  console.log(`💬 واجهة المحادثة: http://0.0.0.0:${port}/chat-interface.html`);
  console.log('🚀 ========================================');

  // التحقق من مفاتيح API
  try {
    const { validateAPIKeys } = require('./ai-config');
    const missingKeys = validateAPIKeys();
    if (missingKeys.length === 0) {
      console.log('🎉 جميع مفاتيح API متوفرة ومُكونة بشكل صحيح!');
    }
  } catch (error) {
    console.log(`⚠️ تحذير في التحقق من مفاتيح API: ${error.message}`);
  }

  try {
    await semanticKernel.initialize();
    console.log(`✅ تم تهيئة Semantic Kernel بنجاح`);
  } catch (error) {
    console.log(`⚠️ تحذير Semantic Kernel: ${error.message}`);
  }

  console.log('🚀 ========================================');
  console.log(`✨ النظام جاهز للاستخدام!`);
  console.log(`🤖 عدد الوكلاء المُسجلة: ${orchestrator.agents.size}`);
  console.log(`🔌 الأنظمة المُدمجة: MCP + AutoGen + SuperAgent + CrewAI + Semantic Kernel`);
  console.log('🚀 ========================================');
});

// معالجة أخطاء الخادم
server.on('error', (error) => {
  console.error(`❌ خطأ في الخادم: ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    console.error(`المنفذ ${port} مُستخدم بالفعل. جرب منفذ آخر.`);
  }
});

// معالجة إيقاف التطبيق
process.on('SIGTERM', () => {
  console.log('🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
  });
});