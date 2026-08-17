/**
 * Research Facility Connector
 *
 * Adapter interface for connecting to universities, laboratories,
 * observatories, HPC centers, quantum providers, medical research,
 * and materials science facilities.
 */

export interface ExperimentId {
  id: string;
  facility: string;
  timestamp: string;
}

export interface JobId {
  id: string;
  experimentId: string;
  facility: string;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

export interface Dataset {
  id: string;
  experimentId: string;
  metadata: Record<string, any>;
  data: any;
  size: number;
}

export interface ProvenanceRecord {
  jobId: string;
  experimentId: string;
  timestamp: string;
  steps: Array<{
    step: string;
    timestamp: string;
    actor: string;
  }>;
}

export interface Experiment {
  id: string;
  hypothesis: string;
  protocol: any;
  parameters: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ResearchFacility {
  registerExperiment(experiment: Experiment): Promise<ExperimentId>;
  submitExperiment(experiment: Experiment): Promise<JobId>;
  getStatus(jobId: JobId): Promise<JobStatus>;
  retrieveResults(jobId: JobId): Promise<Dataset>;
  provenance(jobId: JobId): Promise<ProvenanceRecord>;
}

/**
 * Abstract base class for research facility implementations.
 * Specific facilities (university lab, observatory, HPC center, etc.)
 * should extend this class and implement the methods.
 */
export abstract class BaseResearchFacility implements ResearchFacility {
  protected facilityName: string;
  protected baseUrl: string;
  protected apiKey: string;

  constructor(facilityName: string, baseUrl: string, apiKey: string) {
    this.facilityName = facilityName;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  abstract registerExperiment(experiment: Experiment): Promise<ExperimentId>;
  abstract submitExperiment(experiment: Experiment): Promise<JobId>;
  abstract getStatus(jobId: JobId): Promise<JobStatus>;
  abstract retrieveResults(jobId: JobId): Promise<Dataset>;
  abstract provenance(jobId: JobId): Promise<ProvenanceRecord>;

  getFacilityName(): string {
    return this.facilityName;
  }
}
