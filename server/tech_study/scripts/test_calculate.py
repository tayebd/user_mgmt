import yaml
from calculate import calculate_array_configuration, calculate_protection_devices, calculate_cable_sizing

def load_test_data():
    """Load sample project specifications and component data for testing"""
    project_specs = {
        'array_power': 3045
    }
    components = {
        'panel': {
            'tempCoeffVoc': -0.35,
            'tempCoeffIsc': -0.5,
            'openCircuitVoltage': 37.0,
            'voltageAtPmax': 30.0,
            'shortCircuitCurrent': 8.5,
            'currentAtPmax': 8.0
        },
        'inverter': {
            'maxDcVoltage': 1000,
            'mpptVoltageRangeMax': 600,
            'mpptVoltageRangeMin': 300,
            'maxShortCircuitCurrent': 100,
            'maxInputCurrentPerMppt': 50,
            'nominalOutputPower': 3000
        }
    }
    return project_specs, components

def main():
    """Test the calculate_array_configuration, calculate_protection_devices, and calculate_cable_sizing functions"""
    project_specs, components = load_test_data()

    # Test calculate_array_configuration
    array_config = calculate_array_configuration(project_specs, components)
    print("Array Configuration:")
    print(yaml.dump(array_config, default_flow_style=False))

    # Test calculate_protection_devices
    protection = calculate_protection_devices(project_specs, components, array_config)
    print("Protection Devices:")
    print(yaml.dump(protection, default_flow_style=False))

    # Test calculate_cable_sizing
    cable_sizing = calculate_cable_sizing(project_specs, components, array_config)
    print("Cable Sizing:")
    print(yaml.dump(cable_sizing, default_flow_style=False))

if __name__ == "__main__":
    main()
