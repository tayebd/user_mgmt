#!/usr/bin/env python3
"""
Test runner for the simplified PV simulator
"""

import pytest
import sys
import os
from datetime import datetime

def run_tests():
    """Run all tests and return results"""
    print("Running PV Simulator Tests")
    print("=" * 50)

    # Add current directory to Python path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    # Run pytest with coverage if available
    try:
        import pytest_cov
        pytest_args = [
            "test_simulator.py",
            "-v",
            "--tb=short",
            "--cov=simplified_simulator",
            "--cov-report=term-missing",
            "--cov-report=html:htmlcov"
        ]
    except ImportError:
        pytest_args = [
            "test_simulator.py",
            "-v",
            "--tb=short"
        ]

    # Run the tests
    result = pytest.main(pytest_args)

    if result == 0:
        print("\n✅ All tests passed!")
        return True
    else:
        print(f"\n❌ Tests failed with exit code: {result}")
        return False

def quick_test():
    """Run a quick subset of tests"""
    print("Running Quick Tests")
    print("=" * 30)

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    # Run only basic configuration tests
    pytest_args = [
        "test_simulator.py::TestConfigurations::test_site_config_creation",
        "test_simulator.py::TestSimplePVSimulator::test_simulator_initialization",
        "test_simulator.py::TestSimplePVSimulator::test_system_setup_success",
        "test_simulator.py::TestDefaultConfig::test_create_default_config",
        "-v",
        "--tb=short"
    ]

    result = pytest.main(pytest_args)
    return result == 0

def demo_simulation():
    """Run a demonstration simulation"""
    print("Running Demo Simulation")
    print("=" * 30)

    from simplified_simulator import SimplePVSimulator, create_default_config

    # Create simulator and default config
    simulator = SimplePVSimulator()
    site, panel, array, inverter = create_default_config()

    print(f"Site: {site.latitude}°N, {site.longitude}°W")
    print(f"System: {array.modules_per_string} x {array.strings_in_parallel} panels")
    print(f"Total capacity: {panel.max_power * array.modules_per_string * array.strings_in_parallel / 1000:.1f} kW")
    print()

    # Setup system
    if simulator.setup_system(site, panel, array, inverter):
        print("✅ System configured successfully")

        # Run a short simulation (just for testing)
        print("🏃 Running simulation...")
        results = simulator.simulate_year(2023)

        if results:
            print("✅ Simulation completed successfully!")
            print(f"📊 Annual Energy: {results.annual_energy:.2f} kWh")
            print(f"📊 Capacity Factor: {results.capacity_factor:.2%}")
            print(f"📊 Peak Power: {results.peak_power / 1000:.2f} kW")
            print(f"📊 Performance Ratio: {results.performance_ratio:.2%}")

            # Show monthly breakdown
            print("\n📅 Monthly Energy Production:")
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            for month_num, month_name in enumerate(months, 1):
                energy = results.monthly_energy.get(month_num, 0)
                print(f"  {month_name}: {energy:6.1f} kWh")
        else:
            print("❌ Simulation failed")
    else:
        print("❌ Failed to configure system")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "quick":
            success = quick_test()
        elif command == "demo":
            demo_simulation()
            success = True
        elif command == "full":
            success = run_tests()
        else:
            print("Usage: python run_tests.py [quick|demo|full]")
            print("  quick: Run basic tests")
            print("  demo:  Run demonstration simulation")
            print("  full:  Run all tests with coverage (default)")
            success = run_tests()
    else:
        success = run_tests()

    sys.exit(0 if success else 1)