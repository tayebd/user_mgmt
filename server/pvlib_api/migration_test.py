# tests/migration_test.py
import unittest
from legacy.SPVSimAPI import SPVSim
from core.simulator import PVSimulator

class TestMigration(unittest.TestCase):
    def test_results_match(self):
        # Setup legacy
        legacy_sim = SPVSim()
        legacy_sim.configure_from_request(old_config)
        
        # Setup new
        new_sim = PVSimulator(new_module, new_inverter)
        
        # Compare results within 1%
        legacy_res = legacy_sim.execute_simulation()
        new_res = new_sim.simulate(weather)
        self.assertAlmostEqual(legacy_res['power'], new_res['dc'], delta=0.01)
