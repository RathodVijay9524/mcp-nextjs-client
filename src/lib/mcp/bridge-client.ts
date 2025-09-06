// Enhanced MCP Client that can connect to local bridge server
export class BridgeMCPClient {
  private bridgeUrl: string;
  private isConnected: boolean = false;

  constructor(bridgeUrl: string = 'http://localhost:3001') {
    this.bridgeUrl = bridgeUrl;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.bridgeUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        this.isConnected = true;
        return true;
      }
    } catch (error) {
      console.log('Bridge server not available, using demo mode');
    }
    
    this.isConnected = false;
    return false;
  }

  async analyzeProject(projectPath: string): Promise<any> {
    if (!this.isConnected) {
      return this.getDemoAnalysis(projectPath);
    }

    try {
      const response = await fetch(`${this.bridgeUrl}/api/mcp/file-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'analyze_project',
          path: projectPath
        })
      });

      if (!response.ok) {
        throw new Error(`Bridge request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bridge analysis failed, using demo:', error);
      return this.getDemoAnalysis(projectPath);
    }
  }

  async listFiles(dirPath: string): Promise<any> {
    if (!this.isConnected) {
      return this.getDemoFileList(dirPath);
    }

    try {
      const response = await fetch(`${this.bridgeUrl}/api/mcp/file-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'list_files',
          path: dirPath
        })
      });

      if (!response.ok) {
        throw new Error(`Bridge request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bridge file list failed, using demo:', error);
      return this.getDemoFileList(dirPath);
    }
  }

  async readFile(filePath: string): Promise<any> {
    if (!this.isConnected) {
      return this.getDemoFileContent(filePath);
    }

    try {
      const response = await fetch(`${this.bridgeUrl}/api/mcp/file-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'read_file',
          path: filePath
        })
      });

      if (!response.ok) {
        throw new Error(`Bridge request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bridge file read failed, using demo:', error);
      return this.getDemoFileContent(filePath);
    }
  }

  // Demo fallback methods
  private getDemoAnalysis(projectPath: string) {
    return {
      path: projectPath,
      type: 'Demo Analysis',
      language: 'Multiple',
      framework: 'Modern Web Stack',
      files: ['src/', 'package.json', 'README.md', 'tsconfig.json'],
      dependencies: {
        'react': '^18.0.0',
        'next': '^14.0.0',
        'typescript': '^5.0.0'
      },
      structure: {
        'src/': {
          'components/': { type: 'directory' },
          'pages/': { type: 'directory' },
          'utils/': { type: 'directory' }
        },
        'package.json': { type: 'file', size: 1024 },
        'README.md': { type: 'file', size: 2048 }
      },
      note: 'This is demo data. Start local bridge server for real analysis.'
    };
  }

  private getDemoFileList(dirPath: string) {
    return {
      files: [
        { name: 'src', type: 'directory', path: `${dirPath}/src` },
        { name: 'package.json', type: 'file', path: `${dirPath}/package.json`, size: 1024 },
        { name: 'README.md', type: 'file', path: `${dirPath}/README.md`, size: 2048 },
        { name: 'tsconfig.json', type: 'file', path: `${dirPath}/tsconfig.json`, size: 512 }
      ],
      note: 'Demo file listing. Start local bridge server for real data.'
    };
  }

  private getDemoFileContent(filePath: string) {
    return {
      content: `// Demo content for ${filePath}
This is simulated file content.
Start the local bridge server to read real files.

Bridge Server Setup:
1. Run: node local-mcp-bridge.js
2. Bridge URL: http://localhost:3001
3. Refresh this page`,
      path: filePath,
      note: 'Demo content. Start local bridge server for real file access.'
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getBridgeUrl(): string {
    return this.bridgeUrl;
  }
}
