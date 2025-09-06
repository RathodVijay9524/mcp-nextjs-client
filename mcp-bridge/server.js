// MCP Bridge Server
// Connects your deployed web app to local MCP servers

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS for your deployed app (update with your actual Vercel URL)
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://mcp-nextjs-client-*.vercel.app',
    /https:\/\/.*\.vercel\.app$/  // Allow all vercel apps for testing
  ],
  credentials: true
}));

app.use(express.json());

console.log('🚀 Starting MCP Bridge Server...');

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('📡 Health check requested');
  res.json({ 
    status: 'MCP Bridge Server Running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Bridge status endpoint
app.get('/status', (req, res) => {
  res.json({
    bridge: 'active',
    port: PORT,
    capabilities: [
      'file_operations',
      'project_analysis',
      'directory_listing'
    ]
  });
});

// File operations endpoint
app.post('/api/mcp/file-operations', async (req, res) => {
  try {
    const { operation, path: filePath, content } = req.body;
    console.log(`🔧 MCP Operation: ${operation} on ${filePath}`);

    switch (operation) {
      case 'list_files':
        try {
          const items = await fs.readdir(filePath);
          const fileList = [];
          
          for (const item of items.slice(0, 50)) { // Limit to 50 items for performance
            const fullPath = path.join(filePath, item);
            try {
              const stats = await fs.stat(fullPath);
              fileList.push({
                name: item,
                path: fullPath,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                modified: stats.mtime.toISOString()
              });
            } catch (statError) {
              // Skip files we can't stat
              console.warn(`Cannot stat ${fullPath}:`, statError.message);
            }
          }
          
          console.log(`✅ Listed ${fileList.length} items from ${filePath}`);
          res.json({ files: fileList, path: filePath });
        } catch (error) {
          console.error(`❌ Cannot access ${filePath}:`, error.message);
          res.status(400).json({ error: `Cannot access path: ${error.message}` });
        }
        break;

      case 'read_file':
        try {
          const stats = await fs.stat(filePath);
          if (stats.size > 1024 * 1024) { // 1MB limit
            return res.status(400).json({ error: 'File too large (max 1MB)' });
          }
          
          const fileContent = await fs.readFile(filePath, 'utf-8');
          console.log(`✅ Read file ${filePath} (${stats.size} bytes)`);
          res.json({ 
            content: fileContent, 
            path: filePath,
            size: stats.size,
            modified: stats.mtime.toISOString()
          });
        } catch (error) {
          console.error(`❌ Cannot read ${filePath}:`, error.message);
          res.status(400).json({ error: `Cannot read file: ${error.message}` });
        }
        break;

      case 'analyze_project':
        try {
          console.log(`🔍 Analyzing project: ${filePath}`);
          const analysis = await analyzeProject(filePath);
          console.log(`✅ Project analysis complete: ${analysis.type}`);
          res.json(analysis);
        } catch (error) {
          console.error(`❌ Cannot analyze ${filePath}:`, error.message);
          res.status(400).json({ error: `Cannot analyze project: ${error.message}` });
        }
        break;

      default:
        console.error(`❌ Unknown operation: ${operation}`);
        res.status(400).json({ error: 'Unknown operation' });
    }
  } catch (error) {
    console.error('❌ Bridge server error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Project analysis function
async function analyzeProject(projectPath) {
  const analysis = {
    path: projectPath,
    type: 'Unknown',
    language: 'Unknown',
    framework: 'Unknown',
    files: [],
    dependencies: {},
    structure: {},
    insights: []
  };

  try {
    const items = await fs.readdir(projectPath);
    analysis.files = items.slice(0, 20); // Limit for display

    // Check for specific files to determine project type
    if (items.includes('package.json')) {
      try {
        const packageJson = JSON.parse(
          await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
        );
        
        analysis.type = 'Node.js Project';
        analysis.language = 'JavaScript/TypeScript';
        analysis.dependencies = packageJson.dependencies || {};
        analysis.name = packageJson.name || 'Unnamed Project';
        analysis.version = packageJson.version || 'Unknown';
        
        // Determine framework
        if (packageJson.dependencies?.next) {
          analysis.framework = 'Next.js';
          analysis.insights.push('⚡ Next.js application with server-side rendering');
        } else if (packageJson.dependencies?.react) {
          analysis.framework = 'React';
          analysis.insights.push('⚛️ React application');
        } else if (packageJson.dependencies?.vue) {
          analysis.framework = 'Vue.js';
          analysis.insights.push('🟢 Vue.js application');
        } else if (packageJson.dependencies?.angular) {
          analysis.framework = 'Angular';
          analysis.insights.push('🔺 Angular application');
        }

        // Check for TypeScript
        if (items.includes('tsconfig.json') || packageJson.dependencies?.typescript) {
          analysis.insights.push('📘 TypeScript enabled');
        }

      } catch (jsonError) {
        analysis.insights.push('⚠️ package.json found but cannot be parsed');
      }
    }
    
    if (items.includes('requirements.txt')) {
      analysis.type = 'Python Project';
      analysis.language = 'Python';
      analysis.insights.push('🐍 Python project detected');
    }
    
    if (items.includes('Cargo.toml')) {
      analysis.type = 'Rust Project';
      analysis.language = 'Rust';
      analysis.insights.push('🦀 Rust project detected');
    }

    if (items.includes('.git')) {
      analysis.insights.push('📱 Git repository');
    }

    // Build structure tree (limited depth for performance)
    analysis.structure = await buildStructureTree(projectPath, 2);

  } catch (error) {
    analysis.error = error.message;
    analysis.insights.push(`❌ Analysis error: ${error.message}`);
  }

  return analysis;
}

// Build directory structure tree
async function buildStructureTree(dirPath, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) return {};
  
  const structure = {};
  
  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items.slice(0, 15)) { // Limit to 15 items per directory
      if (item.startsWith('.') && item !== '.git') continue; // Skip hidden files except .git
      
      const fullPath = path.join(dirPath, item);
      
      try {
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          structure[item] = {
            type: 'directory',
            ...await buildStructureTree(fullPath, maxDepth, currentDepth + 1)
          };
        } else {
          structure[item] = {
            type: 'file',
            size: stats.size,
            extension: path.extname(item)
          };
        }
      } catch (statError) {
        // Skip files we can't access
        structure[item] = { type: 'error', message: 'Access denied' };
      }
    }
  } catch (error) {
    structure._error = error.message;
  }
  
  return structure;
}

// Start the server
app.listen(PORT, () => {
  console.log(`🌉 MCP Bridge Server running on http://localhost:${PORT}`);
  console.log(`🔗 Your web app can now connect to this bridge`);
  console.log(`📁 Ready to handle MCP operations from your deployed app!`);
  console.log(`\n🎯 Test endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Status: http://localhost:${PORT}/status`);
  console.log(`\n💡 Usage in your deployed app:`);
  console.log(`   "Analyze this project: C:\\\\Users\\\\Admin\\\\mcp-nextjs-client"`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MCP Bridge Server...');
  process.exit(0);
});
