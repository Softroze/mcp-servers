
// تكوين الوكلاء المتقدم
const AGENT_CONFIGS = {
  // وكلاء التحليل
  ANALYSIS: {
    'data-analyst': {
      name: 'محلل البيانات',
      capabilities: ['data-analysis', 'statistics', 'visualization'],
      priority: 9,
      maxConcurrency: 2,
      specializations: ['financial-data', 'customer-data', 'performance-metrics']
    },
    'text-analyst': {
      name: 'محلل النصوص',
      capabilities: ['text-analysis', 'sentiment-analysis', 'nlp'],
      priority: 8,
      maxConcurrency: 3,
      specializations: ['sentiment', 'summarization', 'keyword-extraction']
    }
  },

  // وكلاء التوليد
  GENERATION: {
    'content-generator': {
      name: 'مولد المحتوى',
      capabilities: ['content-creation', 'writing', 'copywriting'],
      priority: 7,
      maxConcurrency: 1,
      specializations: ['articles', 'social-media', 'marketing-copy']
    },
    'code-generator': {
      name: 'مولد الكود',
      capabilities: ['code-generation', 'programming', 'debugging'],
      priority: 8,
      maxConcurrency: 2,
      specializations: ['javascript', 'python', 'html-css']
    }
  },

  // وكلاء المعالجة
  PROCESSING: {
    'image-processor': {
      name: 'معالج الصور',
      capabilities: ['image-processing', 'computer-vision', 'ocr'],
      priority: 6,
      maxConcurrency: 2,
      specializations: ['resize', 'filter', 'text-extraction']
    },
    'data-processor': {
      name: 'معالج البيانات',
      capabilities: ['data-transformation', 'etl', 'cleaning'],
      priority: 8,
      maxConcurrency: 3,
      specializations: ['csv', 'json', 'database']
    }
  },

  // وكلاء التصنيف
  CLASSIFICATION: {
    'document-classifier': {
      name: 'مصنف المستندات',
      capabilities: ['document-classification', 'categorization'],
      priority: 7,
      maxConcurrency: 3,
      specializations: ['legal', 'financial', 'technical']
    },
    'spam-detector': {
      name: 'كاشف البريد المزعج',
      capabilities: ['spam-detection', 'email-filtering'],
      priority: 5,
      maxConcurrency: 5,
      specializations: ['email', 'sms', 'comments']
    }
  }
};

// استراتيجيات التنفيذ
const EXECUTION_STRATEGIES = {
  HIERARCHICAL: {
    name: 'هرمي',
    description: 'تنفيذ متسلسل بقيادة وكيل رئيسي',
    bestFor: ['complex-workflows', 'dependent-tasks', 'quality-critical']
  },
  
  PARALLEL: {
    name: 'متوازي',
    description: 'تنفيذ متزامن لعدة مهام',
    bestFor: ['independent-tasks', 'time-critical', 'high-throughput']
  },
  
  ADAPTIVE: {
    name: 'تكيفي',
    description: 'يتكيف مع ظروف النظام والموارد',
    bestFor: ['variable-workload', 'resource-optimization', 'dynamic-requirements']
  },
  
  INTELLIGENT: {
    name: 'ذكي',
    description: 'يدمج جميع الاستراتيجيات بذكاء',
    bestFor: ['complex-scenarios', 'optimal-performance', 'automated-decision-making']
  }
};

// قواعد التحسين
const OPTIMIZATION_RULES = {
  PERFORMANCE: {
    loadBalancing: true,
    resourceMonitoring: true,
    failoverEnabled: true,
    caching: true
  },
  
  QUALITY: {
    redundancyCheck: true,
    errorRetry: 3,
    validationEnabled: true,
    qualityGates: true
  },
  
  COST: {
    resourceLimits: true,
    efficientRouting: true,
    minimizeLatency: true,
    optimizeUtilization: true
  }
};

// مقاييس الأداء
const PERFORMANCE_METRICS = {
  RESPONSE_TIME: {
    excellent: 500,   // أقل من 500ms
    good: 1000,       // أقل من ثانية واحدة
    acceptable: 3000, // أقل من 3 ثوانٍ
    poor: 5000        // أكثر من 5 ثوانٍ
  },
  
  SUCCESS_RATE: {
    excellent: 0.98,  // 98% نجاح أو أكثر
    good: 0.95,       // 95% نجاح أو أكثر
    acceptable: 0.90, // 90% نجاح أو أكثر
    poor: 0.80        // أقل من 80% نجاح
  },
  
  THROUGHPUT: {
    high: 100,        // أكثر من 100 مهمة/دقيقة
    medium: 50,       // 50-100 مهمة/دقيقة
    low: 20,          // 20-50 مهمة/دقيقة
    very_low: 10      // أقل من 10 مهام/دقيقة
  }
};

module.exports = {
  AGENT_CONFIGS,
  EXECUTION_STRATEGIES,
  OPTIMIZATION_RULES,
  PERFORMANCE_METRICS
};
