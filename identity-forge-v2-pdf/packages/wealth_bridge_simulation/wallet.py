from dataclasses import dataclass


@dataclass(frozen=True)
class PaperWallet:
    wallet_id: str
    mode: str = "paper"

    def __post_init__(self) -> None:
        if self.mode != "paper":
            raise ValueError("Only paper wallet mode is supported")

    def status(self) -> dict:
        return {
            "wallet_id": self.wallet_id,
            "mode": self.mode,
            "transfers_enabled": False,
            "simulation_only": True,
        }
