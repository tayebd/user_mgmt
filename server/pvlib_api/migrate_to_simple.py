#!/usr/bin/env python3
"""
Migration script to convert old PV system data to new simplified format
"""

import pickle
import json
from datetime import datetime
from typing import Dict, Any, Optional

from simplified_simulator import SiteConfig, PanelConfig, ArrayConfig, InverterConfig


def load_old_spv_file(filepath: str) -> Optional[Dict[str, Any]]:
    """Load old .spv file and return data dictionary"""
    try:
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
        return data
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None


def convert_site_data(old_site: Dict[str, Any]) -> SiteConfig:
    """Convert old site data to new SiteConfig"""
    return SiteConfig(
        latitude=old_site.get('lat', 0.0),
        longitude=old_site.get('lon', 0.0),
        altitude=old_site.get('elev', 100.0),
        timezone=str(old_site.get('tz', 'UTC')),
        albedo=0.25  # Default value
    )


def convert_panel_data(old_panel: Dict[str, Any]) -> PanelConfig:
    """Convert old panel data to new PanelConfig"""
    return PanelConfig(
        max_power=old_panel.get('PTC', 400.0),
        open_circuit_voltage=old_panel.get('V_oc_ref', 48.0),
        short_circuit_current=old_panel.get('I_sc_ref', 10.0),
        voltage_at_pmax=old_panel.get('V_mp_ref', 40.0),
        current_at_pmax=old_panel.get('I_mp_ref', 9.0),
        temp_coeff_voc=old_panel.get('beta_oc', -0.003),
        temp_coeff_isc=old_panel.get('alpha_sc', 0.0005)
    )


def convert_array_data(old_array: Dict[str, Any]) -> ArrayConfig:
    """Convert old array data to new ArrayConfig"""
    return ArrayConfig(
        modules_per_string=old_array.get('uis', 10),
        strings_in_parallel=old_array.get('sip', 3),
        tilt_angle=old_array.get('tilt', 30.0),
        azimuth_angle=old_array.get('azimuth', 180.0),
        mounting_height=old_array.get('mtg_hgt', 2.0),
        ground_coverage_ratio=0.3  # Default value
    )


def convert_inverter_data(old_inverter: Dict[str, Any]) -> InverterConfig:
    """Convert old inverter data to new InverterConfig"""
    return InverterConfig(
        nominal_output_power=old_inverter.get('Paco', 10000.0),
        max_dc_voltage=old_inverter.get('Vdcmax', 600.0),
        max_input_current=old_inverter.get('Idcmax', 20.0),
        efficiency=0.96  # Default value
    )


def migrate_spv_to_json(input_path: str, output_path: str) -> bool:
    """Migrate old .spv file to new JSON format"""
    print(f"Migrating {input_path} to {output_path}")

    # Load old data
    old_data = load_old_spv_file(input_path)
    if not old_data:
        return False

    try:
        # Convert to new format
        new_config = {
            "migration_info": {
                "timestamp": datetime.now().isoformat(),
                "source_file": input_path,
                "version": "1.0"
            },
            "site": convert_site_data(old_data.get('site', {})).__dict__,
            "panel": convert_panel_data(old_data.get('pnl', {})).__dict__,
            "array": convert_array_data(old_data.get('ary', {})).__dict__,
            "inverter": convert_inverter_data(old_data.get('inv', {})).__dict__
        }

        # Save as JSON
        with open(output_path, 'w') as f:
            json.dump(new_config, f, indent=2)

        print(f"✅ Successfully migrated to {output_path}")
        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False


def create_sample_config():
    """Create a sample configuration file for testing"""
    from simplified_simulator import create_default_config

    site, panel, array, inverter = create_default_config()

    config = {
        "description": "Sample PV system configuration",
        "created": datetime.now().isoformat(),
        "site": site.__dict__,
        "panel": panel.__dict__,
        "array": array.__dict__,
        "inverter": inverter.__dict__
    }

    with open('sample_config.json', 'w') as f:
        json.dump(config, f, indent=2)

    print("✅ Sample configuration created: sample_config.json")


def validate_config(config_path: str) -> bool:
    """Validate a configuration file"""
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)

        # Try to create configuration objects
        site = SiteConfig(**config['site'])
        panel = PanelConfig(**config['panel'])
        array = ArrayConfig(**config['array'])
        inverter = InverterConfig(**config['inverter'])

        print(f"✅ Configuration {config_path} is valid")
        print(f"   Site: {site.latitude}°, {site.longitude}°")
        print(f"   System: {array.modules_per_string}x{array.strings_in_parallel} panels")
        print(f"   Capacity: {panel.max_power * array.modules_per_string * array.strings_in_parallel / 1000:.1f} kW")

        return True

    except Exception as e:
        print(f"❌ Configuration {config_path} is invalid: {e}")
        return False


if __name__ == "__main__":
    import sys
    import os

    if len(sys.argv) < 2:
        print("Usage: python migrate_to_simple.py <command> [args]")
        print("Commands:")
        print("  migrate <input.spv> <output.json>  Migrate old SPV file to new JSON")
        print("  validate <config.json>             Validate configuration file")
        print("  sample                             Create sample configuration")
        print("  batch <directory>                  Migrate all .spv files in directory")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "migrate":
        if len(sys.argv) != 4:
            print("Usage: python migrate_to_simple.py migrate <input.spv> <output.json>")
            sys.exit(1)
        success = migrate_spv_to_json(sys.argv[2], sys.argv[3])

    elif command == "validate":
        if len(sys.argv) != 3:
            print("Usage: python migrate_to_simple.py validate <config.json>")
            sys.exit(1)
        success = validate_config(sys.argv[2])

    elif command == "sample":
        create_sample_config()
        success = True

    elif command == "batch":
        if len(sys.argv) != 3:
            print("Usage: python migrate_to_simple.py batch <directory>")
            sys.exit(1)

        directory = sys.argv[2]
        success = True

        for filename in os.listdir(directory):
            if filename.endswith('.spv'):
                input_path = os.path.join(directory, filename)
                output_path = os.path.join(directory, filename.replace('.spv', '.json'))
                if not migrate_spv_to_json(input_path, output_path):
                    success = False

    else:
        print(f"Unknown command: {command}")
        success = False

    sys.exit(0 if success else 1)