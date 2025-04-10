// Templates as strings (these would be stored in separate files in a real application)
export const equipmentTemplate = `# Equipment Specifications

## Panel: {{panel.model}}
- Maximum Power: {{panel.maxPower}} W
- Open Circuit Voltage (Voc): {{panel.openCircuitVoltage}} V
- Voltage at Maximum Power (Vmp): {{panel.voltageAtPmax}} V
- Short Circuit Current (Isc): {{panel.shortCircuitCurrent}} A
- Current at Maximum Power (Imp): {{panel.currentAtPmax}} A
- Temperature Coefficient (Voc): {{panel.tempCoeffVoc}} %/°C
- Temperature Coefficient (Isc): {{panel.tempCoeffIsc}} %/°C

## Inverter: {{inverter.model}}
- Nominal Output Power: {{inverter.nominalOutputPower}} W
- Maximum DC Voltage: {{inverter.maxDcVoltage}} V
- MPPT Voltage Range: {{inverter.mpptVoltageRangeMin}} - {{inverter.mpptVoltageRangeMax}} V
- Maximum Input Current per MPPT: {{inverter.maxInputCurrentPerMppt}} A
- Maximum Short Circuit Current: {{inverter.maxShortCircuitCurrent}} A
- Maximum Output Current: {{inverter.maxOutputCurrent}} A
`;

export const arrayConfigurationTemplate = `# Array Configuration

## Calculated Parameters
- Voc at -10°C: {{array.Voc_10}} V
- Vmp at -10°C: {{array.Vmp_10}} V
- Vmp at 85°C: {{array.Vmp_85}} V
- Isc at 85°C: {{array.Isc_85}} A
- Imp at 85°C: {{array.Imp_85}} A

## Series Configuration
- Maximum modules in series: {{array.Nsmax}}
- Optimal modules in series: {{array.Nsoptimal}}
- Minimum modules in series: {{array.Nsmin}}

## Parallel Configuration
- Maximum strings in parallel: {{array.Npmax}}
- Optimal strings in parallel: {{array.Npoptimal}}

## Power Ratio
- Array Power: {{array.array_power}} W
- Power Ratio: {{array.power_ratio}}
`;

export const protectionTemplate = `# Protection Devices

## DC Protection
- Maximum system voltage: {{protection.fuse_Vocmax_val}} V
- Fuse current rating: {{protection.fuse_IscSTC}} A
- Switch current rating: {{protection.switch_IscSTC}} A
- Maximum system voltage: {{protection.Vocmax}} V
- Maximum system current: {{protection.Iscmax}} A

## Maximum Parallel Connections
- Without protection (Ncmax): {{protection.Ncmax_lmt}}
- With protection (Npmax): {{protection.Npmax_lmt}}
`;

export const cableSizingTemplate = `# Cable Sizing

## DC Cable Sizing
- Current capacity at 80°C: {{dc_cable_sizing.Iz_prime_80C}} A
- Current capacity at 50°C: {{dc_cable_sizing.Iz_prime_50C}} A
- Current capacity at 25°C: {{dc_cable_sizing.Iz_prime_25C}} A
- Voltage drop: {{dc_cable_sizing.delta_u}} V ({{dc_cable_sizing.delta_u_perc}}%)

## AC Cable Sizing
- Current capacity at 80°C: {{ac1_cable_sizing.Iz_prime_80C}} A
- Current capacity at 50°C: {{ac1_cable_sizing.Iz_prime_50C}} A
- Current capacity at 25°C: {{ac1_cable_sizing.Iz_prime_25C}} A
- Voltage drop (section 1): {{ac1_cable_sizing.delta_u}} V ({{ac1_cable_sizing.delta_u_perc}}%)
- Voltage drop (section 2): {{ac2_cable_sizing.delta_u}} V ({{ac2_cable_sizing.delta_u_perc}}%)
- Total voltage drop: {{ac1_cable_sizing.delta_u_perc + ac2_cable_sizing.delta_u_perc}}%
`;


export const calculationsTemplate = `# Detailed Calculations

## Array Configuration Calculations
- Voc at STC: {{panel.openCircuitVoltage}} V
- Temperature coefficient (Voc): {{panel.tempCoeffVoc}}%/°C
- Voc at -10°C = {{panel.openCircuitVoltage}} × (1 + (-35 × {{panel.tempCoeffVoc}}/100)) = {{array.Voc_10}} V
- Maximum modules in series = {{inverter.maxDcVoltage}} / {{array.Voc_10}} = {{array.Nsmax_calc}} ≈ 
{{array.Nsmax}}

## Protection Device Calculations
- Fuse sizing: 1.1 × 1.25 × {{panel.shortCircuitCurrent}} = {{protection.fuse_IscSTC}} A
- Switch sizing: 1.25 × {{panel.shortCircuitCurrent}} = {{protection.switch_IscSTC}} A

## Cable Sizing Calculations
- DC voltage drop = 2 × ρ × (L/S) × Imp = 2 × {{constants.resistivity_cu}} × ({{dc_cable_sizing.length}}/{{dc_cable_sizing.section}}) × {{panel.currentAtPmax}} = {{dc_cable_sizing.delta_u}} V
- DC voltage drop percentage = 100 × {{dc_cable_sizing.delta_u}} / {{panel.voltageAtPmax}} = {{dc_cable_sizing.delta_u_perc}}%
`;
