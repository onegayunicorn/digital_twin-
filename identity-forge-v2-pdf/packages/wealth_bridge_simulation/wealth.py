from dataclasses import dataclass, field


@dataclass
class WealthStrategyPlan:
    """Paper-simulation plan; never connects to markets or estimates returns."""

    strategies: list[str] = field(default_factory=lambda: [
        "hyperfusion_mining_concept",
        "star_seed_staking_concept",
        "quantum_arbitrage_concept",
        "liquidity_provision_concept",
    ])
    mode: str = "paper"

    def activate(self) -> dict:
        if self.mode != "paper":
            raise ValueError("Only paper mode is supported by this package")
        return {
            "status": "paper_simulation_ready",
            "active_strategies": list(self.strategies),
            "estimated_apy": None,
            "orders_enabled": False,
            "simulation_only": True,
        }
