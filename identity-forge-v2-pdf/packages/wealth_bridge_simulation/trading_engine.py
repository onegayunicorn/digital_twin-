from dataclasses import dataclass, field

from .trading_config import TradingBotConfig


@dataclass
class PaperTradingEngine:
    config: TradingBotConfig
    is_running: bool = False
    signal_history: list[dict] = field(default_factory=list)

    def start(self) -> dict:
        self.is_running = True
        return {"status": "paper_engine_started", "orders_enabled": False, "simulation_only": True}

    def evaluate(self, signal: str = "HOLD", confidence: float = 0.0) -> dict:
        if not 0 <= confidence <= 1:
            raise ValueError("confidence must be between 0 and 1")
        result = {
            "action": signal if signal in {"BUY", "SELL", "HOLD"} else "HOLD",
            "confidence": confidence,
            "executed": False,
            "reason": "paper_review_only",
            "simulation_only": True,
        }
        self.signal_history.append(result)
        return result

    def stop(self) -> dict:
        self.is_running = False
        return {"status": "paper_engine_stopped", "simulation_only": True}
