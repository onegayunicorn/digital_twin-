"""Local deterministic network and ledger simulations."""
from dataclasses import dataclass, field
import hashlib
import json

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

    def get_path_details(self) -> dict[str, object]:
        return {"start": self.start_point, "end": self.end_point, "active": len(self.connections), "capacity": self.capacity, "simulation_only": True}

@dataclass
class BellChain:
    num_bells: int = 8
    bells: list[bool] = field(init=False)

    def __post_init__(self) -> None:
        self.bells = [False] * self.num_bells

    def ring_bell(self, index: int) -> bool:
        if not 0 <= index < self.num_bells:
            return False
        self.bells[index] = True
        return True

    def get_chain_state(self) -> list[str]:
        return ["Rung" if value else "Silent" for value in self.bells]

@dataclass(frozen=True)
class Block:
    index: int
    data: dict[str, object]
    previous_hash: str
    nonce: int = 0

    @property
    def hash(self) -> str:
        payload = json.dumps({"index": self.index, "data": self.data, "previous": self.previous_hash, "nonce": self.nonce}, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

class Blockchain:
    """Local hash-chain demonstration; not a blockchain network or custody system."""
    def __init__(self) -> None:
        self.chain = [Block(0, {"info": "conceptual genesis"}, "0")]

    def add_block(self, data: dict[str, object]) -> Block:
        block = Block(len(self.chain), data, self.chain[-1].hash)
        self.chain.append(block)
        return block

    def is_valid(self) -> bool:
        return all(block.previous_hash == self.chain[i - 1].hash for i, block in enumerate(self.chain) if i > 0)
