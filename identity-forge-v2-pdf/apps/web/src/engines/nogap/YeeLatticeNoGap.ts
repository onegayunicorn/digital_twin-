/**
 * YEE LATTICE — No Gap Theory Integration
 * Fills spatial gaps with background pressure and density
 */

import { NoGapTheoryEngine, Vector3D } from './NoGapTheoryEngine';

export interface YeeCell {
  position: Vector3D;
  electric: Vector3D;
  magnetic: Vector3D;
  density: number;
  pressure: number;
  cfl: number;
}

export class YeeLatticeNoGap {
  private cells: YeeCell[] = [];
  private resolution: number;
  private nogapEngine: NoGapTheoryEngine;

  constructor(resolution: number = 32) {
    this.resolution = resolution;
    this.nogapEngine = new NoGapTheoryEngine();
    this.initializeLattice();
  }

  private initializeLattice(): void {
    const step = 2 / this.resolution;

    for (let i = 0; i < this.resolution; i++) {
      for (let j = 0; j < this.resolution; j++) {
        for (let k = 0; k < this.resolution; k++) {
          const x = -1 + i * step + step / 2;
          const y = -1 + j * step + step / 2;
          const z = -1 + k * step + step / 2;

          // No gap — every point has a cell
          const cell: YeeCell = {
            position: { x, y, z },
            electric: { x: 0, y: 0, z: 0 },
            magnetic: { x: 0, y: 0, z: 0 },
            density: 1.0,
            pressure: 1.0,
            cfl: 0.5,
          };

          this.cells.push(cell);
          this.nogapEngine.addLatticePoint({ x, y, z });
        }
      }
    }
  }

  updateField(): void {
    // Evolve the No Gap field
    this.nogapEngine.evolveField();

    // Map field to each cell
    for (const cell of this.cells) {
      const sample = this.nogapEngine.sampleAtPoint(cell.position);

      cell.electric = sample.electric.field;
      cell.magnetic = sample.magnetic.field;
      cell.density = sample.medium.density;
      cell.pressure = sample.medium.pressure;
      cell.cfl = sample.cfl.stability;
    }
  }

  getCells(): YeeCell[] {
    return this.cells;
  }

  getFieldAt(position: Vector3D): YeeCell | null {
    // Continuous sampling — no gaps
    const sample = this.nogapEngine.sampleAtPoint(position);

    return {
      position,
      electric: sample.electric.field,
      magnetic: sample.magnetic.field,
      density: sample.medium.density,
      pressure: sample.medium.pressure,
      cfl: sample.cfl.stability,
    };
  }

  isStable(): boolean {
    return this.nogapEngine.isStable();
  }

  getCFLFactor(): number {
    return this.nogapEngine.getCFLFactor();
  }

  getPhysicalMappings(): Record<string, string> {
    return this.nogapEngine.getPhysicalMappings();
  }

  getResolution(): number {
    return this.resolution;
  }

  getNoGapEngine(): NoGapTheoryEngine {
    return this.nogapEngine;
  }
}
