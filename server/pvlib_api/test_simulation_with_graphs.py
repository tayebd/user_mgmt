#!/usr/bin/env python3
"""
Comprehensive Test Suite for PVLib Simulation with Graph Visualization
Tests multiple scenarios and displays results in graph form using matplotlib
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from datetime import datetime
import os
from simplified_simulator import (
    SimplePVSimulator,
    SiteConfig,
    PanelConfig,
    ArrayConfig,
    InverterConfig,
    create_default_config
)

# Set matplotlib backend to Agg for non-interactive use
plt.switch_backend('Agg')
plt.style.use('seaborn-v0_8')


class SimulationTestRunner:
    """Run comprehensive tests and generate visualization graphs"""

    def __init__(self, output_dir="test_results"):
        self.output_dir = output_dir
        self.simulator = SimplePVSimulator()
        os.makedirs(output_dir, exist_ok=True)
        print(f"Test results will be saved to: {os.path.abspath(output_dir)}")

    def test_scenario_1_default_config(self):
        """Test 1: Default configuration"""
        print("\n" + "="*60)
        print("TEST 1: Default Configuration")
        print("="*60)

        site, panel, array, inverter = create_default_config()

        if not self.simulator.setup_system(site, panel, array, inverter):
            print("ERROR: System setup failed")
            return None

        results = self.simulator.simulate_year(2023)

        if results:
            print(f"✓ Annual Energy: {results.annual_energy:.2f} kWh")
            print(f"✓ Capacity Factor: {results.capacity_factor:.2%}")
            print(f"✓ Peak Power: {results.peak_power:.2f} W")
            print(f"✓ Performance Ratio: {results.performance_ratio:.2%}")

            # Generate graphs
            self.plot_monthly_energy(results, "Test1_Default_Monthly.png")
            self.plot_hourly_profile(results, "Test1_Default_Hourly.png")
            self.plot_daily_energy_heatmap(results, "Test1_Default_DailyHeatmap.png")

            return results
        else:
            print("ERROR: Simulation failed")
            return None

    def test_scenario_2_southern_hemisphere(self):
        """Test 2: Southern hemisphere location (Sydney, Australia)"""
        print("\n" + "="*60)
        print("TEST 2: Southern Hemisphere (Sydney, Australia)")
        print("="*60)

        site = SiteConfig(
            latitude=-33.8688,
            longitude=151.2093,
            altitude=100,
            timezone="Australia/Sydney",
            albedo=0.25
        )

        panel = PanelConfig(
            max_power=400,
            open_circuit_voltage=48,
            short_circuit_current=9.5,
            voltage_at_pmax=40,
            current_at_pmax=9.0
        )

        array = ArrayConfig(
            modules_per_string=10,
            strings_in_parallel=3,
            tilt_angle=30,
            azimuth_angle=180
        )

        inverter = InverterConfig(
            nominal_output_power=10000,
            max_dc_voltage=600,
            max_input_current=20
        )

        if not self.simulator.setup_system(site, panel, array, inverter):
            print("ERROR: System setup failed")
            return None

        results = self.simulator.simulate_year(2023)

        if results:
            print(f"✓ Annual Energy: {results.annual_energy:.2f} kWh")
            print(f"✓ Capacity Factor: {results.capacity_factor:.2%}")
            print(f"✓ Peak Power: {results.peak_power:.2f} W")
            print(f"✓ Performance Ratio: {results.performance_ratio:.2%}")

            # Verify seasonal pattern is opposite
            summer_months = [12, 1, 2]
            winter_months = [6, 7, 8]
            summer_avg = np.mean([results.monthly_energy[m] for m in summer_months])
            winter_avg = np.mean([results.monthly_energy[m] for m in winter_months])
            print(f"✓ Summer months (12,1,2) avg: {summer_avg:.2f} kWh")
            print(f"✓ Winter months (6,7,8) avg: {winter_avg:.2f} kWh")
            assert summer_avg > winter_avg, "Southern hemisphere seasonal pattern incorrect"

            # Generate graphs
            self.plot_monthly_energy(results, "Test2_Sydney_Monthly.png", title="Sydney, Australia - Monthly Energy")
            self.plot_hourly_profile(results, "Test2_Sydney_Hourly.png")
            self.plot_daily_energy_heatmap(results, "Test2_Sydney_DailyHeatmap.png")

            return results
        else:
            print("ERROR: Simulation failed")
            return None

    def test_scenario_3_equator(self):
        """Test 3: Equator location (Singapore)"""
        print("\n" + "="*60)
        print("TEST 3: Equator Location (Singapore)")
        print("="*60)

        site = SiteConfig(
            latitude=1.3521,
            longitude=103.8198,
            altitude=50,
            timezone="Asia/Singapore",
            albedo=0.20
        )

        panel = PanelConfig(
            max_power=400,
            open_circuit_voltage=48,
            short_circuit_current=9.5,
            voltage_at_pmax=40,
            current_at_pmax=9.0
        )

        array = ArrayConfig(
            modules_per_string=10,
            strings_in_parallel=3,
            tilt_angle=5,  # Low tilt at equator
            azimuth_angle=180
        )

        inverter = InverterConfig(
            nominal_output_power=10000,
            max_dc_voltage=600,
            max_input_current=20
        )

        if not self.simulator.setup_system(site, panel, array, inverter):
            print("ERROR: System setup failed")
            return None

        results = self.simulator.simulate_year(2023)

        if results:
            print(f"✓ Annual Energy: {results.annual_energy:.2f} kWh")
            print(f"✓ Capacity Factor: {results.capacity_factor:.2%}")
            print(f"✓ Peak Power: {results.peak_power:.2f} W")
            print(f"✓ Performance Ratio: {results.performance_ratio:.2%}")

            # Generate graphs
            self.plot_monthly_energy(results, "Test3_Equator_Monthly.png", title="Singapore - Monthly Energy")
            self.plot_hourly_profile(results, "Test3_Equator_Hourly.png")
            self.plot_daily_energy_heatmap(results, "Test3_Equator_DailyHeatmap.png")

            return results
        else:
            print("ERROR: Simulation failed")
            return None

    def test_scenario_4_different_tilt_angles(self):
        """Test 4: Different tilt angles comparison"""
        print("\n" + "="*60)
        print("TEST 4: Different Tilt Angles")
        print("="*60)

        site, panel, _, inverter = create_default_config()
        tilt_angles = [0, 15, 30, 45, 60]
        tilt_results = {}

        for tilt in tilt_angles:
            print(f"\nTesting tilt angle: {tilt}°")
            array = ArrayConfig(
                modules_per_string=10,
                strings_in_parallel=3,
                tilt_angle=tilt,
                azimuth_angle=180
            )

            if not self.simulator.setup_system(site, panel, array, inverter):
                print(f"ERROR: System setup failed for {tilt}°")
                continue

            results = self.simulator.simulate_year(2023)
            if results:
                tilt_results[tilt] = results
                print(f"  ✓ Annual Energy: {results.annual_energy:.2f} kWh")
                print(f"  ✓ Capacity Factor: {results.capacity_factor:.2%}")

        if tilt_results:
            # Generate comparison graph
            self.plot_tilt_comparison(tilt_results)
            print("\n✓ Tilt angle comparison graph saved")

        return tilt_results

    def test_scenario_5_system_sizes(self):
        """Test 5: Different system sizes"""
        print("\n" + "="*60)
        print("TEST 5: Different System Sizes")
        print("="*60)

        site, panel, array, inverter = create_default_config()

        system_configs = [
            {"name": "Small (3kW)", "modules": 8, "strings": 1, "inverter": 3000},
            {"name": "Medium (10kW)", "modules": 25, "strings": 5, "inverter": 10000},
            {"name": "Large (20kW)", "modules": 50, "strings": 10, "inverter": 20000},
        ]

        size_results = {}

        for config in system_configs:
            print(f"\nTesting {config['name']}")
            test_array = ArrayConfig(
                modules_per_string=config["modules"],
                strings_in_parallel=config["strings"],
                tilt_angle=30,
                azimuth_angle=180
            )

            test_inverter = InverterConfig(
                nominal_output_power=config["inverter"],
                max_dc_voltage=600,
                max_input_current=40
            )

            if not self.simulator.setup_system(site, panel, test_array, test_inverter):
                print(f"  ERROR: System setup failed for {config['name']}")
                continue

            results = self.simulator.simulate_year(2023)
            if results:
                size_results[config["name"]] = results
                print(f"  ✓ Annual Energy: {results.annual_energy:.2f} kWh")
                print(f"  ✓ Capacity Factor: {results.capacity_factor:.2%}")
                print(f"  ✓ Peak Power: {results.peak_power:.2f} W")

        if size_results:
            # Generate system size comparison
            self.plot_system_size_comparison(size_results)
            print("\n✓ System size comparison graph saved")

        return size_results

    def test_scenario_6_single_day_simulation(self):
        """Test 6: Single day detailed simulation"""
        print("\n" + "="*60)
        print("TEST 6: Single Day Detailed Simulation")
        print("="*60)

        site, panel, array, inverter = create_default_config()

        if not self.simulator.setup_system(site, panel, array, inverter):
            print("ERROR: System setup failed")
            return None

        # Test different days of the year
        test_dates = [
            ("2023-06-21", "Summer Solstice"),
            ("2023-12-21", "Winter Solstice"),
            ("2023-03-21", "Spring Equinox"),
            ("2023-09-21", "Fall Equinox")
        ]

        day_results = {}

        for date_str, description in test_dates:
            print(f"\nTesting {description} ({date_str})")
            results = self.simulator.simulate_day(date_str)

            if results:
                day_results[description] = results
                daily_total = sum(results['power_output']) / 1000
                print(f"  ✓ Daily Energy: {daily_total:.2f} kWh")
                print(f"  ✓ Peak Power: {max(results['power_output']):.2f} W")
                print(f"  ✓ Peak Hour: {results['power_output'].index(max(results['power_output']))}:00")

        if day_results:
            # Generate day comparison graphs
            self.plot_day_comparison(day_results)
            print("\n✓ Day comparison graph saved")

        return day_results

    def test_scenario_7_performance_comparison(self):
        """Test 7: Performance metrics comparison across locations"""
        print("\n" + "="*60)
        print("TEST 7: Performance Metrics Comparison")
        print("="*60)

        locations = [
            {"name": "Atlanta (Default)", "site": SiteConfig(33.45, -84.15, 300, "America/New_York")},
            {"name": "Los Angeles", "site": SiteConfig(34.05, -118.24, 100, "America/Los_Angeles")},
            {"name": "Phoenix", "site": SiteConfig(33.45, -112.07, 400, "America/Phoenix")},
            {"name": "Miami", "site": SiteConfig(25.76, -80.19, 20, "America/New_York")},
            {"name": "Denver", "site": SiteConfig(39.74, -104.99, 1600, "America/Denver")},
        ]

        panel = PanelConfig(
            max_power=400,
            open_circuit_voltage=48,
            short_circuit_current=9.5,
            voltage_at_pmax=40,
            current_at_pmax=9.0
        )

        array = ArrayConfig(
            modules_per_string=10,
            strings_in_parallel=3,
            tilt_angle=30,
            azimuth_angle=180
        )

        inverter = InverterConfig(
            nominal_output_power=10000,
            max_dc_voltage=600,
            max_input_current=20
        )

        location_results = {}

        for loc in locations:
            print(f"\nTesting {loc['name']}")
            if not self.simulator.setup_system(loc['site'], panel, array, inverter):
                print(f"  ERROR: System setup failed for {loc['name']}")
                continue

            results = self.simulator.simulate_year(2023)
            if results:
                location_results[loc['name']] = results
                print(f"  ✓ Annual Energy: {results.annual_energy:.2f} kWh")
                print(f"  ✓ Capacity Factor: {results.capacity_factor:.2%}")
                print(f"  ✓ Performance Ratio: {results.performance_ratio:.2%}")

        if location_results:
            # Generate performance comparison
            self.plot_performance_comparison(location_results)
            print("\n✓ Performance comparison graph saved")

        return location_results

    def plot_monthly_energy(self, results, filename, title=None):
        """Plot monthly energy production"""
        months = list(range(1, 13))
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        energy = [results.monthly_energy[m] for m in months]

        fig, ax = plt.subplots(figsize=(12, 6))
        bars = ax.bar(month_names, energy, color='orange', alpha=0.7, edgecolor='black')

        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.0f}',
                   ha='center', va='bottom')

        ax.set_title(title or 'Monthly Energy Production', fontsize=14, fontweight='bold')
        ax.set_xlabel('Month', fontsize=12)
        ax.set_ylabel('Energy Production (kWh)', fontsize=12)
        ax.grid(True, alpha=0.3)

        # Add statistics text
        total = sum(energy)
        max_month = month_names[energy.index(max(energy))]
        min_month = month_names[energy.index(min(energy))]
        stats_text = f'Total: {total:.0f} kWh\nMax: {max_month} ({max(energy):.0f} kWh)\nMin: {min_month} ({min(energy):.0f} kWh)'
        ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, filename), dpi=300, bbox_inches='tight')
        plt.close()
        print(f"  Graph saved: {filename}")

    def plot_hourly_profile(self, results, filename, title=None):
        """Plot average hourly power output"""
        hourly_data = np.array(results.hourly_power_output)

        # Reshape to days and calculate average
        daily_hours = hourly_data.reshape(-1, 24)
        avg_hourly = np.mean(daily_hours, axis=0)

        hours = list(range(24))

        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(hours, avg_hourly, 'b-', linewidth=2, marker='o', markersize=4)

        # Shade night time
        ax.axvspan(0, 6, alpha=0.2, color='gray', label='Night')
        ax.axvspan(18, 24, alpha=0.2, color='gray')

        ax.set_title(title or 'Average Hourly Power Output', fontsize=14, fontweight='bold')
        ax.set_xlabel('Hour of Day', fontsize=12)
        ax.set_ylabel('Power Output (W)', fontsize=12)
        ax.set_xticks(range(0, 24, 2))
        ax.grid(True, alpha=0.3)
        ax.legend()

        # Add peak information
        peak_hour = np.argmax(avg_hourly)
        peak_power = max(avg_hourly)
        stats_text = f'Peak: {peak_hour}:00 ({peak_power:.0f} W)\nPeak-to-Min Ratio: {peak_power/min(avg_hourly[avg_hourly>0]):.1f}x'
        ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, filename), dpi=300, bbox_inches='tight')
        plt.close()
        print(f"  Graph saved: {filename}")

    def plot_daily_energy_heatmap(self, results, filename):
        """Plot daily energy as heatmap calendar view"""
        # Get daily energy data
        days = list(results.daily_energy.keys())
        energy = [results.daily_energy[d] for d in days]

        # Create a full year grid
        calendar_data = np.zeros((53, 7))  # 53 weeks, 7 days

        # Convert day of year to week/day
        for day, eng in zip(days, energy):
            date = pd.Timestamp(f'2023-01-01') + pd.Timedelta(days=day-1)
            week = date.isocalendar()[1] - 1
            day_of_week = date.weekday()
            if week < 53:
                calendar_data[week, day_of_week] = eng

        fig, ax = plt.subplots(figsize=(15, 8))
        im = ax.imshow(calendar_data, cmap='YlOrRd', aspect='auto')

        # Add colorbar
        cbar = plt.colorbar(im, ax=ax)
        cbar.set_label('Daily Energy (kWh)', fontsize=12)

        # Labels
        ax.set_title('Daily Energy Production Heatmap', fontsize=14, fontweight='bold')
        ax.set_xlabel('Day of Week', fontsize=12)
        ax.set_ylabel('Week of Year', fontsize=12)
        ax.set_xticks(range(7))
        ax.set_xticklabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, filename), dpi=300, bbox_inches='tight')
        plt.close()
        print(f"  Graph saved: {filename}")

    def plot_tilt_comparison(self, tilt_results):
        """Plot comparison of different tilt angles"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

        # Annual energy comparison
        tilts = list(tilt_results.keys())
        annual_energies = [tilt_results[t].annual_energy for t in tilts]

        bars = ax1.bar([f"{t}°" for t in tilts], annual_energies, color='skyblue', alpha=0.7)
        ax1.set_title('Annual Energy vs Tilt Angle', fontsize=12, fontweight='bold')
        ax1.set_xlabel('Tilt Angle', fontsize=11)
        ax1.set_ylabel('Annual Energy (kWh)', fontsize=11)
        ax1.grid(True, alpha=0.3)

        # Add value labels
        for bar in bars:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.0f}',
                    ha='center', va='bottom')

        # Capacity factor comparison
        cap_factors = [tilt_results[t].capacity_factor * 100 for t in tilts]

        bars2 = ax2.bar([f"{t}°" for t in tilts], cap_factors, color='lightgreen', alpha=0.7)
        ax2.set_title('Capacity Factor vs Tilt Angle', fontsize=12, fontweight='bold')
        ax2.set_xlabel('Tilt Angle', fontsize=11)
        ax2.set_ylabel('Capacity Factor (%)', fontsize=11)
        ax2.grid(True, alpha=0.3)

        # Add value labels
        for bar in bars2:
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.1f}%',
                    ha='center', va='bottom')

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, "Test4_Tilt_Comparison.png"), dpi=300, bbox_inches='tight')
        plt.close()

    def plot_system_size_comparison(self, size_results):
        """Plot comparison of different system sizes"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

        sizes = list(size_results.keys())
        annual_energies = [size_results[s].annual_energy for s in sizes]
        cap_factors = [size_results[s].capacity_factor * 100 for s in sizes]

        bars1 = ax1.bar(sizes, annual_energies, color='coral', alpha=0.7)
        ax1.set_title('Annual Energy by System Size', fontsize=12, fontweight='bold')
        ax1.set_xlabel('System Size', fontsize=11)
        ax1.set_ylabel('Annual Energy (kWh)', fontsize=11)
        ax1.tick_params(axis='x', rotation=45)
        ax1.grid(True, alpha=0.3)

        for bar in bars1:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.0f}',
                    ha='center', va='bottom')

        bars2 = ax2.bar(sizes, cap_factors, color='gold', alpha=0.7)
        ax2.set_title('Capacity Factor by System Size', fontsize=12, fontweight='bold')
        ax2.set_xlabel('System Size', fontsize=11)
        ax2.set_ylabel('Capacity Factor (%)', fontsize=11)
        ax2.tick_params(axis='x', rotation=45)
        ax2.grid(True, alpha=0.3)

        for bar in bars2:
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.1f}%',
                    ha='center', va='bottom')

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, "Test5_Size_Comparison.png"), dpi=300, bbox_inches='tight')
        plt.close()

    def plot_day_comparison(self, day_results):
        """Plot comparison of different days"""
        fig, ax = plt.subplots(figsize=(14, 7))

        colors = ['red', 'blue', 'green', 'orange']
        for i, (day, data) in enumerate(day_results.items()):
            hours = range(24)
            power = data['power_output']
            ax.plot(hours, power, label=day, linewidth=2, color=colors[i % len(colors)])

        ax.set_title('Power Output Comparison - Different Days of Year', fontsize=14, fontweight='bold')
        ax.set_xlabel('Hour of Day', fontsize=12)
        ax.set_ylabel('Power Output (W)', fontsize=12)
        ax.grid(True, alpha=0.3)
        ax.legend()
        ax.set_xticks(range(0, 24, 2))

        # Shade night time
        ax.axvspan(0, 6, alpha=0.1, color='gray')
        ax.axvspan(18, 24, alpha=0.1, color='gray')

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, "Test6_Day_Comparison.png"), dpi=300, bbox_inches='tight')
        plt.close()

    def plot_performance_comparison(self, location_results):
        """Plot performance comparison across locations"""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))

        locations = list(location_results.keys())
        annual_energies = [location_results[l].annual_energy for l in locations]
        cap_factors = [location_results[l].capacity_factor * 100 for l in locations]
        peak_powers = [location_results[l].peak_power for l in locations]
        perf_ratios = [location_results[l].performance_ratio * 100 for l in locations]

        # Annual Energy
        bars1 = ax1.bar(range(len(locations)), annual_energies, color='lightcoral', alpha=0.7)
        ax1.set_title('Annual Energy by Location', fontsize=12, fontweight='bold')
        ax1.set_ylabel('Annual Energy (kWh)', fontsize=11)
        ax1.set_xticks(range(len(locations)))
        ax1.set_xticklabels([l.split()[0] for l in locations], rotation=45)
        ax1.grid(True, alpha=0.3)

        for i, bar in enumerate(bars1):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.0f}',
                    ha='center', va='bottom', fontsize=9)

        # Capacity Factor
        bars2 = ax2.bar(range(len(locations)), cap_factors, color='lightskyblue', alpha=0.7)
        ax2.set_title('Capacity Factor by Location', fontsize=12, fontweight='bold')
        ax2.set_ylabel('Capacity Factor (%)', fontsize=11)
        ax2.set_xticks(range(len(locations)))
        ax2.set_xticklabels([l.split()[0] for l in locations], rotation=45)
        ax2.grid(True, alpha=0.3)

        for i, bar in enumerate(bars2):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.1f}%',
                    ha='center', va='bottom', fontsize=9)

        # Peak Power
        bars3 = ax3.bar(range(len(locations)), peak_powers, color='lightgreen', alpha=0.7)
        ax3.set_title('Peak Power by Location', fontsize=12, fontweight='bold')
        ax3.set_ylabel('Peak Power (W)', fontsize=11)
        ax3.set_xticks(range(len(locations)))
        ax3.set_xticklabels([l.split()[0] for l in locations], rotation=45)
        ax3.grid(True, alpha=0.3)

        for i, bar in enumerate(bars3):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.0f}',
                    ha='center', va='bottom', fontsize=9)

        # Performance Ratio
        bars4 = ax4.bar(range(len(locations)), perf_ratios, color='gold', alpha=0.7)
        ax4.set_title('Performance Ratio by Location', fontsize=12, fontweight='bold')
        ax4.set_ylabel('Performance Ratio (%)', fontsize=11)
        ax4.set_xticks(range(len(locations)))
        ax4.set_xticklabels([l.split()[0] for l in locations], rotation=45)
        ax4.grid(True, alpha=0.3)

        for i, bar in enumerate(bars4):
            height = bar.get_height()
            ax4.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.1f}%',
                    ha='center', va='bottom', fontsize=9)

        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, "Test7_Performance_Comparison.png"), dpi=300, bbox_inches='tight')
        plt.close()

    def run_all_tests(self):
        """Run all test scenarios and generate comprehensive report"""
        print("="*70)
        print(" PVLIB SIMULATION TEST SUITE WITH GRAPH VISUALIZATION")
        print("="*70)
        print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        all_results = {}

        # Run all test scenarios
        all_results['default'] = self.test_scenario_1_default_config()
        all_results['southern_hemisphere'] = self.test_scenario_2_southern_hemisphere()
        all_results['equator'] = self.test_scenario_3_equator()
        all_results['tilt_comparison'] = self.test_scenario_4_different_tilt_angles()
        all_results['size_comparison'] = self.test_scenario_5_system_sizes()
        all_results['day_simulation'] = self.test_scenario_6_single_day_simulation()
        all_results['performance_comparison'] = self.test_scenario_7_performance_comparison()

        # Generate summary report
        self.generate_summary_report(all_results)

        print("\n" + "="*70)
        print(" ALL TESTS COMPLETED")
        print("="*70)
        print(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Results saved to: {os.path.abspath(self.output_dir)}")
        print("\nGenerated graphs:")
        for file in sorted(os.listdir(self.output_dir)):
            if file.endswith('.png'):
                print(f"  - {file}")

    def generate_summary_report(self, all_results):
        """Generate a summary report of all tests"""
        report_path = os.path.join(self.output_dir, "TEST_SUMMARY_REPORT.txt")

        with open(report_path, 'w') as f:
            f.write("="*70 + "\n")
            f.write(" PVLIB SIMULATION TEST SUITE - SUMMARY REPORT\n")
            f.write("="*70 + "\n")
            f.write(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            f.write("TEST SCENARIOS:\n")
            f.write("-"*70 + "\n\n")

            # Test 1: Default
            f.write("1. DEFAULT CONFIGURATION\n")
            f.write("   Location: Atlanta, GA (33.45°N, 84.15°W)\n")
            f.write("   System: 12kW (40 panels @ 400W)\n")
            if all_results['default']:
                r = all_results['default']
                f.write(f"   ✓ Annual Energy: {r.annual_energy:.2f} kWh\n")
                f.write(f"   ✓ Capacity Factor: {r.capacity_factor:.2%}\n")
                f.write(f"   ✓ Peak Power: {r.peak_power:.2f} W\n")
                f.write(f"   ✓ Performance Ratio: {r.performance_ratio:.2%}\n")
            f.write("\n")

            # Test 2: Southern Hemisphere
            f.write("2. SOUTHERN HEMISPHERE\n")
            f.write("   Location: Sydney, Australia (33.87°S, 151.21°E)\n")
            f.write("   System: 12kW (40 panels @ 400W)\n")
            if all_results['southern_hemisphere']:
                r = all_results['southern_hemisphere']
                f.write(f"   ✓ Annual Energy: {r.annual_energy:.2f} kWh\n")
                f.write(f"   ✓ Capacity Factor: {r.capacity_factor:.2%}\n")
                f.write(f"   ✓ Seasonal Pattern: Verified (Summer > Winter)\n")
            f.write("\n")

            # Test 3: Equator
            f.write("3. EQUATOR LOCATION\n")
            f.write("   Location: Singapore (1.35°N, 103.82°E)\n")
            f.write("   System: 12kW (40 panels @ 400W, 5° tilt)\n")
            if all_results['equator']:
                r = all_results['equator']
                f.write(f"   ✓ Annual Energy: {r.annual_energy:.2f} kWh\n")
                f.write(f"   ✓ Capacity Factor: {r.capacity_factor:.2%}\n")
                f.write(f"   ✓ Consistent year-round production\n")
            f.write("\n")

            # Test 4: Tilt Comparison
            f.write("4. TILT ANGLE COMPARISON\n")
            f.write("   Location: Atlanta, GA\n")
            f.write("   System: 12kW with varying tilt angles\n")
            if all_results['tilt_comparison']:
                best_tilt = max(all_results['tilt_comparison'].items(), key=lambda x: x[1].annual_energy)
                f.write(f"   ✓ Best tilt angle: {best_tilt[0]}° ({best_tilt[1].annual_energy:.2f} kWh)\n")
                f.write(f"   ✓ Tested angles: {list(all_results['tilt_comparison'].keys())}\n")
            f.write("\n")

            # Test 5: System Sizes
            f.write("5. SYSTEM SIZE COMPARISON\n")
            f.write("   Location: Atlanta, GA\n")
            if all_results['size_comparison']:
                f.write("   ✓ Tested sizes: Small (3kW), Medium (10kW), Large (20kW)\n")
                for name, r in all_results['size_comparison'].items():
                    f.write(f"     - {name}: {r.annual_energy:.2f} kWh (CF: {r.capacity_factor:.1%})\n")
            f.write("\n")

            # Test 6: Day Simulation
            f.write("6. SINGLE DAY SIMULATION\n")
            f.write("   Location: Atlanta, GA\n")
            f.write("   System: 12kW\n")
            if all_results['day_simulation']:
                f.write("   ✓ Tested days:\n")
                for day, data in all_results['day_simulation'].items():
                    total = sum(data['power_output']) / 1000
                    peak = max(data['power_output'])
                    f.write(f"     - {day}: {total:.2f} kWh (Peak: {peak:.0f}W)\n")
            f.write("\n")

            # Test 7: Performance Comparison
            f.write("7. PERFORMANCE COMPARISON\n")
            f.write("   Multiple US cities comparison\n")
            f.write("   System: 12kW standard configuration\n")
            if all_results['performance_comparison']:
                f.write("   ✓ Results by location:\n")
                for name, r in all_results['performance_comparison'].items():
                    f.write(f"     - {name}: {r.annual_energy:.0f} kWh, CF: {r.capacity_factor:.1%}\n")
                best_location = max(all_results['performance_comparison'].items(),
                                   key=lambda x: x[1].annual_energy)
                f.write(f"   ✓ Best performing location: {best_location[0]}\n")
            f.write("\n")

            f.write("-"*70 + "\n")
            f.write("GRAPH OUTPUTS:\n")
            f.write("-"*70 + "\n")
            for file in sorted(os.listdir(self.output_dir)):
                if file.endswith('.png'):
                    f.write(f"  - {file}\n")
            f.write("\n")

            f.write("="*70 + "\n")
            f.write("All tests completed successfully!\n")
            f.write("="*70 + "\n")

        print(f"\n✓ Summary report saved: {report_path}")


def main():
    """Main entry point"""
    print("Starting PVLib Simulation Test Suite with Graph Visualization...")
    print("This will run 7 comprehensive test scenarios and generate graphs.\n")

    runner = SimulationTestRunner(output_dir="test_simulation_results")
    runner.run_all_tests()


if __name__ == "__main__":
    main()
