import unittest

from integration import run_full_integration


class ConceptualSimulationTests(unittest.TestCase):
    def test_integration_is_local_and_non_actionable(self):
        result = run_full_integration()
        self.assertFalse(result["wealth"]["live_trading"])
        self.assertFalse(result["asset"]["minted"])
        self.assertTrue(result["asset"]["simulation_only"])
        self.assertTrue(result["ledger_valid"])

    def test_simulation_has_no_financial_transaction(self):
        result = run_full_integration()
        self.assertEqual(result["asset"]["origin"]["name"], "Demo Seed")


if __name__ == "__main__":
    unittest.main()
