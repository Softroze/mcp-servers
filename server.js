
const http = require('http');
const fs = require('fs');
const path = require('path');
const AIService = require('./ai-service');
const AgentOrchestrator = require('./agent-orchestrator');
const AutoGenIntegration = require('./autogen-integration');
const SuperAgentIntegration = require('./superagent-integration');
const CrewAIIntegration = require('./crewai-integration');
const SemanticKernelIntegration = require('./semantic-kernel-integration');

const aiService = new AIService();
const orchestrator = new AgentOrchestrator();
const autoGen = new AutoGenIntegration();
const superAgent = new SuperAgentIntegration();
const crewAI = new CrewAIIntegration();
const semanticKernel = new SemanticKernelIntegration();

// تكامل الوكلاء الخمسة الأساسية
class UnifiedAgentSystem {
  constructor() {
    this.mcp = orchestrator;
    this.autogen = autoGen;
    this.superagent = superAgent;
    this.crewai = crewAI;
    this.semantickernel = semanticKernel;
    this.crossAgentTasks = new Map();
  }

  // تنفيذ مهمة موحدة عبر جميع الأنظمة
  async executeUnifiedTask(taskConfig) {
    const {
      task,
      requiredSystems = ['mcp', 'semantickernel'],
      collaborationMode = 'sequential',
      fallbackStrategy = 'best-available'
    } = taskConfig;

    const results = {};
    
    try {
      switch (collaborationMode) {
        case 'parallel':
          results.parallel = await this.executeParallelAcrossSystems(task, requiredSystems);
          break;
        case 'sequential':
          results.sequential = await this.executeSequentialAcrossSystems(task, requiredSystems);
          break;
        case 'hybrid':
          results.hybrid = await this.executeHybridAcrossSystems(task, requiredSystems);
          break;
        case 'consensus':
          results.consensus = await this.executeConsensusAcrossSystems(task, requiredSystems);
          break;
      }

      return {
        success: true,
        results: results,
        systemsUsed: requiredSystems,
        collaborationMode: collaborationMode
      };

    } catch (error) {
      // تطبيق استراتيجية الاحتياط
      if (fallbackStrategy === 'best-available') {
        return await this.fallbackToBestSystem(task, error);
      }
      throw error;
    }
  }

  // تنفيذ متوازي عبر الأنظمة
  async executeParallelAcrossSystems(task, systems) {
    const promises = systems.map(async (systemName) => {
      try {
        return await this.executeOnSystem(systemName, task);
      } catch (error) {
        return { system: systemName, error: error.message, success: false };
      }
    });

    return await Promise.all(promises);
  }

  // تنفيذ متسلسل عبر الأنظمة
  async executeSequentialAcrossSystems(task, systems) {
    const results = [];
    let currentTask = task;

    for (const systemName of systems) {
      try {
        const result = await this.executeOnSystem(systemName, currentTask);
        results.push(result);
        
        // استخدام نتيجة النظام السابق كمدخل للتالي
        if (result.success && result.result) {
          currentTask = {
            ...task,
            previousResult: result.result,
            context: result.context || {}
          };
        }
      } catch (error) {
        results.push({ system: systemName, error: error.message, success: false });
      }
    }

    return results;
  }

  // تنفيذ هجين (ذكي ومتكيف)
  async executeHybridAcrossSystems(task, systems) {
    // تحليل المهمة لتحديد أفضل نظام للبدء
    const analysisResult = await this.analyzeTaskForBestSystem(task);
    const primarySystem = analysisResult.recommendedSystem;
    const supportingSystems = systems.filter(s => s !== primarySystem);

    // تنفيذ على النظام الأساسي
    const primaryResult = await this.executeOnSystem(primarySystem, task);

    // إذا نجح النظام الأساسي، استخدم الأنظمة الداعمة للتحسين
    if (primaryResult.success) {
      const enhancementTasks = supportingSystems.map(async (systemName) => {
        const enhancementTask = {
          ...task,
          type: 'enhancement',
          baseResult: primaryResult.result,
          enhancementMode: this.getEnhancementMode(systemName)
        };
        return await this.executeOnSystem(systemName, enhancementTask);
      });

      const enhancements = await Promise.all(enhancementTasks);
      
      return {
        primary: primaryResult,
        enhancements: enhancements,
        finalResult: this.mergeResults(primaryResult, enhancements)
      };
    }

    return { primary: primaryResult, enhancements: [], finalResult: primaryResult };
  }

