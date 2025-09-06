// Local MCP Bridge Server
// Run this on your local machine to bridge web app <-> MCP servers

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS for your deployed app
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-deployed-app.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'MCP Bridge Server Running', timestamp: new Date().toISOString() });
});

// File operations endpoint
app.post('/api/mcp/file-operations', async (req, res) => {
  try {
    const { operation, path: filePath, content } = req.body;

    switch (operation) {
      case 'list_files':
        try {
          const items = await fs.readdir(filePath);
          const fileList = [];
          
          for (const item of items) {
            const fullPath = path.join(filePath, item);
            const stats = await fs.stat(fullPath);
            fileList.push({
              name: item,
              path: fullPath,
              type: stats.isDirectory() ? 'directory' : 'file',
              size: stats.size,
              modified: stats.mtime
            });
          }
          
          res.json({ files: fileList });
        } catch (error) {
          res.status(400).json({ error: `Cannot access path: ${error.message}` });
        }
        break;

      case 'read_file':
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          res.json({ content: fileContent, path: filePath });
        } catch (error) {
          res.status(400).json({ error: `Cannot read file: ${error.message}` });
        }
        break;

      case 'analyze_project':
        try {
          // Analyze project structure
          const analysis = await analyzeProject(filePath);
          res.json(analysis);
        } catch (error) {
          res.status(400).json({ error: `Cannot analyze project: ${error.message}` });
        }
        break;

      default:
        res.status(400).json({ error: 'Unknown operation' });
    }
  } catch (error) {
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
    structure: {}
  };

  try {
    const items = await fs.readdir(projectPath);
    analysis.files = items;

    // Check for specific files to determine project type
    if (items.includes('package.json')) {
      const packageJson = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8'));
      analysis.type = 'Node.js Project';
      analysis.language = 'JavaScript/TypeScript';
      analysis.dependencies = packageJson.dependencies || {};
      
      // Determine framework
      if (packageJson.dependencies?.next) analysis.framework = 'Next.js';
      else if (packageJson.dependencies?.react) analysis.framework = 'React';
      else if (packageJson.dependencies?.vue) analysis.framework = 'Vue.js';
      else if (packageJson.dependencies?.angular) analysis.framework = 'Angular';
    }
    
    if (items.includes('requirements.txt')) {
      analysis.type = 'Python Project';
      analysis.language = 'Python';
    }
    
    if (items.includes('Cargo.toml')) {
      analysis.type = 'Rust Project';
      analysis.language = 'Rust';
    }

    // Build structure tree
    analysis.structure = await buildStructureTree(projectPath, 2); // 2 levels deep

  } catch (error) {
    analysis.error = error.message;
  }

  return analysis;
}

// Build directory structure tree
async function buildStructureTree(dirPath, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) return {};
  
  const structure = {};
  
  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items.slice(0, 20)) { // Limit to 20 items per directory
      const fullPath = path.join(dirPath, item);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        structure[item] = await buildStructureTree(fullPath, maxDepth, currentDepth + 1);
      } else {
        structure[item] = {
          type: 'file',
          size: stats.size,
          extension: path.extname(item)
        };
      }
    }
  } catch (error) {
    structure._error = error.message;
  }
  
  return structure;
}

app.listen(PORT, () => {
  console.log(`🌉 MCP Bridge Server running on http://localhost:${PORT}`);
  console.log(`🔗 Configure your web app to use: http://localhost:${PORT}`);
  console.log(`📁 Ready to handle file operations from your deployed app!`);
});

module.exports = app;
