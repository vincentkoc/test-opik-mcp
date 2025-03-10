import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import environment variables loader
import './utils/env.js';

// Import configuration
import config from './config.js';

// Types
import {
  ProjectResponse,
  SingleProjectResponse,
  PromptResponse,
  SinglePromptResponse,
  TraceResponse,
  SingleTraceResponse,
  TraceStatsResponse,
  MetricsResponse
} from './types.js';

// Helper function to make requests to API
const makeApiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> => {
  // Prepare headers based on configuration
  // According to Opik API documentation:
  // - authorization header should NOT include "Bearer" prefix
  // - Comet-Workspace header should be included for cloud installations
  const API_HEADERS: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    authorization: config.apiKey
  };

  // Add workspace header for cloud version (and on-premise installations of Comet platform)
  if (config.workspaceName) {
    API_HEADERS["Comet-Workspace"] = config.workspaceName;
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...API_HEADERS,
        ...options.headers,
      },
    });

    if (!response.ok) {
      return {
        data: null,
        error: `HTTP error! status: ${response.status} ${JSON.stringify(
          response.body
        )}`,
      };
    }

    const data = (await response.json()) as T;
    return {
      data,
      error: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error making API request:", error);
    return {
      data: null,
      error: errorMessage,
    };
  }
};

// Create and configure server
const server = new McpServer({
  name: "opik-manager",
  version: "1.0.0",
});

// ----------- PROMPTS TOOLS -----------