  // تنفيذ بالإجماع عبر الأنظمة
  async executeConsensusAcrossSystems(task, systems) {
    const results = await this.executeParallelAcrossSystems(task, systems);
    const successfulResults = results.filter(r => r.success);

    if (successfulResults.length === 0) {
      return { consensus: false, results: results, confidence: 0 };
    }

    // تحليل النتائج لإيجاد الإجماع
    const consensus = this.findConsensusAmongResults(successfulResults);
    
    return {
      consensus: consensus.found,
      results: results,
      consensusResult: consensus.result,
      confidence: consensus.confidence,
      agreement: successfulResults.length / results.length
    };
  }

  // تنفيذ على نظام معين
  async executeOnSystem(systemName, task) {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (systemName) {
        case 'mcp':
          result = await this.mcp.executeIntelligent({
            tasks: [task],
            optimization: 'balanced'
          });
          break;
          
        case 'autogen':
          // إنشاء محادثة جماعية لـ AutoGen
          const chatId = `chat-${Date.now()}`;
          const agents = ['analyst', 'generator', 'reviewer'];
          
          this.autogen.createGroupChat(chatId, agents, 'analyst');
          result = await this.autogen.initiateGroupChat(chatId, task.description || task.query);
          break;
          
        case 'superagent':
          const agentId = this.findBestSuperAgent(task);
          result = await this.superagent.executeSuperAgentTask(agentId, task);
          break;
          
        case 'crewai':
          // إنشاء طاقم ديناميكي حسب المهمة
          const crewId = `crew-${Date.now()}`;
          const crew = this.crewai.createCompleteCrewForTask('dynamic-task', task.description);
          result = await this.crewai.executeCrew(crew.id, { task: task });
          break;
          
        case 'semantickernel':
          const semanticAgentId = this.findBestSemanticAgent(task);
          result = await this.semantickernel.executeSemanticTask(semanticAgentId, task);
          break;
          
        default:
          throw new Error(`Unknown system: ${systemName}`);
      }

      return {
        system: systemName,
        success: true,
        result: result,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        system: systemName,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  // تحليل المهمة لاختيار أفضل نظام
  async analyzeTaskForBestSystem(task) {
    const taskType = task.type || 'general';
    const complexity = task.complexity || 'medium';
    const requirements = task.requirements || [];

    const systemScores = {
      mcp: this.calculateMCPScore(task),
      autogen: this.calculateAutoGenScore(task),
      superagent: this.calculateSuperAgentScore(task),
      crewai: this.calculateCrewAIScore(task),
      semantickernel: this.calculateSemanticKernelScore(task)
    };

    const recommendedSystem = Object.keys(systemScores).reduce((a, b) => 
      systemScores[a] > systemScores[b] ? a : b
    );

    return {
      recommendedSystem: recommendedSystem,
      scores: systemScores,
      reasoning: this.generateRecommendationReasoning(task, systemScores)
    };
  }

  // حساب نقاط MCP
  calculateMCPScore(task) {
    let score = 0.5; // نقطة أساسية
    
    if (task.type === 'collaboration') score += 0.3;
    if (task.complexity === 'high') score += 0.2;
    if (task.requirements?.includes('orchestration')) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  // حساب نقاط AutoGen
  calculateAutoGenScore(task) {
    let score = 0.4;
    
    if (task.type === 'conversation' || task.type === 'chat') score += 0.4;
    if (task.requirements?.includes('multi-agent-chat')) score += 0.3;
    if (task.description?.includes('محادثة') || task.description?.includes('chat')) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  // حساب نقاط SuperAgent
  calculateSuperAgentScore(task) {
    let score = 0.4;
    
    if (task.type === 'workflow') score += 0.3;
    if (task.requirements?.includes('tools')) score += 0.3;
    if (task.complexity === 'medium') score += 0.2;
    
    return Math.min(score, 1.0);
  }

  // حساب نقاط CrewAI
  calculateCrewAIScore(task) {
    let score = 0.4;
    
    if (task.type === 'project' || task.type === 'team-work') score += 0.4;
    if (task.requirements?.includes('role-based')) score += 0.3;
    if (task.complexity === 'high') score += 0.2;
    
    return Math.min(score, 1.0);
  }

  // حساب نقاط Semantic Kernel
  calculateSemanticKernelScore(task) {
    let score = 0.6; // نقطة عالية لأنه متقدم
    
    if (task.type === 'analysis' || task.type === 'planning') score += 0.3;
    if (task.requirements?.includes('semantic-understanding')) score += 0.3;
    if (task.description?.includes('تحليل') || task.description?.includes('خطة')) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  // العثور على أفضل وكيل SuperAgent
  findBestSuperAgent(task) {
    const agents = Array.from(this.superagent.agents.keys());
    return agents.length > 0 ? agents[0] : null;
  }

  // العثور على أفضل وكيل Semantic Kernel
  findBestSemanticAgent(task) {
    const agents = this.semantickernel.getAllSemanticAgents();
    
    if (task.type === 'analysis') return 'semantic-analyst';
    if (task.type === 'planning') return 'semantic-planner';
    if (task.type === 'conversation') return 'semantic-conversationalist';
    
    return agents.length > 0 ? agents[0].id : 'semantic-analyst';
  }

  // دمج النتائج من أنظمة متعددة
  mergeResults(primaryResult, enhancements) {
    const merged = {
      primary: primaryResult.result,
      enhanced: {},
      combinedInsights: [],
      confidenceScore: primaryResult.result.confidence || 0.8
    };

    enhancements.forEach(enhancement => {
      if (enhancement.success) {
        merged.enhanced[enhancement.system] = enhancement.result;
        if (enhancement.result.insights) {
          merged.combinedInsights.push(...enhancement.result.insights);
        }
      }
    });

    // حساب نقاط الثقة المجمعة
    const successfulEnhancements = enhancements.filter(e => e.success);
    if (successfulEnhancements.length > 0) {
      const enhancementConfidence = successfulEnhancements.reduce((sum, e) => 
        sum + (e.result.confidence || 0.7), 0) / successfulEnhancements.length;
      merged.confidenceScore = (merged.confidenceScore + enhancementConfidence) / 2;
    }

    return merged;
  }

  // العثور على إجماع بين النتائج
  findConsensusAmongResults(results) {
    // خوارزمية بسيطة للإجماع
    const outputs = results.map(r => r.result.output || r.result.response || '');
    const similarities = this.calculateSimilarities(outputs);
    
    if (similarities.averageSimilarity > 0.7) {
      return {
        found: true,
        result: this.selectBestResult(results),
        confidence: similarities.averageSimilarity
      };
    }

    return {
      found: false,
      result: this.selectBestResult(results),
      confidence: similarities.averageSimilarity
    };
  }

  // حساب التشابهات بين النتائج
  calculateSimilarities(outputs) {
    // محاكاة حساب التشابه
    const avgLength = outputs.reduce((sum, output) => sum + output.length, 0) / outputs.length;
    const lengthVariation = outputs.reduce((sum, output) => 
      sum + Math.abs(output.length - avgLength), 0) / outputs.length;
    
    const similarity = Math.max(0, 1 - (lengthVariation / avgLength));
    
    return {
      averageSimilarity: similarity,
      details: { avgLength, lengthVariation }
    };
  }

  // اختيار أفضل نتيجة
  selectBestResult(results) {
    return results.reduce((best, current) => {
      const bestScore = this.calculateResultScore(best);
      const currentScore = this.calculateResultScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  // حساب نقاط النتيجة
  calculateResultScore(result) {
    let score = 0;
    
    if (result.success) score += 0.5;
    if (result.result?.confidence) score += result.result.confidence * 0.3;
    if (result.executionTime) score += Math.max(0, 0.2 - (result.executionTime / 10000));
    
    return score;
  }

  // الاحتياط لأفضل نظام متاح
  async fallbackToBestSystem(task, originalError) {
    const systemHealth = await this.checkSystemsHealth();
    const availableSystems = Object.keys(systemHealth).filter(s => systemHealth[s].available);
    
    if (availableSystems.length === 0) {
      throw new Error(`All systems unavailable. Original error: ${originalError.message}`);
    }

    const bestSystem = availableSystems[0]; // أبسط اختيار
    
    try {
      const result = await this.executeOnSystem(bestSystem, task);
      return {
        success: true,
        result: result,
        fallbackUsed: true,
        originalError: originalError.message,
        systemUsed: bestSystem
      };
    } catch (fallbackError) {
      throw new Error(`Fallback failed: ${fallbackError.message}. Original: ${originalError.message}`);
    }
  }

  // فحص صحة الأنظمة
  async checkSystemsHealth() {
    return {
      mcp: { available: true, performance: 0.9 },
      autogen: { available: true, performance: 0.8 },
      superagent: { available: true, performance: 0.85 },
      crewai: { available: true, performance: 0.88 },
      semantickernel: { available: true, performance: 0.95 }
    };
  }

  // إحصائيات النظام الموحد
  getUnifiedStats() {
    return {
      mcp: this.mcp.getSystemStats(),
      autogen: this.autogen.getAutoGenStats(),
      superagent: this.superagent.getSuperAgentStats(),
      crewai: this.crewai.getCrewAIStats(),
      semantickernel: {
        totalAgents: this.semantickernel.getAllSemanticAgents().length,
        totalSkills: this.semantickernel.getAvailableSkills().length
      },
      unified: {
        totalCrossAgentTasks: this.crossAgentTasks.size,
        systemsIntegrated: 5,
        lastUpdate: new Date()
      }
    };
  }
}

const unifiedSystem = new UnifiedAgentSystem();

// تسجيل الوكلاء الافتراضية
orchestrator.registerAgent('analysis-agent', {
  name: 'وكيل التحليل',
  capabilities: ['analysis', 'data-processing', 'statistics'],
  priority: 8,
  maxConcurrency: 2
});

orchestrator.registerAgent('generation-agent', {
  name: 'وكيل التوليد',
  capabilities: ['generation', 'creativity', 'content-creation'],
  priority: 7,
  maxConcurrency: 1
});

orchestrator.registerAgent('classification-agent', {
  name: 'وكيل التصنيف',
  capabilities: ['classification', 'categorization', 'pattern-recognition'],
  priority: 6,
  maxConcurrency: 3
});

orchestrator.registerAgent('processing-agent', {
  name: 'وكيل المعالجة',
  capabilities: ['processing', 'transformation', 'data-manipulation'],
  priority: 9,
  maxConcurrency: 2
});

const server = http.createServer(async (req, res) => {
  // معالجة طلبات API للوكلاء
  if (req.url.startsWith('/api/agents') && req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { action, data } = JSON.parse(body);
          let result;
          
          switch(action) {
            case 'execute-hierarchical':
              result = await orchestrator.executeHierarchical(data.tasks, data.masterAgent);
              break;
            case 'execute-parallel':
              result = await orchestrator.executeParallel(data.tasks);
              break;
            case 'execute-adaptive':
              result = await orchestrator.executeAdaptive(data.tasks, data.rules);
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
            case 'semantic-execute':
              result = await semanticKernel.executeSemanticTask(data.agentId, data.task);
              break;
            case 'semantic-agents':
              result = semanticKernel.getAllSemanticAgents();
              break;
            case 'semantic-skills':
              result = semanticKernel.getAvailableSkills();
              break;
            case 'create-agent-group':
              result = orchestrator.createAgentGroup(data.groupId, data.agentIds, data.collaborationType);
              break;
            case 'execute-collaborative':
              result = await orchestrator.executeCollaborativeTask(data.taskConfig);
              break;
            case 'get-collaboration-stats':
              result = orchestrator.getCollaborationStats();
              break;
            case 'autogen-create-agent':
              result = autoGen.createConversableAgent(data.agentId, data.config);
              break;
            case 'autogen-group-chat':
              result = await autoGen.initiateGroupChat(data.chatId, data.message);
              break;
            case 'autogen-stats':
              result = autoGen.getAutoGenStats();
              break;
            case 'superagent-create':
              result = superAgent.createSuperAgent(data.agentId, data.config);
              break;
            case 'superagent-execute':
              result = await superAgent.executeSuperAgentTask(data.agentId, data.task);
              break;
            case 'superagent-workflow':
              result = await superAgent.executeWorkflow(data.workflowId, data.input);
              break;
            case 'superagent-stats':
              result = superAgent.getSuperAgentStats();
              break;
            case 'crewai-create-crew':
              result = crewAI.createCrew(data.crewId, data.config);
              break;
            case 'crewai-execute':
              result = await crewAI.executeCrew(data.crewId, data.inputs);
              break;
            case 'crewai-complete-project':
              result = crewAI.createCompleteCrewForTask(data.projectName, data.taskDescription);
              break;
            case 'crewai-stats':
              result = crewAI.getCrewAIStats();
              break;
            // الإجراءات الموحدة للأنظمة الخمسة
            case 'unified-execute':
              result = await unifiedSystem.executeUnifiedTask(data.taskConfig);
              break;
            case 'unified-stats':
              result = unifiedSystem.getUnifiedStats();
              break;
            case 'analyze-best-system':
              result = await unifiedSystem.analyzeTaskForBestSystem(data.task);
              break;
            case 'cross-system-collaboration':
              result = await unifiedSystem.executeHybridAcrossSystems(data.task, data.systems);
              break;
            case 'system-health-check':
              result = await unifiedSystem.checkSystemsHealth();
              break;
            default:
              throw new Error(`Action غير مدعوم: ${action}`);
          }
          
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // معالجة طلبات API للذكاء الاصطناعي
  if (req.url.startsWith('/api/ai') && req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { provider, message, options } = JSON.parse(body);
          const response = await aiService.sendRequest(provider, message, options);
          
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(JSON.stringify({ success: true, response }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // معالجة طلبات CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
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
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.md': 'text/plain'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        fs.readFile('./README.md', (error, content) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 الخادم يعمل الآن على: http://0.0.0.0:${port}/`);
  console.log(`📊 لوحة التحكم الموحدة: http://0.0.0.0:${port}/unified-dashboard.html`);
  console.log(`🤖 واجهة إدارة الوكلاء: http://0.0.0.0:${port}/agent-management.html`);
  
  try {
    // تهيئة Semantic Kernel
    await semanticKernel.initialize();
    console.log(`✅ تم تهيئة Semantic Kernel بنجاح`);
  } catch (error) {
    console.log(`⚠️ تحذير: فشل في تهيئة Semantic Kernel: ${error.message}`);
  }
  
  console.log(`✨ النظام الموحد للوكلاء الذكيين جاهز للاستخدام!`);
});

// معالجة أخطاء الخادم
server.on('error', (error) => {
  console.error(`❌ خطأ في الخادم: ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    console.error(`المنفذ ${port} مُستخدم بالفعل. جرب منفذ آخر.`);
  }
});

// معالجة إيقاف التطبيق بشكل صحيح
process.on('SIGTERM', () => {
  console.log('🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادر بنجاح');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادر بنجاح');
  });
});
