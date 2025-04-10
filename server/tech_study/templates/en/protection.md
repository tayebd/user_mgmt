# Equipements de Protection

## Caractéristiques des équipements DC et AC 
#DC and AC Protection Devices

| Equipement | Caractéristiques techniques |
| -- | -- |
| Fusibles | U~fusible~ = {{ dc_protection.fuse.Vn }}<br> I~fusible~ = {{ dc_protection.fuse.In }} |
| Parafoudre DC | Type 2<br>Ucpv = {{ dc_protection.lightning.Ucpv }}<br>Up = {{ dc_protection.lightning.Up }}<br>In = {{ dc_protection.lightning.In }} {{ dc_protection.lightning.InUnit }}<br>Iscpv = {{ dc_protection.lightning.Iscpv }} {{ dc_protection.lightning.IscpvUnit }} |
| Interrupteur sectionneur DC | Usec = {{ dc_protection.switch.Usec }}<br>Isec = {{ dc_protection.switch.Isec }} |
| Disjoncteur (différentiel) AC | Udis = {{ ac_protection.switch.Usec }}<br>In = {{ ac_protection.fuse.In }}<br>Pouvoir de coupure = 6kA<br>Sensibilité = 30mA |
| Parafoudre AC | Type 2<br>Uc = {{ ac_protection.lightning.Uc }}<br>Up = {{ ac_protection.lightning.Up }}<br>In = {{ ac_protection.lightning.In }} {{ ac_protection.lightning.InUnit }}<br>Isc = {{ ac_protection.lightning.Isc }} {{ ac_protection.lightning.IscUnit }} |
| Section câbles DC | Section = {{ dc_cable_sizing.section }}<br>Courant admissible Iz = 30A |
| Section câbles AC | Section = {{ ac1_cable_sizing.section }}<br>Courant admissible Iz = 30A |

## Dimensionnement et Dispositifs de protection coté DC :
#DC Protection Devices

### Nombre maximal de chaînes en parallèle sans protection
#Maximum Number of Parallel Strings Without Protection
$$Ncmax ≤ (1+\frac{I_{RM}}{I_{scSTC}})$$

