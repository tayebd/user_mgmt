# DC and AC Cable Sizing

## Ambient Temperature Reference
The ambient temperature used for DC/AC cable sizing:
- Buried: 25°C
- In technical room: 50°C
- In cable tray not exposed to sunlight: 50°C
- In cable tray exposed to sunlight: 80°C

## DC Cables

The choice of current capacity (Iz) for PV string cables must take into account the different correction factors defined in the NF C 15-100 standard.

Current capacity calculation:
Iz' = Iz × (K1 × K2 × K3 × K4)

Where:
- Iz': Maximum admissible current of the chosen cable accounting for installation conditions
- Iz: Current capacity of the chosen cable
- K1: Correction factor for installation method
- K2: Correction factor for mutual influence of circuits placed side by side (circuit grouping)
- K3: Correction factor for ambient temperature and insulation type
- K4: Correction factor for number of cable layers in a cable tray

**Numerical Application:**

- Cable tray exposed to sunlight (80°C): Iz' = {{ dc_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_80C }} = {{ cable_sizing.dc_Iz_prime_80C }} A
- Cable tray at 25°C: Iz' = {{ dc_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_25C }} = {{ cable_sizing.dc_Iz_prime_25C }} A
- Cable tray at 50°C: Iz' = {{ dc_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_50C }} = {{ cable_sizing.dc_Iz_prime_50C }} A


### Installation Method

{{ dc_cable.installationMethod }}

### Reference Method

{{ dc_cable.referenceMethod }}

### Circuit Grouping

{{ dc_cable.circuitGrouping }}

### Multiple Layer Correction Factors

{{ dc_cable.layerFactors }}

### Ambient Temperature

{{ dc_cable.temperatureFactors }}

### Number of Layers

{{ dc_cable.numberLayers }}

### Soil Thermal Resistivity

{{ dc_cable.soilResistivity }}

**Note:** Any other provisions mentioned in the NF C 15-100 standard are applicable

**Conclusion:**

| DC Cable Current Capacity | Section | Current Capacity Iz | Corrected Current Iz' |
|--------------------------|---------|---------------------|------------------------|
| {{ dc_cable_sizing.Iz }} A   | {{ dc_cable_sizing.section }} mm2 | {{ dc_cable_sizing.Iz }} A | {{ cable_sizing.dc_Iz_prime_25C }} A |

### DC Voltage Drop Calculation

Δu = 2 × ρ × L/S × ImpSTC
​Δu (en %) = 100 × Δu/Ump

The total voltage drop is limited to 3%.

ρ = {{ constants.resistivity_cu }} Ωmm²/m for copper and ρ = {{ constants.resistivity_al }} Ωmm²/m for aluminum

The voltage drop must be calculated for all sections.

| Section | ρ (Ωmm²/m) | L(m) | I(A) | Section(mm²) | V | Δu | Δu% |
|---------|------------|------|------|--------------|---|-----|-----|
| PV String 1_inv1 | {{ constants.resistivity_cu }} | {{ dc_cable_sizing.length }} | {{ dc_cable_sizing.Iz }} | {{ dc_cable_sizing.section }} | {{ dc_cable.voltage }} | {{ dc_cable_sizing.delta_u }} | {{ dc_cable_sizing.delta_u_perc }} |

**Conclusion:**
On a choisi une section de: {{ dc_cable_sizing.section }}mm² avec un Δu (en %) = {{ dc_cable_sizing.delta_u_perc }}%

### Minimum DC Cable Characteristics

The cable must have the following minimum technical characteristics:
- Cable type: single-core, double insulation, UV resistant
- Cable section: standardized
- Compliance with DC cable standards

Thus, it is expected that:
- Maximum permissible temperature on the core in permanent operation is 90°C or 120°C (XLPE insulation)
- Maximum permissible temperature on the core in short-circuit operation is 250°C
- Maximum DC voltage: 1.8 kV
- Rated AC voltage: U0/U: 0.6/1 (1.2) kV
  - U0: effective value between the core of a conductor
  - U: effective value between the cores of two conductors

