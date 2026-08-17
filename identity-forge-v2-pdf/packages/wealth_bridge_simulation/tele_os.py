from dataclasses import dataclass, field


@dataclass
class TeleOs:
    network_name: str
    onboarded_vendors: dict[str, dict] = field(default_factory=dict)
    bridged_avenues: list[dict] = field(default_factory=list)

    def onboard_vendor(self, vendor_id: str, details: dict) -> bool:
        if vendor_id in self.onboarded_vendors:
            return False
        self.onboarded_vendors[vendor_id] = {"id": vendor_id, "details": details}
        return True

    def bridge_avenue(self, name: str, description: str) -> None:
        self.bridged_avenues.append({"name": name, "description": description})

    def status(self) -> dict:
        return {
            "network": self.network_name,
            "total_vendors": len(self.onboarded_vendors),
            "avenues": list(self.bridged_avenues),
            "external_connections_enabled": False,
            "simulation_only": True,
        }
