import yaml
import math
import os
from pathlib import Path

def load_data():
    """Load project specifications and component data"""
    with open('data/project_specs.yaml', 'r') as f:
        project_specs = yaml.safe_load(f)
    
    with open('data/components.yaml', 'r') as f:
        components = yaml.safe_load(f)
    
    return project_specs, components

def calculate_array_configuration(project_specs, components):
    """Calculate PV array configuration parameters"""
    # Extract panel and inverter data
    panel = components.get('panel', {})
    inverter = components.get('inverter', {})
    project = project_specs.get('project', {})
    print(f"Panel data: {panel}")
    print(f"Inverter data: {inverter}")
    
    # Temperature coefficients
    beta_factor = panel.get('tempCoeffVoc', 0) / 100.0  # %/°C
    alpha_factor = panel.get('tempCoeffIsc', 0) / 100.0  # %/°C
    print(f"beta_factor: {beta_factor}, alpha_factor: {alpha_factor}")
    
    # Panel voltage calculations at different temperatures
    # At -10°C (cold condition)
    temp_effect_cold = -35 * beta_factor
    temp_multiplier_cold = 1 + temp_effect_cold
    Voc_10 = panel.get('openCircuitVoltage', 0) * temp_multiplier_cold
    Vmp_10 = panel.get('voltageAtPmax', 0) * temp_multiplier_cold
    print(f"Voc_10: {Voc_10}, Vmp_10: {Vmp_10}")
    
    # At 85°C (hot condition)
    temp_effect_hot = 60 * beta_factor
    temp_multiplier_hot = 1 + temp_effect_hot
    Vmp_85 = panel.get('voltageAtPmax', 0) * temp_multiplier_hot
    print(f"Vmp_85: {Vmp_85}")
    
    # Current calculations at 85°C
    temp_effect_isc = 60 * alpha_factor
    temp_multiplier_isc = 1 + temp_effect_isc
    Isc_85 = panel.get('shortCircuitCurrent', 0) * temp_multiplier_isc
    Imp_85 = panel.get('currentAtPmax', 0) * temp_multiplier_isc
    print(f"Isc_85: {Isc_85}, Imp_85: {Imp_85}")
    
    # Calculate maximum number of panels in series
    Nsmax_calc = inverter.get('maxDcVoltage', 1) / Voc_10 if Voc_10 != 0 else 1
    Nsmax = math.floor(Nsmax_calc)
    print(f"Nsmax_calc: {Nsmax_calc}, Nsmax: {Nsmax}")
    
    # Calculate optimal number of panels in series
    Nsoptimal_calc = inverter.get('mpptVoltageRangeMax', 1) / Vmp_10 if Vmp_10 != 0 else 1
    Nsoptimal = math.floor(Nsoptimal_calc)
    print(f"Nsoptimal_calc: {Nsoptimal_calc}, Nsoptimal: {Nsoptimal}")
    
    # Calculate minimum number of panels in series
    Nsmin_calc = inverter.get('mpptVoltageRangeMin', 1) / Vmp_85 if Vmp_85 != 0 else 1
    Nsmin = math.ceil(Nsmin_calc)
    print(f"Nsmin_calc: {Nsmin_calc}, Nsmin: {Nsmin}")
    
    # Calculate maximum number of strings in parallel (short circuit protection)
    Npmax_calc = inverter.get('maxShortCircuitCurrent', 1) / Isc_85 if Isc_85 != 0 else 1
    Npmax = math.floor(Npmax_calc)
    print(f"Npmax_calc: {Npmax_calc}, Npmax: {Npmax}")
    
    # Calculate optimal number of strings in parallel
    Npoptimal_calc = inverter.get('maxInputCurrentPerMppt', 1) / Imp_85 if Imp_85 != 0 else 1
    Npoptimal = math.floor(Npoptimal_calc)
    print(f"Npoptimal_calc: {Npoptimal_calc}, Npoptimal: {Npoptimal}")
    
    # Calculate power ratio
    total_panels = project.get('numberPanels', 1)
    total_power = total_panels * panel.get('maxPower', 1)
    power_ratio = total_power / inverter.get('nominalOutputPower', 1)
    print(f"total_panels: {total_panels}, total_power: {total_power}, power_ratio: {power_ratio}")
    
    # Store calculations in a dictionary
    array = {
        'Voc_10': round(Voc_10, 2),
        'Vmp_10': round(Vmp_10, 2),
        'Vmp_85': round(Vmp_85, 2),
        'Isc_85': round(Isc_85, 2),
        'Imp_85': round(Imp_85, 2),
        'Nsmax': Nsmax,
        'Nsoptimal': Nsoptimal,
        'Nsmin': Nsmin,
        'Npmax': Npmax,
        'Npoptimal': Npoptimal,
        'power_ratio': round(power_ratio, 2),
        'array_power': round(total_power, 2)
    }
    
    return array

