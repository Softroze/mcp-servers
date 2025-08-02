
class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.workflows = new Map();
    this.performanceMetrics = new Map();
    this.dependencies = new Map();
  }

  // تسجيل وكيل جديد
  registerAgent(agentId, config) {
    this.agents.set(agentId, {
      id: agentId,
      name: config.name,
      capabilities: config.capabilities || [],
      priority: config.priority || 0,
      maxConcurrency: config.maxConcurrency || 1,
      currentTasks: 0,
      status: 'idle',
      lastUsed: null,
      successRate: 1.0,
      avgResponseTime: 0,
      ...config
    });
    
    this.performanceMetrics.set(agentId, {
      totalTasks: 0,
      successfulTasks: 0,
      averageTime: 0,
      errors: []
    });
  }

  // التنفيذ الهرمي - المدير يوزع المهام
  async executeHierarchical(taskChain, masterAgentId) {
    const masterAgent = this.agents.get(masterAgentId);
    if (!masterAgent) throw new Error(`Master agent ${masterAgentId} not found`);

    const results = [];
    
    for (const task of taskChain) {
      const bestAgent = this.selectBestAgentForTask(task);
      const result = await this.executeTask(bestAgent.id, task);
      results.push({
        agentId: bestAgent.id,
        task: task,
        result: result,
        timestamp: new Date()
      });
    }
    
    return {
      type: 'hierarchical',
      masterAgent: masterAgentId,
      results: results,
      totalTime: results.reduce((acc, r) => acc + (r.result.executionTime || 0), 0)
    };
  }

  // التنفيذ المتوازي - تشغيل عدة وكلاء في نفس الوقت
  async executeParallel(tasks) {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'idle' && agent.currentTasks < agent.maxConcurrency);

    if (availableAgents.length === 0) {
      throw new Error('No available agents for parallel execution');
    }

    const taskPromises = tasks.map(async (task, index) => {
      const agent = availableAgents[index % availableAgents.length];
      return {
        agentId: agent.id,
        task: task,
        result: await this.executeTask(agent.id, task),
        timestamp: new Date()
      };
    });

    const results = await Promise.all(taskPromises);
    
    return {
      type: 'parallel',
      results: results,
      totalTime: Math.max(...results.map(r => r.result.executionTime || 0))
    };
  }

  // التنفيذ التكيفي - يتكيف حسب الظروف
  async executeAdaptive(tasks, adaptationRules = {}) {
    const metrics = this.analyzeSystemLoad();
    let strategy = 'sequential';
    
    // قواعد التكيف
    if (metrics.systemLoad < 0.3 && tasks.length > 1) {
      strategy = 'parallel';
    } else if (metrics.availableAgents > tasks.length * 2) {
      strategy = 'distributed';
    } else if (metrics.criticalTasks > 0) {
      strategy = 'priority';
    }

    // تطبيق الاستراتيجية المناسبة
    switch (strategy) {
      case 'parallel':
        return await this.executeParallel(tasks);
      case 'distributed':
        return await this.executeDistributed(tasks);
      case 'priority':
        return await this.executePriority(tasks);
      default:
        return await this.executeSequential(tasks);
    }
  }

  // التنفيذ الذكي - يدمج جميع السيناريوهات
  async executeIntelligent(workflowConfig) {
    const {
      tasks,
      requirements = {},
      constraints = {},
      optimization = 'balanced'
    } = workflowConfig;

    // تحليل المتطلبات
    const analysis = await this.analyzeWorkflow(tasks, requirements);
    
    // اختيار الاستراتيجية الأمثل
    const strategy = this.selectOptimalStrategy(analysis, constraints, optimization);
    
    // تنفيذ الاستراتيجية مع المراقبة
    const execution = await this.executeWithMonitoring(tasks, strategy);
    
    // تحسين ديناميكي أثناء التنفيذ
    if (execution.needsOptimization) {
      return await this.optimizeExecution(execution);
    }
    
    return execution;
  }

  // اختيار أفضل وكيل للمهمة
  selectBestAgentForTask(task) {
    const suitableAgents = Array.from(this.agents.values())
      .filter(agent => {
        return agent.status === 'idle' &&
               agent.currentTasks < agent.maxConcurrency &&
               this.hasRequiredCapabilities(agent, task);
      })
      .sort((a, b) => {
        // ترتيب حسب الأداء والأولوية
        const scoreA = this.calculateAgentScore(a, task);
        const scoreB = this.calculateAgentScore(b, task);
        return scoreB - scoreA;
      });

    if (suitableAgents.length === 0) {
      throw new Error('No suitable agent found for task');
    }

    return suitableAgents[0];
  }

  // حساب نقاط الوكيل للمهمة
  calculateAgentScore(agent, task) {
    const metrics = this.performanceMetrics.get(agent.id);
    const capabilityMatch = this.calculateCapabilityMatch(agent, task);
    const performanceScore = metrics.successfulTasks / Math.max(metrics.totalTasks, 1);
    const speedScore = 1 / Math.max(metrics.averageTime, 1);
    
    return (capabilityMatch * 0.4) + (performanceScore * 0.3) + (speedScore * 0.2) + (agent.priority * 0.1);
  }

  // تنفيذ مهمة مع مراقبة الأداء
  async executeTask(agentId, task) {
    const agent = this.agents.get(agentId);
    const startTime = Date.now();
    
    try {
      agent.status = 'busy';
      agent.currentTasks++;
      
      // محاكاة تنفيذ المهمة (يمكن استبدالها بالتنفيذ الفعلي)
      const result = await this.simulateTaskExecution(agent, task);
      
      const executionTime = Date.now() - startTime;
      this.updatePerformanceMetrics(agentId, true, executionTime);
      
      agent.lastUsed = new Date();
      return {
        success: true,
        result: result,
        executionTime: executionTime,
        agentId: agentId
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updatePerformanceMetrics(agentId, false, executionTime, error);
      
      return {
        success: false,
        error: error.message,
        executionTime: executionTime,
        agentId: agentId
      };
    } finally {
      agent.status = 'idle';
      agent.currentTasks--;
    }
  }

  // محاكاة تنفيذ المهمة
  async simulateTaskExecution(agent, task) {
    // محاكاة وقت المعالجة
    const processingTime = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // محاكاة نتيجة المعالجة
    return {
      taskType: task.type,
      agentName: agent.name,
      result: `تم تنفيذ ${task.type} بواسطة ${agent.name}`,
      data: task.data || {}
    };
  }

  // تحديث مقاييس الأداء
  updatePerformanceMetrics(agentId, success, executionTime, error = null) {
    const metrics = this.performanceMetrics.get(agentId);
    
    metrics.totalTasks++;
    if (success) {
      metrics.successfulTasks++;
    } else if (error) {
      metrics.errors.push({
        timestamp: new Date(),
        error: error.message || error
      });
    }
    
    // حساب متوسط وقت التنفيذ
    metrics.averageTime = (metrics.averageTime * (metrics.totalTasks - 1) + executionTime) / metrics.totalTasks;
    
    // تحديث معدل النجاح للوكيل
    const agent = this.agents.get(agentId);
    agent.successRate = metrics.successfulTasks / metrics.totalTasks;
    agent.avgResponseTime = metrics.averageTime;
  }

  // تحليل حمولة النظام
  analyzeSystemLoad() {
    const totalAgents = this.agents.size;
    const busyAgents = Array.from(this.agents.values()).filter(a => a.status === 'busy').length;
    const availableAgents = totalAgents - busyAgents;
    
    return {
      systemLoad: busyAgents / totalAgents,
      availableAgents: availableAgents,
      totalAgents: totalAgents,
      criticalTasks: 0 // يمكن تحديدها حسب المتطلبات
    };
  }

  // التحقق من القدرات المطلوبة
  hasRequiredCapabilities(agent, task) {
    if (!task.requiredCapabilities || task.requiredCapabilities.length === 0) {
      return true;
    }
    
    return task.requiredCapabilities.every(capability => 
      agent.capabilities.includes(capability)
    );
  }

  // حساب تطابق القدرات
  calculateCapabilityMatch(agent, task) {
    if (!task.requiredCapabilities || task.requiredCapabilities.length === 0) {
      return 1.0;
    }
    
    const matchedCapabilities = task.requiredCapabilities.filter(capability =>
      agent.capabilities.includes(capability)
    );
    
    return matchedCapabilities.length / task.requiredCapabilities.length;
  }

  // تحليل سير العمل
  async analyzeWorkflow(tasks, requirements) {
    return {
      complexity: tasks.length,
      estimatedTime: tasks.length * 1000, // تقدير بسيط
      resourceRequirements: requirements,
      dependencies: this.findTaskDependencies(tasks)
    };
  }

  // اختيار الاستراتيجية الأمثل
  selectOptimalStrategy(analysis, constraints, optimization) {
    // منطق اختيار الاستراتيجية حسب التحليل
    if (analysis.complexity > 10 && optimization === 'speed') {
      return 'parallel';
    } else if (constraints.resources === 'limited') {
      return 'sequential';
    } else {
      return 'adaptive';
    }
  }

  // التنفيذ مع المراقبة
  async executeWithMonitoring(tasks, strategy) {
    const startTime = Date.now();
    let results;
    
    switch (strategy) {
      case 'parallel':
        results = await this.executeParallel(tasks);
        break;
      case 'sequential':
        results = await this.executeSequential(tasks);
        break;
      default:
        results = await this.executeAdaptive(tasks);
    }
    
    results.totalExecutionTime = Date.now() - startTime;
    results.needsOptimization = this.shouldOptimize(results);
    
    return results;
  }

  // التنفيذ المتسلسل
  async executeSequential(tasks) {
    const results = [];
    
    for (const task of tasks) {
      const bestAgent = this.selectBestAgentForTask(task);
      const result = await this.executeTask(bestAgent.id, task);
      results.push({
        agentId: bestAgent.id,
        task: task,
        result: result,
        timestamp: new Date()
      });
    }
    
    return {
      type: 'sequential',
      results: results,
      totalTime: results.reduce((acc, r) => acc + (r.result.executionTime || 0), 0)
    };
  }

  // الحصول على إحصائيات النظام
  getSystemStats() {
    const agents = Array.from(this.agents.values());
    const metrics = Array.from(this.performanceMetrics.values());
    
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'busy').length,
      averageSuccessRate: metrics.reduce((acc, m) => acc + (m.successfulTasks / Math.max(m.totalTasks, 1)), 0) / metrics.length,
      totalTasksProcessed: metrics.reduce((acc, m) => acc + m.totalTasks, 0),
      systemHealth: this.calculateSystemHealth()
    };
  }

  // حساب صحة النظام
  calculateSystemHealth() {
    const agents = Array.from(this.agents.values());
    const healthyAgents = agents.filter(a => a.successRate > 0.8).length;
    return healthyAgents / agents.length;
  }
}

module.exports = AgentOrchestrator;