### Nombre maximal de chaînes en parallèle par dispositif de protection
$$Npmax ≤ (0.5 * (1+\frac{I_{RM}}{I_{sc-max}})$$

**Numerical Application:**

Ncmax ≤ {{ protection.Ncmax_lmt }}
Npmax ≤ {{ protection.Npmax_lmt }}

### Protection Contre les Surintensités (côté DC)

Le calibre des fusibles côté DC doit respecter les conditions suivantes:
- I~n~ ≥ 1.25 × I~sc~ (STC)
- I~n~ ≤ 2 × I~sc~ (STC)
- I~n~ ≤ I~z~ (courant admissible du câble)

**Numerical Application:**
Avec I~sc~ (STC) = {{ panel.shortCircuitCurrent }} A:
- I~n~ ≥ 1.25 × {{ panel.shortCircuitCurrent }} = {{ 1.25 * panel.shortCircuitCurrent | round(2) }} A
- I~n~ ≤ 2 × {{ panel.shortCircuitCurrent }} = {{ 2 * panel.shortCircuitCurrent | round(2) }} A
- i~n~ ≤ {{ dc_cable_sizing.Iz }}

Le fusible choisi a un calibre de {{ dc_protection.fuse.In }} A, ce qui respecte ces conditions.

### Protection Contre les Surtensions

Les parafoudres sont dimensionnés pour:
- Côté DC: Tension Ucpv = {{ dc_protection.lightning.Ucpv }} V ≥ 1.2 × Voc (à -10°C) = {{ 1.2 * array.Voc_10 | round(2) }} V
- Côté AC: Tension Uc = {{ ac_protection.lightning.Uc }} V ≥ 1.1 × U~nom~ = {{ 1.1 * inverter.outputVoltage | round(2) }} V

### Protection Contre les Contacts Indirects

Le système comprend:
- Mise à la terre de toutes les parties métalliques de l'installation
- Un disjoncteur différentiel de sensibilité 30mA côté AC
- Des câbles de section {{ ground_cable.section }} pour la mise à la terre



### DC Fuse Requirements
- Rated voltage: U~fusible~ ≥ Vocmax (-10°C)
- Rated current: 1.1 × 1.25 × IscSTC ≤ Ifusible ≤ Irm

**Numerical Application:**
- Required minimum fuse voltage: {{ array.Voc_10 }} V
- Required minimum fuse current: {{ panel.shortCircuitCurrent }} × 1.1 × 1.25 = {{ protection.fuse_IscSTC }} A

- Used fuse rated current = {{ dc_protection.fuse.In }} A
- Used fuse rated voltage = {{ dc_protection.fuse.Vn }} V
- Fuse maker: {{ dc_protection.fuse.maker }}
- Reference and type: {{ dc_protection.fuse.type }}

### DC Disconnect Switch

Requirements:
- Switch voltage rating: Usec > Voc(-10) of PV array
- Switch current rating: Isec > 1.25 × Isc of PV array
  (for bifacial panels: Isec > Isc with gain) of PV array

**Numerical Application:**
- Switch voltage rating: {{ dc_protection.switch.Usec }} >  {{ array.Voc_10 }} V
- - Switch current rating: {{ dc_protection.switch.Isec }} > 1.25 x {{ panel.shortCircuitCurrent }} = {{ protection.switch_IscSTC }} A

- Used disconnect switch current rating = {{ dc_protection.switch.Isec }} A
- Used disconnect switch voltage rating = {{ dc_protection.switch.Usec }} V
- Disconnect switch maker: {{ dc_protection.switch.maker }}
- Reference and type: {{ dc_protection.switch.ref_type }}

### DC Surge Protector

Requirements:
- Type I or Type II
- Maximum continuous operating voltage: Ucpv > Uoc max = 1.2 × UocSTC
- Protection level: Up < 80% of equipment impulse withstand voltage
  (Up < 50% for equipment more than 10 meters away)
- Nominal discharge current: In > 5 kA
- Short-circuit withstand: Iscpv > Iscmax PV = 1.25 × IscSTC

**Numerical Application:**
- Type I
- Maximum continuous operating voltage: {{ dc_protection.lightning.Ucpv }} > {{ protection.Vocmax}}
- Nominal discharge current: {{ dc_protection.lightning.In }} > 5 kA
- Short-circuit withstand: Iscpv > Iscmax PV = {{ protection.Iscmax }}

- Used Ucpv = {{ dc_protection.lightning.Ucpv }} V DC
- Up = {{ dc_protection.lightning.Up }} kV
- Used In = {{ dc_protection.lightning.In }} kA
- Used Iscpv = {{ dc_protection.lightning.Iscpv }} kA
- Surge protector maker: {{ dc_protection.lightning.maker }}
- Reference and type: {{ dc_protection.lightning.ref_type }}

## AC Protection Devices

### AC Circuit Breaker (Differential)

Requirements:
- Rated operating voltage: Ue = 230 V or 400 V generally
- Imax inverter ≤ Rated current (Ie) ≤ I~z_cable_AC~
- Sensitivity: 30 mA (domestic applications)

**Numerical Application:**

- Rated operating voltage: Ue = {{ ac_protection.fuse.Vn }}
- Imax inverter ≤ Rated current: {{ ac_protection.fuse.In }} ≤ {{ ac1_cable_sizing.Iz }}
- Sensitivity: {{ ac_protection.fuse.sensitivity }} = 30 mA

- Circuit breaker voltage = {{ ac_protection.fuse.Vn }} V
- Circuit breaker rated current = {{ ac_protection.fuse.In }} A
- Circuit breaker sensitivity = {{ ac_protection.fuse.sensitivity }}
- Circuit breaker maker: {{ ac_protection.fuse.maker }}
- Reference and type: {{ ac_protection.fuse.ref_type }}

### AC Surge Protector

Requirements:
- Type I or Type II
- Maximum continuous operating voltage: Uc > 1.1 × (Ue=230)
- Protection level: Up < 80% of equipment impulse withstand voltage
  (Up < 50% for equipment more than 10 meters away)
- Nominal discharge current: In > 5 kA

**Numerical Application:**
- Type I
- Maximum continuous operating voltage: {{ ac_protection.lightning.Uc }} > 1.1 × (Ue=230)
- Nominal discharge current: {{ ac_protection.lightning.In }} > 5 kA

- Used Uc = {{ ac_protection.lightning.Uc }} kVAC
- Used In = {{ ac_protection.lightning.In }} kA
- Surge protector maker: {{ ac_protection.lightning.maker }}
- Reference and type: {{ ac_protection.lightning.ref_type }}

### AC Main Disconnect Switch

Requirements:
- Switch voltage rating: Usec >= Uond
- Switch current rating: Isec > number of inverters × Imax

**Numerical Application:**
- Switch voltage rating: {{ ac_protection.switch.Usec }} >= {{ inverter.outputVoltage }}
- Switch current rating: {{ ac_protection.switch.Usec }} > 1 × {{ inverter.maxOutputCurrent }} = {{ inverter.maxOutputCurrent }}

- Used disconnect switch current rating = {{ ac_protection.switch.Isec }} A
- Used disconnect switch voltage rating = {{ ac_protection.switch.Usec }} V
- Disconnect switch maker: {{ ac_protection.switch.maker }}
- Reference and type: {{ ac_protection.switch.ref_type }}
