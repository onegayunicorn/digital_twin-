from dataclasses import dataclass


@dataclass(frozen=True)
class CouncilOfGreatMinds:
    principles: tuple[str, ...]

    def evaluate_opportunity(self, opportunity: dict) -> dict:
        aligned = [p for p in self.principles if opportunity.get(p, False)]
        return {
            "name": opportunity.get("name", "unnamed"),
            "aligned_principles": aligned,
            "approved_for_review": bool(aligned),
            "simulation_only": True,
        }

    def provide_guidance(self, challenge: str) -> str:
        principle = self.principles[0] if self.principles else "evidence"
        return f"Review {challenge} through {principle} principles."
