/**
 * Quantum Backend Abstraction Layer
 *
 * Provides a unified interface for quantum computation backends.
 * Applications don't care whether the experiment runs on:
 * - Local simulator
 * - HPC simulator
 * - IBM Quantum hardware
 * - AWS Braket
 * - Future QPU providers
 */

export interface BackendCapabilities {
  qubits: number;
  gates: string[];
  errorCorrection: boolean;
  maxShots: number;
}

export interface QuantumExperiment {
  id: string;
  circuit: string;
  shots: number;
  parameters: Record<string, number>;
}

export interface QuantumJob {
  id: string;
  backend: string;
  experiment: string;
  status: string;
  createdAt: string;
}

export interface QuantumJobStatus {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

export interface QuantumResult {
  id: string;
  jobId: string;
  counts: Record<string, number>;
  fidelity?: number;
  executionTime: number;
}

export interface QuantumBackend {
  name: string;
  capabilities(): Promise<BackendCapabilities>;
  submit(experiment: QuantumExperiment): Promise<QuantumJob>;
  status(jobId: string): Promise<QuantumJobStatus>;
  result(jobId: string): Promise<QuantumResult>;
}