def calculate_protection_devices(project_specs, components, array_config):
    """Calculate protection device parameters"""

    # Extract panel data
    panel = components.get('panel', {})
    
    # Maximum number of parallel connection w/o protection: Ncxmax
    # Maximum number of parallel connection w/t protection device: Npmax
    Irm = panel.get('maxSeriesFuseRating', 0 )
    Isc = panel.get('shortCircuitCurrent', 0 )
    Impp = panel.get('currentAtPmax', 0)
    Ncmax_lmt = (1 + Irm) / Isc
    Npmax_lmt = 0.5 * ( 1 + ( Irm / Impp ))

    # Calculate fuse current requirements
    fuse_IscSTC = panel.get('shortCircuitCurrent', 0) * 1.1 * 1.25
    switch_IscSTC = panel.get('shortCircuitCurrent', 0) * 1.25
    Vocmax = panel.get('openCircuitVoltage', 0) * 1.2
    Iscmax =  panel.get('shortCircuitCurrent', 0) * 1.25

    # Store calculations in a dictionary
    protection = {
        'fuse_Vocmax_val': array_config['Voc_10'],
        'fuse_IscSTC': round(fuse_IscSTC, 2),
        'switch_IscSTC': round(switch_IscSTC, 2),
        'Vocmax': round(Vocmax, 2),
        'Iscmax': round(Iscmax, 2),
        'Ncmax_lmt': round(Ncmax_lmt, 2),
        'Npmax_lmt': round(Npmax_lmt, 2),
    }
    
    return protection

