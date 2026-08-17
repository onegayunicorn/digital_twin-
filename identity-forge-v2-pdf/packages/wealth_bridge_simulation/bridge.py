from dataclasses import dataclass, field


@dataclass
class Bridge:
    start_point: str
    end_point: str
    capacity: int = 10
    connections: list[str] = field(default_factory=list)

    def add_connection(self, connection_id: str) -> bool:
        if len(self.connections) >= self.capacity or connection_id in self.connections:
            return False
        self.connections.append(connection_id)
        return True

    def get_metrics(self) -> dict:
        return {
            "start": self.start_point,
            "end": self.end_point,
            "active_connections": len(self.connections),
            "capacity": self.capacity,
            "utilization": len(self.connections) / self.capacity if self.capacity else 0.0,
            "simulation_only": True,
        }
