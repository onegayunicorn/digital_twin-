import unittest

try:
    from .integration import run_full_integration
    from .hyperfusion import HyperfusionStaticSeed
    from .wealth import WealthStrategyPlan
except ImportError:
    from integration import run_full_integration
    from hyperfusion import HyperfusionStaticSeed
    from wealth import WealthStrategyPlan


class WealthBridgeSimulationTests(unittest.TestCase):
    def test_full_integration_is_local_and_non_actionable(self):
        result = run_full_integration()
        self.assertTrue(result["wealth"]["simulation_only"])
        self.assertFalse(result["wealth"]["orders_enabled"])
        self.assertTrue(result["ledger"]["is_valid"])
        self.assertFalse(result["asset"]["minted"])
        self.assertTrue(result["tele_os"]["simulation_only"])

    def test_static_seed_does_not_create_device_link(self):
        self.assertFalse(HyperfusionStaticSeed(90, 0.99).result()["device_link"])

    def test_only_paper_mode_is_supported(self):
        with self.assertRaises(ValueError):
            WealthStrategyPlan(mode="live").activate()


if __name__ == "__main__":
    unittest.main()
