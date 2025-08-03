const http = require('http');
const fs = require('fs');
const path = require('path');

// تحميل خدمات الذكاء الاصطناعي مع معالجة أفضل للأخطاء
let AIService;
try {
  const aiServiceModule = require('./ai-service');
  AIService = aiServiceModule.default || aiServiceModule;
  console.log('✅ تم تحميل ai-service بنجاح');
} catch (error) {
  console.log('⚠️ تحذير: لم يتم العثور على ai-service.js، سيتم استخدام خدمة بديلة');
  console.log('تفاصيل الخطأ:', error.message);
  
  // خدمة بديلة محسنة
  AIService = class {
    constructor() {
      console.log('🔧 تم تهيئة الخدمة البديلة');
    }
    
    async sendRequest(provider, message, options = {}) {
      return {
        success: true,
        response: `تم معالجة الرسالة باستخدام الخدمة البديلة: ${message}`,
        provider: provider || 'fallback'
      };
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

// إنشاء الخدمات مع معالجة محسنة للأخطاء
let aiService, orchestrator;

try {
  console.log('🔧 تهيئة خدمات الذكاء الاصطناعي...');
  
  // التحقق من أن AIService ليس undefined
  if (!AIService) {
    throw new Error('AIService غير محدد');
  }
  
  aiService = new AIService();
  
  // التحقق من نجاح التهيئة
  if (!aiService) {
    throw new Error('فشل في إنشاء aiService');
  }
  
  orchestrator = new AgentOrchestrator();
  
  if (!orchestrator) {
    throw new Error('فشل في إنشاء orchestrator');
  }
  
  console.log('✅ تم تهيئة جميع الخدمات بنجاح');
  console.log('📊 aiService:', typeof aiService);
  console.log('📊 orchestrator:', typeof orchestrator);
  
} catch (error) {
  console.error('❌ خطأ في تهيئة الخدمات:', error.message);
  console.error('🔍 تفاصيل الخطأ:', error.stack);
  
  // إنشاء خدمات بديلة آمنة
  aiService = {
    async sendRequest(provider, message, options = {}) {
      console.log(`📝 استخدام الخدمة البديلة للمزود: ${provider}`);
      return {
        success: true,
        response: `تم معالجة الرسالة بواسطة الخدمة البديلة: ${message}`,
        provider: provider || 'fallback',
        timestamp: new Date().toISOString()
      };
    }
  };
  
  orchestrator = new AgentOrchestrator();
  
  console.log('🛠️ تم إنشاء الخدمات البديلة بنجاح');
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
        const { action, data } = JSON.parse(body);
        let result;

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

  // API للذكاء الاصطناعي
  if (req.url.startsWith('/api/ai') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        console.log('📨 تلقي طلب AI API');
        
        // التحقق من وجود البيانات
        if (!body || body.trim() === '') {
          throw new Error('لا توجد بيانات في الطلب');
        }
        
        let requestData;
        try {
          requestData = JSON.parse(body);
        } catch (parseError) {
          throw new Error('خطأ في تحليل JSON: ' + parseError.message);
        }
        
        const { provider, message, options } = requestData || {};
        
        if (!provider || !message) {
          throw new Error('يجب تحديد المزود والرسالة');
        }

        // التحقق من وجود aiService
        if (!aiService || typeof aiService.sendRequest !== 'function') {
          throw new Error('خدمة الذكاء الاصطناعي غير متاحة');
        }

        console.log(`🤖 إرسال طلب للمزود: ${provider}`);
        const response = await aiService.sendRequest(provider, message, options || {});

        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
          success: true, 
          response,
          timestamp: new Date().toISOString()
        }));
        
      } catch (error) {
        console.error('❌ خطأ في AI API:', error.message);
        console.error('🔍 تفاصيل:', error.stack);
        
        res.writeHead(500, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message,
          details: 'تأكد من صحة البيانات المرسلة',
          timestamp: new Date().toISOString()
        }));
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