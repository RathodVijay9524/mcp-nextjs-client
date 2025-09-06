# Example MCP Server Configurations

This file contains examples of how to configure different types of MCP servers with your Next.js client.

## Basic Python MCP Server

For a simple Python MCP server:

**Server Configuration:**
- Server Name: `My Python Tools`
- Command: `python`
- Arguments: `C:\path\to\your\mcp_server.py`

## Python with Virtual Environment

If your MCP server uses a virtual environment:

**Server Configuration:**
- Server Name: `Venv Tools`
- Command: `C:\path\to\your\venv\Scripts\python.exe`
- Arguments: `C:\path\to\your\mcp_server.py`

## Node.js MCP Server

For Node.js based MCP servers:

**Server Configuration:**
- Server Name: `Node Tools`
- Command: `node`
- Arguments: `C:\path\to\your\mcp_server.js`

## Testing Your Configuration

1. **Verify your MCP server works independently:**
   ```bash
   # Test your Python MCP server
   python C:\path\to\your\mcp_server.py
   
   # Or with virtual environment
   C:\path\to\your\venv\Scripts\python.exe C:\path\to\your\mcp_server.py
   ```

2. **Check that your server implements the STDIO protocol** - it should accept JSON-RPC messages on stdin and respond on stdout.

3. **Add the server in the MCP Next.js client:**
   - Click the Settings button (⚙️) in the sidebar
   - Scroll to "MCP Servers" section
   - Click "Add Server"
   - Fill in the configuration details
   - Click "Add Server"

## Common Issues

- **Path Issues**: Use absolute paths for both command and arguments
- **Permission Issues**: Ensure the Python/Node executable has proper permissions
- **Environment Variables**: Add any required environment variables in the configuration
- **Dependencies**: Make sure all MCP server dependencies are installed

## Environment Variables

If your MCP server requires environment variables, you can add them in the server configuration (this feature needs to be implemented in the UI, but the backend supports it).

Example:
```json
{
  "API_KEY": "your-api-key",
  "DEBUG": "true"
}
```