## AC Cables

The choice of current capacity (Iz) for AC cables must take into account the different correction factors defined in the NF C 15-100 standard.

Current capacity calculation:
Iz' = Iz × (K1 × K2 × K3 × K4)

Where:
- Iz': Maximum admissible current of the chosen cable accounting for installation conditions
- Iz: Current capacity of the chosen cable
- K1: Correction factor for installation method
- K2: Correction factor for mutual influence of circuits placed side by side (circuit grouping)
- K3: Correction factor for ambient temperature and insulation type
- K4: Correction factor for number of cable layers in a cable tray

**Numerical Application:**

- Cable tray exposed to sunlight (80°C): Iz' = {{ ac1_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_80C }} = {{ cable_sizing.ac_Iz_prime_80C }} A
- Cable tray at 25°C: Iz' = {{ ac1_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_25C }} = {{ ac1_cable_sizing.Iz_prime_25C }} A
- Cable tray at 50°C: Iz' = {{ ac1_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_50C }} = {{ cable_sizing.ac_Iz_prime_50C }} A


### Installation Method

{{ ac_cable.installationMethod }}

### Reference Method

{{ ac_cable.referenceMethod }}

### Circuit Grouping

{{ ac_cable.circuitGrouping }}

### Multiple Layer Correction Factors

{{ ac_cable.layerFactors }}

### Ambient Temperature

{{ ac_cable.temperatureFactors }}

### Number of Layers

{{ ac_cable.numberLayers }}

### Soil Thermal Resistivity

{{ ac_cable.soilResistivity }}

**Note:** Any other provisions mentioned in the NF C 15-100 standard are applicable

**Conclusion:**

| AC Cable Current Capacity | Section | Corrected Current | Current Capacity |
|--------------------------|---------|-------------------|------------------|
| {{ ac1_cable_sizing.Iz }}   | {{ ac1_cable_sizing.section }} | {{ ac1_cable_sizing.Iz_prime_25C }} | {{ ac1_cable_sizing.Iz }} |

### AC Voltage Drop

The voltage drop must be calculated for all sections up to the injection point.

∆u = b (ρ × L/S × cosφ + λ × L × sinφ) × Imax_inverter

Δu (%) = 100 × ∆u / Ve

The total voltage drop is limited to 3%.

Where:
- b = 1 for three-phase circuits and b = 2 for single-phase circuits
- ρ = {{ constants.resistivity_cu }} Ωmm²/m for copper and ρ = {{ constants.resistivity_al }} Ωmm²/m for aluminum

| Section | b | ρ | L | I | S | λ | cos(φ) | sin(φ) | V | ∆u | Δu (%) |
|---------|---|---|---|---|---|---|--------|--------|---|-----|--------|
| Inverter -> AC panel | 2 | 0.02314 | {{ ac1_cable_sizing.length }} | {{ inverter.maxOutputCurrent }} | {{ ac1_cable_sizing.section }} | 0.00008 | 0.8 | 0.6 | 230 | {{ ac1_cable_sizing.delta_u }} | {{ ac1_cable_sizing.delta_u_perc }} |
| AC panel -> TGBT | 2 | 0.02314 | {{ ac2_cable_sizing.length }} | {{ inverter.maxOutputCurrent }} | {{ ac1_cable_sizing.section }} | 0.00008 | 0.8 | 0.6 | 230 | {{ ac2_cable_sizing.delta_u }} | {{ ac2_cable_sizing.delta_u_perc }} |


**Conclusion:**

∆utot = ∆u1 + ∆u2 = {{ ac2_cable_sizing.delta_u_perc }} + {{ ac2_cable_sizing.delta_u_perc }} =  {{ ac1_cable_sizing.delta_u_perc }}
where ∆u1 is the voltage drop between inverter and AC panel and
∆u2 is the voltage drop between AC panel and TGBT

Total voltage drop: {{ ac1_cable_sizing.delta_u_perc }} % < 3%

