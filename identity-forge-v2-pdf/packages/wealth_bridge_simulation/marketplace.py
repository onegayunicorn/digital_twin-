from dataclasses import dataclass, field


@dataclass
class PaperMarketplace:
    assets: list[dict] = field(default_factory=list)

    def register_asset(self, asset: dict) -> dict:
        record = {**asset, "listed": False, "minted": False, "simulation_only": True}
        self.assets.append(record)
        return record

    def search(self, query: str = "") -> list[dict]:
        needle = query.casefold()
        return [asset for asset in self.assets if needle in asset.get("name", "").casefold()]
