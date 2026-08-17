from dataclasses import dataclass, field
import hashlib
import json


@dataclass
class QuantumBioAI:
    """Deterministic metadata transform for local demonstrations only."""

    ai_model_name: str
    assets: list[dict] = field(default_factory=list)

    def process_star_seed_to_nft(self, seed_data: dict) -> dict:
        canonical = json.dumps(seed_data, sort_keys=True, separators=(",", ":"))
        asset_id = hashlib.sha256(canonical.encode()).hexdigest()
        asset = {
            "id": asset_id,
            "name": f"ConceptAsset_{seed_data.get('name', 'StarSeed')}",
            "origin_seed": seed_data,
            "value_score": None,
            "minted": False,
            "simulation_only": True,
        }
        self.assets.append(asset)
        return asset

    def find_doorway_state(self, market_data: dict) -> dict:
        return {
            "status": "conceptual_review_only",
            "demand_signal": market_data.get("demand"),
            "liquidity_signal": market_data.get("liquidity"),
            "market_action_enabled": False,
            "simulation_only": True,
        }

    def get_nft_portfolio(self) -> list[dict]:
        return list(self.assets)
