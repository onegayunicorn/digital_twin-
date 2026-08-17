from dataclasses import dataclass, field
from enum import Enum


class StrategyType(str, Enum):
    TREND_FOLLOWING = "trend_following"
    ARBITRAGE = "arbitrage"
    GRID_TRADING = "grid_trading"
    MEAN_REVERSION = "mean_reversion"
    MOMENTUM = "momentum"
    MARKET_MAKING = "market_making"


class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    AGGRESSIVE = "aggressive"


@dataclass(frozen=True)
class TradingBotConfig:
    bot_id: str
    name: str
    enabled: bool = False
    mode: str = "paper"
    strategy: StrategyType = StrategyType.TREND_FOLLOWING
    trading_pairs: tuple[str, ...] = ("DEMO/USDT",)
    risk_level: RiskLevel = RiskLevel.MODERATE
    max_position_size_usd: float = 0.0
    max_daily_loss_usd: float = 0.0
    stop_loss_pct: float = 0.0
    take_profit_pct: float = 0.0
    min_order_interval_sec: int = 5

    def __post_init__(self) -> None:
        if self.mode != "paper":
            raise ValueError("Only paper mode is supported")
        if self.max_position_size_usd or self.max_daily_loss_usd:
            raise ValueError("Financial limits are disabled in the simulation package")
