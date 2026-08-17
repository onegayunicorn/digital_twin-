from dataclasses import dataclass, field


@dataclass
class BellChain:
    num_bells: int = 8
    bells: list[bool] = field(init=False)

    def __post_init__(self) -> None:
        if self.num_bells < 1:
            raise ValueError("num_bells must be positive")
        self.bells = [False] * self.num_bells

    def ring_bell(self, index: int) -> dict:
        if not 0 <= index < self.num_bells:
            return {"ok": False, "error": "invalid_index", "simulation_only": True}
        self.bells[index] = True
        return {"ok": True, "bell": index, "status": "resonating", "simulation_only": True}

    def get_chain_state(self) -> dict:
        return {
            "total_bells": self.num_bells,
            "rung_count": sum(self.bells),
            "sequence": [i for i, rung in enumerate(self.bells) if rung],
            "next_bell": next((i for i, rung in enumerate(self.bells) if not rung), None),
            "simulation_only": True,
        }
