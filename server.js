
const http = require('http');
const fs = require('fs');
const path = require('path');
const AIService = require('./ai-service');
const AgentOrchestrator = require('./agent-orchestrator');

const aiService = new AIService();
const orchestrator = new AgentOrchestrator();

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
  console.log(`Server running at http://0.0.0.0:${port}/`);
  
  // تهيئة Semantic Kernel
  await semanticKernel.initialize();
});
