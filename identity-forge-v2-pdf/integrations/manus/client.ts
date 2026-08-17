/**
 * Manus API Client — Integration for AI agent task management
 *
 * Manus provides an API for programmatically creating and managing
 * AI-agent tasks, projects, files, webhooks, skills, and agents.
 */

export interface ManusClientConfig {
  apiKey: string;
  baseUrl: string;
}

export interface ManusTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  result?: any;
}

export interface ManusProject {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  status: string;
}

export interface CreateTaskParams {
  name: string;
  description: string;
  instructions: string;
  projectId?: string;
  agentId?: string;
}

export class ManusClient {
  private config: ManusClientConfig;

  constructor(config: ManusClientConfig) {
    this.config = config;
  }

  /**
   * Create a new AI agent task via Manus v2 API.
   */
  async createTask(params: CreateTaskParams): Promise<ManusTask> {
    const response = await fetch(`${this.config.baseUrl}/v2/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get task status and results.
   */
  async getTask(taskId: string): Promise<ManusTask> {
    const response = await fetch(`${this.config.baseUrl}/v2/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all tasks with optional filtering.
   */
  async listTasks(params?: {
    projectId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: ManusTask[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const response = await fetch(
      `${this.config.baseUrl}/v2/tasks?${query.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Wait for a task to complete or fail.
   */
  async waitForCompletion(
    taskId: string,
    pollIntervalMs: number = 1000,
    timeoutMs: number = 300000,
  ): Promise<ManusTask> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const task = await this.getTask(taskId);

      if (task.status === 'completed' || task.status === 'failed') {
        return task;
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Task ${taskId} timed out after ${timeoutMs}ms`);
  }

  /**
   * Create a new project.
   */
  async createProject(params: {
    name: string;
    description: string;
  }): Promise<ManusProject> {
    const response = await fetch(`${this.config.baseUrl}/v2/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get project details.
   */
  async getProject(projectId: string): Promise<ManusProject> {
    const response = await fetch(
      `${this.config.baseUrl}/v2/projects/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload a file to a project.
   */
  async uploadFile(params: {
    projectId: string;
    filename: string;
    content: string | Blob;
    contentType?: string;
  }): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', params.content, params.filename);
    formData.append('projectId', params.projectId);

    const response = await fetch(`${this.config.baseUrl}/v2/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Register a webhook for task events.
   */
  async registerWebhook(params: {
    url: string;
    events: string[];
    projectId?: string;
  }): Promise<{ id: string; secret: string }> {
    const response = await fetch(`${this.config.baseUrl}/v2/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// ─── Factory Functions ──────────────────────────────────────────

export function createManusClient(
  apiKey: string,
  baseUrl: string = 'https://api.manus.ai',
): ManusClient {
  return new ManusClient({ apiKey, baseUrl });
}

export function createManusClientFromEnv(): ManusClient | null {
  const apiKey = process.env.MANUS_API_KEY;
  const baseUrl = process.env.MANUS_BASE_URL || 'https://api.manus.ai';

  if (!apiKey) {
    console.warn('MANUS_API_KEY not set in environment');
    return null;
  }

  return new ManusClient({ apiKey, baseUrl });
}