def calculate_cable_sizing(project_specs, components):
    """Calculate cable sizing and voltage drop"""
    # Extract relevant data
    panel = components.get('panel', {})
    inverter = components.get('inverter', {})
    dc_cable = components.get('dc_cable', {})
    ac_cable = components.get('ac_cable', {})
    constants = project_specs.get('constants', {})
    project = project_specs.get('project', {})

    # DC cable calculations
    # Example calculation for Iz' with correction factors
    dc_Iz_base = dc_cable.get('Iz', 43)   # Base current capacity #TODO: check where this value comes from
    K1 = constants.get('K1', 1)        # Installation method factor
    K2 = constants.get('K2', 0.94)     # Circuit grouping factor
    K3 = constants.get('K3', 0.80)     # Ambient temperature factor

    # Different K4 values based on temperature
    K4_80C = constants.get('K4_80C', 0.41)  # 80°C (cable tray exposed to sun)
    K4_50C = constants.get('K4_50C', 0.82)  # 50°C (cable tray not exposed)
    K4_25C = constants.get('K4_25C', 1.04)  # 25°C (buried)

    dc_Iz_prime_80C = dc_Iz_base * K1 * K2 * K3 * K4_80C
    dc_Iz_prime_50C = dc_Iz_base * K1 * K2 * K3 * K4_50C
    dc_Iz_prime_25C = dc_Iz_base * K1 * K2 * K3 * K4_25C
    
    # Voltage drop calculations
    rho = constants.get('resistivity_cu', 0.0168)  # Ω·mm²/m (default copper)
    S = dc_cable.get('section', 4)       # mm²
    L = project.get('dcCableLength', 10) # m
    ImpSTC = panel.get('currentAtPmax', 0)
    Ump = panel.get('voltageAtPmax', 0)

    dc_delta_u = 2 * rho * (L / S) * ImpSTC
    dc_delta_u_perc = 100 * dc_delta_u / Ump if Ump != 0 else 0

    # Voltage drop calculations - AC
    ac_Iz_base = ac_cable.get('Iz', 43)   # Base current capacity #TODO: check where this value comes from

    ac_Iz_prime_80C = ac_Iz_base * K1 * K2 * K3 * K4_80C
    ac_Iz_prime_50C = ac_Iz_base * K1 * K2 * K3 * K4_50C
    ac_Iz_prime_25C = ac_Iz_base * K1 * K2 * K3 * K4_25C

    rho = constants.get('resistivity_cu', 0.0168)  # Ω·mm²/m (default copper)
    S = ac_cable.get('section', 4)       # mm²
    L1 = project.get('acCableLength_1', 10) # m
    L2 = project.get('acCableLength_2', 10) # m
    Imax = inverter.get('maxOutputCurrent', 0)
    Ve = constants.get('gridVoltage', 230)
    sin_phi = constants.get('sin_phi', 0.6)
    cos_phi = constants.get('cos_phi', 0.8)
    _lambda = constants.get('lambda', 0.8)

    ac_delta_u_1 =  2 * ( (rho * (L1 / S) * cos_phi ) + ( _lambda * L1 * sin_phi )) * Imax
    ac_delta_u_perc_1 = 100 * ac_delta_u_1 / Ve if Ve != 0 else 230
    ac_delta_u_2 =  2 * ( (rho * (L2 / S) * cos_phi ) + ( _lambda * L2 * sin_phi )) * Imax
    ac_delta_u_perc_2 = 100 * ac_delta_u_2 / Ve if Ve != 0 else 230
    ac_delta_u_perc = ac_delta_u_perc_1 + ac_delta_u_perc_2

    # Store calculations in a dictionary
    dc_cable_sizing = {
        'Iz': round(dc_Iz, 2),
        'section': round(dc_section, 2),
        'maker': dc_cable.get('maker', ''),
        'Iz_prime_80C': round(dc_Iz_prime_80C, 2),
        'Iz_prime_50C': round(dc_Iz_prime_50C, 2),
        'Iz_prime_25C': round(dc_Iz_prime_25C, 2),
        'delta_u': round(dc_delta_u, 4),
        'delta_u_perc': round(dc_delta_u_perc, 2),
    }
    ac1_cable_sizing = {
        'Iz': round(ac_Iz, 2),
        'section': round(ac_section, 2),
        'maker': ac_cable.get('maker', ''),
        'Iz_prime_80C': round(ac_Iz_prime_80C, 2),
        'Iz_prime_50C': round(ac_Iz_prime_50C, 2),
        'Iz_prime_25C': round(ac_Iz_prime_25C, 2),
        'delta_u': round(ac_delta_u_1, 4),
        'delta_u_perc': round(ac_delta_u_perc_1, 2),
    }
    ac2_cable_sizing = {
        'delta_u': round(ac_delta_u_2, 4),
        'delta_u_perc': round(ac_delta_u_perc_2, 2),
        'delta_u_perc_total': round(ac_delta_u_perc, 2)
    }
    return dc_cable_sizing, ac1_cable_sizing, ac2_

def main():
    """Run all calculations and save results"""
    # Create output directory if it doesn't exist
    os.makedirs('data/calculation_results', exist_ok=True)
    
    # Load data
    project_specs, components = load_data()
    
    # Run calculations
    array = calculate_array_configuration(project_specs, components)
    protection = calculate_protection_devices(project_specs, components, array)
    dc_cable_sizing, ac1_cable_sizing, ac2_cable_sizing = calculate_cable_sizing(project_specs, components)
    
    # Combine all calculations
    all_results = {
        'array': array,
        'protection': protection,
        'dc_cable_sizing': dc_cable_sizing,
        'ac1_cable_sizing': ac1_cable_sizing,
        'ac2_cable_sizing': ac2_cable_sizing
    }
    
    # Save results
    with open('data/calculation_results/calculations.yaml', 'w') as f:
        yaml.dump(all_results, f, default_flow_style=False)
    
    print("Calculations completed and saved.")

if __name__ == "__main__":
    main()
