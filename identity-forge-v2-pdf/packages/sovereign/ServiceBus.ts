/**
 * Sovereign Service Bus
 *
 * Unified service interface for the entire application ecosystem.
 * Every service implements this interface, making providers interchangeable.
 * Adding a new provider doesn't require redesigning the application.
 */

export interface ServiceCapabilities {
  operations: string[];
  rateLimit: number;
  requiresAuth: boolean;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;
  services: Record<string, boolean>;
}

export interface ServiceRequest {
  id: string;
  service: string;
  operation: string;
  payload: any;
  actor: string;
  timestamp: string;
}

export interface ServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  service: string;
  operation: string;
  actor: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface SovereignService {
  id: string;
  name: string;
  version: string;

  health(): Promise<HealthStatus>;
  execute(request: ServiceRequest): Promise<ServiceResponse>;
  authenticate(): Promise<void>;
  capabilities(): Promise<ServiceCapabilities>;
  audit(event: AuditEvent): Promise<void>;
}

/**
 * Abstract base class for service implementations.
 */
export abstract class BaseSovereignService implements SovereignService {
  abstract id: string;
  abstract name: string;
  abstract version: string;

  abstract health(): Promise<HealthStatus>;
  abstract execute(request: ServiceRequest): Promise<ServiceResponse>;
  abstract authenticate(): Promise<void>;
  abstract capabilities(): Promise<ServiceCapabilities>;
  abstract audit(event: AuditEvent): Promise<void>;

  protected generateId(): string {
    return `${this.id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  protected timestamp(): string {
    return new Date().toISOString();
  }
}
