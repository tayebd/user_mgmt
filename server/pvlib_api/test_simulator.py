"""
Comprehensive tests for the simplified PV simulator
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime
from simplified_simulator import (
    SimplePVSimulator,
    SiteConfig,
    PanelConfig,
    ArrayConfig,
    InverterConfig,
    create_default_config
)


class TestConfigurations:
    """Test configuration dataclasses"""

    def test_site_config_creation(self):
        site = SiteConfig(latitude=40.0, longitude=-74.0, altitude=100)
        assert site.latitude == 40.0
        assert site.longitude == -74.0
        assert site.altitude == 100
        assert site.timezone == "UTC"
        assert site.albedo == 0.25

    def test_panel_config_creation(self):
        panel = PanelConfig(
            max_power=400,
            open_circuit_voltage=48,
            short_circuit_current=10,
            voltage_at_pmax=40,
            current_at_pmax=9
        )
        assert panel.max_power == 400
        assert panel.temp_coeff_voc == -0.003  # default value

    def test_array_config_creation(self):
        array = ArrayConfig(
            modules_per_string=10,
            strings_in_parallel=3,
            tilt_angle=30,
            azimuth_angle=180
        )
        assert array.modules_per_string == 10
        assert array.strings_in_parallel == 3
        assert array.ground_coverage_ratio == 0.3  # default

    def test_inverter_config_creation(self):
        inverter = InverterConfig(
            nominal_output_power=10000,
            max_dc_voltage=600,
            max_input_current=20
        )
        assert inverter.nominal_output_power == 10000
        assert inverter.efficiency == 0.96  # default


class TestSimplePVSimulator:
    """Test the main simulator class"""

    def setup_method(self):
        """Setup for each test method"""
        self.simulator = SimplePVSimulator()
        self.site, self.panel, self.array, self.inverter = create_default_config()

    def test_simulator_initialization(self):
        """Test that simulator initializes correctly"""
        assert self.simulator.location is None
        assert self.simulator.pv_system is None

    def test_system_setup_success(self):
        """Test successful system setup"""
        result = self.simulator.setup_system(self.site, self.panel, self.array, self.inverter)
        assert result is True
        assert self.simulator.location is not None
        assert self.simulator.pv_system is not None

    def test_system_setup_with_different_timezone(self):
        """Test system setup with different timezone"""
        site = SiteConfig(
            latitude=33.45,
            longitude=-84.15,
            timezone="America/New_York"
        )
        result = self.simulator.setup_system(site, self.panel, self.array, self.inverter)
        assert result is True
        assert self.simulator.timezone == "America/New_York"

    def test_system_setup_invalid_config(self):
        """Test system setup with invalid configuration"""
        # Invalid panel config (all zeros)
        invalid_panel = PanelConfig(
            max_power=0,
            open_circuit_voltage=0,
            short_circuit_current=0,
            voltage_at_pmax=0,
            current_at_pmax=0
        )
        result = self.simulator.setup_system(self.site, invalid_panel, self.array, self.inverter)
        # Should still create system but simulation may fail

    def test_generate_weather_data(self):
        """Test weather data generation"""
        self.simulator.setup_system(self.site, self.panel, self.array, self.inverter)

        times = pd.date_range('2023-06-15', '2023-06-16', freq='h', tz='UTC')
        weather = self.simulator.generate_weather_data(times)

        assert len(weather) == len(times)
        assert 'ghi' in weather.columns
        assert 'temp_air' in weather.columns
        assert 'wind_speed' in weather.columns
        assert all(weather['ghi'] >= 0)
        assert all(weather['temp_air'] > -50)  # Reasonable temperature bounds
        assert all(weather['wind_speed'] >= 0)

    def test_simulate_year_success(self):
        """Test successful year simulation"""
        self.simulator.setup_system(self.site, self.panel, self.array, self.inverter)

        # Use a smaller year for faster testing
        results = self.simulator.simulate_year(2023)

        assert results is not None
        assert results.annual_energy > 0
        assert results.capacity_factor >= 0
        assert results.peak_power > 0
        assert results.performance_ratio >= 0
        assert len(results.hourly_power_output) == 8760  # 365 days * 24 hours
        assert len(results.daily_energy) <= 366
        assert len(results.monthly_energy) == 12

    def test_simulate_specific_month(self):
        """Test simulation produces reasonable monthly values"""
        self.simulator.setup_system(self.site, self.panel, self.array, self.inverter)

        results = self.simulator.simulate_year(2023)

        # Check monthly values are reasonable
        summer_months = [6, 7, 8]  # Northern hemisphere summer
        winter_months = [12, 1, 2]  # Northern hemisphere winter

        summer_avg = np.mean([results.monthly_energy[m] for m in summer_months])
        winter_avg = np.mean([results.monthly_energy[m] for m in winter_months])

        # Summer should produce more energy than winter for northern hemisphere
        assert summer_avg > winter_avg

    def test_simulate_day_success(self):
        """Test successful day simulation"""
        self.simulator.setup_system(self.site, self.panel, self.array, self.inverter)

        results = self.simulator.simulate_day("2023-06-15")

        assert results is not None
        assert 'times' in results
        assert 'power_output' in results
        assert 'irradiance' in results
        assert 'cell_temperature' in results
        assert 'ambient_temperature' in results
        assert len(results['power_output']) == 24

    def test_simulate_day_invalid_date(self):
        """Test day simulation with invalid date"""
        self.simulator.setup_system(self.site, self.panel, self.array, self.inverter)

        results = self.simulator.simulate_day("invalid-date")
        assert results is None

    def test_simulate_without_setup(self):
        """Test simulation without system setup"""
        # Don't setup the system
        results = self.simulator.simulate_year()
        assert results is None

    def test_simulate_day_without_setup(self):
        """Test day simulation without system setup"""
        results = self.simulator.simulate_day("2023-06-15")
        assert results is None

    def test_different_array_configurations(self):
        """Test simulation with different array configurations"""
        # Test different tilt angles
        flat_array = ArrayConfig(
            modules_per_string=10,
            strings_in_parallel=3,
            tilt_angle=0,  # Flat
            azimuth_angle=180
        )

        steep_array = ArrayConfig(
            modules_per_string=10,
            strings_in_parallel=3,
            tilt_angle=60,  # Steep
            azimuth_angle=180
        )

        self.simulator.setup_system(self.site, self.panel, flat_array, self.inverter)
        flat_results = self.simulator.simulate_year(2023)

        self.simulator.setup_system(self.site, self.panel, steep_array, self.inverter)
        steep_results = self.simulator.simulate_year(2023)

        assert flat_results is not None
        assert steep_results is not None
        # Results should be different for different configurations
        assert abs(flat_results.annual_energy - steep_results.annual_energy) > 0

    def test_different_system_sizes(self):
        """Test simulation with different system sizes"""
        small_array = ArrayConfig(
            modules_per_string=5,
            strings_in_parallel=2,
            tilt_angle=30,
            azimuth_angle=180
        )

        large_array = ArrayConfig(
            modules_per_string=20,
            strings_in_parallel=5,
            tilt_angle=30,
            azimuth_angle=180
        )

        self.simulator.setup_system(self.site, self.panel, small_array, self.inverter)
        small_results = self.simulator.simulate_year(2023)

        self.simulator.setup_system(self.site, self.panel, large_array, self.inverter)
        large_results = self.simulator.simulate_year(2023)

        assert small_results is not None
        assert large_results is not None
        # Larger system should produce more energy
        assert large_results.annual_energy > small_results.annual_energy
        assert large_results.peak_power > small_results.peak_power

    def test_southern_hemisphere_location(self):
        """Test simulation in southern hemisphere"""
        southern_site = SiteConfig(
            latitude=-33.45,  # Southern hemisphere
            longitude=151.23,  # Sydney, Australia
            timezone="Australia/Sydney"
        )

        self.simulator.setup_system(southern_site, self.panel, self.array, self.inverter)
        results = self.simulator.simulate_year(2023)

        assert results is not None
        assert results.annual_energy > 0

        # In southern hemisphere, months 12, 1, 2 should have higher production
        summer_months = [12, 1, 2]
        winter_months = [6, 7, 8]

        summer_avg = np.mean([results.monthly_energy[m] for m in summer_months if m in results.monthly_energy])
        winter_avg = np.mean([results.monthly_energy[m] for m in winter_months if m in results.monthly_energy])

        assert summer_avg > winter_avg


class TestDefaultConfig:
    """Test default configuration function"""

    def test_create_default_config(self):
        """Test default configuration creation"""
        site, panel, array, inverter = create_default_config()

        assert isinstance(site, SiteConfig)
        assert isinstance(panel, PanelConfig)
        assert isinstance(array, ArrayConfig)
        assert isinstance(inverter, InverterConfig)

        assert site.latitude == 33.45
        assert site.longitude == -84.15
        assert panel.max_power == 400
        assert array.modules_per_string == 10
        assert array.strings_in_parallel == 3
        assert inverter.nominal_output_power == 10000

    def test_default_config_simulation(self):
        """Test that default configuration can run simulation"""
        site, panel, array, inverter = create_default_config()
        simulator = SimplePVSimulator()

        assert simulator.setup_system(site, panel, array, inverter)
        results = simulator.simulate_year(2023)

        assert results is not None
        assert results.annual_energy > 0


class TestEdgeCases:
    """Test edge cases and error conditions"""

    def setup_method(self):
        self.simulator = SimplePVSimulator()

    def test_extremely_high_latitude(self):
        """Test simulation at extreme latitude (near poles)"""
        arctic_site = SiteConfig(
            latitude=89.0,  # Near North Pole
            longitude=0,
            timezone="UTC"
        )

        site, panel, array, inverter = create_default_config()
        site.latitude = 89.0

        result = self.simulator.setup_system(site, panel, array, inverter)
        assert result is True

        # Simulation might still work but with limited production
        results = self.simulator.simulate_year(2023)
        # Results may be very low due to extreme latitude
        if results:
            assert results.annual_energy >= 0

    def test_equator_location(self):
        """Test simulation at equator"""
        equator_site = SiteConfig(
            latitude=0.0,  # Equator
            longitude=0.0,
            timezone="UTC"
        )

        site, panel, array, inverter = create_default_config()
        site.latitude = 0.0
        site.longitude = 0.0

        result = self.simulator.setup_system(site, panel, array, inverter)
        assert result is True

        results = self.simulator.simulate_year(2023)
        assert results is not None
        assert results.annual_energy > 0

    def test_minimal_system(self):
        """Test simulation with minimal system size"""
        minimal_panel = PanelConfig(
            max_power=1,  # 1 watt panel
            open_circuit_voltage=1,
            short_circuit_current=1,
            voltage_at_pmax=0.5,
            current_at_pmax=2
        )

        minimal_array = ArrayConfig(
            modules_per_string=1,
            strings_in_parallel=1,
            tilt_angle=30,
            azimuth_angle=180
        )

        minimal_inverter = InverterConfig(
            nominal_output_power=1,
            max_dc_voltage=10,
            max_input_current=5
        )

        site, _, _, _ = create_default_config()

        result = self.simulator.setup_system(site, minimal_panel, minimal_array, minimal_inverter)
        assert result is True

        results = self.simulator.simulate_year(2023)
        assert results is not None
        if results.annual_energy > 0:
            assert results.annual_energy < 100  # Should be very small


if __name__ == "__main__":
    pytest.main([__file__, "-v"])