server.tool(
  "list-prompts",
  "Get a list of Opik prompts",
  {
    page: z.number().describe("Page number for pagination"),
    size: z.number().describe("Number of items per page"),
  },
  async (args) => {
    const response = await makeApiRequest<PromptResponse>(
      `/v1/private/prompts?page=${args.page}&size=${args.size}`
    );

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch prompts" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data.total} prompts (showing page ${
            response.data.page
          } of ${Math.ceil(response.data.total / response.data.size)})`,
        },
        {
          type: "text",
          text: JSON.stringify(response.data.content, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "create-prompt",
  "Create a new prompt",
  {
    name: z.string().describe("Name of the prompt"),
  },
  async (args) => {
    const { name } = args;
    const response = await makeApiRequest<void>(`/v1/private/prompts`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    return {
      content: [
        {
          type: "text",
          text: response.error || "Successfully created prompt",
        },
      ],
    };
  }
);

server.tool(
  "create-prompt-version",
  "Create a new version of a prompt",
  {
    name: z.string().describe("Name of the original prompt"),
    template: z.string().describe("Template content for the prompt version"),
    commit_message: z
      .string()
      .describe("Commit message for the prompt version"),
  },
  async (args) => {
    const { name, template, commit_message } = args;
    const response = await makeApiRequest<any>(`/v1/private/prompts/versions`, {
      method: "POST",
      body: JSON.stringify({
        name,
        version: { template, change_description: commit_message },
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: response.data
            ? "Successfully created prompt version"
            : `${response.error} ${JSON.stringify(args)}` ||
              "Failed to create prompt version",
        },
      ],
    };
  }
);

server.tool(
  "get-prompt-by-id",
  "Get a single prompt by ID",
  {
    promptId: z.string().describe("ID of the prompt to fetch"),
  },
  async (args) => {
    const { promptId } = args;
    const response = await makeApiRequest<SinglePromptResponse>(
      `/v1/private/prompts/${promptId}`
    );

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch prompt" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "update-prompt",
  "Update a prompt",
  {
    promptId: z.string().describe("ID of the prompt to update"),
    name: z.string().describe("New name for the prompt"),
  },
  async (args) => {
    const { promptId, name } = args;
    const response = await makeApiRequest<void>(
      `/v1/private/prompts/${promptId}`,
      {
        method: "PUT",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      content: [
        {
          type: "text",
          text: !response.error
            ? "Successfully updated prompt"
            : response.error || "Failed to update prompt",
        },
      ],
    };
  }
);

server.tool(
  "delete-prompt",
  "Delete a prompt",
  {
    promptId: z.string().describe("ID of the prompt to delete"),
  },
  async (args) => {
    const { promptId } = args;
    const response = await makeApiRequest<void>(
      `/v1/private/prompts/${promptId}`,
      {
        method: "DELETE",
      }
    );

    return {
      content: [
        {
          type: "text",
          text: !response.error
            ? "Successfully deleted prompt"
            : response.error || "Failed to delete prompt",
        },
      ],
    };
  }
);

// ----------- PROJECTS/WORKSPACES TOOLS -----------

server.tool(
  "list-projects",
  "Get a list of projects/workspaces",
  {
    page: z.number().describe("Page number for pagination"),
    size: z.number().describe("Number of items per page"),
  },
  async (args) => {
    const response = await makeApiRequest<ProjectResponse>(
      `/v1/private/projects?page=${args.page}&size=${args.size}`
    );

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch projects" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data.total} projects (showing page ${
            response.data.page
          } of ${Math.ceil(response.data.total / response.data.size)})`,
        },
        {
          type: "text",
          text: JSON.stringify(response.data.content, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get-project-by-id",
  "Get a single project by ID",
  {
    projectId: z.string().describe("ID of the project to fetch"),
  },
  async (args) => {
    const { projectId } = args;
    const response = await makeApiRequest<SingleProjectResponse>(
      `/v1/private/projects/${projectId}`
    );

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch project" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "create-project",
  "Create a new project/workspace",
  {
    name: z.string().describe("Name of the project"),
    description: z.string().optional().describe("Description of the project"),
  },
  async (args) => {
    const { name, description } = args;
    const response = await makeApiRequest<void>(`/v1/private/projects`, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });

    return {
      content: [
        {
          type: "text",
          text: response.error || "Successfully created project",
        },
      ],
    };
  }
);

server.tool(
  "update-project",
  "Update a project",
  {
    projectId: z.string().describe("ID of the project to update"),
    name: z.string().optional().describe("New name for the project"),
    description: z.string().optional().describe("New description for the project"),
  },
  async (args) => {
    const { projectId, name, description } = args;
    const payload: Record<string, string> = {};

    if (name) payload.name = name;
    if (description) payload.description = description;

    const response = await makeApiRequest<void>(
      `/v1/private/projects/${projectId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    return {
      content: [
        {
          type: "text",
          text: !response.error
            ? "Successfully updated project"
            : response.error || "Failed to update project",
        },
      ],
    };
  }
);

server.tool(
  "delete-project",
  "Delete a project",
  {
    projectId: z.string().describe("ID of the project to delete"),
  },
  async (args) => {
    const { projectId } = args;
    const response = await makeApiRequest<void>(
      `/v1/private/projects/${projectId}`,
      {
        method: "DELETE",
      }
    );

    return {
      content: [
        {
          type: "text",
          text: !response.error
            ? "Successfully deleted project"
            : response.error || "Failed to delete project",
        },
      ],
    };
  }
);

// ----------- TRACES TOOLS -----------

server.tool(
  "list-traces",
  "Get a list of traces",
  {
    page: z.number().describe("Page number for pagination"),
    size: z.number().describe("Number of items per page"),
    projectId: z.string().optional().describe("Optional project ID to filter traces"),
  },
  async (args) => {
    const { page, size, projectId } = args;
    let url = `/v1/private/traces?page=${page}&size=${size}`;

    if (projectId) {
      url += `&project_id=${projectId}`;
    }

    const response = await makeApiRequest<TraceResponse>(url);

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch traces" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${response.data.total} traces (showing page ${
            response.data.page
          } of ${Math.ceil(response.data.total / response.data.size)})`,
        },
        {
          type: "text",
          text: JSON.stringify(response.data.content, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get-trace-by-id",
  "Get a single trace by ID",
  {
    traceId: z.string().describe("ID of the trace to fetch"),
  },
  async (args) => {
    const { traceId } = args;
    const response = await makeApiRequest<SingleTraceResponse>(
      `/v1/private/traces/${traceId}`
    );

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch trace" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get-trace-stats",
  "Get statistics for traces",
  {
    projectId: z.string().optional().describe("Optional project ID to filter traces"),
    startDate: z.string().optional().describe("Start date in ISO format (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date in ISO format (YYYY-MM-DD)"),
  },
  async (args) => {
    const { projectId, startDate, endDate } = args;
    let url = `/v1/private/traces/stats`;

    const queryParams = [];
    if (projectId) queryParams.push(`project_id=${projectId}`);
    if (startDate) queryParams.push(`start_date=${startDate}`);
    if (endDate) queryParams.push(`end_date=${endDate}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await makeApiRequest<TraceStatsResponse>(url);

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch trace statistics" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }
);

// ----------- METRICS TOOLS -----------

server.tool(
  "get-metrics",
  "Get metrics data",
  {
    metricName: z.string().optional().describe("Optional metric name to filter"),
    projectId: z.string().optional().describe("Optional project ID to filter metrics"),
    startDate: z.string().optional().describe("Start date in ISO format (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date in ISO format (YYYY-MM-DD)"),
  },
  async (args) => {
    const { metricName, projectId, startDate, endDate } = args;
    let url = `/v1/private/metrics`;

    const queryParams = [];
    if (metricName) queryParams.push(`metric_name=${metricName}`);
    if (projectId) queryParams.push(`project_id=${projectId}`);
    if (startDate) queryParams.push(`start_date=${startDate}`);
    if (endDate) queryParams.push(`end_date=${endDate}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await makeApiRequest<MetricsResponse>(url);

    if (!response.data) {
      return {
        content: [
          { type: "text", text: response.error || "Failed to fetch metrics" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }
);

// ----------- SERVER CONFIGURATION TOOLS -----------

server.tool(
  "get-server-info",
  "Get information about the Opik server configuration",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            apiBaseUrl: config.apiBaseUrl,
            isSelfHosted: config.isSelfHosted,
            hasWorkspace: !!config.workspaceName,
            serverVersion: "v1"
          }, null, 2),
        },
      ],
    };
  }
);

// Server startup
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Opik MCP Server running on stdio");

  // Log server configuration for debugging purposes
  console.error(`API Base URL: ${config.apiBaseUrl}`);
  console.error(`Self-hosted: ${config.isSelfHosted ? "Yes" : "No"}`);
  console.error(`Workspace: ${config.workspaceName || "None"}`);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
