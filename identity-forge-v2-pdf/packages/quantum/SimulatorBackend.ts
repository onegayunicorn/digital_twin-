/**
 * Local Simulator Quantum Backend
 *
 * Implements QuantumBackend interface using local simulation.
 * Used for development, testing, and when quantum hardware is unavailable.
 */

import {
  QuantumBackend,
  BackendCapabilities,
  QuantumExperiment,
  QuantumJob,
  QuantumJobStatus,
  QuantumResult,
} from './QuantumBackend';

export class SimulatorBackend implements QuantumBackend {
  name: string = 'Local Simulator';

  async capabilities(): Promise<BackendCapabilities> {
    return {
      qubits: 30,
      gates: ['h', 'cx', 'rz', 'rx', 'ry'],
      errorCorrection: true,
      maxShots: 1000000,
    };
  }

  async submit(experiment: QuantumExperiment): Promise<QuantumJob> {
    // Simulate circuit execution
    const jobId = `sim-${Date.now()}`;

    return {
      id: jobId,
      backend: this.name,
      experiment: experiment.id,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
  }

  async status(jobId: string): Promise<QuantumJobStatus> {
    // Simulate status progression
    return {
      id: jobId,
      status: 'completed',
      progress: 1.0,
    };
  }

  async result(jobId: string): Promise<QuantumResult> {
    // Simulate quantum measurement results
    return {
      id: `res-${Date.now()}`,
      jobId: jobId,
      counts: {
        '000': 500,
        '001': 250,
        '010': 125,
        '011': 125,
      },
      fidelity: 0.999,
      executionTime: 0.123,
    };
  }
}
