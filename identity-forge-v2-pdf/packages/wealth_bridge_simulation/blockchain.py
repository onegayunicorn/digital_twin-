from __future__ import annotations

from dataclasses import dataclass, field
import hashlib
import json
import time
from typing import Any


@dataclass
class Block:
    index: int
    data: dict[str, Any]
    previous_hash: str
    timestamp: float = field(default_factory=time.time)
    nonce: int = 0

    @property
    def hash(self) -> str:
        payload = json.dumps(
            {
                "index": self.index,
                "data": self.data,
                "previous_hash": self.previous_hash,
                "timestamp": self.timestamp,
                "nonce": self.nonce,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(payload.encode()).hexdigest()


class Blockchain:
    """Local append-only hash-chain demonstration, not a real blockchain."""

    def __init__(self) -> None:
        self.chain = [Block(0, {"message": "simulation genesis"}, "0")]

    def add_block(self, data: dict[str, Any]) -> Block:
        block = Block(len(self.chain), data, self.chain[-1].hash)
        self.chain.append(block)
        return block

    def is_chain_valid(self) -> bool:
        return all(
            current.previous_hash == previous.hash
            for previous, current in zip(self.chain, self.chain[1:])
        )

    def info(self) -> dict[str, Any]:
        return {
            "height": len(self.chain),
            "is_valid": self.is_chain_valid(),
            "latest_hash": self.chain[-1].hash,
            "simulation_only": True,
        }
