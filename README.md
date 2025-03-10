# Opik MCP Server

This repository contains a Model Context Protocol (MCP) implementation for the Opik platform. It provides a set of tools for managing prompts, projects/workspaces, traces, and metrics through a standardized interface.

## Architecture

The Opik API follows a hierarchical structure:
- **Workspaces** are top-level containers that organize all resources
- **Projects** exist within workspaces and are used to group related traces
- **Traces** are always associated with a specific project

When using this MCP server:
- Configuration can be provided via environment variables (`.env` file) or command-line arguments
- For cloud deployments, the default workspace name is "default"
- Project ID is required for most trace operations
- You can override the configured workspace name in supported API calls

## Features

### Prompts
- List all prompts with pagination
- Create new prompts
- Create new versions of existing prompts
- Get prompt details by ID
- Update prompt information
- Delete prompts

### Projects/Workspaces
- List all projects with pagination and sorting
- Create new projects
- Get project details by ID
- Update project information
- Delete projects
- Override workspace name for specific operations

### Traces
- List all traces with pagination and filtering by project ID/name
- Get trace details by ID
- Get trace statistics with filtering options

### Metrics
- Get metrics data with filtering options

## Installation

To use this MCP implementation, follow these steps:

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/opik-mcp.git
   cd opik-mcp
   ```

2. Create a `.cursor/mcp.json` file in your project root:

   ```bash
   mkdir -p .cursor
   touch .cursor/mcp.json
   ```

3. Add the following configuration to the `.cursor/mcp.json` file:

   ```json
   {
     "mcpServers": {
       "opik": {
         "command": "node",
         "args": [
           "/path/to/build/index.js",
           "--apiUrl", "https://www.comet.com/opik/api",
           "--apiKey", "your-api-key",
           "--workspace", "default"
         ]
       }
     }
   }
   ```

4. Alternatively, configure the server with environment variables (see Configuration section)

5. Install dependencies and build the project:

   ```bash
   npm install
   npm run build
   ```

6. Open Cursor and navigate to Settings > MCP

7. Enable the Opik MCP in your Cursor settings

## Configuration

The MCP server can be configured through environment variables (`.env` file) or command-line arguments. Command-line arguments take precedence over environment variables.

### Command-line Arguments

Run the server with command-line arguments:

```bash
node build/index.js --apiUrl "https://www.comet.com/opik/api" --apiKey "your-api-key" --workspace "default"
```

#### Available Arguments

| Argument | Alias | Description | Default |
|----------|-------|-------------|---------|
| `--apiUrl` | `-url` | API base URL | - |
| `--apiKey` | `-key` | API key for authentication | - |
| `--workspace` | `-ws` | Workspace name | "default" |
| `--selfHosted` | - | Whether the instance is self-hosted | false |
| `--debug` | - | Enable debug mode | false |
| `--mcpName` | - | MCP server name | "opik-manager" |
| `--mcpVersion` | - | MCP server version | "1.0.0" |
| `--mcpPort` | - | MCP server port | - |
| `--mcpLogging` | - | Enable MCP server logging | false |
| `--mcpDefaultWorkspace` | - | Default workspace name | "default" |
| `--disablePromptTools` | - | Disable prompt-related tools | false |
| `--disableProjectTools` | - | Disable project-related tools | false |
| `--disableTraceTools` | - | Disable trace-related tools | false |
| `--disableMetricTools` | - | Disable metric-related tools | false |

### Environment Variables

Alternatively, configure via environment variables in a `.env` file:

#### Common Configuration
- `OPIK_API_BASE_URL`: The base URL for the API
  - For cloud: "https://comet.com/opik/api"
  - For self-hosted: "http://localhost:5173/api"
- `OPIK_API_KEY`: Your API key for authentication
- `OPIK_SELF_HOSTED`: Set to "true" for self-hosted instances, or "false" for cloud (default is "false")
- `DEBUG_MODE`: Set to "true" to see detailed API request logs (default is "false")

#### Cloud-specific Configuration
- `OPIK_WORKSPACE_NAME`: Your workspace name (required for cloud instances, defaults to "default")

#### MCP Server Configuration
- `MCP_NAME`: Name of the MCP server (defaults to "opik-manager")
- `MCP_VERSION`: Version of the MCP server (defaults to "1.0.0")
- `MCP_PORT`: Optional port for TCP connections if needed
- `MCP_LOGGING`: Set to "true" to enable MCP-specific logging (defaults to "false")
- `MCP_DEFAULT_WORKSPACE`: Default workspace to use if none is specified (defaults to "default")

#### Tool Enablement
- `MCP_ENABLE_PROMPT_TOOLS`: Set to "false" to disable prompt-related tools (defaults to "true")
- `MCP_ENABLE_PROJECT_TOOLS`: Set to "false" to disable project-related tools (defaults to "true")
- `MCP_ENABLE_TRACE_TOOLS`: Set to "false" to disable trace-related tools (defaults to "true")
- `MCP_ENABLE_METRIC_TOOLS`: Set to "false" to disable metric-related tools (defaults to "true")

## IDE Integration

### Cursor Configuration

To use the Opik MCP server with Cursor IDE, you need to create a `.cursor/mcp.json` file in your project root. This file tells Cursor how to start and configure the MCP server.

Here's a comprehensive example with all available configuration options:

```json
{
  "mcpServers": {
    "opik": {
      "command": "node",
      "args": [
        "/absolute/path/to/build/index.js",

        // API Configuration
        "--apiUrl", "https://www.comet.com/opik/api",
        "--apiKey", "your-api-key",
        "--workspace", "default",

        // Deployment Configuration
        "--selfHosted", "false",

        // Debug Settings
        "--debug", "false",

        // MCP Server Configuration
        "--mcpName", "opik-manager",
        "--mcpVersion", "1.0.0",
        "--mcpLogging", "false",
        "--mcpDefaultWorkspace", "default",

        // Tool Enablement (omit these to use defaults)
        "--disablePromptTools", "false",
        "--disableProjectTools", "false",
        "--disableTraceTools", "false",
        "--disableMetricTools", "false"
      ],
      "env": {
        // You can also set environment variables here if preferred
        // "OPIK_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### Important Notes:

1. **Absolute Path**: Make sure to use an absolute path to the `index.js` file to ensure Cursor can find it regardless of the working directory.

2. **Minimal Configuration**: For a simpler setup, you can use just the essential parameters:

```json
{
  "mcpServers": {
    "opik": {
      "command": "node",
      "args": [
        "/absolute/path/to/build/index.js",
        "--apiUrl", "https://www.comet.com/opik/api",
        "--apiKey", "your-api-key",
        "--workspace", "default"
      ]
    }
  }
}
```

3. **Multiple Configurations**: You can define multiple MCP servers by adding more entries to the `mcpServers` object:

```json
{
  "mcpServers": {
    "opik-prod": {
      "command": "node",
      "args": [
        "/absolute/path/to/build/index.js",
        "--apiUrl", "https://www.comet.com/opik/api",
        "--apiKey", "your-production-api-key",
        "--workspace", "production"
      ]
    },
    "opik-dev": {
      "command": "node",
      "args": [
        "/absolute/path/to/build/index.js",
        "--apiUrl", "https://www.comet.com/opik/api",
        "--apiKey", "your-development-api-key",
        "--workspace", "development"
      ]
    }
  }
}
```

4. **Enabling in Cursor**: After setting up the configuration file, go to Cursor settings → MCP and enable the Opik MCP server(s).

## Available Tools

### Prompts

#### 1. List Prompts

Lists all available prompts with pagination support.

```typescript
{
  name: "list-prompts",
  parameters: {
    page: number,    // Page number for pagination
    size: number     // Number of items per page
  }
}
```

#### 2. Create Prompt

Creates a new prompt.

```typescript
{
  name: "create-prompt",
  parameters: {
    name: string     // Name of the prompt
  }
}
```

#### 3. Create Prompt Version

Creates a new version of an existing prompt.

```typescript
{
  name: "create-prompt-version",
  parameters: {
    name: string,           // Name of the original prompt
    template: string,       // Template content for the prompt version
    commit_message: string  // Commit message for the prompt version
  }
}
```

#### 4. Get Prompt by ID

Retrieves details of a specific prompt.

```typescript
{
  name: "get-prompt-by-id",
  parameters: {
    promptId: string  // ID of the prompt to fetch
  }
}
```

#### 5. Update Prompt

Updates an existing prompt's information.

```typescript
{
  name: "update-prompt",
  parameters: {
    promptId: string,  // ID of the prompt to update
    name: string       // New name for the prompt
  }
}
```

#### 6. Delete Prompt

Deletes an existing prompt.

```typescript
{
  name: "delete-prompt",
  parameters: {
    promptId: string  // ID of the prompt to delete
  }
}
```

### Projects/Workspaces

#### 1. List Projects

Lists all available projects with pagination support.

```typescript
{
  name: "list-projects",
  parameters: {
    page: number,                 // Page number for pagination
    size: number,                 // Number of items per page
    sortBy?: string,              // Optional field to sort by
    sortOrder?: string,           // Optional sort order (asc/desc)
    workspaceName?: string        // Optional workspace name override
  }
}
```

#### 2. Get Project by ID

Retrieves details of a specific project.

```typescript
{
  name: "get-project-by-id",
  parameters: {
    projectId: string,            // ID of the project to fetch
    workspaceName?: string        // Optional workspace name override
  }
}
```

#### 3. Create Project

Creates a new project.

```typescript
{
  name: "create-project",
  parameters: {
    name: string,                 // Name for the new project
    description?: string          // Optional description for the new project
  }
}
```

#### 4. Update Project

Updates an existing project.

```typescript
{
  name: "update-project",
  parameters: {
    projectId: string,            // ID of the project to update
    name?: string,                // Optional new name for the project
    description?: string,         // Optional new description for the project
    workspaceName?: string        // Optional workspace name override
  }
}
```

#### 5. Delete Project

Deletes an existing project.

```typescript
{
  name: "delete-project",
  parameters: {
    projectId: string  // ID of the project to delete
  }
}
```

### Traces

> **Important**: The Opik API requires either a project ID or project name for most trace endpoints. If neither is provided, the MCP server will attempt to use the first available project.

#### 1. List Traces

Lists all available traces with pagination and filtering support.

```typescript
{
  name: "list-traces",
  parameters: {
    page: number,                 // Page number for pagination
    size: number,                 // Number of items per page
    projectId?: string,           // Project ID to filter traces
    projectName?: string          // Project name to filter traces (alternative to projectId)
  }
}
```

#### 2. Get Trace by ID

Retrieves details of a specific trace.

```typescript
{
  name: "get-trace-by-id",
  parameters: {
    traceId: string  // ID of the trace to fetch
  }
}
```

#### 3. Get Trace Stats

Retrieves trace statistics.

```typescript
{
  name: "get-trace-stats",
  parameters: {
    projectId?: string,           // Project ID to filter traces
    projectName?: string,         // Project name to filter traces (alternative to projectId)
    startDate?: string,           // Optional start date in ISO format (YYYY-MM-DD)
    endDate?: string              // Optional end date in ISO format (YYYY-MM-DD)
  }
}
```

### Metrics

#### 1. Get Metrics

Retrieves metrics data with filtering support.

```typescript
{
  name: "get-metrics",
  parameters: {
    metricName?: string,       // Optional metric name to filter
    projectId?: string,        // Optional project ID to filter metrics
    startDate?: string,        // Optional start date in ISO format (YYYY-MM-DD)
    endDate?: string           // Optional end date in ISO format (YYYY-MM-DD)
  }
}
```

### Server Configuration

#### 1. Get Server Info

Retrieves information about the Opik server configuration.

```typescript
{
  name: "get-server-info",
  parameters: {}
}
```

## Response Format

All tools return responses in the following format:

```typescript
{
  content: [
    {
      type: "text",
      text: string, // Response message or formatted data
    },
  ];
}
```

## Development

### Testing

Run the test suite with:

```bash
npm test
```

The tests validate the API client functionality and the MCP server implementation.

## Security

- API keys are required for authentication
- All requests are made over HTTPS (for cloud) or HTTP (for self-hosted)
- Sensitive information is handled securely

## Contributing

Feel free to submit issues and enhancement requests!
