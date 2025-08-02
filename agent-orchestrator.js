class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.workflows = new Map();
    this.performanceMetrics = new Map();
    this.dependencies = new Map();
    this.collaborationNetwork = new Map(); // شبكة التعاون بين الوكلاء
    this.communicationChannels = new Map(); // قنوات التواصل
    this.sharedResources = new Map(); // الموارد المشتركة
    this.agentGroups = new Map(); // مجموعات الوكلاء
    this.workflowPipelines = new Map(); // خطوط أنابيب المهام
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

  // ===== نظام التعاون والتكامل بين الوكلاء =====

  // إنشاء مجموعة وكلاء متعاونة
  createAgentGroup(groupId, agentIds, collaborationType = 'cooperative') {
    const groupAgents = agentIds.map(id => this.agents.get(id)).filter(Boolean);
    
    this.agentGroups.set(groupId, {
      id: groupId,
      agents: groupAgents,
      type: collaborationType,
      sharedContext: new Map(),
      communicationProtocol: this.establishCommunicationProtocol(collaborationType),
      createdAt: new Date()
    });

    // تأسيس شبكة التعاون
    this.establishCollaborationNetwork(groupId, agentIds);
    
    return this.agentGroups.get(groupId);
  }

  // تأسيس شبكة التعاون
  establishCollaborationNetwork(groupId, agentIds) {
    for (let i = 0; i < agentIds.length; i++) {
      for (let j = i + 1; j < agentIds.length; j++) {
        const connectionId = `${agentIds[i]}-${agentIds[j]}`;
        this.collaborationNetwork.set(connectionId, {
          agent1: agentIds[i],
          agent2: agentIds[j],
          groupId: groupId,
          connectionStrength: 1.0,
          communicationHistory: [],
          sharedTasks: [],
          trustLevel: 0.8
        });
      }
    }
  }

  // تأسيس بروتوكول التواصل
  establishCommunicationProtocol(type) {
    const protocols = {
      cooperative: {
        method: 'broadcast',
        frequency: 'realtime',
        dataSharing: 'full',
        priority: 'equal'
      },
      hierarchical: {
        method: 'tree',
        frequency: 'ondemand',
        dataSharing: 'limited',
        priority: 'ranked'
      },
      competitive: {
        method: 'auction',
        frequency: 'task-based',
        dataSharing: 'minimal',
        priority: 'performance'
      }
    };
    
    return protocols[type] || protocols.cooperative;
  }

  // تنفيذ مهام تعاونية
  async executeCollaborativeTask(taskConfig) {
    const {
      task,
      groupId,
      collaborationStrategy = 'divide-and-conquer',
      synchronization = 'async'
    } = taskConfig;

    const group = this.agentGroups.get(groupId);
    if (!group) throw new Error(`Agent group ${groupId} not found`);

    // تحليل المهمة وتقسيمها
    const subtasks = await this.decomposeTask(task, group.agents);
    
    // توزيع المهام الفرعية
    const assignedTasks = this.assignSubtasks(subtasks, group.agents, collaborationStrategy);
    
    // تنفيذ مع التنسيق
    const results = await this.executeWithCoordination(assignedTasks, group, synchronization);
    
    // دمج النتائج
    const finalResult = await this.mergeResults(results, task);
    
    // تحديث شبكة التعاون
    this.updateCollaborationNetwork(groupId, results);
    
    return finalResult;
  }

  // تحليل وتقسيم المهمة
  async decomposeTask(task, agents) {
    const complexity = this.analyzeTaskComplexity(task);
    const availableCapabilities = agents.flatMap(a => a.capabilities);
    
    const subtasks = [];
    
    // تقسيم حسب القدرات المتاحة
    if (task.type === 'analysis' && availableCapabilities.includes('data-processing')) {
      subtasks.push({ type: 'data-collection', priority: 1 });
      subtasks.push({ type: 'data-analysis', priority: 2 });
      subtasks.push({ type: 'result-synthesis', priority: 3 });
    } else if (task.type === 'generation' && availableCapabilities.includes('content-creation')) {
      subtasks.push({ type: 'research', priority: 1 });
      subtasks.push({ type: 'content-creation', priority: 2 });
      subtasks.push({ type: 'quality-review', priority: 3 });
    } else {
      // تقسيم عام
      subtasks.push({ type: 'preprocessing', priority: 1 });
      subtasks.push({ type: 'main-processing', priority: 2 });
      subtasks.push({ type: 'postprocessing', priority: 3 });
    }
    
    return subtasks.map(st => ({
      ...st,
      originalTask: task,
      estimatedTime: complexity.estimatedTime / subtasks.length,
      requiredCapabilities: this.determineRequiredCapabilities(st.type)
    }));
  }

  // تحديد القدرات المطلوبة للمهمة الفرعية
  determineRequiredCapabilities(subtaskType) {
    const capabilityMap = {
      'data-collection': ['data-processing', 'analysis'],
      'data-analysis': ['analysis', 'statistics'],
      'result-synthesis': ['analysis', 'generation'],
      'research': ['analysis', 'data-processing'],
      'content-creation': ['generation', 'creativity'],
      'quality-review': ['classification', 'analysis'],
      'preprocessing': ['processing', 'data-manipulation'],
      'main-processing': ['processing', 'analysis'],
      'postprocessing': ['processing', 'generation']
    };
    
    return capabilityMap[subtaskType] || ['processing'];
  }

  // توزيع المهام الفرعية
  assignSubtasks(subtasks, agents, strategy) {
    const assignments = [];
    
    switch (strategy) {
      case 'divide-and-conquer':
        assignments.push(...this.divideAndConquerAssignment(subtasks, agents));
        break;
      case 'pipeline':
        assignments.push(...this.pipelineAssignment(subtasks, agents));
        break;
      case 'redundant':
        assignments.push(...this.redundantAssignment(subtasks, agents));
        break;
      default:
        assignments.push(...this.optimalAssignment(subtasks, agents));
    }
    
    return assignments;
  }

  // استراتيجية التقسيم والغلبة
  divideAndConquerAssignment(subtasks, agents) {
    return subtasks.map(subtask => {
      const suitableAgent = this.findBestAgentForSubtask(subtask, agents);
      return {
        subtask: subtask,
        agentId: suitableAgent.id,
        dependencies: [],
        priority: subtask.priority
      };
    });
  }

  // استراتيجية خط الأنابيب
  pipelineAssignment(subtasks, agents) {
    const sortedSubtasks = subtasks.sort((a, b) => a.priority - b.priority);
    return sortedSubtasks.map((subtask, index) => {
      const agentIndex = index % agents.length;
      return {
        subtask: subtask,
        agentId: agents[agentIndex].id,
        dependencies: index > 0 ? [sortedSubtasks[index - 1]] : [],
        priority: subtask.priority
      };
    });
  }

  // العثور على أفضل وكيل للمهمة الفرعية
  findBestAgentForSubtask(subtask, agents) {
    return agents
      .filter(agent => this.hasRequiredCapabilities(agent, subtask))
      .sort((a, b) => this.calculateAgentScore(b, subtask) - this.calculateAgentScore(a, subtask))[0];
  }

  // التنفيذ مع التنسيق
  async executeWithCoordination(assignments, group, synchronization) {
    const results = [];
    const communicationLog = [];
    
    if (synchronization === 'sync') {
      // تنفيذ متزامن مع تنسيق مباشر
      for (const assignment of assignments.sort((a, b) => a.priority - b.priority)) {
        const result = await this.executeAssignmentWithCommunication(assignment, group, communicationLog);
        results.push(result);
        
        // مشاركة النتائج مع الوكلاء الآخرين
        await this.broadcastResultToGroup(result, group, assignment.agentId);
      }
    } else {
      // تنفيذ غير متزامن مع تنسيق دوري
      const promises = assignments.map(assignment => 
        this.executeAssignmentWithCommunication(assignment, group, communicationLog)
      );
      
      const allResults = await Promise.all(promises);
      results.push(...allResults);
    }
    
    return {
      taskResults: results,
      communicationLog: communicationLog,
      collaborationMetrics: this.calculateCollaborationMetrics(results, group)
    };
  }

  // تنفيذ المهمة مع التواصل
  async executeAssignmentWithCommunication(assignment, group, communicationLog) {
    const agent = this.agents.get(assignment.agentId);
    const startTime = Date.now();
    
    // طلب الموارد المشتركة إن لزم الأمر
    const sharedData = await this.requestSharedResources(assignment, group);
    
    // تنفيذ المهمة
    const result = await this.executeTask(assignment.agentId, {
      ...assignment.subtask,
      sharedData: sharedData
    });
    
    // تسجيل التواصل
    communicationLog.push({
      timestamp: new Date(),
      agentId: assignment.agentId,
      action: 'task-execution',
      details: {
        subtask: assignment.subtask.type,
        duration: Date.now() - startTime,
        success: result.success
      }
    });
    
    // تحديث الموارد المشتركة
    await this.updateSharedResources(assignment, result, group);
    
    return {
      ...result,
      assignment: assignment,
      communicationEvents: communicationLog.filter(log => log.agentId === assignment.agentId)
    };
  }

  // طلب الموارد المشتركة
  async requestSharedResources(assignment, group) {
    const resourceKey = `${group.id}-shared-data`;
    const sharedData = this.sharedResources.get(resourceKey) || {};
    
    // إضافة بيانات خاصة بالمهمة الفرعية
    return {
      ...sharedData,
      taskContext: assignment.subtask,
      groupContext: group.sharedContext
    };
  }

  // تحديث الموارد المشتركة
  async updateSharedResources(assignment, result, group) {
    const resourceKey = `${group.id}-shared-data`;
    const currentData = this.sharedResources.get(resourceKey) || {};
    
    this.sharedResources.set(resourceKey, {
      ...currentData,
      [`${assignment.subtask.type}-result`]: result,
      lastUpdated: new Date(),
      contributingAgent: assignment.agentId
    });
    
    // تحديث سياق المجموعة
    group.sharedContext.set(assignment.subtask.type, result);
  }

  // بث النتيجة للمجموعة
  async broadcastResultToGroup(result, group, excludeAgentId) {
    const message = {
      type: 'result-broadcast',
      content: result,
      sender: excludeAgentId,
      timestamp: new Date()
    };
    
    for (const agent of group.agents) {
      if (agent.id !== excludeAgentId) {
        await this.sendMessageToAgent(agent.id, message);
      }
    }
  }

  // إرسال رسالة لوكيل
  async sendMessageToAgent(agentId, message) {
    const channelKey = `channel-${agentId}`;
    
    if (!this.communicationChannels.has(channelKey)) {
      this.communicationChannels.set(channelKey, []);
    }
    
    this.communicationChannels.get(channelKey).push(message);
    
    // محاكاة معالجة الرسالة
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.messageQueue = agent.messageQueue || [];
      agent.messageQueue.push(message);
    }
  }

  // دمج النتائج
  async mergeResults(executionResults, originalTask) {
    const taskResults = executionResults.taskResults;
    const successfulResults = taskResults.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return {
        success: false,
        error: 'No successful subtask results to merge',
        originalTask: originalTask
      };
    }
    
    // دمج النتائج حسب نوع المهمة
    let mergedResult;
    
    if (originalTask.type === 'analysis') {
      mergedResult = this.mergeAnalysisResults(successfulResults);
    } else if (originalTask.type === 'generation') {
      mergedResult = this.mergeGenerationResults(successfulResults);
    } else {
      mergedResult = this.mergeGenericResults(successfulResults);
    }
    
    return {
      success: true,
      result: mergedResult,
      originalTask: originalTask,
      subtaskResults: taskResults,
      collaborationMetrics: executionResults.collaborationMetrics,
      communicationLog: executionResults.communicationLog
    };
  }

  // دمج نتائج التحليل
  mergeAnalysisResults(results) {
    const analysisData = results.map(r => r.result.data || {});
    const insights = results.flatMap(r => r.result.insights || []);
    
    return {
      type: 'analysis',
      combinedData: Object.assign({}, ...analysisData),
      insights: insights,
      confidence: results.reduce((avg, r) => avg + (r.result.confidence || 0.8), 0) / results.length,
      summary: `تم دمج ${results.length} نتائج تحليل بنجاح`
    };
  }

  // دمج نتائج التوليد
  mergeGenerationResults(results) {
    const generatedContent = results.map(r => r.result.content || '').join('\n\n');
    
    return {
      type: 'generation',
      content: generatedContent,
      sections: results.map(r => ({
        agent: r.agentId,
        content: r.result.content
      })),
      quality: results.reduce((avg, r) => avg + (r.result.quality || 0.8), 0) / results.length,
      summary: `تم دمج ${results.length} نتائج توليد بنجاح`
    };
  }

  // دمج النتائج العامة
  mergeGenericResults(results) {
    return {
      type: 'generic',
      results: results.map(r => r.result),
      count: results.length,
      summary: `تم دمج ${results.length} نتائج بنجاح`
    };
  }

  // حساب مقاييس التعاون
  calculateCollaborationMetrics(results, group) {
    const taskResults = results.taskResults;
    const successRate = taskResults.filter(r => r.success).length / taskResults.length;
    const avgExecutionTime = taskResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / taskResults.length;
    
    return {
      groupEfficiency: successRate,
      averageExecutionTime: avgExecutionTime,
      communicationOverhead: results.communicationLog.length,
      agentUtilization: this.calculateAgentUtilization(group),
      collaborationScore: successRate * 0.6 + (1 - (avgExecutionTime / 10000)) * 0.4
    };
  }

  // حساب استخدام الوكلاء
  calculateAgentUtilization(group) {
    const utilization = {};
    
    for (const agent of group.agents) {
      const metrics = this.performanceMetrics.get(agent.id);
      utilization[agent.id] = {
        tasksCompleted: metrics.successfulTasks,
        efficiency: metrics.successfulTasks / Math.max(metrics.totalTasks, 1),
        avgResponseTime: metrics.averageTime
      };
    }
    
    return utilization;
  }

  // تحديث شبكة التعاون
  updateCollaborationNetwork(groupId, results) {
    const communicationEvents = results.communicationLog;
    
    // تحديث قوة الاتصال بناءً على التفاعل
    for (const event of communicationEvents) {
      const connections = Array.from(this.collaborationNetwork.values())
        .filter(conn => conn.groupId === groupId && 
                       (conn.agent1 === event.agentId || conn.agent2 === event.agentId));
      
      connections.forEach(conn => {
        conn.communicationHistory.push(event);
        conn.connectionStrength = Math.min(conn.connectionStrength + 0.1, 2.0);
        
        // تحديث مستوى الثقة بناءً على النجاح
        if (event.details.success) {
          conn.trustLevel = Math.min(conn.trustLevel + 0.05, 1.0);
        }
      });
    }
  }

  // الحصول على إحصائيات التعاون
  getCollaborationStats() {
    const groups = Array.from(this.agentGroups.values());
    const connections = Array.from(this.collaborationNetwork.values());
    
    return {
      totalGroups: groups.length,
      totalConnections: connections.length,
      averageGroupSize: groups.reduce((sum, g) => sum + g.agents.length, 0) / Math.max(groups.length, 1),
      averageConnectionStrength: connections.reduce((sum, c) => sum + c.connectionStrength, 0) / Math.max(connections.length, 1),
      averageTrustLevel: connections.reduce((sum, c) => sum + c.trustLevel, 0) / Math.max(connections.length, 1),
      activeGroups: groups.filter(g => g.agents.some(a => a.status === 'busy')).length
    };
  }

  // تحليل تعقد المهمة
  analyzeTaskComplexity(task) {
    const description = task.description || '';
    const dataSize = task.dataSize || 0;
    
    let complexity = 'simple';
    let estimatedTime = 1000;
    
    if (description.length > 500 || dataSize > 1000000) {
      complexity = 'complex';
      estimatedTime = 5000;
    } else if (description.length > 200 || dataSize > 100000) {
      complexity = 'medium';
      estimatedTime = 3000;
    }
    
    return {
      level: complexity,
      estimatedTime: estimatedTime,
      factors: {
        descriptionLength: description.length,
        dataSize: dataSize,
        requiredCapabilities: task.requiredCapabilities?.length || 0
      }
    };
  }
}

module.exports = AgentOrchestrator;